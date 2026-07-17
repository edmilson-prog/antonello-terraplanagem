import { useSyncExternalStore } from "react";
import { supabase, sessaoRestaurada } from "@/lib/supabase";
import type { Equipamento } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesma API pública do antigo
// createMockStore) — cache em memória + notificação via useSyncExternalStore,
// recarregado do banco após cada mutação. Nada aqui lê src/mocks/ mais.

type NovoEquipamento = Omit<Equipamento, "id" | "created_at" | "updated_at">;
type PatchEquipamento = Partial<Omit<Equipamento, "id" | "created_at">>;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Equipamento[] = [];
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
    .from("equipamentos")
    .select("*")
    .order("nome")
    .returns<Equipamento[]>();

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
const useEquipamento = (id: string) =>
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

const create = async (
  dados: NovoEquipamento,
  opts?: { planoIntervaloHoras?: number },
): Promise<Equipamento> => {
  const { data, error } = await supabase
    .from("equipamentos")
    .insert(dados)
    .select()
    .single()
    .returns<Equipamento>();

  if (error) throw new Error(error.message);

  if (opts?.planoIntervaloHoras) {
    const { error: erroPlano } = await supabase.from("planos_manutencao").insert({
      equipamento_id: data.id,
      descricao: `Plano preventivo — ${data.nome}`,
      intervalo_horas: opts.planoIntervaloHoras,
      ativo: true,
    });
    if (erroPlano) throw new Error(erroPlano.message);
  }

  await carregar();
  return data;
};

const update = async (id: string, patch: PatchEquipamento): Promise<void> => {
  const { error } = await supabase.from("equipamentos").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
};

const setAtivo = async (id: string, ativo: boolean): Promise<void> => update(id, { ativo });

export const equipamentosStore = {
  getAll,
  getById,
  useAll,
  useEquipamento,
  useEstado,
  create,
  update,
  setAtivo,
  retry: carregar,
};
