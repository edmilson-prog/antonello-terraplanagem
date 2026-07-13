import { useSyncExternalStore } from "react";
import { contasReceber as seed } from "@/mocks/contas-receber";
import type { ContaReceber, FormaRecebimento } from "@/shared/types";

export type ResultadoBaixaReceber =
  | { ok: true; conta: ContaReceber }
  | { ok: false; motivo: string };

export type DadosBaixaReceber = {
  recebido_em: string; // "YYYY-MM-DD"
  forma_recebimento: FormaRecebimento;
};

export function criarContasReceberStore(inicial: ContaReceber[]) {
  let itens: ContaReceber[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): ContaReceber | null => itens.find((c) => c.id === id) ?? null;

  function darBaixaReceber(id: string, dados: DadosBaixaReceber): ResultadoBaixaReceber {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Conta a receber não encontrada." };
    if (atual.status === "liquidada") return { ok: false, motivo: "Esta conta já foi recebida." };
    const agora = new Date().toISOString();
    const liquidada: ContaReceber = {
      ...atual,
      status: "liquidada",
      recebido_em: dados.recebido_em,
      forma_recebimento: dados.forma_recebimento,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === id ? liquidada : c));
    notificar();
    return { ok: true, conta: liquidada };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
  const useContaReceber = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((c) => c.id === id) ?? null,
      () => itens.find((c) => c.id === id) ?? null,
    );

  return { listar, obter, darBaixaReceber, useTodas, useContaReceber };
}

export const contasReceberStore = criarContasReceberStore(seed);
