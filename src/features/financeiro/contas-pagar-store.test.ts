import { describe, it, expect, beforeEach } from "vitest";
import { criarContasPagarStore } from "./contas-pagar-store";
import type { ContaPagar } from "@/shared/types";

const seed: ContaPagar[] = [
  {
    id: "cp-t01",
    descricao: "Diesel",
    fornecedor: "Posto A",
    categoria: "diesel",
    valor: 500,
    vencimento: "2026-07-01",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "cp-t02",
    descricao: "Manutenção",
    fornecedor: "Mecânica X",
    categoria: "manutencao",
    valor: 1200,
    vencimento: "2026-06-15",
    status: "liquidada",
    pago_em: "2026-06-14",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-14T00:00:00.000Z",
  },
];

describe("criarContasPagarStore", () => {
  let store: ReturnType<typeof criarContasPagarStore>;

  beforeEach(() => {
    store = criarContasPagarStore(seed);
  });

  it("listar retorna 2 itens", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("criar adiciona nova conta aberta ao início da lista", () => {
    store.criar({
      descricao: "Borracha",
      fornecedor: null,
      categoria: "outro",
      valor: 100,
      vencimento: "2026-07-10",
    });
    const itens = store.listar();
    expect(itens).toHaveLength(3);
    expect(itens[0].descricao).toBe("Borracha");
    expect(itens[0].status).toBe("aberta");
    expect(itens[0].pago_em).toBeNull();
  });

  it("darBaixaPagar transita aberta → liquidada com data", () => {
    const r = store.darBaixaPagar("cp-t01", "2026-06-30");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.conta.status).toBe("liquidada");
      expect(r.conta.pago_em).toBe("2026-06-30");
    }
  });

  it("darBaixaPagar em conta já paga retorna ok:false", () => {
    const r = store.darBaixaPagar("cp-t02", "2026-06-30");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já");
  });

  it("darBaixaPagar em id inexistente retorna ok:false", () => {
    const r = store.darBaixaPagar("xxx", "2026-06-30");
    expect(r.ok).toBe(false);
  });
});
