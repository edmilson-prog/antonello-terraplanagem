// A1 — OCR do horímetro. Absorve o que antes vivia em src/shared/lib/ocr.ts
// (mesmo comportamento — nenhuma regressão de UX no HorimetroCapture).

interface LeituraHorimetroOpts {
  /** valor base plausível (ex.: horímetro atual do equipamento) */
  base?: number;
  /** atraso simulado da leitura (ms); use 0 em testes */
  delayMs?: number;
  /** força falha para exercitar o fallback manual */
  simularFalha?: boolean;
}

export const IA_HORIMETRO_VALOR_SIMULADO = 1234.5;

export async function lerHorimetro(
  _arquivo: File | Blob,
  opts: LeituraHorimetroOpts = {},
): Promise<number> {
  const { base, delayMs = 1200, simularFalha = false } = opts;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (simularFalha) {
    throw new Error("Não foi possível ler o horímetro da foto.");
  }
  return base != null ? Math.round(base * 10) / 10 : IA_HORIMETRO_VALOR_SIMULADO;
}
