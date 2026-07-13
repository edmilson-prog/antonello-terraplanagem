import { round2, gerarItens, calcularValorTotal } from "@/features/faturamento/calculo";
import { resumoPipeline, osFechadasSemFaturamento } from "@/features/faturamento/derivacoes";
import { statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { alertasManutencao } from "@/features/manutencao/derivacoes";
import { estaNoIntervalo, type IntervaloPeriodo } from "@/features/dashboard/periodo";
import type {
  Apontamento,
  ContaPagar,
  ContaReceber,
  Equipamento,
  Faturamento,
  OrdemServico,
  PlanoManutencao,
  PrecoFundacao,
  PrecoHoraMaquina,
  RegistroManutencao,
} from "@/shared/types";

export interface ContagemOSPorStatus {
  abertas: number;
  emAndamento: number;
  fechadasNoPeriodo: number;
}

// Abertas/em andamento = estado atual (statusEfetivoOS), sem recorte de período.
// Fechadas no período = fechada_em dentro do intervalo selecionado.
export function contagemOSPorStatus(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  intervalo: IntervaloPeriodo,
): ContagemOSPorStatus {
  let abertas = 0;
  let emAndamento = 0;
  let fechadasNoPeriodo = 0;
  for (const o of ordens) {
    const status = statusEfetivoOS(o, apontamentos);
    if (status === "aberta") abertas += 1;
    else if (status === "em_andamento") emAndamento += 1;
    else if (status === "fechada" && estaNoIntervalo(o.fechada_em, intervalo))
      fechadasNoPeriodo += 1;
  }
  return { abertas, emAndamento, fechadasNoPeriodo };
}

// Soma horas_trabalhadas dos apontamentos finalizados no período (finalizado_em).
export function horasApontadasNoPeriodo(
  apontamentos: Apontamento[],
  intervalo: IntervaloPeriodo,
): number {
  return apontamentos
    .filter((a) => a.status === "finalizado" && estaNoIntervalo(a.finalizado_em, intervalo))
    .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
}

// Valor (R$) das OS fechadas no período ainda sem fatura — preview via gerarItens,
// sem persistir nada (mesma função pura usada por faturamentosStore.gerarDeOS).
export function valorExecutadoNoPeriodo(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  faturamentos: Faturamento[],
  equipamentos: Equipamento[],
  precosHM: PrecoHoraMaquina[],
  precosFund: PrecoFundacao[],
  intervalo: IntervaloPeriodo,
): number {
  const semFatura = osFechadasSemFaturamento(ordens, faturamentos).filter((o) =>
    estaNoIntervalo(o.fechada_em, intervalo),
  );
  const total = semFatura.reduce((soma, o) => {
    const itens = gerarItens(o, apontamentos, equipamentos, precosHM, precosFund);
    return soma + calcularValorTotal(itens, 0);
  }, 0);
  return round2(total);
}

export interface PipelineFinanceiroPeriodo {
  executado: number;
  faturado: number;
  recebido: number;
}

// Pipeline executado → faturado → recebido, todos em R$, restritos ao período
// selecionado (faturado_em / recebido_em). Reaproveita resumoPipeline (PRD-004/007)
// filtrando as listas de entrada — não duplica a soma/agrupamento.
export function pipelineFinanceiroPeriodo(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  faturamentos: Faturamento[],
  contasReceber: ContaReceber[],
  equipamentos: Equipamento[],
  precosHM: PrecoHoraMaquina[],
  precosFund: PrecoFundacao[],
  intervalo: IntervaloPeriodo,
): PipelineFinanceiroPeriodo {
  const executado = valorExecutadoNoPeriodo(
    ordens,
    apontamentos,
    faturamentos,
    equipamentos,
    precosHM,
    precosFund,
    intervalo,
  );
  const faturamentosNoPeriodo = faturamentos.filter((f) =>
    estaNoIntervalo(f.faturado_em, intervalo),
  );
  const contasNoPeriodo = contasReceber.filter((c) => estaNoIntervalo(c.recebido_em, intervalo));
  const pipeline = resumoPipeline(ordens, faturamentosNoPeriodo, contasNoPeriodo);
  return { executado, faturado: pipeline.faturado.total, recebido: pipeline.recebido.total };
}

export interface ResumoContasPendentes {
  vencidas: number;
  aVencer: number;
}

// Snapshot atual (não filtra por período — vencida/a vencer é sobre "agora", não um recorte histórico).
export function resumoContasPendentes(
  contasReceber: ContaReceber[],
  contasPagar: ContaPagar[],
  agora: Date,
): ResumoContasPendentes {
  const agoraISO = agora.toISOString();
  const abertas = [
    ...contasReceber.filter((c) => c.status === "aberta"),
    ...contasPagar.filter((c) => c.status === "aberta"),
  ];
  let vencidas = 0;
  let aVencer = 0;
  for (const c of abertas) {
    if (contaVencida(c, agoraISO)) vencidas += 1;
    else aVencer += 1;
  }
  return { vencidas, aVencer };
}

// Contagem de alertas de manutenção (próxima + vencida) — snapshot atual.
export function contagemAlertasManutencao(
  equipamentos: Equipamento[],
  planos: PlanoManutencao[],
  registros: RegistroManutencao[],
): number {
  return alertasManutencao(equipamentos, planos, registros).length;
}
