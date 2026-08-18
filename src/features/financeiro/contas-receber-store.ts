import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type { ContaReceber, FormaRecebimento } from "@/shared/types";

/*
 * Contas a receber (Onda 21) — saiu do mock em memória para o Supabase,
 * fechando o par com `contas_pagar`, que migrou na Onda 17.
 *
 * A conta nasce do faturamento (nunca é criada à mão, ao contrário da conta a
 * pagar), então a store não tem `criar`: o que ela protege é a baixa.
 *
 * A API pública é a mesma de antes, com uma diferença que os chamadores
 * precisam respeitar: `darBaixaReceber` virou assíncrona.
 */

export type ResultadoBaixaReceber =
  | { ok: true; conta: ContaReceber }
  | { ok: false; motivo: string };

export type DadosBaixaReceber = {
  recebido_em: string; // "YYYY-MM-DD"
  forma_recebimento: FormaRecebimento;
};

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: ContaReceber[] = [];
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
    .from("contas_receber")
    .select("*")
    .order("vencimento")
    .returns<ContaReceber[]>();

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
const obter = (id: string): ContaReceber | null => itens.find((c) => c.id === id) ?? null;
const getEstado = () => estado;

async function darBaixaReceber(
  id: string,
  dados: DadosBaixaReceber,
): Promise<ResultadoBaixaReceber> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Conta a receber não encontrada." };
  if (atual.status === "liquidada") return { ok: false, motivo: "Esta conta já foi recebida." };

  const { data, error } = await supabase
    .from("contas_receber")
    .update({
      status: "liquidada",
      recebido_em: dados.recebido_em,
      forma_recebimento: dados.forma_recebimento,
    })
    .eq("id", id)
    .select()
    .single()
    .returns<ContaReceber>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, conta: data };
}

const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);
const useContaReceber = (id: string) =>
  useSyncExternalStore(
    inscrever,
    () => itens.find((c) => c.id === id) ?? null,
    () => itens.find((c) => c.id === id) ?? null,
  );

export const contasReceberStore = {
  listar,
  obter,
  darBaixaReceber,
  useTodas,
  useEstado,
  useContaReceber,
  retry: carregar,
};
