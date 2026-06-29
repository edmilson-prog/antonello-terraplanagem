import type { OrdemServico } from "@/shared/types";

// Próximo número no formato OS-AAAA-NNNN (sequencial por ano).
export function proximoNumeroOS(ordens: Pick<OrdemServico, "numero">[], ano: number): string {
  const prefixo = `OS-${ano}-`;
  const maior = ordens
    .map((o) => o.numero)
    .filter((n) => n.startsWith(prefixo))
    .map((n) => Number.parseInt(n.slice(prefixo.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => (n > max ? n : max), 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}
