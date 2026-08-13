import { useSyncExternalStore } from "react";
import { supabase, sessaoRestaurada } from "@/lib/supabase";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import { podeFecharOS } from "@/features/ordem-servico/derivacoes";
import type { Apontamento, OrdemServico } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesma API pública do antigo mock
// em memória) — cache em memória + notificação via useSyncExternalStore,
// recarregado do banco após cada mutação. Nada aqui lê src/mocks/ mais.
//
// A leitura tem dois caminhos: a retaguarda lê a tabela sob a sessão do Supabase
// Auth; o app de campo, que roda como `anon` e não enxerga `ordens_servico`, lê
// pela RPC `listar_ordens_operador` com o token da sessão por PIN. As mutações
// (criar/atualizar/fechar) são exclusivas da retaguarda — pelo ADR-001 o
// operador nunca fecha uma OS.

export type ResultadoFecharOrdem =
  | { ok: true; ordem: OrdemServico }
  | { ok: false; motivo: string };

type NovaOrdem = Omit<
  OrdemServico,
  "id" | "status" | "aberta_em" | "fechada_em" | "pendente_sync" | "created_at" | "updated_at"
>;
type PatchOrdem = Partial<Omit<OrdemServico, "id" | "created_at">>;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: OrdemServico[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

function buscar(): PromiseLike<{ data: OrdemServico[] | null; error: { message: string } | null }> {
  const sessao = lerSessaoOperador();
  if (sessao) {
    return supabase
      .rpc("listar_ordens_operador", { p_token: sessao.token })
      .returns<OrdemServico[]>();
  }
  return supabase
    .from("ordens_servico")
    .select("*")
    .order("aberta_em", { ascending: false })
    .returns<OrdemServico[]>();
}

async function carregar() {
  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await buscar();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

sessaoRestaurada.then(carregar);

const listar = () => itens;
const obter = (id: string) => itens.find((o) => o.id === id);
const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useOrdem = (id: string) =>
  useSyncExternalStore(
    inscrever,
    () => obter(id),
    () => obter(id),
  );
const useEstado = () =>
  useSyncExternalStore(
    inscrever,
    () => estado,
    () => estado,
  );

async function criar(dados: NovaOrdem): Promise<OrdemServico> {
  const agora = new Date().toISOString();
  const { data, error } = await supabase
    .from("ordens_servico")
    .insert({
      ...dados,
      status: "aberta",
      aberta_em: agora,
      fechada_em: null,
      pendente_sync: false,
    })
    .select()
    .single()
    .returns<OrdemServico>();

  if (error) throw new Error(error.message);
  await carregar();
  return data;
}

async function atualizar(id: string, patch: PatchOrdem): Promise<void> {
  const { error } = await supabase.from("ordens_servico").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
}

async function fechar(id: string, apontamentos: Apontamento[]): Promise<ResultadoFecharOrdem> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "OS não encontrada." };
  const r = podeFecharOS(atual, apontamentos);
  if (!r.pode) return { ok: false, motivo: r.motivo };

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("ordens_servico")
    .update({ status: "fechada", fechada_em: agora })
    .eq("id", id);
  if (error) return { ok: false, motivo: error.message };

  await carregar();
  const fechada = obter(id);
  if (!fechada) return { ok: false, motivo: "OS não encontrada após fechar." };
  return { ok: true, ordem: fechada };
}

export const ordensStore = {
  listar,
  obter,
  criar,
  atualizar,
  fechar,
  useTodas,
  useOrdem,
  useEstado,
  retry: carregar,
};
