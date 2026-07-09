import { useSyncExternalStore } from "react";
import { apontamentos as apontamentosIniciais } from "@/mocks/apontamentos";
import { calcularHoras } from "@/features/apontamento/calcular-horas";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import type { Apontamento } from "@/shared/types";

export interface IniciarInput {
  equipamento_id: string;
  horimetro_inicial: number;
  os_id?: string | null;
  observacao?: string | null;
  foto_inicial_url?: string | null;
  modalidade?: "seca" | "operada" | null;
}

export interface FinalizarInput {
  horimetro_final: number;
  foto_final_url?: string | null;
  metros_executados?: number | null;
}

export type FinalizarResultado =
  | { ok: true; apontamento: Apontamento }
  | { ok: false; erro: "nao_encontrado" | "ja_finalizado" | "final_menor_que_inicial" };

export interface ApontamentosStore {
  listar: () => Apontamento[];
  obter: (id: string) => Apontamento | undefined;
  useTodos: () => Apontamento[];
  useApontamento: (id: string) => Apontamento | undefined;
  iniciar: (input: IniciarInput) => Apontamento;
  finalizar: (id: string, input: FinalizarInput) => FinalizarResultado;
}

// Store dedicado em memória. Não usa createMockStore porque Apontamento tem
// ciclo de vida (status em_andamento → finalizado), não soft-delete (ativo).
// Espelha o padrão de features/ordem-servico/ordens-store.ts.
export function criarApontamentosStore(seed: Apontamento[]): ApontamentosStore {
  let itens: Apontamento[] = seed.map((a) => ({ ...a }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((a) => a.id === id);

  const iniciar: ApontamentosStore["iniciar"] = (input) => {
    const agora = new Date().toISOString();
    const novo: Apontamento = {
      id: crypto.randomUUID(),
      equipamento_id: input.equipamento_id,
      operador_id: getOperadorLogadoId(),
      os_id: input.os_id ?? null,
      horimetro_inicial: input.horimetro_inicial,
      horimetro_final: null,
      horas_trabalhadas: null,
      foto_inicial_url: input.foto_inicial_url ?? null,
      foto_final_url: null,
      observacao: input.observacao?.trim() ? input.observacao.trim() : null,
      modalidade: input.modalidade ?? null,
      metros_executados: null,
      status: "em_andamento",
      pendente_sync: true,
      iniciado_em: agora,
      finalizado_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return novo;
  };

  const finalizar: ApontamentosStore["finalizar"] = (id, input) => {
    const atual = itens.find((a) => a.id === id);
    if (!atual) return { ok: false, erro: "nao_encontrado" };
    if (atual.status === "finalizado") return { ok: false, erro: "ja_finalizado" };
    if (input.horimetro_final < atual.horimetro_inicial) {
      return { ok: false, erro: "final_menor_que_inicial" };
    }
    const agora = new Date().toISOString();
    const atualizado: Apontamento = {
      ...atual,
      horimetro_final: input.horimetro_final,
      horas_trabalhadas: calcularHoras(atual.horimetro_inicial, input.horimetro_final),
      foto_final_url: input.foto_final_url ?? atual.foto_final_url,
      metros_executados: input.metros_executados ?? atual.metros_executados,
      status: "finalizado",
      pendente_sync: true,
      finalizado_em: agora,
      updated_at: agora,
    };
    itens = itens.map((a) => (a.id === id ? atualizado : a));
    notificar();
    return { ok: true, apontamento: atualizado };
  };

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useApontamento = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((a) => a.id === id),
      () => itens.find((a) => a.id === id),
    );

  return { listar, obter, useTodos, useApontamento, iniciar, finalizar };
}

export const apontamentosStore = criarApontamentosStore(apontamentosIniciais);

// Filtro puro (testável) — usado pela tela "Meus apontamentos".
export function apontamentosDoOperador(
  lista: Apontamento[],
  operadorId: string,
): Apontamento[] {
  return lista.filter((a) => a.operador_id === operadorId);
}

// Apontamento em andamento do operador (premissa do domínio: no máximo 1 por vez).
export function apontamentoEmAndamentoDoOperador(
  lista: Apontamento[],
  operadorId: string,
): Apontamento | null {
  return apontamentosDoOperador(lista, operadorId).find((a) => a.status === "em_andamento") ?? null;
}
