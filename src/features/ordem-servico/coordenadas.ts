/*
 * Par de coordenadas do canteiro, digitado como texto.
 *
 * O caso real é colar do Google Maps ("-28.2992, -54.2631"), então o parse
 * aceita as formas em que esse texto costuma chegar: vírgula ou espaço como
 * separador, sinal de menos comum ou o traço tipográfico que alguns teclados e
 * o próprio Maps produzem (− U+2212), e vírgula decimal do teclado brasileiro.
 *
 * O que NÃO faz: adivinhar. Texto que não vira um par válido devolve erro e o
 * formulário recusa — coordenada aproximada põe a máquina no lugar errado do
 * mapa, o que é pior que não ter pin nenhum.
 */

export interface Coordenadas {
  lat: number;
  lng: number;
}

export type ResultadoCoordenadas =
  | { ok: true; valor: Coordenadas | null }
  | { ok: false; motivo: string };

const MENOS_TIPOGRAFICO = /[−–—]/g;

export function parseCoordenadas(texto: string | undefined): ResultadoCoordenadas {
  const bruto = texto?.trim();
  // Campo vazio é ausência de localização, não erro: informar a coordenada da
  // obra é opcional.
  if (!bruto) return { ok: true, valor: null };

  const normalizado = bruto.replace(MENOS_TIPOGRAFICO, "-");

  // Vírgula decimal só é ambígua quando ela também separa o par. Separando por
  // vírgula, "−28,2992, −54,2631" viraria quatro pedaços — daí a contagem.
  const pedacos = normalizado
    .split(/[,;\s]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let lat: number;
  let lng: number;

  if (pedacos.length === 2) {
    lat = Number(pedacos[0]);
    lng = Number(pedacos[1]);
  } else if (pedacos.length === 4) {
    // Vírgula decimal: "-28,2992, -54,2631".
    lat = Number(`${pedacos[0]}.${pedacos[1]}`);
    lng = Number(`${pedacos[2]}.${pedacos[3]}`);
  } else {
    return { ok: false, motivo: "Informe latitude e longitude, ex.: -28.2992, -54.2631" };
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, motivo: "Coordenadas inválidas" };
  }
  if (lat < -90 || lat > 90) {
    return { ok: false, motivo: "Latitude fora da faixa (-90 a 90)" };
  }
  if (lng < -180 || lng > 180) {
    return { ok: false, motivo: "Longitude fora da faixa (-180 a 180)" };
  }

  // 6 casas ≈ 11 cm, o limite da coluna numeric(9,6) — e muito além do que
  // localizar um canteiro exige.
  return {
    ok: true,
    valor: { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 },
  };
}

/** Formata de volta para o campo de texto do formulário. */
export function formatCoordenadas(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return "";
  return `${lat}, ${lng}`;
}
