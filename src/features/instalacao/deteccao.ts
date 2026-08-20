/*
 * Detecção do estado de instalação do app de campo (PWA).
 *
 * Quem primeiro precisou disso foi o Web Push (no iOS só existe com o app na
 * tela inicial), mas a pergunta "este app está instalado?" é da instalação, e
 * não das notificações — `features/notificacoes/push.ts` importa daqui.
 */

export function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ se apresenta como Mac; o toque é o que o denuncia.
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Aberto pelo ícone da tela inicial (standalone), e não por dentro do navegador. */
export function rodandoInstalado(): boolean {
  if (typeof window === "undefined") return false;
  const navegadorIOS = window.navigator as Navigator & { standalone?: boolean };
  const standalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  return standalone || navegadorIOS.standalone === true;
}
