import { useSyncExternalStore } from "react";
import { abastecimentos as seed } from "@/mocks/abastecimentos";
import type { Abastecimento } from "@/shared/types";

export interface NovoAbastecimento {
  equipamento_id: string;
  litros: number;
  horimetro: number;
  operador_id?: string | null;
  preco_litro?: number | null;
  custo_total?: number | null;
  local?: string | null;
}

export type ResultadoAbastecimento =
  | { ok: true; abastecimento: Abastecimento }
  | { ok: false; erro: "litros_invalido" | "horimetro_menor_que_anterior" };

export interface AbastecimentosStore {
  listar: () => Abastecimento[];
  obter: (id: string) => Abastecimento | undefined;
  useTodos: () => Abastecimento[];
  registrar: (input: NovoAbastecimento) => ResultadoAbastecimento;
}

// Store dedicado (não usa createMockStore: Abastecimento é um registro
// append-only, sem `ativo`/soft-delete). Espelha o padrão de
// features/apontamento/apontamentos-store.ts e
// features/manutencao/registros-manutencao-store.ts.
//
// Validação de horímetro é local: compara só contra o abastecimento mais
// recente (por `abastecido_em`) DESTE equipamento — não consulta
// equipamentosStore.horimetro_atual. Mantém o store isolado/puro (mesmo
// trade-off documentado no PRD-011 para a regra "OS fechada").
export function criarAbastecimentosStore(inicial: Abastecimento[]): AbastecimentosStore {
  let itens: Abastecimento[] = inicial.map((a) => ({ ...a }));
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

  function ultimoHorimetro(equipamentoId: string): number | null {
    const doEquipamento = itens
      .filter((a) => a.equipamento_id === equipamentoId)
      .sort((a, b) => b.abastecido_em.localeCompare(a.abastecido_em));
    return doEquipamento[0]?.horimetro ?? null;
  }

  const registrar: AbastecimentosStore["registrar"] = (input) => {
    if (input.litros <= 0) return { ok: false, erro: "litros_invalido" };
    const anterior = ultimoHorimetro(input.equipamento_id);
    if (anterior !== null && input.horimetro < anterior) {
      return { ok: false, erro: "horimetro_menor_que_anterior" };
    }
    const agora = new Date().toISOString();
    const novo: Abastecimento = {
      id: crypto.randomUUID(),
      equipamento_id: input.equipamento_id,
      operador_id: input.operador_id ?? null,
      litros: input.litros,
      horimetro: input.horimetro,
      preco_litro: input.preco_litro ?? null,
      custo_total: input.custo_total ?? null,
      local: input.local?.trim() ? input.local.trim() : null,
      abastecido_em: agora,
      created_at: agora,
      updated_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return { ok: true, abastecimento: novo };
  };

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, useTodos, registrar };
}

export const abastecimentosStore = criarAbastecimentosStore(seed);
