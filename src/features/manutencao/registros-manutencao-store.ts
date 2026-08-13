import { useSyncExternalStore } from "react";
import { registrosManutencao as seed } from "@/mocks/registros-manutencao";
import type { RegistroManutencao } from "@/shared/types";

export type ResultadoRegistrarManutencao =
  | { ok: true; registro: RegistroManutencao }
  | { ok: false; motivo: string };

export interface RegistrarManutencaoInput {
  horimetroRealizado: number;
  intervaloHoras: number;
  custo?: number | null;
  observacao?: string | null;
}

export interface CriarPrevistaInput {
  equipamento_id: string;
  plano_id: string;
  horimetro_previsto: number;
}

export interface RegistrosManutencaoStore {
  listar: () => RegistroManutencao[];
  obter: (id: string) => RegistroManutencao | undefined;
  useTodos: () => RegistroManutencao[];
  criarPrevista: (input: CriarPrevistaInput) => RegistroManutencao;
  registrarRealizada: (
    registroId: string,
    input: RegistrarManutencaoInput,
  ) => ResultadoRegistrarManutencao;
}

// Store dedicado (não usa createMockStore: RegistroManutencao não tem `ativo`).
// Pura por injeção: registrarRealizada recebe `intervaloHoras` do chamador em
// vez de importar planosManutencaoStore, mantendo o factory testável isolado
// (mesmo padrão de criarContasPagarStore).
export function criarRegistrosManutencaoStore(
  inicial: RegistroManutencao[],
): RegistrosManutencaoStore {
  let itens: RegistroManutencao[] = inicial.map((r) => ({ ...r }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((r) => r.id === id);

  function construirPrevista(
    equipamentoId: string,
    planoId: string,
    horimetroPrevisto: number,
    agora: string,
  ): RegistroManutencao {
    return {
      id: crypto.randomUUID(),
      equipamento_id: equipamentoId,
      plano_id: planoId,
      horimetro_previsto: horimetroPrevisto,
      horimetro_realizado: null,
      status: "prevista",
      custo: null,
      observacao: null,
      realizada_em: null,
      created_at: agora,
      updated_at: agora,
    };
  }

  const criarPrevista: RegistrosManutencaoStore["criarPrevista"] = (input) => {
    const novo = construirPrevista(
      input.equipamento_id,
      input.plano_id,
      input.horimetro_previsto,
      new Date().toISOString(),
    );
    itens = [novo, ...itens];
    notificar();
    return novo;
  };

  const registrarRealizada: RegistrosManutencaoStore["registrarRealizada"] = (
    registroId,
    input,
  ) => {
    const atual = obter(registroId);
    if (!atual) return { ok: false, motivo: "Registro de manutenção não encontrado." };
    if (atual.status === "realizada")
      return { ok: false, motivo: "Esta manutenção já foi registrada como realizada." };

    const agora = new Date().toISOString();
    const realizado: RegistroManutencao = {
      ...atual,
      status: "realizada",
      horimetro_realizado: input.horimetroRealizado,
      custo: input.custo ?? null,
      observacao: input.observacao?.trim() ? input.observacao.trim() : null,
      realizada_em: agora,
      updated_at: agora,
    };
    const proximo = construirPrevista(
      atual.equipamento_id,
      atual.plano_id,
      input.horimetroRealizado + input.intervaloHoras,
      agora,
    );
    itens = [proximo, ...itens.map((r) => (r.id === registroId ? realizado : r))];
    notificar();
    return { ok: true, registro: realizado };
  };

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, useTodos, criarPrevista, registrarRealizada };
}

export const registrosManutencaoStore = criarRegistrosManutencaoStore(seed);
