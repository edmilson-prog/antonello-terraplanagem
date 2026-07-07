import { custoHoraEquipamento } from "@/features/custo-hora/derivacoes";
import type { DetalheItemCusto } from "@/features/custo-hora/derivacoes";
import { round2 } from "@/features/faturamento/calculo";
import type {
  Abastecimento,
  Apontamento,
  ComponenteCusto,
  Equipamento,
  Faturamento,
  OrdemServico,
  PrecoHoraMaquina,
  RegistroManutencao,
} from "@/shared/types";

// Rentabilidade cruza receita (PRD-004, Faturamento) com custo (PRD-013,
// custoHoraEquipamento) em dois recortes — equipamento e obra/OS. Topo da
// pirâmide analítica: nunca persistido, sempre recalculado (PRD-014).
//
// Receita conta QUALQUER Faturamento existente para a OS (rascunho ou
// faturado) — o rascunho já reflete o valor calculado por gerarItens
// (PRD-004); só o "recebido" (PRD-007) fica de fora, pois PRD-014 depende de
// PRD-004, não de PRD-007. O período de um Faturamento, para este recorte, é
// o mês de `gerado_em` (todo Faturamento tem essa data; `faturado_em` é null
// em rascunho, por isso não serve de chave de período).

export interface ComposicaoReceita {
  faturamento_id: string;
  faturamento_numero: string;
  os_id: string;
  valor: number;
}

export interface RentabilidadeEquipamento {
  equipamento_id: string;
  periodo: string; // "YYYY-MM"
  horas_trabalhadas: number;
  receita: number;
  custo: number;
  margem: number;
  margem_percentual: number | null; // null quando receita === 0 (evita percentual quebrado)
  custo_incompleto: boolean; // propagado de CustoHoraEquipamento.configuracao_incompleta
  composicao_receita: ComposicaoReceita[];
  detalhamento_custo: DetalheItemCusto[];
}

export interface ComposicaoCustoObra {
  equipamento_id: string;
  horas: number;
  custo_por_hora: number | null;
  custo: number;
}

export interface RentabilidadeObra {
  os_id: string;
  os_numero: string;
  cliente_id: string;
  periodo: string; // mês de gerado_em do(s) faturamento(s) desta obra
  receita: number;
  custo: number;
  margem: number;
  margem_percentual: number | null;
  custo_incompleto: boolean; // true se algum equipamento envolvido tiver configuração de custo incompleta (ou sem horas no período)
  composicao_receita: ComposicaoReceita[];
  composicao_custo: ComposicaoCustoObra[];
}

export function periodoDoFaturamento(f: Faturamento): string {
  return f.gerado_em.slice(0, 7);
}

function horasDoEquipamentoNaOS(
  apontamentos: Apontamento[],
  equipamentoId: string,
  osId: string,
): number {
  const finalizados = apontamentos.filter(
    (a) =>
      a.os_id === osId &&
      a.equipamento_id === equipamentoId &&
      a.status === "finalizado" &&
      a.horas_trabalhadas != null,
  );
  return round2(finalizados.reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0));
}

export function rentabilidadePorEquipamento(
  equipamento: Equipamento,
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  faturamentos: Faturamento[],
): RentabilidadeEquipamento {
  const custo = custoHoraEquipamento(
    equipamento,
    periodo,
    componentes,
    abastecimentos,
    registrosManutencao,
    apontamentos,
    precosHoraMaquina,
  );

  const composicaoReceita: ComposicaoReceita[] = [];
  for (const f of faturamentos) {
    if (periodoDoFaturamento(f) !== periodo) continue;
    for (const item of f.itens) {
      if (item.tipo !== "hora_maquina" || item.origem_id !== equipamento.id) continue;
      composicaoReceita.push({
        faturamento_id: f.id,
        faturamento_numero: f.numero,
        os_id: f.os_id,
        valor: item.valor_total,
      });
    }
  }
  const receita = round2(composicaoReceita.reduce((soma, c) => soma + c.valor, 0));
  const margem = round2(receita - custo.custo_total);

  return {
    equipamento_id: equipamento.id,
    periodo,
    horas_trabalhadas: custo.horas_trabalhadas,
    receita,
    custo: custo.custo_total,
    margem,
    margem_percentual: receita > 0 ? margem / receita : null,
    custo_incompleto: custo.configuracao_incompleta,
    composicao_receita: composicaoReceita,
    detalhamento_custo: custo.detalhamento,
  };
}

