import { useSyncExternalStore } from "react";
import { contasPagar as seed } from "@/mocks/contas-pagar";
import type { ContaPagar, CategoriaDespesa } from "@/shared/types";

export type ResultadoBaixaPagar =
  | { ok: true; conta: ContaPagar }
  | { ok: false; motivo: string };

export type NovaContaPagar = {
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
};

export function criarContasPagarStore(inicial: ContaPagar[]) {
  let itens: ContaPagar[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): ContaPagar | null =>
    itens.find((c) => c.id === id) ?? null;

  function criar(nova: NovaContaPagar): ContaPagar {
    const agora = new Date().toISOString();
    const conta: ContaPagar = {
      id: crypto.randomUUID(),
      ...nova,
      status: "aberta",
      pago_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [conta, ...itens];
    notificar();
    return conta;
  }

  function darBaixaPagar(id: string, pago_em: string): ResultadoBaixaPagar {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Conta a pagar não encontrada." };
    if (atual.status === "liquidada")
      return { ok: false, motivo: "Esta conta já foi paga." };
    const agora = new Date().toISOString();
    const liquidada: ContaPagar = {
      ...atual,
      status: "liquidada",
      pago_em,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === id ? liquidada : c));
    notificar();
    return { ok: true, conta: liquidada };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, criar, darBaixaPagar, useTodas };
}

export const contasPagarStore = criarContasPagarStore(seed);
