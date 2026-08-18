/**
 * Escala uma série absoluta para 0..100, que é o contrato do `Sparkline`.
 * Série toda zerada vira uma linha reta em vez de dividir por zero.
 *
 * Vive fora do componente porque o KpiHeroi só pode exportar componentes
 * (regra do fast refresh). Faturamento e Financeiro tinham cada um a sua cópia
 * desta função; hoje passam a série absoluta ao KpiHeroi, que escala aqui.
 */
export function escalar0a100(valores: number[]): number[] {
  const max = Math.max(...valores, 0);
  if (max === 0) return valores.map(() => 0);
  return valores.map((v) => Math.round((v / max) * 100));
}
