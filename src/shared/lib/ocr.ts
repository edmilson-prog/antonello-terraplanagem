// Leitura automática do horímetro por foto — camada SIMULADA, isolada e
// plugável. O PRD-002 mantém o OCR opcional (RF-003, "Could"), com fallback
// de digitação manual. Quando um serviço real existir, troca-se só este
// arquivo; a UI consome apenas `OCR_HABILITADO` e `lerHorimetroDaFoto`.

export const OCR_HABILITADO = true;
export const OCR_VALOR_SIMULADO = 1234.5;

interface LeituraOpts {
  /** valor base plausível (ex.: horímetro atual do equipamento) */
  base?: number;
  /** atraso simulado da leitura (ms); use 0 em testes */
  delayMs?: number;
  /** força falha para exercitar o fallback manual */
  simularFalha?: boolean;
}

export async function lerHorimetroDaFoto(
  _arquivo: File | Blob,
  opts: LeituraOpts = {},
): Promise<number> {
  const { base, delayMs = 1200, simularFalha = false } = opts;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (simularFalha) {
    throw new Error("Não foi possível ler o horímetro da foto.");
  }
  return base != null ? Math.round(base * 10) / 10 : OCR_VALOR_SIMULADO;
}
