import { useSyncExternalStore } from "react";
import { comprovantes as seed } from "@/mocks/comprovantes";
import { proximoNumeroCMP } from "@/features/comprovantes/numero-comprovante";
import type { Comprovante } from "@/shared/types";

export type ResultadoComprovante =
  | { ok: true; comprovante: Comprovante }
  | { ok: false; motivo: string };

export type NovoComprovante = {
  os_id: string;
  cliente_id: string;
  resumo_servico: string;
};

export type DadosAssinatura = {
  assinante_nome: string;
  assinatura_url: string;
};

// Store dedicado (não usa createMockStore): Comprovante tem ciclo de vida
// próprio (pendente → assinado/recusado, ambos terminais), não soft-delete.
// Espelha o padrão de features/orcamentos/orcamentos-store.ts. Fica isolado
// de outras stores — quem monta resumo_servico e valida "OS fechada" é o
// componente chamador (ver derivacoes.ts e ordem-detalhe-retaguarda.tsx).
export function criarComprovantesStore(inicial: Comprovante[]) {
  let itens: Comprovante[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((c) => c.id === id);
  const obterPorOS = (osId: string) => itens.find((c) => c.os_id === osId);

  function gerar(data: NovoComprovante): ResultadoComprovante {
    if (obterPorOS(data.os_id)) {
      return { ok: false, motivo: "Esta OS já tem um comprovante gerado." };
    }
    const agora = new Date().toISOString();
    const ano = new Date(agora).getFullYear();
    const novo: Comprovante = {
      id: crypto.randomUUID(),
      numero: proximoNumeroCMP(itens, ano),
      os_id: data.os_id,
      cliente_id: data.cliente_id,
      resumo_servico: data.resumo_servico,
      assinante_nome: null,
      assinatura_url: null,
      status: "pendente",
      motivo_recusa: null,
      gerado_em: agora,
      assinado_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return { ok: true, comprovante: novo };
  }

  function assinar(id: string, dados: DadosAssinatura): ResultadoComprovante {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Comprovante não encontrado." };
    if (atual.status !== "pendente") {
      return { ok: false, motivo: "Só comprovantes pendentes podem ser assinados." };
    }
    if (!dados.assinante_nome.trim()) {
      return { ok: false, motivo: "Informe o nome do assinante." };
    }
    if (!dados.assinatura_url) {
      return { ok: false, motivo: "Capture a assinatura antes de confirmar." };
    }
    const agora = new Date().toISOString();
    const assinado: Comprovante = {
      ...atual,
      status: "assinado",
      assinante_nome: dados.assinante_nome.trim(),
      assinatura_url: dados.assinatura_url,
      assinado_em: agora,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === id ? assinado : c));
    notificar();
    return { ok: true, comprovante: assinado };
  }

  function recusar(id: string, motivo: string | null): ResultadoComprovante {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Comprovante não encontrado." };
    if (atual.status !== "pendente") {
      return { ok: false, motivo: "Só comprovantes pendentes podem ser recusados." };
    }
    const agora = new Date().toISOString();
    const recusado: Comprovante = {
      ...atual,
      status: "recusado",
      motivo_recusa: motivo,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === id ? recusado : c));
    notificar();
    return { ok: true, comprovante: recusado };
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useComprovante = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((c) => c.id === id),
      () => itens.find((c) => c.id === id),
    );

  return { listar, obter, obterPorOS, gerar, assinar, recusar, useTodos, useComprovante };
}

export const comprovantesStore = criarComprovantesStore(seed);
