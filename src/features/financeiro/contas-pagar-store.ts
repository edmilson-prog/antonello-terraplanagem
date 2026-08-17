import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type { ContaPagar, CategoriaDespesa, FormaPagamento } from "@/shared/types";

// Contas a pagar saíram do mock em memória para o Supabase na Onda 17, porque
// a compra de diesel passou a gerar conta automaticamente — e uma conta que
// some no F5 não serve para nada.
//
// A API pública é a mesma de antes (listar/obter/criar/darBaixaPagar/useTodas),
// com uma diferença que os chamadores precisam respeitar: `criar` e
// `darBaixaPagar` viraram assíncronas.

export type ResultadoBaixaPagar = { ok: true; conta: ContaPagar } | { ok: false; motivo: string };

export type NovaContaPagar = {
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  documento: string | null;
  forma_pagamento: FormaPagamento | null;
  observacao: string | null;
};

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: ContaPagar[] = [];
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
    .from("contas_pagar")
    .select("*")
    .order("vencimento")
    .returns<ContaPagar[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(carregar);

const listar = () => itens;
const obter = (id: string): ContaPagar | null => itens.find((c) => c.id === id) ?? null;
const getEstado = () => estado;

async function criar(nova: NovaContaPagar): Promise<ContaPagar> {
  const { data, error } = await supabase
    .from("contas_pagar")
    .insert({ ...nova, status: "aberta", pago_em: null })
    .select()
    .single()
    .returns<ContaPagar>();

  if (error) throw new Error(error.message);
  await carregar();
  return data;
}

async function darBaixaPagar(id: string, pago_em: string): Promise<ResultadoBaixaPagar> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Conta a pagar não encontrada." };
  if (atual.status === "liquidada") return { ok: false, motivo: "Esta conta já foi paga." };

  const { data, error } = await supabase
    .from("contas_pagar")
    .update({ status: "liquidada", pago_em })
    .eq("id", id)
    .select()
    .single()
    .returns<ContaPagar>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, conta: data };
}

const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

export const contasPagarStore = {
  listar,
  obter,
  criar,
  darBaixaPagar,
  useTodas,
  useEstado,
  retry: carregar,
};
