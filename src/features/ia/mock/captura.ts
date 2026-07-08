// A1 — OCR do horímetro. Absorve o que antes vivia em src/shared/lib/ocr.ts
// (mesmo comportamento — nenhuma regressão de UX no HorimetroCapture).

import { comDelay } from "@/features/ia/delay";

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
  await comDelay(null, delayMs);
  if (simularFalha) {
    throw new Error("Não foi possível ler o horímetro da foto.");
  }
  return base != null ? Math.round(base * 10) / 10 : IA_HORIMETRO_VALOR_SIMULADO;
}

// A3 — apontamento por voz. Sem captura real de áudio nesta fase (não exige
// permissão de microfone do navegador): o botão simula o ciclo completo
// gravar → transcrever, e o texto/valor retornado é sempre determinístico.
const FRASE_OBSERVACAO_SIMULADA = "Serviço executado sem intercorrências.";

interface TranscricaoOpts {
  delayMs?: number;
  horimetroBase?: number;
}

export async function transcreverVoz(
  campo: "observacao" | "horimetro",
  opts: TranscricaoOpts = {},
): Promise<string> {
  const { delayMs = 1500, horimetroBase } = opts;
  await comDelay(null, delayMs);
  if (campo === "horimetro") {
    const base = horimetroBase ?? IA_HORIMETRO_VALOR_SIMULADO;
    return String(Math.round(base * 10) / 10);
  }
  return FRASE_OBSERVACAO_SIMULADA;
}
