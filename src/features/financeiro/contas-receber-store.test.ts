import { describe, it, expect, beforeEach } from "vitest";
import { criarContasReceberStore } from "./contas-receber-store";
import type { ContaReceber } from "@/shared/types";

const seed: ContaReceber[] = [
  {
    id: "cr-t01",
    faturamento_id: "fat-001",
    cliente_id: "cl-001",
    valor: 1000,
    vencimento: "2026-07-01",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "cr-t02",
    faturamento_id: "fat-002",
    cliente_id: "cl-002",
    valor: 500,
    vencimento: "2026-07-05",
    status: "liquidada",
    recebido_em: "2026-06-30",
    forma_recebimento: "pix",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-30T00:00:00.000Z",
  },
];

describe("criarContasReceberStore", () => {
  let store: ReturnType<typeof criarContasReceberStore>;

  beforeEach(() => {
    store = criarContasReceberStore(seed);
  });

  it("listar retorna os 2 itens do seed", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("obter retorna item pelo id", () => {
    expect(store.obter("cr-t01")?.valor).toBe(1000);
  });

  it("obter retorna null para id inexistente", () => {
    expect(store.obter("inexistente")).toBeNull();
  });

  it("darBaixaReceber transita aberta → liquidada com data e forma", () => {
    const r = store.darBaixaReceber("cr-t01", {
      recebido_em: "2026-06-30",
      forma_recebimento: "dinheiro",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.conta.status).toBe("liquidada");
      expect(r.conta.recebido_em).toBe("2026-06-30");
      expect(r.conta.forma_recebimento).toBe("dinheiro");
    }
  });

  it("darBaixaReceber em conta já liquidada retorna ok:false", () => {
    const r = store.darBaixaReceber("cr-t02", {
      recebido_em: "2026-06-30",
      forma_recebimento: "pix",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já");
  });

  it("darBaixaReceber em id inexistente retorna ok:false", () => {
    const r = store.darBaixaReceber("xxx", {
      recebido_em: "2026-06-30",
      forma_recebimento: "boleto",
    });
    expect(r.ok).toBe(false);
  });
});
