import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type { HistoricoPreco } from "@/shared/types";

/*
 * Histórico de preços (Onda 20) — só leitura.
 *
 * Antes era uma lista em memória que a própria tela alimentava ao salvar uma
 * alteração; o F5 apagava tudo. Agora quem grava é o trigger
 * `tg_registrar_historico_preco`, nas três tabelas de preço — mesmo desenho do
 * histórico de parâmetros (Onda 13).
 *
 * Isso muda a responsabilidade: os formulários NÃO chamam mais `registrar()`.
 * Alteração feita por SQL, importação ou qualquer caminho futuro entra no
 * histórico do mesmo jeito, em vez de depender de a tela ter lembrado.
 */

const LIMITE = 100;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: HistoricoPreco[] = [];
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
  if (credencialAtual() !== "retaguarda") {
    itens = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("precos_historico")
    .select("*")
    .order("alterado_em", { ascending: false })
    .limit(LIMITE)
    .returns<HistoricoPreco[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(() => {
  void carregar();
});

const listar = () => itens;
const getEstado = () => estado;

const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

export const historicoPrecosStore = {
  listar,
  useTodos,
  useEstado,
  retry: carregar,
};
