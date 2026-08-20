import { supabase } from "@/lib/supabase";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import { ehIOS, rodandoInstalado } from "@/features/instalacao/deteccao";

/*
 * Web Push no cliente (PRD-020).
 *
 * O service worker é um arquivo estático em public/sw.js, registrado à mão —
 * o vite.config.ts do projeto proíbe adicionar plugins (o preset da Lovable já
 * traz os seus e plugin duplicado quebra o build), então nada de vite-plugin-pwa.
 */

const CAMINHO_SW = "/sw.js";
const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? "";

export type EstadoPush =
  | "indisponivel" // navegador sem suporte (ou iOS fora da tela inicial)
  | "nao_configurado" // falta VITE_VAPID_PUBLIC_KEY no build
  | "bloqueado" // o usuário negou a permissão no navegador
  | "desligado"
  | "ligado";

/*
 * O padrão Web Push manda a chave como Uint8Array, não como a string base64url.
 *
 * O parâmetro de tipo é explícito porque `applicationServerKey` exige
 * `BufferSource`, que aceita view sobre `ArrayBuffer` mas não sobre
 * `SharedArrayBuffer`. Sem ele, o `Uint8Array` genérico do TS 5.7+ carrega
 * `ArrayBufferLike` e o compilador recusa — mesmo o buffer aqui sendo sempre
 * um `ArrayBuffer` comum, criado logo abaixo.
 */
function base64UrlParaUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const preenchimento = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalizada = (base64 + preenchimento).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = window.atob(normalizada);
  const saida = new Uint8Array(bruto.length);
  for (let i = 0; i < bruto.length; i += 1) saida[i] = bruto.charCodeAt(i);
  return saida;
}

function arrayBufferParaBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return window.btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** No iOS, Web Push só existe se o app tiver sido instalado na tela inicial. */
export function precisaInstalarNaTelaInicial(): boolean {
  return ehIOS() && !rodandoInstalado();
}

export function pushSuportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(CAMINHO_SW, { scope: "/" });
  } catch (erro) {
    console.warn("Falha ao registrar o service worker:", erro);
    return null;
  }
}

export async function estadoAtualDoPush(): Promise<EstadoPush> {
  if (!pushSuportado()) return "indisponivel";
  if (precisaInstalarNaTelaInicial()) return "indisponivel";
  if (!VAPID_PUBLIC_KEY) return "nao_configurado";
  if (Notification.permission === "denied") return "bloqueado";

  const registro = await navigator.serviceWorker.getRegistration(CAMINHO_SW);
  const inscricao = await registro?.pushManager.getSubscription();
  return inscricao ? "ligado" : "desligado";
}

/**
 * Pede a permissão, inscreve no serviço de push do navegador e guarda a
 * inscrição no banco. Retorna o estado final — quem chama decide o que dizer.
 */
export async function ativarPush(): Promise<EstadoPush> {
  const sessao = lerSessaoOperador();
  if (!sessao) return "desligado";
  if (!pushSuportado() || precisaInstalarNaTelaInicial()) return "indisponivel";
  if (!VAPID_PUBLIC_KEY) return "nao_configurado";

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") return permissao === "denied" ? "bloqueado" : "desligado";

  const registro =
    (await navigator.serviceWorker.getRegistration(CAMINHO_SW)) ?? (await registrarServiceWorker());
  if (!registro) return "indisponivel";

  // `ready` garante que o worker está ativo antes de inscrever.
  await navigator.serviceWorker.ready;

  const inscricao =
    (await registro.pushManager.getSubscription()) ??
    (await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlParaUint8Array(VAPID_PUBLIC_KEY),
    }));

  const { error } = await supabase.rpc("registrar_push_subscription", {
    p_token: sessao.token,
    p_endpoint: inscricao.endpoint,
    p_p256dh: arrayBufferParaBase64Url(inscricao.getKey("p256dh")),
    p_auth: arrayBufferParaBase64Url(inscricao.getKey("auth")),
    p_user_agent: navigator.userAgent.slice(0, 300),
  });

  if (error) {
    console.warn("Falha ao guardar a inscrição de push:", error.message);
    return "desligado";
  }

  return "ligado";
}

export async function desativarPush(): Promise<EstadoPush> {
  const sessao = lerSessaoOperador();
  if (!pushSuportado()) return "indisponivel";

  const registro = await navigator.serviceWorker.getRegistration(CAMINHO_SW);
  const inscricao = await registro?.pushManager.getSubscription();
  if (!inscricao) return "desligado";

  if (sessao) {
    await supabase.rpc("remover_push_subscription", {
      p_token: sessao.token,
      p_endpoint: inscricao.endpoint,
    });
  }
  await inscricao.unsubscribe();
  return "desligado";
}

/**
 * Reafirma a inscrição deste aparelho no banco a cada abertura do app.
 * Serve para dois casos: o navegador rotacionou o endpoint por conta própria,
 * e o aparelho trocou de operador (a RPC reaponta a linha pelo endpoint).
 */
export async function reafirmarInscricao(): Promise<void> {
  const sessao = lerSessaoOperador();
  if (!sessao || !pushSuportado() || Notification.permission !== "granted") return;

  const registro = await navigator.serviceWorker.getRegistration(CAMINHO_SW);
  const inscricao = await registro?.pushManager.getSubscription();
  if (!inscricao) return;

  await supabase.rpc("registrar_push_subscription", {
    p_token: sessao.token,
    p_endpoint: inscricao.endpoint,
    p_p256dh: arrayBufferParaBase64Url(inscricao.getKey("p256dh")),
    p_auth: arrayBufferParaBase64Url(inscricao.getKey("auth")),
    p_user_agent: navigator.userAgent.slice(0, 300),
  });
}
