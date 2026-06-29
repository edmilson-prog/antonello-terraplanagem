import { useSyncExternalStore } from "react";
import { ordensServico as seed } from "@/mocks/ordens-servico";
import { podeFecharOS } from "@/features/ordem-servico/derivacoes";
import type { Apontamento, OrdemServico } from "@/shared/types";

export type ResultadoFecharOrdem =
  | { ok: true; ordem: OrdemServico }
  | { ok: false; motivo: string };

type NovaOrdem = Omit<
  OrdemServico,
  "id" | "status" | "aberta_em" | "fechada_em" | "pendente_sync" | "created_at" | "updated_at"
>;

export function criarOrdensStore(inicial: OrdemServico[]) {
  let itens: OrdemServico[] = inicial.map((o) => ({ ...o }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((o) => o.id === id);

  function criar(data: NovaOrdem): OrdemServico {
    const agora = new Date().toISOString();
    const nova: OrdemServico = {
      ...data,
      id: crypto.randomUUID(),
      status: "aberta",
      aberta_em: agora,
      fechada_em: null,
      pendente_sync: false,
      created_at: agora,
      updated_at: agora,
    };
    itens = [nova, ...itens];
    notificar();
    return nova;
  }

  function atualizar(id: string, patch: Partial<Omit<OrdemServico, "id" | "created_at">>) {
    itens = itens.map((o) =>
      o.id === id ? { ...o, ...patch, updated_at: new Date().toISOString() } : o,
    );
    notificar();
  }

  function fechar(id: string, apontamentos: Apontamento[]): ResultadoFecharOrdem {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "OS não encontrada." };
    const r = podeFecharOS(atual, apontamentos);
    if (!r.pode) return { ok: false, motivo: r.motivo };
    const agora = new Date().toISOString();
    const fechada: OrdemServico = {
      ...atual,
      status: "fechada",
      fechada_em: agora,
      updated_at: agora,
    };
    itens = itens.map((o) => (o.id === id ? fechada : o));
    notificar();
    return { ok: true, ordem: fechada };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
  const useOrdem = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((o) => o.id === id),
      () => itens.find((o) => o.id === id),
    );

  return { listar, obter, criar, atualizar, fechar, useTodas, useOrdem };
}

export const ordensStore = criarOrdensStore(seed);
