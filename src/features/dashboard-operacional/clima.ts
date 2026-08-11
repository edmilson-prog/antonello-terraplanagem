// Clima da base da operação, exibido sobre o mapa do canteiro (UI kit
// `DashboardOperacional`). Usa a Open-Meteo: API pública, sem chave e sem
// cadastro, e a requisição só envia coordenadas fixas — nenhum dado do
// sistema ou do usuário sai daqui.

export interface Clima {
  temperatura: number; // °C
  descricao: string;
  icone: string; // Iconify
}

export interface LocalClima {
  nome: string;
  lat: number;
  lng: number;
}

// Base da empresa. Trocar aqui se a operação mudar de praça.
export const LOCAL_PADRAO: LocalClima = {
  nome: "Santo Ângelo — RS",
  lat: -28.2992,
  lng: -54.2631,
};

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

// Códigos WMO devolvidos pela Open-Meteo em `weather_code`.
const TEMPO_POR_CODIGO: Record<number, { descricao: string; icone: string }> = {
  0: { descricao: "céu limpo", icone: "lucide:sun" },
  1: { descricao: "predominantemente limpo", icone: "lucide:sun" },
  2: { descricao: "parcialmente nublado", icone: "lucide:cloud-sun" },
  3: { descricao: "nublado", icone: "lucide:cloudy" },
  45: { descricao: "nevoeiro", icone: "lucide:cloud-fog" },
  48: { descricao: "nevoeiro com geada", icone: "lucide:cloud-fog" },
  51: { descricao: "garoa fraca", icone: "lucide:cloud-drizzle" },
  53: { descricao: "garoa", icone: "lucide:cloud-drizzle" },
  55: { descricao: "garoa forte", icone: "lucide:cloud-drizzle" },
  56: { descricao: "garoa congelante", icone: "lucide:cloud-drizzle" },
  57: { descricao: "garoa congelante forte", icone: "lucide:cloud-drizzle" },
  61: { descricao: "chuva fraca", icone: "lucide:cloud-rain" },
  63: { descricao: "chuva", icone: "lucide:cloud-rain" },
  65: { descricao: "chuva forte", icone: "lucide:cloud-rain" },
  66: { descricao: "chuva congelante", icone: "lucide:cloud-rain" },
  67: { descricao: "chuva congelante forte", icone: "lucide:cloud-rain" },
  71: { descricao: "neve fraca", icone: "lucide:cloud-snow" },
  73: { descricao: "neve", icone: "lucide:cloud-snow" },
  75: { descricao: "neve forte", icone: "lucide:cloud-snow" },
  77: { descricao: "grãos de neve", icone: "lucide:snowflake" },
  80: { descricao: "pancadas de chuva", icone: "lucide:cloud-rain-wind" },
  81: { descricao: "pancadas de chuva", icone: "lucide:cloud-rain-wind" },
  82: { descricao: "pancadas fortes de chuva", icone: "lucide:cloud-rain-wind" },
  85: { descricao: "pancadas de neve", icone: "lucide:cloud-snow" },
  86: { descricao: "pancadas fortes de neve", icone: "lucide:cloud-snow" },
  95: { descricao: "trovoada", icone: "lucide:cloud-lightning" },
  96: { descricao: "trovoada com granizo", icone: "lucide:cloud-hail" },
  99: { descricao: "trovoada com granizo forte", icone: "lucide:cloud-hail" },
};

const TEMPO_DESCONHECIDO = { descricao: "sem leitura", icone: "lucide:cloud" };

export function descreverTempo(codigo: number): { descricao: string; icone: string } {
  return TEMPO_POR_CODIGO[codigo] ?? TEMPO_DESCONHECIDO;
}

export function urlClima(local: LocalClima = LOCAL_PADRAO): string {
  const params = new URLSearchParams({
    latitude: String(local.lat),
    longitude: String(local.lng),
    current: "temperature_2m,weather_code",
    timezone: "America/Sao_Paulo",
  });
  return `${ENDPOINT}?${params.toString()}`;
}

interface RespostaOpenMeteo {
  current?: { temperature_2m?: number; weather_code?: number };
}

// Converte a resposta crua em Clima. Exportada para teste — a validação vive
// aqui, não no componente.
export function interpretarResposta(dados: unknown): Clima | null {
  const atual = (dados as RespostaOpenMeteo)?.current;
  if (!atual || typeof atual.temperature_2m !== "number") return null;
  const tempo = descreverTempo(atual.weather_code ?? -1);
  return {
    temperatura: Math.round(atual.temperature_2m),
    descricao: tempo.descricao,
    icone: tempo.icone,
  };
}

// Devolve null em qualquer falha (rede, HTTP, payload inesperado): o clima é
// enfeite informativo, nunca pode derrubar o mapa.
export async function buscarClima(
  local: LocalClima = LOCAL_PADRAO,
  signal?: AbortSignal,
): Promise<Clima | null> {
  try {
    const resposta = await fetch(urlClima(local), { signal });
    if (!resposta.ok) return null;
    return interpretarResposta(await resposta.json());
  } catch {
    return null;
  }
}
