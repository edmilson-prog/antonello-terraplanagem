import { VERSAO_SISTEMA, CODINOME_SISTEMA } from "@/features/auth/versao-sistema";

/*
 * Rótulo do aparelho para o card "Acesso ao app" da retaguarda.
 *
 * LGPD — minimização: o escritório precisa saber "de que tipo de aparelho este
 * operador aponta", não *qual* aparelho. Então sai daqui um rótulo grosso
 * ("Android · Redmi 12"), nunca o user-agent inteiro. Nada de IMEI, id de
 * instalação, resolução de tela ou qualquer combinação que sirva de impressão
 * digital: quanto mais preciso o rótulo, mais ele vira rastreamento.
 *
 * Quando o navegador não entrega o modelo, o rótulo para na plataforma — e o
 * card mostra "Android" mesmo, sem completar com adivinhação.
 */

interface UserAgentData {
  platform?: string;
  model?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ platform?: string; model?: string }>;
}

const PLATAFORMAS: { re: RegExp; nome: string }[] = [
  { re: /android/i, nome: "Android" },
  { re: /iphone|ipad|ipod|ios/i, nome: "iOS" },
  { re: /windows/i, nome: "Windows" },
  { re: /mac os|macintosh/i, nome: "macOS" },
  { re: /linux/i, nome: "Linux" },
];

function plataformaDoUserAgent(ua: string): string | null {
  return PLATAFORMAS.find((p) => p.re.test(ua))?.nome ?? null;
}

/*
 * O modelo, no Android, vem no miolo do user-agent entre o nível de API e o
 * "Build/": "Linux; Android 13; Redmi 12 Build/TKQ1". Fora desse formato não
 * tentamos extrair nada — chute de modelo é pior que ausência de modelo.
 */
function modeloAndroid(ua: string): string | null {
  const m = /Android\s+[\d.]+;\s*([^;)]+?)(?:\s+Build\/|[;)])/i.exec(ua);
  const bruto = m?.[1]?.trim();
  if (!bruto || /^wv$/i.test(bruto) || bruto.length > 40) return null;
  return bruto;
}

/** Ex.: "Android · Redmi 12", "iOS", "Windows". `null` fora do navegador. */
export function rotuloDispositivo(): string | null {
  if (typeof navigator === "undefined") return null;

  const uaData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  const ua = navigator.userAgent ?? "";

  const plataforma = uaData?.platform || plataformaDoUserAgent(ua);
  if (!plataforma) return null;

  const modelo = uaData?.model || (plataforma === "Android" ? modeloAndroid(ua) : null);
  return modelo ? `${plataforma} · ${modelo}` : plataforma;
}

/** Versão do bundle que está rodando, como a retaguarda a exibe. */
export function versaoDoApp(): string {
  return `v${VERSAO_SISTEMA} · ${CODINOME_SISTEMA}`;
}
