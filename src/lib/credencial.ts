import { supabase, sessaoRestaurada } from "@/lib/supabase";
import { EVENTO_CREDENCIAL_OPERADOR } from "@/lib/eventos";
import { lerSessaoOperador } from "@/features/auth/operador-session";

/*
 * Quem está falando com o banco agora — e o aviso de quando isso muda.
 *
 * O bundle não tem code-splitting: todo store é importado no boot de qualquer
 * rota, inclusive a landing pública, a tela de login e o app de campo. Sem
 * sessão, o supabase-js manda a anon key como Bearer, e as tabelas de negócio
 * só têm GRANT SELECT para `authenticated` — a consulta volta 42501
 * ("permission denied for table ..."), que o PostgREST devolve como 401.
 *
 * Pior: nenhum login recarrega a página (a retaguarda entra com
 * navigate({ to: "/admin" }), o operador com o token em localStorage), então um
 * store que só carregasse no import guardava esse erro até o usuário dar F5.
 * Daí as duas metades daqui: `credencialAtual()` diz se vale consultar, e
 * `assinarCredencial()` avisa quando passa a valer.
 */

export type Credencial = "retaguarda" | "operador" | "nenhuma";

let temSessaoRetaguarda = false;
let bootConcluido = false;
let ultima: Credencial = "nenhuma";
const ouvintes = new Set<() => void>();

/*
 * O operador vem primeiro: no app de campo o acesso é por RPC com token, que
 * funciona mesmo sem sessão do Supabase Auth. O token é lido na hora (e não
 * guardado em cache) porque muda direto no localStorage, sem evento de auth —
 * um valor memorizado ficaria velho entre o login e a primeira carga.
 */
export function credencialAtual(): Credencial {
  if (lerSessaoOperador()) return "operador";
  return temSessaoRetaguarda ? "retaguarda" : "nenhuma";
}

function revisar() {
  // Antes do boot terminar não há o que avisar: a assinatura já dispara uma vez
  // quando `sessaoRestaurada` resolve, e antecipar aqui daria carga dobrada.
  if (!bootConcluido) return;
  const atual = credencialAtual();
  if (atual === ultima) return;
  ultima = atual;
  ouvintes.forEach((avisar) => avisar());
}

const boot = sessaoRestaurada.then(({ data }) => {
  temSessaoRetaguarda = Boolean(data.session);
  ultima = credencialAtual();
  bootConcluido = true;
});

supabase.auth.onAuthStateChange((_evento, session) => {
  temSessaoRetaguarda = Boolean(session);
  revisar();
});

if (typeof window !== "undefined") {
  window.addEventListener(EVENTO_CREDENCIAL_OPERADOR, revisar);
}

/*
 * Chama `aoMudar` uma vez assim que a sessão persistida termina de ser
 * restaurada, e de novo a cada troca real de credencial (entrar, sair, trocar
 * de perfil). Devolve a função que cancela a assinatura.
 */
export function assinarCredencial(aoMudar: () => void): () => void {
  ouvintes.add(aoMudar);
  void boot.then(aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
  };
}