export function rentabilidadePorTodosEquipamentos(
  equipamentos: Equipamento[],
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  faturamentos: Faturamento[],
): RentabilidadeEquipamento[] {
  return equipamentos
    .filter((e) => e.ativo)
    .map((e) =>
      rentabilidadePorEquipamento(
        e,
        periodo,
        componentes,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ),
    );
}

function obrasComFaturamentoNoPeriodo(
  faturamentos: Faturamento[],
  periodo: string,
): Map<string, Faturamento[]> {
  const porOS = new Map<string, Faturamento[]>();
  for (const f of faturamentos) {
    if (periodoDoFaturamento(f) !== periodo) continue;
    const lista = porOS.get(f.os_id) ?? [];
    lista.push(f);
    porOS.set(f.os_id, lista);
  }
  return porOS;
}

export function rentabilidadePorObra(
  os: OrdemServico,
  faturamentosDaOS: Faturamento[],
  periodo: string,
  equipamentos: Equipamento[],
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): RentabilidadeObra {
  const receita = round2(faturamentosDaOS.reduce((soma, f) => soma + f.valor_total, 0));
  const composicaoReceita: ComposicaoReceita[] = faturamentosDaOS.map((f) => ({
    faturamento_id: f.id,
    faturamento_numero: f.numero,
    os_id: f.os_id,
    valor: f.valor_total,
  }));

  const equipamentoIds = Array.from(
    new Set(
      apontamentos
        .filter((a) => a.os_id === os.id && a.status === "finalizado")
        .map((a) => a.equipamento_id),
    ),
  );

  const composicaoCusto: ComposicaoCustoObra[] = [];
  let custoIncompleto = false;
  for (const equipamentoId of equipamentoIds) {
    const equipamento = equipamentos.find((e) => e.id === equipamentoId);
    if (!equipamento) continue;
    const horas = horasDoEquipamentoNaOS(apontamentos, equipamentoId, os.id);
    const resultado = custoHoraEquipamento(
      equipamento,
      periodo,
      componentes,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    if (resultado.configuracao_incompleta || resultado.custo_por_hora == null) {
      custoIncompleto = true;
    }
    const custo = resultado.custo_por_hora != null ? round2(resultado.custo_por_hora * horas) : 0;
    composicaoCusto.push({
      equipamento_id: equipamentoId,
      horas,
      custo_por_hora: resultado.custo_por_hora,
      custo,
    });
  }

  const custoTotal = round2(composicaoCusto.reduce((soma, c) => soma + c.custo, 0));
  const margem = round2(receita - custoTotal);

  return {
    os_id: os.id,
    os_numero: os.numero,
    cliente_id: os.cliente_id,
    periodo,
    receita,
    custo: custoTotal,
    margem,
    margem_percentual: receita > 0 ? margem / receita : null,
    custo_incompleto: custoIncompleto,
    composicao_receita: composicaoReceita,
    composicao_custo: composicaoCusto,
  };
}

export function rentabilidadePorTodasAsObras(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
  periodo: string,
  equipamentos: Equipamento[],
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): RentabilidadeObra[] {
  const porOS = obrasComFaturamentoNoPeriodo(faturamentos, periodo);
  const resultado: RentabilidadeObra[] = [];
  for (const [osId, faturamentosDaOS] of porOS) {
    const os = ordens.find((o) => o.id === osId);
    if (!os) continue;
    resultado.push(
      rentabilidadePorObra(
        os,
        faturamentosDaOS,
        periodo,
        equipamentos,
        componentes,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ),
    );
  }
  return resultado;
}
