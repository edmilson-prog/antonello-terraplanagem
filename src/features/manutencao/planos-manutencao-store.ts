import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import type { PlanoManutencao } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesma API pública do antigo
// createMockStore) — cache em memória + notificação via useSyncExternalStore,
// recarregado do banco após cada mutação. Nada aqui lê src/mocks/ mais.
//
// Duas leituras, como em ordens-store: a retaguarda consulta a tabela sob a
// sessão do Supabase Auth; o app de campo roda como `anon`, não enxerga
// `planos_manutencao` (a policy exige is_retaguarda()) e vai pela RPC
// `listar_planos_manutencao_operador` com o token da sessão por PIN. Escrever
// é exclusivo da retaguarda — plano é cadastro.
//
// A migração fechou um buraco antigo: `equipamentosStore.create` já gravava o
// plano preventivo direto no Supabase, mas a lista continuava vindo do mock —
// então o plano nascia invisível.

type NovoPlano = Omit<PlanoManutencao, "id" | "created_at" | "updated_at">;
type PatchPlano = Partial<Omit<PlanoManutencao, "id" | "created_at">>;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: PlanoManutencao[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

function buscar(): PromiseLike<{
  data: PlanoManutencao[] | null;
  error: { message: string } | null;
}> {
  const sessao = lerSessaoOperador();
  if (sessao) {
    return supabase
      .rpc("listar_planos_manutencao_operador", { p_token: sessao.token })
      .returns<PlanoManutencao[]>();
  }
  return supabase
    .from("planos_manutencao")
    .select("*")
    .order("descricao")
    .returns<PlanoManutencao[]>();
}

async function carregar() {
  if (credencialAtual() === "nenhuma") {
    itens = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

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

assinarCredencial(carregar);

const getAll = () => itens;
const getById = (id: string) => itens.find((p) => p.id === id);
const getEstado = () => estado;

const useAll = () => useSyncExternalStore(inscrever, getAll, getAll);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

async function create(dados: NovoPlano): Promise<PlanoManutencao> {
  const { data, error } = await supabase
    .from("planos_manutencao")
    .insert(dados)
    .select()
    .single()
    .returns<PlanoManutencao>();

  if (error) throw new Error(error.message);
  await carregar();
  return data;
}

async function update(id: string, patch: PatchPlano): Promise<void> {
  const { error } = await supabase.from("planos_manutencao").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
}

const setAtivo = (id: string, ativo: boolean): Promise<void> => update(id, { ativo });

export const planosManutencaoStore = {
  getAll,
  getById,
  useAll,
  useEstado,
  create,
  update,
  setAtivo,
  retry: carregar,
};
