import { useSyncExternalStore } from "react";
import { supabase, sessaoRestaurada } from "@/lib/supabase";
import type { Operador } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesma API pública do antigo
// createMockStore) — cache em memória + notificação via useSyncExternalStore,
// recarregado do banco após cada mutação. Nada aqui lê src/mocks/ mais.
//
// `create` passa por uma RPC (criar_operador) em vez de insert direto: a
// tabela exige pin_hash (não nulo), e o hash só pode ser gerado com pgcrypto
// no servidor. PIN inicial = últimos 4 dígitos do CPF.

type NovoOperador = Omit<Operador, "id" | "created_at" | "updated_at"> & {
  equipamentos_ids?: string[];
};
type PatchOperador = Partial<Omit<Operador, "id" | "created_at">>;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Operador[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

async function carregar() {
  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("operadores")
    .select("id, nome, telefone, cpf, ativo, created_at, updated_at")
    .order("nome")
    .returns<Operador[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

sessaoRestaurada.then(carregar);

const getAll = () => itens;
const getById = (id: string) => itens.find((i) => i.id === id);
const useAll = () => useSyncExternalStore(inscrever, getAll, getAll);
const useOperador = (id: string) =>
  useSyncExternalStore(
    inscrever,
    () => getById(id),
    () => getById(id),
  );
const useEstado = () =>
  useSyncExternalStore(
    inscrever,
    () => estado,
    () => estado,
  );

const create = async (dados: NovoOperador): Promise<Operador> => {
  const { data, error } = await supabase.rpc("criar_operador", {
    p_nome: dados.nome,
    p_telefone: dados.telefone ?? "",
    p_cpf: dados.cpf,
    p_ativo: dados.ativo,
    p_vinculo: dados.vinculo ?? undefined,
    p_data_nascimento: dados.data_nascimento ?? undefined,
    p_cnh_categoria: dados.cnh_categoria ?? undefined,
    p_cnh_validade: dados.cnh_validade ?? undefined,
    p_base: dados.base ?? undefined,
    p_equipamentos_ids: dados.equipamentos_ids ?? undefined,
  });

  if (error) throw new Error(error.message);
  await carregar();
  return data as unknown as Operador;
};

const update = async (id: string, patch: PatchOperador): Promise<void> => {
  const { error } = await supabase.from("operadores").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
};

const setAtivo = async (id: string, ativo: boolean): Promise<void> => update(id, { ativo });

export const operadoresStore = {
  getAll,
  getById,
  useAll,
  useOperador,
  useEstado,
  create,
  update,
  setAtivo,
  retry: carregar,
};
