// Horas trabalhadas a partir do horímetro. Arredonda para 1 casa decimal
// para evitar drift de ponto flutuante (ex.: 1208.3 - 1200.1).
export function calcularHoras(inicial: number, final: number): number {
  return Math.round((final - inicial) * 10) / 10;
}
