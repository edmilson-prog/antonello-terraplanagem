/*
 * Regra do convite de instalação do app de campo.
 *
 * Tudo o que decide *se* o convite aparece mora aqui, puro e testável: o hook
 * só liga isto aos eventos do navegador. Duas ideias sustentam o desenho:
 *
 * 1. O convite só aparece quando existe um caminho real de instalação — o
 *    prompt nativo (Chrome/Edge/Samsung) ou o passo a passo do iOS. Em um
 *    navegador onde nada disso vale (Firefox, Safari de desktop), insistir
 *    seria pedir ao operador algo que ele não tem como fazer.
 * 2. "Agora não" é respeitado com prazo crescente e, na terceira vez, para de
 *    perguntar. O operador em campo não pode ser interrogado toda manhã — o
 *    convite continua disponível no Perfil, por iniciativa dele.
 */

export type ModoConvite =
  | "oculto" // já instalado, sem caminho de instalação, ou dispensado
  | "nativo" // o navegador entregou o prompt de instalação
  | "ios"; // iPhone/iPad: só o passo a passo manual resolve

export interface PreferenciaConvite {
  /** Quantas vezes o operador disse "agora não". */
  dispensas: number;
  /** ISO da última dispensa; `null` quando nunca dispensou. */
  dispensadoEm: string | null;
}

export const CHAVE_CONVITE = "antonello.convite_instalacao";

/** Silêncio depois de cada "agora não". Esgotada a lista, não pergunta mais. */
export const DIAS_DE_SILENCIO = [7, 30];

export const PREFERENCIA_VAZIA: PreferenciaConvite = { dispensas: 0, dispensadoEm: null };

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function lerPreferencia(): PreferenciaConvite {
  if (typeof window === "undefined") return PREFERENCIA_VAZIA;
  try {
    const bruto = window.localStorage.getItem(CHAVE_CONVITE);
    if (!bruto) return PREFERENCIA_VAZIA;
    const salvo = JSON.parse(bruto) as Partial<PreferenciaConvite>;
    return {
      dispensas: typeof salvo.dispensas === "number" ? salvo.dispensas : 0,
      dispensadoEm: typeof salvo.dispensadoEm === "string" ? salvo.dispensadoEm : null,
    };
  } catch {
    // Storage bloqueado ou conteúdo corrompido: convidar é melhor que sumir.
    return PREFERENCIA_VAZIA;
  }
}

function gravarPreferencia(preferencia: PreferenciaConvite): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_CONVITE, JSON.stringify(preferencia));
  } catch {
    // Sem storage o convite volta na próxima abertura — incômodo, não erro.
  }
}

export function registrarDispensa(agora: Date = new Date()): PreferenciaConvite {
  const atual = lerPreferencia();
  const proxima: PreferenciaConvite = {
    dispensas: atual.dispensas + 1,
    dispensadoEm: agora.toISOString(),
  };
  gravarPreferencia(proxima);
  return proxima;
}

/** Instalou: o histórico de dispensas não vale mais nada. */
export function limparPreferencia(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHAVE_CONVITE);
  } catch {
    /* idem gravarPreferencia */
  }
}

export function silenciado(preferencia: PreferenciaConvite, agora: Date = new Date()): boolean {
  if (preferencia.dispensas <= 0 || !preferencia.dispensadoEm) return false;

  const dias = DIAS_DE_SILENCIO[preferencia.dispensas - 1];
  // Dispensou mais vezes do que a lista prevê: o recado foi dado, não insiste.
  if (dias === undefined) return true;

  const desde = Date.parse(preferencia.dispensadoEm);
  if (Number.isNaN(desde)) return false;

  return agora.getTime() - desde < dias * UM_DIA_MS;
}

export interface EntradaConvite {
  instalado: boolean;
  ios: boolean;
  /** O navegador guardou um `beforeinstallprompt` para usar. */
  promptNativo: boolean;
  preferencia: PreferenciaConvite;
  agora: Date;
  /** Ponto de entrada permanente (Perfil): não obedece ao "agora não". */
  ignorarSilencio?: boolean;
}

export function decidirConvite({
  instalado,
  ios,
  promptNativo,
  preferencia,
  agora,
  ignorarSilencio = false,
}: EntradaConvite): ModoConvite {
  if (instalado) return "oculto";

  // O prompt nativo vem primeiro: onde ele existe, instalar é um toque só.
  const modo: ModoConvite = promptNativo ? "nativo" : ios ? "ios" : "oculto";
  if (modo === "oculto") return "oculto";

  if (!ignorarSilencio && silenciado(preferencia, agora)) return "oculto";
  return modo;
}
