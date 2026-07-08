// A1 — OCR do horímetro. Absorve o que antes vivia em src/shared/lib/ocr.ts
// (mesmo comportamento — nenhuma regressão de UX no HorimetroCapture).

import { comDelay } from "@/features/ia/delay";
import { round2 } from "@/features/faturamento/calculo";

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

// A4 — OCR de cupom de abastecimento. litros é operacional (visível nos dois
// ambientes); valor é RETAGUARDA-ONLY — o dialog do operador nunca lê o
// segundo campo do retorno (barreira aplicada no consumidor, RNF-003).
const IA_CUPOM_LITROS_SIMULADO = 95.4;
const IA_CUPOM_VALOR_LITRO_SIMULADO = 6.29;

export interface LeituraCupom {
  litros: number;
  valor: number | null;
}

export async function lerCupomAbastecimento(
  _arquivo: File | Blob,
  opts: { delayMs?: number; simularFalha?: boolean } = {},
): Promise<LeituraCupom> {
  const { delayMs = 1200, simularFalha = false } = opts;
  await comDelay(null, delayMs);
  if (simularFalha) {
    throw new Error("Não foi possível ler o cupom.");
  }
  return {
    litros: IA_CUPOM_LITROS_SIMULADO,
    valor: round2(IA_CUPOM_LITROS_SIMULADO * IA_CUPOM_VALOR_LITRO_SIMULADO),
  };
}
