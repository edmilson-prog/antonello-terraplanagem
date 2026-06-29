import { describe, expect, it } from "vitest";
import { criarOrcamentosStore } from "@/features/orcamentos/orcamentos-store";
import type { Orcamento, OrcamentoItem } from "@/shared/types";

const item = (over: Partial<OrcamentoItem> = {}): OrcamentoItem => ({
  id: crypto.randomUUID(),
  tipo: "hora_maquina",
  descricao: "Escavadeira — 10 h operada (estimado)",
  origem_id: "eq-001",
  hora_tipo: "operada",
  quantidade_estimada: 10,
  valor_unitario: 360,
  valor_total: 3600,
  sem_preco: false,
  ...over,
});

const base = (over: Partial<Orcamento> = {}): Orcamento => ({
  id: "orc-x",
  numero: "ORC-2026-0001",
  cliente_id: "cl-001",
  descricao_obra: "Obra teste",
  itens: [],
  desconto: 0,
  valor_total: 0,
  validade: "2026-07-30",
  observacao: null,
  status: "rascunho",
  os_id: null,
  enviado_em: null,
  decidido_em: null,
  created_at: "2026-06-01T12:00:00.000Z",
  updated_at: "2026-06-01T12:00:00.000Z",
  ...over,
});

describe("criar", () => {
  it("cria rascunho com número, itens vazios e total zero", () => {
    const store = criarOrcamentosStore([]);
    const novo = store.criar({ cliente_id: "cl-002", descricao_obra: "Nova obra", validade: "2026-08-01" });
    expect(novo.status).toBe("rascunho");
    expect(novo.numero).toBe("ORC-2026-0001");
    expect(novo.itens).toEqual([]);
    expect(novo.valor_total).toBe(0);
    expect(novo.validade).toBe("2026-08-01");
    expect(store.listar()).toHaveLength(1);
  });
});

describe("atualizar", () => {
  it("recalcula o total ao trocar itens e desconto", () => {
    const store = criarOrcamentosStore([base()]);
    store.atualizar("orc-x", { itens: [item(), item({ valor_total: 850, tipo: "mobilizacao", hora_tipo: null })], desconto: 100 });
    expect(store.obter("orc-x")?.valor_total).toBe(4350); // 3600 + 850 − 100
  });
});

describe("enviar", () => {
  it("bloqueia orçamento vazio", () => {
    const store = criarOrcamentosStore([base()]);
    const r = store.enviar("orc-x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toMatch(/vazio/i);
  });
  it("envia rascunho com itens", () => {
    const store = criarOrcamentosStore([base({ itens: [item()], valor_total: 3600 })]);
    const r = store.enviar("orc-x");
    expect(r.ok).toBe(true);
    expect(store.obter("orc-x")?.status).toBe("enviado");
    expect(store.obter("orc-x")?.enviado_em).not.toBeNull();
  });
});

describe("aprovar / recusar", () => {
  it("aprova a partir de enviado", () => {
    const store = criarOrcamentosStore([base({ status: "enviado", itens: [item()], valor_total: 3600 })]);
    const r = store.aprovar("orc-x");
    expect(r.ok).toBe(true);
    expect(store.obter("orc-x")?.status).toBe("aprovado");
    expect(store.obter("orc-x")?.decidido_em).not.toBeNull();
  });
  it("recusa a partir de enviado", () => {
    const store = criarOrcamentosStore([base({ status: "enviado", itens: [item()], valor_total: 3600 })]);
    expect(store.recusar("orc-x").ok).toBe(true);
    expect(store.obter("orc-x")?.status).toBe("recusado");
  });
  it("bloqueia decidir um rascunho", () => {
    const store = criarOrcamentosStore([base({ itens: [item()] })]);
    expect(store.aprovar("orc-x").ok).toBe(false);
  });
});

describe("vincularOS", () => {
  it("grava o os_id", () => {
    const store = criarOrcamentosStore([base({ status: "aprovado", itens: [item()], valor_total: 3600 })]);
    store.vincularOS("orc-x", "os-123");
    expect(store.obter("orc-x")?.os_id).toBe("os-123");
  });
});
