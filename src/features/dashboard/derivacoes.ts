import { round2, gerarItens, calcularValorTotal } from "@/features/faturamento/calculo";
import { resumoPipeline, osFechadasSemFaturamento } from "@/features/faturamento/derivacoes";
import { statusEfetivoOS, totalHorasOS } from "@/features/ordem-servico/derivacoes";
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

// Intervalo imediatamente anterior, de mesma duração — base do "vs. período
// anterior" dos KPIs. Espelha intervaloMesAnterior (Painel Operacional), mas
// genérico: serve para hoje/semana/mês sem uma regra nova por período.
export function intervaloAnterior(intervalo: IntervaloPeriodo): IntervaloPeriodo {
  const duracao = intervalo.fim.getTime() - intervalo.inicio.getTime();
  return {
    inicio: new Date(intervalo.inicio.getTime() - duracao),
    fim: new Date(intervalo.inicio.getTime() - 1),
  };
}

// Divide o intervalo em N fatias iguais — alimenta só as sparklines dos KPIs
// (forma da curva dentro do período, não um recorte de negócio).
export function bucketsDoIntervalo(
  intervalo: IntervaloPeriodo,
  quantidade: number,
): IntervaloPeriodo[] {
  if (quantidade < 1) return [];
  const inicio = intervalo.inicio.getTime();
  const passo = (intervalo.fim.getTime() - inicio) / quantidade;
  return Array.from({ length: quantidade }, (_, i) => ({
    inicio: new Date(inicio + i * passo),
    fim: new Date(i === quantidade - 1 ? intervalo.fim.getTime() : inicio + (i + 1) * passo - 1),
  }));
}

// Soma `valorDe` por fatia do intervalo. Genérica porque as três séries dos KPIs
// (faturado, horas, OS abertas) só diferem no campo de data e no valor somado.
export function serieEmBuckets<T>(
  itens: T[],
  dataDe: (item: T) => string | null | undefined,
  valorDe: (item: T) => number,
  intervalo: IntervaloPeriodo,
  quantidade = 8,
): number[] {
  return bucketsDoIntervalo(intervalo, quantidade).map((bucket) =>
    round2(
      itens
        .filter((item) => estaNoIntervalo(dataDe(item), bucket))
        .reduce((soma, item) => soma + valorDe(item), 0),
    ),
  );
}

// Âncora temporal dos blocos que não seguem o filtro de período (apontamentos
// recentes, horas por semana): o apontamento finalizado mais recente, ou `agora`
// quando não há nenhum. Sem isso, uma base cujo último apontamento é antigo
// renderiza cards vazios que parecem defeito — mesmo motivo de
// dataReferenciaOperacional no Painel Operacional.
export function referenciaApontamentos(apontamentos: Apontamento[], agora: Date): Date {
  const datas = apontamentos
    .map((a) => a.finalizado_em)
    .filter((d): d is string => d !== null && d !== undefined);
  if (datas.length === 0) return agora;
  return new Date(datas.sort().at(-1) as string);
}

export interface SemanaHoras {
  rotulo: string; // "dd/mm" do início da janela
  horas: number;
}

// Últimas `semanas` janelas de 7 dias corridos terminando em `referencia`.
export function serieSemanalHoras(
  apontamentos: Apontamento[],
  referencia: Date,
  semanas = 8,
): SemanaHoras[] {
  const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;
  const fimBase = referencia.getTime();
  return Array.from({ length: semanas }, (_, i) => {
    const indice = semanas - 1 - i; // 0 = janela mais recente
    const fim = new Date(fimBase - indice * SEMANA_MS);
    const inicio = new Date(fim.getTime() - SEMANA_MS + 1);
    const horas = apontamentos
      .filter((a) => a.status === "finalizado" && estaNoIntervalo(a.finalizado_em, { inicio, fim }))
      .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
    const dia = String(inicio.getDate()).padStart(2, "0");
    const mes = String(inicio.getMonth() + 1).padStart(2, "0");
    return { rotulo: `${dia}/${mes}`, horas: round2(horas) };
  });
}

