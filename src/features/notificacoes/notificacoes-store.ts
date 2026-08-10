import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import type { Notificacao } from "@/shared/types";

/*
 * Store de notificações do operador (PRD-020).
 *
 * Duas diferenças em relação aos outros stores do projeto:
 *
 * 1. Não fala com a tabela, fala com RPCs. O operador não tem sessão nativa do
 *    Supabase (token opaco, ver ADR de auth em feedback do projeto), então
 *    `anon` não tem policy nenhuma em notificacoes — a função SECURITY DEFINER
 *    é a fronteira. Por isso também não há Realtime aqui: a atualização é por
 *    reconsulta, e o "tempo real" de verdade vem do Web Push.
 *
 * 2. Guarda cache em disco. O operador abre o app no meio da obra sem sinal e
 *    ainda assim precisa ver o que já chegou.
 */

const CHAVE_CACHE = "antonello.notificacoes";
const CHAVE_FILA_LIDAS = "antonello.notificacoes.fila_lidas";
const LIMITE_PADRAO = 50;

interface Estado {
  itens: Notificacao[];
  isLoading: boolean;
  error: Error | null;
  /** true quando o que está na tela saiu do disco e ainda não foi confirmado pela rede. */
  offline: boolean;
}

interface CacheEmDisco {
  operadorId: string;
  itens: Notificacao[];
}

let estado: Estado = { itens: [], isLoading: false, error: null, offline: false };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

const temJanela = () => typeof window !== "undefined";

/* ---------------- persistência local ---------------- */

function lerCache(operadorId: string): Notificacao[] {
  if (!temJanela()) return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_CACHE);
    if (!bruto) return [];
    const cache = JSON.parse(bruto) as CacheEmDisco;
    // Cache de outro operador no mesmo aparelho não vale — descarta.
    return cache.operadorId === operadorId ? cache.itens : [];
  } catch {
    return [];
  }
}

function gravarCache(operadorId: string, itens: Notificacao[]) {
  if (!temJanela()) return;
  try {
    const cache: CacheEmDisco = { operadorId, itens };
    window.localStorage.setItem(CHAVE_CACHE, JSON.stringify(cache));
  } catch {
    // Cota estourada ou modo privativo: seguir sem cache é melhor que quebrar.
  }
}

function lerFilaLidas(): string[] {
  if (!temJanela()) return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_FILA_LIDAS);
    return bruto ? (JSON.parse(bruto) as string[]) : [];
  } catch {
    return [];
  }
}

function gravarFilaLidas(ids: string[]) {
  if (!temJanela()) return;
  try {
    if (ids.length === 0) window.localStorage.removeItem(CHAVE_FILA_LIDAS);
    else window.localStorage.setItem(CHAVE_FILA_LIDAS, JSON.stringify(ids));
  } catch {
    // idem lerCache
  }
}

/**
 * O servidor não sabe das leituras que ainda estão na fila offline. Sem isto,
 * um refresh faria as notificações "voltarem a ser novas" na cara do operador.
 */
function aplicarFilaLocal(itens: Notificacao[]): Notificacao[] {
  const fila = new Set(lerFilaLidas());
  if (fila.size === 0) return itens;
  const agora = new Date().toISOString();
  return itens.map((n) => (n.lida_em === null && fila.has(n.id) ? { ...n, lida_em: agora } : n));
}

/* ---------------- leitura ---------------- */

function definirEstado(patch: Partial<Estado>) {
  estado = { ...estado, ...patch };
  notificar();
}

export async function carregar(): Promise<void> {
  const sessao = temJanela() ? lerSessaoOperador() : null;
  if (!sessao) {
    definirEstado({ itens: [], isLoading: false, error: null, offline: false });
    return;
  }

  // Pinta o cache antes de ir na rede: a tela nunca nasce vazia se já houve
  // uma carga antes neste aparelho.
  if (estado.itens.length === 0) {
    const doDisco = lerCache(sessao.operadorId);
    if (doDisco.length > 0) {
      definirEstado({ itens: aplicarFilaLocal(doDisco), offline: true });
    }
  }

  definirEstado({ isLoading: true, error: null });

  const { data, error } = await supabase.rpc("listar_notificacoes", {
    p_token: sessao.token,
    p_limite: LIMITE_PADRAO,
  });

  if (error) {
    // Sem rede o cache já pintado continua valendo; só sinalizamos a origem.
    definirEstado({
      isLoading: false,
      error: new Error(error.message),
      offline: estado.itens.length > 0,
    });
    return;
  }

  const itens = aplicarFilaLocal((data ?? []) as Notificacao[]);
  gravarCache(sessao.operadorId, itens);
  definirEstado({ itens, isLoading: false, error: null, offline: false });

  await sincronizarFilaLidas();
}

/* ---------------- escrita ---------------- */

async function chamarMarcarLidas(token: string, ids: string[]): Promise<boolean> {
  const { error } = await supabase.rpc("marcar_notificacoes_lidas", {
    p_token: token,
    p_ids: ids,
  });
  return !error;
}

/**
 * Sobe as leituras que ficaram pendentes por falta de sinal. Idempotente: a
 * RPC só mexe no que ainda está com lida_em nulo.
 */
export async function sincronizarFilaLidas(): Promise<void> {
  const sessao = temJanela() ? lerSessaoOperador() : null;
  const fila = lerFilaLidas();
  if (!sessao || fila.length === 0) return;

  if (await chamarMarcarLidas(sessao.token, fila)) {
    gravarFilaLidas([]);
  }
}

/**
 * Marca como lidas. Sem `ids`, marca todas as não lidas conhecidas — é o botão
 * "Marcar lidas" do cabeçalho.
 *
 * Otimista de propósito: o operador toca e o badge zera na hora. Se a rede
 * falhar, os ids entram na fila e sobem depois; a tela não volta atrás.
 */
export async function marcarLidas(ids?: string[]): Promise<void> {
  const sessao = temJanela() ? lerSessaoOperador() : null;
  if (!sessao) return;

  const alvos = ids ?? estado.itens.filter((n) => n.lida_em === null).map((n) => n.id);
  if (alvos.length === 0) return;

  const agora = new Date().toISOString();
  const conjunto = new Set(alvos);
  const itens = estado.itens.map((n) =>
    conjunto.has(n.id) && n.lida_em === null ? { ...n, lida_em: agora } : n,
  );
  gravarCache(sessao.operadorId, itens);
  definirEstado({ itens });

  if (!(await chamarMarcarLidas(sessao.token, alvos))) {
    const fila = Array.from(new Set([...lerFilaLidas(), ...alvos]));
    gravarFilaLidas(fila);
  }
}

/** Chamado no logout: o próximo operador deste aparelho não pode ver nada disto. */
export function limparNotificacoesLocais(): void {
  if (temJanela()) {
    window.localStorage.removeItem(CHAVE_CACHE);
    window.localStorage.removeItem(CHAVE_FILA_LIDAS);
  }
  estado = { itens: [], isLoading: false, error: null, offline: false };
  notificar();
}

/* ---------------- hooks ---------------- */

const lerEstado = () => estado;

export function useNotificacoes(): Estado {
  return useSyncExternalStore(inscrever, lerEstado, lerEstado);
}

export function useNaoLidas(): number {
  return useSyncExternalStore(
    inscrever,
    () => estado.itens.filter((n) => n.lida_em === null).length,
    () => 0,
  );
}

export const notificacoesStore = {
  carregar,
  marcarLidas,
  sincronizarFilaLidas,
  limparNotificacoesLocais,
  useNotificacoes,
  useNaoLidas,
  listar: () => estado.itens,
};
