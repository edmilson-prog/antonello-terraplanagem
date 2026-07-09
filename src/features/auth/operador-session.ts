const STORAGE_KEY = "antonello.sessao_operador";

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
}

export function encerrarSessaoOperador() {
  window.localStorage.removeItem(STORAGE_KEY);
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
