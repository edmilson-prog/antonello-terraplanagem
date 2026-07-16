import { describe, it, expect } from "vitest";
import { criarHistoricoPrecosStore } from "@/features/precos/historico-precos-store";
import type { PrecoHoraMaquina, PrecoMobilizacao } from "@/shared/types";

const PRECO: PrecoHoraMaquina = {
  id: "phm-001",
  equipamento_id: "eq-001",
  tipo_equipamento: null,
  valor_hora_seca: 280,
  valor_hora_operada: 360,
  ativo: true,
  created_at: "2025-01-15T12:00:00.000Z",
  updated_at: "2026-03-10T09:00:00.000Z",
};

const MOBILIZACAO: PrecoMobilizacao = {
  id: "pm-001",
  descricao: "Mobilização escavadeira até 50km",
  valor: 850,
  ativo: true,
  created_at: "2025-04-01T12:00:00.000Z",
  updated_at: "2026-02-15T12:00:00.000Z",
};

describe("historicoPrecosStore", () => {
  it("começa vazio quando não há seed", () => {
    const store = criarHistoricoPrecosStore([]);
    expect(store.listar()).toEqual([]);
  });

  it("registrar adiciona uma entrada com tipo, preco_id e snapshot corretos", () => {
    const store = criarHistoricoPrecosStore([]);
    store.registrar("hora_maquina", PRECO);
    const itens = store.listar();
    expect(itens).toHaveLength(1);
    expect(itens[0].tipo).toBe("hora_maquina");
    expect(itens[0].preco_id).toBe("phm-001");
    expect(itens[0].snapshot).toEqual(PRECO);
  });

  it("registros mais recentes ficam primeiro", () => {
    const store = criarHistoricoPrecosStore([]);
    store.registrar("hora_maquina", PRECO);
    store.registrar("mobilizacao", MOBILIZACAO);
    const itens = store.listar();
    expect(itens[0].preco_id).toBe("pm-001");
    expect(itens[1].preco_id).toBe("phm-001");
  });
});
