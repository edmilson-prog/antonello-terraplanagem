import type { Comprovante } from "@/shared/types";

// Próximo número no formato CMP-AAAA-NNNN (sequencial por ano).
export function proximoNumeroCMP(comprovantes: Pick<Comprovante, "numero">[], ano: number): string {
  const prefixo = `CMP-${ano}-`;
  const maior = comprovantes
    .map((c) => c.numero)
    .filter((n) => n.startsWith(prefixo))
    .map((n) => Number.parseInt(n.slice(prefixo.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => (n > max ? n : max), 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}
