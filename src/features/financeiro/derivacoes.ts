import { round2 } from "@/features/faturamento/calculo";
import type { ContaReceber, ContaPagar } from "@/shared/types";

// Vencida = status aberta E vencimento estritamente anterior a agoraISO (YYYY-MM-DD comparação lexical)
export function contaVencida(
  conta: Pick<ContaReceber | ContaPagar, "status" | "vencimento">,
  agoraISO: string,
): boolean {
  return conta.status === "aberta" && conta.vencimento < agoraISO;
}

export function resumoCaixa(
  receber: ContaReceber[],
  pagar: ContaPagar[],
): { totalReceber: number; totalPagar: number; saldoPrevisto: number } {
  const totalReceber = round2(
    receber.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0),
  );
  const totalPagar = round2(
    pagar.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0),
  );
  return { totalReceber, totalPagar, saldoPrevisto: round2(totalReceber - totalPagar) };
}
