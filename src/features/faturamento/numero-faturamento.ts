import type { Faturamento } from "@/shared/types";

// Próximo número no formato FAT-AAAA-NNNN (sequencial por ano).
export function proximoNumeroFAT(faturamentos: Pick<Faturamento, "numero">[], ano: number): string {
  const prefixo = `FAT-${ano}-`;
  const maior = faturamentos
    .map((f) => f.numero)
    .filter((n) => n.startsWith(prefixo))
    .map((n) => Number.parseInt(n.slice(prefixo.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => (n > max ? n : max), 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}
