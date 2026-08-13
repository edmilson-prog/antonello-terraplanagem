import { EVENTO_CREDENCIAL_OPERADOR } from "@/lib/eventos";

const STORAGE_KEY = "antonello.sessao_operador";
const ULTIMO_OPERADOR_KEY = "antonello.ultimo_operador";

/*
 * Entrar e sair pelo PIN não recarrega a página, e localStorage não avisa a
 * própria aba. Sem este aviso, os stores continuariam com o resultado de antes
 * do login — no app de campo, com a lista vazia que a falta de credencial
 * produz — até alguém dar F5.
 */
function avisarMudancaDeCredencial() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENTO_CREDENCIAL_OPERADOR));
}

export interface OperadorSessao {
  token: string;
  operadorId: string;
  operadorNome: string;
  expiraEm: string; // ISO 8601
}

export function lerSessaoOperador(): OperadorSessao | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const sessao = JSON.parse(raw) as OperadorSessao;
    if (new Date(sessao.expiraEm).getTime() <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return sessao;
  } catch {
    return null;
  }
}

export function gravarSessaoOperador(sessao: OperadorSessao) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
  avisarMudancaDeCredencial();
}

export function encerrarSessaoOperador() {
  window.localStorage.removeItem(STORAGE_KEY);
  avisarMudancaDeCredencial();
}

export interface UltimoOperador {
  id: string;
  nome: string;
}

/*
 * Quem entrou por último NESTE aparelho. Sobrevive ao logout de propósito: o
 * celular é do operador (ou fica na máquina), então o login abre direto no PIN
 * dele em vez de pedir a escolha toda vez. Só id e nome — nada além do que a
 * RLS `operadores_anon_login_list` já expõe à role anon.
 */
export function lembrarUltimoOperador(operador: UltimoOperador) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ULTIMO_OPERADOR_KEY, JSON.stringify(operador));
}

export function lerUltimoOperador(): UltimoOperador | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ULTIMO_OPERADOR_KEY);
  if (!raw) return null;
  try {
    const operador = JSON.parse(raw) as UltimoOperador;
    return operador.id && operador.nome ? operador : null;
  } catch {
    return null;
  }
}

// Lança se chamado fora de uma rota protegida por /app (nunca deveria acontecer
// já que o OperadorShell redireciona pra /app/entrar antes de renderizar).
export function getOperadorLogadoId(): string {
  const sessao = lerSessaoOperador();
  if (!sessao) {
    throw new Error("Nenhum operador logado.");
  }
  return sessao.operadorId;
}
