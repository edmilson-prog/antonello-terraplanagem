import { useSyncExternalStore } from "react";
import { orcamentos as seed } from "@/mocks/orcamentos";
import { calcularTotalOrcamento } from "@/features/orcamentos/calculo";
import { proximoNumeroORC } from "@/features/orcamentos/numero-orcamento";
import { podeDecidir, podeEnviar } from "@/features/orcamentos/derivacoes";
import type { Orcamento } from "@/shared/types";

export type ResultadoTransicao =
  | { ok: true; orcamento: Orcamento }
  | { ok: false; motivo: string };

export type NovoOrcamento = {
  cliente_id: string;
  descricao_obra: string;
  validade: string | null;
};

export type PatchOrcamento = Partial<
  Pick<Orcamento, "itens" | "desconto" | "observacao" | "descricao_obra" | "validade">
>;

export function criarOrcamentosStore(inicial: Orcamento[]) {
  let itens: Orcamento[] = inicial.map((o) => ({ ...o }));
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

  function criar(data: NovoOrcamento): Orcamento {
    const agora = new Date().toISOString();
    const ano = new Date(agora).getFullYear();
    const novo: Orcamento = {
      id: crypto.randomUUID(),
      numero: proximoNumeroORC(itens, ano),
      cliente_id: data.cliente_id,
      descricao_obra: data.descricao_obra,
      itens: [],
      desconto: 0,
      valor_total: 0,
      validade: data.validade,
      observacao: null,
      status: "rascunho",
      os_id: null,
      enviado_em: null,
      decidido_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return novo;
  }

  function atualizar(id: string, patch: PatchOrcamento) {
    itens = itens.map((o) => {
      if (o.id !== id) return o;
      const next: Orcamento = { ...o, ...patch, updated_at: new Date().toISOString() };
      next.valor_total = calcularTotalOrcamento(next.itens, next.desconto);
      return next;
    });
    notificar();
  }

  function enviar(id: string): ResultadoTransicao {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Orçamento não encontrado." };
    const r = podeEnviar(atual);
    if (!r.pode) return { ok: false, motivo: r.motivo ?? "Não é possível enviar." };
    const agora = new Date().toISOString();
    const enviado: Orcamento = { ...atual, status: "enviado", enviado_em: agora, updated_at: agora };
    itens = itens.map((o) => (o.id === id ? enviado : o));
    notificar();
    return { ok: true, orcamento: enviado };
  }

  function decidir(id: string, status: "aprovado" | "recusado"): ResultadoTransicao {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Orçamento não encontrado." };
    const r = podeDecidir(atual);
    if (!r.pode) return { ok: false, motivo: r.motivo ?? "Não é possível decidir." };
    const agora = new Date().toISOString();
    const decidido: Orcamento = { ...atual, status, decidido_em: agora, updated_at: agora };
    itens = itens.map((o) => (o.id === id ? decidido : o));
    notificar();
    return { ok: true, orcamento: decidido };
  }

  const aprovar = (id: string) => decidir(id, "aprovado");
  const recusar = (id: string) => decidir(id, "recusado");

  function vincularOS(id: string, osId: string) {
    itens = itens.map((o) =>
      o.id === id ? { ...o, os_id: osId, updated_at: new Date().toISOString() } : o,
    );
    notificar();
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useOrcamento = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((o) => o.id === id),
      () => itens.find((o) => o.id === id),
    );

  return { listar, obter, criar, atualizar, enviar, aprovar, recusar, vincularOS, useTodos, useOrcamento };
}

export const orcamentosStore = criarOrcamentosStore(seed);
