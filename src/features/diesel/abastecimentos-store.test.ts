import { describe, it, expect, beforeEach } from "vitest";
import {
  criarAbastecimentosStore,
  type AbastecimentosStore,
} from "@/features/diesel/abastecimentos-store";
import type { Abastecimento } from "@/shared/types";

const SEED: Abastecimento[] = [
  {
    id: "seed-1",
    equipamento_id: "eq-001",
    operador_id: "op-001",
    litros: 100,
    horimetro: 500,
    preco_litro: null,
    custo_total: null,
    local: null,
    abastecido_em: "2026-06-01T08:00:00.000Z",
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
];

describe("criarAbastecimentosStore", () => {
  let store: AbastecimentosStore;

  beforeEach(() => {
    store = criarAbastecimentosStore(SEED);
  });

  it("lista o seed inicial", () => {
    expect(store.listar()).toHaveLength(1);
  });

  it("registra um novo abastecimento com sucesso", () => {
    const r = store.registrar({ equipamento_id: "eq-001", litros: 50, horimetro: 520 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.abastecimento.litros).toBe(50);
      expect(r.abastecimento.horimetro).toBe(520);
      expect(r.abastecimento.operador_id).toBeNull();
      expect(r.abastecimento.preco_litro).toBeNull();
      expect(r.abastecimento.custo_total).toBeNull();
    }
    expect(store.listar()).toHaveLength(2);
  });

  it("rejeita litros zero ou negativos", () => {
    const r = store.registrar({ equipamento_id: "eq-001", litros: 0, horimetro: 520 });
    expect(r).toEqual({ ok: false, erro: "litros_invalido" });
    expect(store.listar()).toHaveLength(1);
  });

  it("rejeita horímetro menor que o abastecimento anterior do mesmo equipamento", () => {
    const r = store.registrar({ equipamento_id: "eq-001", litros: 50, horimetro: 400 });
    expect(r).toEqual({ ok: false, erro: "horimetro_menor_que_anterior" });
  });

  it("aceita qualquer horímetro para um equipamento sem abastecimento anterior", () => {
    const r = store.registrar({ equipamento_id: "eq-002", litros: 50, horimetro: 10 });
    expect(r.ok).toBe(true);
  });

  it("compara contra o abastecimento mais recente por data, não o último do array", () => {
    const s = criarAbastecimentosStore([
      {
        id: "seed-recente",
        equipamento_id: "eq-009",
        operador_id: null,
        litros: 100,
        horimetro: 500,
        preco_litro: null,
        custo_total: null,
        local: null,
        abastecido_em: "2026-06-20T08:00:00.000Z",
        created_at: "2026-06-20T08:00:00.000Z",
        updated_at: "2026-06-20T08:00:00.000Z",
      },
      {
        id: "seed-antigo",
        equipamento_id: "eq-009",
        operador_id: null,
        litros: 50,
        horimetro: 100,
        preco_litro: null,
        custo_total: null,
        local: null,
        abastecido_em: "2026-06-01T08:00:00.000Z",
        created_at: "2026-06-01T08:00:00.000Z",
        updated_at: "2026-06-01T08:00:00.000Z",
      },
    ]);
    // horímetro 300 é maior que o mais antigo (100) mas menor que o mais
    // recente (500) — só deve ser aceito se a comparação usar a data certa.
    const r = s.registrar({ equipamento_id: "eq-009", litros: 30, horimetro: 300 });
    expect(r).toEqual({ ok: false, erro: "horimetro_menor_que_anterior" });
  });

  it("registra com custo quando informado pela retaguarda", () => {
    const r = store.registrar({
      equipamento_id: "eq-001",
      litros: 80,
      horimetro: 700,
      preco_litro: 6.5,
      custo_total: 520,
      local: "Posto X",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.abastecimento.preco_litro).toBe(6.5);
      expect(r.abastecimento.custo_total).toBe(520);
      expect(r.abastecimento.local).toBe("Posto X");
    }
  });

  it("useTodos está definido (hook reativo)", () => {
    expect(typeof store.useTodos).toBe("function");
  });
});
