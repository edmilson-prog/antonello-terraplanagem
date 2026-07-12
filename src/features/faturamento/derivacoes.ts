import { round2 } from "@/features/faturamento/calculo";
import type { ContaReceber, Faturamento, OrdemServico } from "@/shared/types";

export function faturamentoDaOS(osId: string, faturamentos: Faturamento[]): Faturamento | null {
  return faturamentos.find((f) => f.os_id === osId) ?? null;
}

// OS fechadas sem fatura nenhuma — popula "Aguardando faturamento".
export function osFechadasSemFaturamento(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
): OrdemServico[] {
  return ordens.filter((o) => o.status === "fechada" && faturamentoDaOS(o.id, faturamentos) === null);
}

// Pipeline: executado = fechadas ainda não confirmadas (sem fatura OU rascunho);
// faturado = faturas confirmadas; recebido = contas a receber liquidadas (PRD-007).
export function resumoPipeline(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
  contasReceber: ContaReceber[] = [],
): {
  executado: number;
  faturado: { qtd: number; total: number };
  recebido: { qtd: number; total: number };
} {
  const fechadas = ordens.filter((o) => o.status === "fechada");
  const faturadas = faturamentos.filter((f) => f.status === "faturado");
  const osFaturadas = new Set(faturadas.map((f) => f.os_id));
  const liquidadas = contasReceber.filter((c) => c.status === "liquidada");
  return {
    executado: fechadas.filter((o) => !osFaturadas.has(o.id)).length,
    faturado: {
      qtd: faturadas.length,
      total: round2(faturadas.reduce((s, f) => s + f.valor_total, 0)),
    },
    recebido: {
      qtd: liquidadas.length,
      total: round2(liquidadas.reduce((s, c) => s + c.valor, 0)),
    },
  };
}

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function chaveMes(iso: string): string {
  return iso.slice(0, 7); // "YYYY-MM"
}

function somarMeses(chaveMesRef: string, offset: number): string {
  const [ano, mes] = chaveMesRef.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1 + offset, 1));
  const anoNovo = data.getUTCFullYear();
  const mesNovo = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${anoNovo}-${mesNovo}`;
}

export interface AgregadoMensalFaturamento {
  mes: string;
  rotulo: string;
  valor: number;
  qtd: number;
}

// Agrega valor_total de Faturamento por mês de faturado_em, últimos N meses até a referência.
export function agregadoMensal(
  faturamentos: Faturamento[],
  referenciaISO: string,
  meses = 6,
): AgregadoMensalFaturamento[] {
  const mesRef = chaveMes(referenciaISO);
  const chaves = Array.from({ length: meses }, (_, i) => somarMeses(mesRef, i - (meses - 1)));
  const faturados = faturamentos.filter((f) => f.status === "faturado" && f.faturado_em != null);
  return chaves.map((chave) => {
    const doMes = faturados.filter((f) => chaveMes(f.faturado_em as string) === chave);
    const mesIndex = Number(chave.slice(5, 7)) - 1;
    return {
      mes: chave,
      rotulo: MESES_ABREV[mesIndex],
      valor: round2(doMes.reduce((s, f) => s + f.valor_total, 0)),
      qtd: doMes.length,
    };
  });
}

// Conta a Receber vinculada a um Faturamento (PRD-007).
export function contaDoFaturamento(faturamentoId: string, contas: ContaReceber[]): ContaReceber | null {
  return contas.find((c) => c.faturamento_id === faturamentoId) ?? null;
}
