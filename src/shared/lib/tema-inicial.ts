/*
 * Aplicação do tema ANTES da primeira pintura.
 *
 * O tema é uma classe `.dark` no <html> (ver src/styles.css). Quem a coloca lá
 * precisa rodar antes do React: se ficar por conta de um `useEffect`, a tela
 * nasce clara e só escurece depois — e, pior, só nas telas onde algum
 * componente chama `useTheme()`. Era o que acontecia no app de campo: recarregar
 * em /app abria claro, porque o único consumidor do hook era o Perfil.
 *
 * Por isso o script vai inline no <head> (ver src/routes/__root.tsx), como
 * string: ele roda no HTML servido, antes de qualquer bundle.
 */

export const CHAVE_TEMA = "antonello.theme";

export type Tema = "light" | "dark";

/*
 * Escrito em ES5 e sem depender de nada do bundle — é executado cru pelo
 * navegador. O try/catch cobre storage bloqueado (modo privado, política de
 * cookies): sem preferência legível, cai no que o sistema do aparelho pede.
 */
export const SCRIPT_TEMA_INICIAL = `try{var t=localStorage.getItem("${CHAVE_TEMA}");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}`;
