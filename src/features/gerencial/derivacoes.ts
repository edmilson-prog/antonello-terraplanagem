import { round2 } from "@/features/faturamento/calculo";
import {
  rentabilidadePorTodosEquipamentos,
  rentabilidadePorTodasAsObras,
} from "@/features/rentabilidade/derivacoes";
import type {
  RentabilidadeEquipamento,
  RentabilidadeObra,
} from "@/features/rentabilidade/derivacoes";
import { horasTrabalhadasNoPeriodo } from "@/features/custo-hora/derivacoes";
import { indicadoresPorEquipamento } from "@/features/diesel/derivacoes";
import type { IndicadorDieselEquipamento } from "@/features/diesel/derivacoes";
import { pipelineFinanceiroPeriodo } from "@/features/dashboard/derivacoes";
import type { PipelineFinanceiroPeriodo } from "@/features/dashboard/derivacoes";
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import {
  intervaloDatas,
  intervaloDias,
  mesesDoPeriodo,
} from "@/features/gerencial/periodo-gerencial";
import type { PeriodoGerencial } from "@/features/gerencial/periodo-gerencial";
import type {
  Abastecimento,
  Apontamento,
  ComponenteCusto,
  ContaReceber,
  Equipamento,
  Faturamento,
  OrdemServico,
  PrecoFundacao,
  PrecoHoraMaquina,
  RegistroManutencao,
} from "@/shared/types";

// Agregadores do Dashboard Gerencial (PRD-016). Nenhuma regra de custo/margem
// é recalculada aqui — tudo delega para custo-hora (013) e rentabilidade (014),
// só reorganizando por mês/período. Ver nota no plano sobre a diferença entre
// serieMensalFaturamento (faturamento total, RF-001) e serieMensalCustoMargem
// (receita/custo/margem só do que é atribuível a um equipamento, RF-002).
// Além do escopo, os dois grupos também bucketizam por campo de data diferente:
// serieMensalFaturamento usa faturado_em, enquanto serieMensalCustoMargem e as
// duas funções de ranking usam gerado_em (via periodoDoFaturamento) — hoje
// sempre o mesmo mês nos mocks, mas não necessariamente em dados reais.

export interface PontoFaturamentoMensal {
  mes: string;
  rotulo: string;
  faturado: number;
}

export function serieMensalFaturamento(
  meses: string[],
  faturamentos: Faturamento[],
): PontoFaturamentoMensal[] {
  return meses.map((mes) => {
    const doMes = faturamentos.filter(
      (f) => f.status === "faturado" && f.faturado_em != null && f.faturado_em.slice(0, 7) === mes,
    );
    return {
      mes,
      rotulo: rotuloMes(mes),
      faturado: round2(doMes.reduce((soma, f) => soma + f.valor_total, 0)),
    };
  });
}

export interface PontoCustoMargemMensal {
  mes: string;
  rotulo: string;
  receita: number;
  custo: number;
  margem: number;
}

export function serieMensalCustoMargem(
  meses: string[],
  equipamentos: Equipamento[],
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  faturamentos: Faturamento[],
): PontoCustoMargemMensal[] {
  return meses.map((mes) => {
    const porEquipamento = rentabilidadePorTodosEquipamentos(
      equipamentos,
      mes,
      componentes,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    );
    const receita = round2(porEquipamento.reduce((soma, r) => soma + r.receita, 0));
    const custo = round2(porEquipamento.reduce((soma, r) => soma + r.custo, 0));
    return { mes, rotulo: rotuloMes(mes), receita, custo, margem: round2(receita - custo) };
  });
}

// null (não Infinity/NaN) quando o valor anterior é 0 — evita variação % quebrada.
export function variacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return round2(((atual - anterior) / anterior) * 100);
}

export interface HorasEquipamentoPeriodo {
  equipamento_id: string;
  equipamento_nome: string;
  horas: number;
}

export function horasPorEquipamentoNoPeriodo(
  equipamentos: Equipamento[],
  apontamentos: Apontamento[],
  periodo: PeriodoGerencial,
): HorasEquipamentoPeriodo[] {
  const meses = mesesDoPeriodo(periodo);
  return equipamentos
    .filter((e) => e.ativo)
    .map((e) => ({
      equipamento_id: e.id,
      equipamento_nome: e.nome,
      horas: round2(
        meses.reduce((soma, mes) => soma + horasTrabalhadasNoPeriodo(apontamentos, e.id, mes), 0),
      ),
    }));
}

