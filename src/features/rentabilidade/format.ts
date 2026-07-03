// Formata margem_percentual (fração crua, ex.: 0.707) como "70.7%". Retorna
// "—" quando null (receita zero — ver Global Constraints).
export function formatPercentual(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}