export interface ResumoSemanal {
  media: number;
  pico: number;
  picoRotulo: string | null;
}

export function resumoSemanal(semanas: SemanaHoras[]): ResumoSemanal {
  if (semanas.length === 0) return { media: 0, pico: 0, picoRotulo: null };
  const total = semanas.reduce((soma, s) => soma + s.horas, 0);
  const maior = semanas.reduce((a, b) => (b.horas > a.horas ? b : a));
  return {
    media: round2(total / semanas.length),
    pico: maior.horas,
    picoRotulo: maior.horas > 0 ? maior.rotulo : null,
  };
}

export interface OSAtiva {
  os: OrdemServico;
  status: "aberta" | "em_andamento";
  horas: number;
}

// OS que ainda estão na rua: em andamento primeiro (mais horas no topo), depois
// as abertas aguardando o primeiro apontamento (mais recentes primeiro).
export function osAtivas(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  limite?: number,
): OSAtiva[] {
  const ativas: OSAtiva[] = [];
  for (const o of ordens) {
    const status = statusEfetivoOS(o, apontamentos);
    if (status !== "aberta" && status !== "em_andamento") continue;
    ativas.push({ os: o, status, horas: totalHorasOS(o.id, apontamentos) });
  }
  ativas.sort((a, b) => {
    if (a.status !== b.status) return a.status === "em_andamento" ? -1 : 1;
    if (a.status === "em_andamento") return b.horas - a.horas;
    return b.os.aberta_em.localeCompare(a.os.aberta_em);
  });
  return limite === undefined ? ativas : ativas.slice(0, limite);
}

export interface ApontamentosDoDia {
  data: string | null; // "YYYY-MM-DD" do dia exibido; null quando não há apontamento
  itens: Apontamento[];
}

// Apontamentos finalizados do dia mais recente com movimento (não necessariamente
// hoje — ver referenciaApontamentos). Mais recente primeiro.
export function apontamentosDoDiaMaisRecente(
  apontamentos: Apontamento[],
  limite?: number,
): ApontamentosDoDia {
  const finalizados = apontamentos.filter(
    (a) => a.status === "finalizado" && a.finalizado_em !== null,
  );
  if (finalizados.length === 0) return { data: null, itens: [] };
  const dia = finalizados
    .map((a) => (a.finalizado_em as string).slice(0, 10))
    .sort()
    .at(-1) as string;
  const itens = finalizados
    .filter((a) => (a.finalizado_em as string).slice(0, 10) === dia)
    .sort((a, b) => (b.finalizado_em as string).localeCompare(a.finalizado_em as string));
  return { data: dia, itens: limite === undefined ? itens : itens.slice(0, limite) };
}

export interface VencimentoProximo {
  conta: ContaReceber;
  documento: string; // número do faturamento de origem, quando encontrado
  vencida: boolean;
}

// Contas a receber em aberto, do vencimento mais antigo ao mais recente — as
// vencidas aparecem primeiro por construção. Reaproveita contaVencida (PRD-007).
export function vencimentosProximos(
  contasReceber: ContaReceber[],
  faturamentos: Faturamento[],
  agoraISO: string,
  limite?: number,
): VencimentoProximo[] {
  const abertas = contasReceber
    .filter((c) => c.status === "aberta")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((conta) => ({
      conta,
      documento: faturamentos.find((f) => f.id === conta.faturamento_id)?.numero ?? "—",
      vencida: contaVencida(conta, agoraISO),
    }));
  return limite === undefined ? abertas : abertas.slice(0, limite);
}

export interface SaldoAReceber {
  total: number;
  titulos: number;
  vencidos: number;
}

// Snapshot do que a empresa tem a receber agora — não recorta por período
// (um título vencido em maio continua sendo saldo em agosto).
export function saldoAReceber(contasReceber: ContaReceber[], agoraISO: string): SaldoAReceber {
  const abertas = contasReceber.filter((c) => c.status === "aberta");
  return {
    total: round2(abertas.reduce((soma, c) => soma + c.valor, 0)),
    titulos: abertas.length,
    vencidos: abertas.filter((c) => contaVencida(c, agoraISO)).length,
  };
}
