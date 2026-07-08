// Espelha o padrão já usado em src/shared/lib/ocr.ts: flag + delay simulado.
// Quando o provider real (Fase 4) existir, troca-se cada mock/*.ts — nunca
// os componentes de UI, que só conhecem os contratos de types.ts.

export const IA_HABILITADA = true;

export async function comDelay<T>(valor: T, ms = 900): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return valor;
}
