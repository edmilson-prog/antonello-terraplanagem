import { describe, expect, it } from "vitest";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import type { OrcamentoItem } from "@/shared/types";

// orcamentosStore agora é o singleton real (Supabase, fake em vitest.setup.ts) —
// não existe mais o factory criarOrcamentosStore. Cada teste cria seu próprio
// orçamento via .criar() para não depender do estado dos outros testes no
// mesmo arquivo (o fake acumula estado entre os `it()` do arquivo).

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

function criarBase() {
  return orcamentosStore.criar({
    cliente_id: "cl-001",
    descricao_obra: "Obra teste orcamentos-store",
    validade: "2026-08-30",
  });
}

describe("criar", () => {
  it("cria rascunho com número, itens vazios e total zero", async () => {
    const novo = await criarBase();
    expect(novo.status).toBe("rascunho");
    expect(novo.numero).toMatch(/^ORC-\d{4}-\d{4}$/);
    expect(novo.itens).toEqual([]);
    expect(novo.valor_total).toBe(0);
    expect(novo.validade).toBe("2026-08-30");
  });
});

describe("atualizar", () => {
  it("recalcula o total ao trocar itens e desconto", async () => {
    const orc = await criarBase();
    await orcamentosStore.atualizar(orc.id, {
      itens: [item(), item({ valor_total: 850, tipo: "mobilizacao", hora_tipo: null })],
      desconto: 100,
    });
    expect(orcamentosStore.obter(orc.id)?.valor_total).toBe(4350); // 3600 + 850 − 100
  });
});

describe("enviar", () => {
  it("bloqueia orçamento vazio", async () => {
    const orc = await criarBase();
    const r = await orcamentosStore.enviar(orc.id);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toMatch(/vazio/i);
  });

  it("envia rascunho com itens", async () => {
    const orc = await criarBase();
    await orcamentosStore.atualizar(orc.id, { itens: [item()] });
    const r = await orcamentosStore.enviar(orc.id);
    expect(r.ok).toBe(true);
    expect(orcamentosStore.obter(orc.id)?.status).toBe("enviado");
    expect(orcamentosStore.obter(orc.id)?.enviado_em).not.toBeNull();
  });
});

describe("aprovar / recusar", () => {
  it("aprova a partir de enviado", async () => {
    const orc = await criarBase();
    await orcamentosStore.atualizar(orc.id, { itens: [item()] });
    await orcamentosStore.enviar(orc.id);
    const r = await orcamentosStore.aprovar(orc.id);
    expect(r.ok).toBe(true);
    expect(orcamentosStore.obter(orc.id)?.status).toBe("aprovado");
    expect(orcamentosStore.obter(orc.id)?.decidido_em).not.toBeNull();
  });

  it("recusa a partir de enviado", async () => {
    const orc = await criarBase();
    await orcamentosStore.atualizar(orc.id, { itens: [item()] });
    await orcamentosStore.enviar(orc.id);
    const r = await orcamentosStore.recusar(orc.id);
    expect(r.ok).toBe(true);
    expect(orcamentosStore.obter(orc.id)?.status).toBe("recusado");
  });

  it("bloqueia decidir um rascunho", async () => {
    const orc = await criarBase();
    await orcamentosStore.atualizar(orc.id, { itens: [item()] });
    const r = await orcamentosStore.aprovar(orc.id);
    expect(r.ok).toBe(false);
  });
});

describe("vincularOS", () => {
  it("grava o os_id", async () => {
    const orc = await criarBase();
    await orcamentosStore.vincularOS(orc.id, "os-123");
    expect(orcamentosStore.obter(orc.id)?.os_id).toBe("os-123");
  });
});
