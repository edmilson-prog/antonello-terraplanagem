import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type { RegistroCampoRecebido } from "./tipos";

/*
 * O que chegou do campo, visto pelo escritório (Onda 22).
 *
 * Store separada da fila do operador de propósito: as duas leem a mesma
 * tabela, mas resolvem problemas opostos. Lá é fila offline — grava primeiro,
 * envia depois, e o que importa é não perder. Aqui é leitura simples sob a
 * sessão do Supabase Auth, sob a policy `registros_campo_retaguarda_all`.
 * Misturar as duas semânticas numa store só deixaria as duas piores.
 *
 * Esta leitura enxerga `assinatura`, que a RPC do operador não devolve.
 */

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: RegistroCampoRecebido[] = [];
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
    .from("registros_campo")
    .select("*")
    .order("registrado_em", { ascending: false })
    .returns<RegistroCampoRecebido[]>();

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

export const registrosCampoRetaguardaStore = {
  listar,
  useTodos,
  useEstado,
  retry: carregar,
};
