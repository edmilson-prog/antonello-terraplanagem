import { describe, expect, it } from "vitest";
import { podeDecidir, podeEnviar, validadeVencida } from "@/features/orcamentos/derivacoes";
import type { OrcamentoItem } from "@/shared/types";

const itemFake: OrcamentoItem = {
  id: "i1",
  tipo: "hora_maquina",
  descricao: "x",
  origem_id: "eq-001",
  hora_tipo: "operada",
  quantidade_estimada: 1,
  valor_unitario: 100,
  valor_total: 100,
  sem_preco: false,
};

describe("validadeVencida", () => {
  it("é false quando não há validade", () => {
    expect(validadeVencida({ validade: null }, "2026-06-29T12:00:00.000Z")).toBe(false);
  });
  it("é true quando a validade é anterior a hoje", () => {
    expect(validadeVencida({ validade: "2026-05-01" }, "2026-06-29T12:00:00.000Z")).toBe(true);
  });
  it("é false quando a validade é hoje ou futura", () => {
    expect(validadeVencida({ validade: "2026-06-29" }, "2026-06-29T12:00:00.000Z")).toBe(false);
    expect(validadeVencida({ validade: "2026-07-30" }, "2026-06-29T12:00:00.000Z")).toBe(false);
  });
});

describe("podeEnviar", () => {
  it("bloqueia orçamento vazio", () => {
    const r = podeEnviar({ status: "rascunho", itens: [] });
    expect(r.pode).toBe(false);
    expect(r.motivo).toMatch(/vazio/i);
  });
  it("permite rascunho com itens", () => {
    expect(podeEnviar({ status: "rascunho", itens: [itemFake] }).pode).toBe(true);
  });
  it("bloqueia quando já não é rascunho", () => {
    expect(podeEnviar({ status: "enviado", itens: [itemFake] }).pode).toBe(false);
  });
});

describe("podeDecidir", () => {
  it("só permite a partir de enviado", () => {
    expect(podeDecidir({ status: "enviado" }).pode).toBe(true);
    expect(podeDecidir({ status: "rascunho" }).pode).toBe(false);
    expect(podeDecidir({ status: "aprovado" }).pode).toBe(false);
  });
});
