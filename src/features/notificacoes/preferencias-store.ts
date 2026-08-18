import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type {
  NotificacoesPreferencias,
  PreferenciaEventoNotificacao,
  TipoNotificacao,
} from "@/shared/types";

/*
 * Preferências de notificação (Onda 19) — uma linha para a empresa inteira,
 * mesma escolha da tabela `parametros`. Decisão do usuário: o app de campo não
 * tem tela de preferências, então guardar por pessoa deixaria o operador sem
 * como mudar a dele.
 *
 * Junto vêm os aparelhos com push, que não são preferência mas moram na mesma
 * tela — e o nome do operador precisa vir junto, senão a lista seria de
 * endpoints anônimos.
 */

export interface AparelhoPush {
  id: string;
  operador_id: string;
  operador_nome: string;
  endpoint: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let preferencias: NotificacoesPreferencias | null = null;
let eventos: PreferenciaEventoNotificacao[] = [];
let aparelhos: AparelhoPush[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

interface LinhaAparelho {
  id: string;
  operador_id: string;
  endpoint: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  operadores: { nome: string } | null;
}

async function carregar() {
  if (credencialAtual() !== "retaguarda") {
    preferencias = null;
    eventos = [];
    aparelhos = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const [prefs, evts, devs] = await Promise.all([
    supabase
      .from("notificacoes_preferencias")
      .select("*")
      .limit(1)
      .maybeSingle<NotificacoesPreferencias>(),
    supabase
      .from("notificacoes_preferencias_eventos")
      .select("*")
      .returns<PreferenciaEventoNotificacao[]>(),
    supabase
      .from("push_subscriptions")
      .select("id, operador_id, endpoint, user_agent, created_at, updated_at, operadores(nome)")
      .order("updated_at", { ascending: false })
      .returns<LinhaAparelho[]>(),
  ]);

  const falha = prefs.error ?? evts.error ?? devs.error;
  if (falha) {
    estado = { isLoading: false, error: new Error(falha.message) };
    notificar();
    return;
  }

  preferencias = prefs.data ?? null;
  eventos = evts.data ?? [];
  aparelhos = (devs.data ?? []).map((d) => ({
    id: d.id,
    operador_id: d.operador_id,
    operador_nome: d.operadores?.nome ?? "Operador removido",
    endpoint: d.endpoint,
    user_agent: d.user_agent,
    created_at: d.created_at,
    updated_at: d.updated_at,
  }));

  estado = { isLoading: false, error: null };
  notificar();
}

assinarCredencial(carregar);

const getPreferencias = () => preferencias;
const getEventos = () => eventos;
const getAparelhos = () => aparelhos;
const getEstado = () => estado;

const usePreferencias = () => useSyncExternalStore(inscrever, getPreferencias, getPreferencias);
const useEventos = () => useSyncExternalStore(inscrever, getEventos, getEventos);
const useAparelhos = () => useSyncExternalStore(inscrever, getAparelhos, getAparelhos);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

export type PatchPreferencias = Partial<
  Omit<NotificacoesPreferencias, "id" | "created_at" | "updated_at">
>;

async function salvar(
  patch: PatchPreferencias,
  matriz: Record<
    TipoNotificacao,
    Omit<PreferenciaEventoNotificacao, "tipo" | "created_at" | "updated_at">
  >,
): Promise<void> {
  if (!preferencias) throw new Error("Preferências ainda não carregadas.");

  const { data: sessao } = await supabase.auth.getSession();

  const { error: erroPrefs } = await supabase
    .from("notificacoes_preferencias")
    .update({ ...patch, atualizado_por: sessao.session?.user.id ?? null })
    .eq("id", preferencias.id);
  if (erroPrefs) throw new Error(erroPrefs.message);

  // A matriz vai inteira num upsert só: são 18 linhas, e mandar uma a uma
  // deixaria a tela salva pela metade se a rede caísse no meio.
  const linhas = Object.entries(matriz).map(([tipo, canais]) => ({ tipo, ...canais }));
  const { error: erroEventos } = await supabase
    .from("notificacoes_preferencias_eventos")
    .upsert(linhas, { onConflict: "tipo" });
  if (erroEventos) throw new Error(erroEventos.message);

  await carregar();
}

export const preferenciasNotificacaoStore = {
  getPreferencias,
  getEventos,
  getAparelhos,
  usePreferencias,
  useEventos,
  useAparelhos,
  useEstado,
  salvar,
  retry: carregar,
};
