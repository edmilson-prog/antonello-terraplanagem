import { precoHoraDoEquipamento, round2 } from "@/features/faturamento/calculo";
import { custoAbastecimento } from "@/features/diesel/derivacoes";
import type {
  Abastecimento,
  Apontamento,
  ComponenteCusto,
  Equipamento,
  PrecoHoraMaquina,
  RegistroManutencao,
  TipoComponenteCusto,
} from "@/shared/types";

// Custo/hora é sempre CALCULADO por (equipamento, período) — nunca
// persistido (PRD-013). Reaproveita precoHoraDoEquipamento/round2
// (faturamento) e custoAbastecimento (diesel) em vez de duplicar a lógica de
// resolução de preço e de custo de diesel.

export interface DetalheItemCusto {
  tipo: TipoComponenteCusto;
  descricao: string;
  valor: number;
}

export interface CustoHoraEquipamento {
  equipamento_id: string;
  periodo: string; // "YYYY-MM"
  horas_trabalhadas: number;
  custo_diesel: number;
  custo_manutencao: number;
  custo_fixo_rateado: number;
  custo_variavel: number;
  custo_total: number;
  custo_por_hora: number | null; // null quando horas_trabalhadas === 0 (evita divisão por zero)
  preco_hora: number | null; // valor_hora_operada do preço ativo do equipamento, se houver
  margem_hora: number | null; // preco_hora - custo_por_hora (null se qualquer um faltar)
  detalhamento: DetalheItemCusto[]; // sempre as 4 categorias, mesmo com valor 0 (RNF-003)
  configuracao_incompleta: boolean; // true quando não há nenhum ComponenteCusto ativo
}

function noPeriodo(iso: string, periodo: string): boolean {
  return iso.slice(0, 7) === periodo;
}

export function horasTrabalhadasNoPeriodo(
  apontamentos: Apontamento[],
  equipamentoId: string,
  periodo: string,
): number {
  const finalizados = apontamentos.filter(
    (a) =>
      a.equipamento_id === equipamentoId &&
      a.status === "finalizado" &&
      a.horas_trabalhadas != null &&
      a.finalizado_em != null &&
      noPeriodo(a.finalizado_em, periodo),
  );
  return round2(finalizados.reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0));
}

export function custoDieselNoPeriodo(
  abastecimentos: Abastecimento[],
  equipamentoId: string,
  periodo: string,
): number {
  const doPeriodo = abastecimentos.filter(
    (a) => a.equipamento_id === equipamentoId && noPeriodo(a.abastecido_em, periodo),
  );
  return round2(doPeriodo.reduce((soma, a) => soma + (custoAbastecimento(a) ?? 0), 0));
}

export function custoManutencaoNoPeriodo(
  registros: RegistroManutencao[],
  equipamentoId: string,
  periodo: string,
): number {
  const doPeriodo = registros.filter(
    (r) =>
      r.equipamento_id === equipamentoId &&
      r.status === "realizada" &&
      r.realizada_em != null &&
      noPeriodo(r.realizada_em, periodo),
  );
  return round2(doPeriodo.reduce((soma, r) => soma + (r.custo ?? 0), 0));
}

export function componentesAtivosDoEquipamento(
  componentes: ComponenteCusto[],
  equipamentoId: string,
): ComponenteCusto[] {
  return componentes.filter((c) => c.ativo && c.equipamento_id === equipamentoId);
}

export function custoHoraEquipamento(
  equipamento: Equipamento,
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): CustoHoraEquipamento {
  const horasTrabalhadas = horasTrabalhadasNoPeriodo(apontamentos, equipamento.id, periodo);
  const custoDiesel = custoDieselNoPeriodo(abastecimentos, equipamento.id, periodo);
  const custoManutencao = custoManutencaoNoPeriodo(registrosManutencao, equipamento.id, periodo);

  const ativos = componentesAtivosDoEquipamento(componentes, equipamento.id);
  const fixos = ativos.filter((c) => c.tipo === "fixo_mensal");
  const variaveis = ativos.filter((c) => c.tipo === "variavel_hora");

  const custoFixoRateado = round2(fixos.reduce((soma, c) => soma + c.valor, 0));
  // custo_variavel deriva da SOMA dos itens já arredondados (não de round2 sobre
  // o agregado) para que o "Custo total" nunca divirja da soma visível das
  // linhas do detalhamento quando houver 2+ componentes variavel_hora.
  const itensVariaveis: DetalheItemCusto[] = variaveis.map((c) => ({
    tipo: c.tipo,
    descricao: c.descricao,
    valor: round2(c.valor * horasTrabalhadas),
  }));
  const custoVariavel = round2(itensVariaveis.reduce((soma, item) => soma + item.valor, 0));
  const custoTotal = round2(custoDiesel + custoManutencao + custoFixoRateado + custoVariavel);
  const custoPorHora = horasTrabalhadas > 0 ? round2(custoTotal / horasTrabalhadas) : null;

  const preco = precoHoraDoEquipamento(equipamento, precosHoraMaquina);
  const precoHora = preco ? preco.valor_hora_operada : null;
  const margemHora =
    custoPorHora != null && precoHora != null ? round2(precoHora - custoPorHora) : null;

  const detalhamento: DetalheItemCusto[] = [
    ...fixos.map((c) => ({ tipo: c.tipo, descricao: c.descricao, valor: c.valor })),
    ...itensVariaveis,
    { tipo: "diesel", descricao: "Diesel", valor: custoDiesel },
    { tipo: "manutencao", descricao: "Manutenção", valor: custoManutencao },
  ];

  return {
    equipamento_id: equipamento.id,
    periodo,
    horas_trabalhadas: horasTrabalhadas,
    custo_diesel: custoDiesel,
    custo_manutencao: custoManutencao,
    custo_fixo_rateado: custoFixoRateado,
    custo_variavel: custoVariavel,
    custo_total: custoTotal,
    custo_por_hora: custoPorHora,
    preco_hora: precoHora,
    margem_hora: margemHora,
    detalhamento,
    configuracao_incompleta: ativos.length === 0,
  };
}

export function custoHoraPorEquipamento(
  equipamentos: Equipamento[],
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): CustoHoraEquipamento[] {
  return equipamentos
    .filter((e) => e.ativo)
    .map((e) =>
      custoHoraEquipamento(
        e,
        periodo,
        componentes,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ),
    );
}

// Estimativa de custo/hora INDEPENDENTE do uso real do período — soma os
// componentes ativos do equipamento usando horas/mês de referência fixas em
// vez de horas_trabalhadas reais (que podem ser 0 e zerar custo_por_hora em
// custoHoraEquipamento). Mesma fórmula do "impacto no custo/h" já usada no
// formulário de Componente de Custo, generalizada para todos os componentes
// do equipamento. Usada em Preços (coluna Custo ref./Margem).
export function custoEstimadoHoraEquipamento(
  equipamentoId: string,
  componentes: ComponenteCusto[],
  horasReferencia = 160,
): number | null {
  const ativos = componentesAtivosDoEquipamento(componentes, equipamentoId);
  if (ativos.length === 0) return null;
  const fixos = ativos.filter((c) => c.tipo === "fixo_mensal");
  const variaveis = ativos.filter((c) => c.tipo === "variavel_hora");
  const custoFixoRateado =
    horasReferencia > 0
      ? round2(fixos.reduce((soma, c) => soma + c.valor, 0) / horasReferencia)
      : 0;
  const custoVariavel = round2(variaveis.reduce((soma, c) => soma + c.valor, 0));
  return round2(custoFixoRateado + custoVariavel);
}
