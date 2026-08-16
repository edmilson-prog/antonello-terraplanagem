import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type { ParametroAlteracao, Parametros } from "@/shared/types";

// Store dos parâmetros da plataforma. Diferente das outras stores do projeto,
// esta guarda UM registro, não uma lista — a tabela é singleton por índice
// único no banco. Mesmo mecanismo de notificação (useSyncExternalStore) e o
// mesmo guard de credencial das demais.
//
// `versao` e `atualizado_por` não são enviados no update: quem carimba os dois
// é o trigger `parametros_antes_update`, e só quando algum campo de negócio
// mudou de fato.
type PatchParametros = Partial<
  Omit<Parametros, "id" | "versao" | "atualizado_por" | "created_at" | "updated_at">
>;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let atual: Parametros | null = null;
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
  // Tabela da retaguarda: sem sessão a consulta voltaria 401. `assinarCredencial`
  // chama de novo quando a sessão entra.
  if (credencialAtual() !== "retaguarda") {
    atual = null;
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("parametros")
    .select("*")
    .maybeSingle()
    .returns<Parametros>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    atual = data ?? null;
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(carregar);

const get = () => atual;
const getEstado = () => estado;

const useParametros = () => useSyncExternalStore(inscrever, get, get);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

const salvar = async (patch: PatchParametros): Promise<void> => {
  if (!atual) throw new Error("Parâmetros ainda não carregados.");
  const { error } = await supabase.from("parametros").update(patch).eq("id", atual.id);
  if (error) throw new Error(error.message);
  await carregar();
};

// Histórico é lido sob demanda (só quando o diálogo abre), não fica em cache:
// é uma lista que só cresce e ninguém consulta no fluxo normal.
const carregarHistorico = async (limite = 100): Promise<ParametroAlteracao[]> => {
  const { data, error } = await supabase
    .from("parametros_historico")
    .select("*")
    .order("alterado_em", { ascending: false })
    .limit(limite)
    .returns<ParametroAlteracao[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const parametrosStore = {
  get,
  useParametros,
  useEstado,
  salvar,
  carregarHistorico,
  retry: carregar,
};