export function utilizacaoPorEquipamentoNoPeriodo(
  equipamentos: Equipamento[],
  abastecimentos: Abastecimento[],
  apontamentos: Apontamento[],
  periodo: PeriodoGerencial,
): IndicadorDieselEquipamento[] {
  return indicadoresPorEquipamento(
    equipamentos,
    abastecimentos,
    apontamentos,
    intervaloDias(periodo),
  );
}

// custoHoraEquipamento/rentabilidadePorEquipamento só entendem 1 mês por vez —
// por isso o ranking do período soma a rentabilidade mês a mês por
// equipamento/obra, em vez de inventar um cálculo novo sobre um intervalo.
export function rankingEquipamentosPorMargem(
  equipamentos: Equipamento[],
  periodo: PeriodoGerencial,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  faturamentos: Faturamento[],
): RentabilidadeEquipamento[] {
  const rotuloPeriodo = `${periodo.mesInicio}..${periodo.mesFim}`;
  const acumulado = new Map<string, RentabilidadeEquipamento>();

  for (const mes of mesesDoPeriodo(periodo)) {
    const doMes = rentabilidadePorTodosEquipamentos(
      equipamentos,
      mes,
      componentes,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    );
    for (const r of doMes) {
      const atual = acumulado.get(r.equipamento_id);
      if (!atual) {
        acumulado.set(r.equipamento_id, { ...r, periodo: rotuloPeriodo });
        continue;
      }
      acumulado.set(r.equipamento_id, {
        ...atual,
        horas_trabalhadas: round2(atual.horas_trabalhadas + r.horas_trabalhadas),
        receita: round2(atual.receita + r.receita),
        custo: round2(atual.custo + r.custo),
        margem: round2(atual.margem + r.margem),
        custo_incompleto: atual.custo_incompleto || r.custo_incompleto,
        composicao_receita: [...atual.composicao_receita, ...r.composicao_receita],
        detalhamento_custo: [...atual.detalhamento_custo, ...r.detalhamento_custo],
      });
    }
  }

  return Array.from(acumulado.values())
    .map((r) => ({ ...r, margem_percentual: r.receita > 0 ? r.margem / r.receita : null }))
    .sort((a, b) => b.margem - a.margem);
}

export function rankingObrasPorMargem(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
  periodo: PeriodoGerencial,
  equipamentos: Equipamento[],
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): RentabilidadeObra[] {
  const rotuloPeriodo = `${periodo.mesInicio}..${periodo.mesFim}`;
  const acumulado = new Map<string, RentabilidadeObra>();

  for (const mes of mesesDoPeriodo(periodo)) {
    const doMes = rentabilidadePorTodasAsObras(
      ordens,
      faturamentos,
      mes,
      equipamentos,
      componentes,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    for (const r of doMes) {
      const atual = acumulado.get(r.os_id);
      if (!atual) {
        acumulado.set(r.os_id, { ...r, periodo: rotuloPeriodo });
        continue;
      }
      acumulado.set(r.os_id, {
        ...atual,
        receita: round2(atual.receita + r.receita),
        custo: round2(atual.custo + r.custo),
        margem: round2(atual.margem + r.margem),
        custo_incompleto: atual.custo_incompleto || r.custo_incompleto,
        composicao_receita: [...atual.composicao_receita, ...r.composicao_receita],
        composicao_custo: [...atual.composicao_custo, ...r.composicao_custo],
      });
    }
  }

  return Array.from(acumulado.values())
    .map((r) => ({ ...r, margem_percentual: r.receita > 0 ? r.margem / r.receita : null }))
    .sort((a, b) => b.margem - a.margem);
}

export function pipelineConsolidadoNoPeriodo(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  faturamentos: Faturamento[],
  contasReceber: ContaReceber[],
  equipamentos: Equipamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  precosFundacao: PrecoFundacao[],
  periodo: PeriodoGerencial,
): PipelineFinanceiroPeriodo {
  return pipelineFinanceiroPeriodo(
    ordens,
    apontamentos,
    faturamentos,
    contasReceber,
    equipamentos,
    precosHoraMaquina,
    precosFundacao,
    intervaloDatas(periodo),
  );
}
