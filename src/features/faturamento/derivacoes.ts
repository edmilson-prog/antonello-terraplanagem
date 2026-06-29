import { round2 } from "@/features/faturamento/calculo";
import type { Faturamento, OrdemServico } from "@/shared/types";

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
// faturado = faturas confirmadas; recebido = 0 (placeholder PRD-007).
export function resumoPipeline(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
): { executado: number; faturado: { qtd: number; total: number }; recebido: 0 } {
  const fechadas = ordens.filter((o) => o.status === "fechada");
  const faturadas = faturamentos.filter((f) => f.status === "faturado");
  const osFaturadas = new Set(faturadas.map((f) => f.os_id));
  return {
    executado: fechadas.filter((o) => !osFaturadas.has(o.id)).length,
    faturado: { qtd: faturadas.length, total: round2(faturadas.reduce((s, f) => s + f.valor_total, 0)) },
    recebido: 0,
  };
}
