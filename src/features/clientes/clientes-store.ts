import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type { Cliente } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesma API pública do antigo
// createMockStore) — cache em memória + notificação via useSyncExternalStore,
// recarregado do banco após cada mutação. Nada aqui lê src/mocks/ mais.

type NovoCliente = Omit<Cliente, "id" | "created_at" | "updated_at">;
type PatchCliente = Partial<Omit<Cliente, "id" | "created_at">>;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Cliente[] = [];
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
  // `clientes` é tabela da retaguarda: o GRANT SELECT é só para
  // `authenticated`. Sem sessão a consulta voltaria 401 e o erro ficaria na
  // tela até um F5 — melhor não sair. `assinarCredencial` chama de novo quando
  // a sessão entra.
  if (credencialAtual() !== "retaguarda") {
    itens = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nome")
    .returns<Cliente[]>();

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
const getById = (id: string) => itens.find((i) => i.id === id);
const useAll = () => useSyncExternalStore(inscrever, getAll, getAll);
const useCliente = (id: string) =>
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

const create = async (dados: NovoCliente): Promise<Cliente> => {
  const { data, error } = await supabase
    .from("clientes")
    .insert(dados)
    .select()
    .single()
    .returns<Cliente>();

  if (error) throw new Error(error.message);
  await carregar();
  return data;
};

const update = async (id: string, patch: PatchCliente): Promise<void> => {
  const { error } = await supabase.from("clientes").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
};

const setAtivo = async (id: string, ativo: boolean): Promise<void> => update(id, { ativo });

export const clientesStore = {
  getAll,
  getById,
  useAll,
  useCliente,
  useEstado,
  create,
  update,
  setAtivo,
  retry: carregar,
};
