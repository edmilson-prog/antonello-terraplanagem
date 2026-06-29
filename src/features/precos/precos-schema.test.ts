import { describe, expect, it } from "vitest";
import {
  precoHoraMaquinaSchema,
  precoFundacaoSchema,
  precoMobilizacaoSchema,
} from "@/features/precos/precos-schema";

describe("precoHoraMaquinaSchema", () => {
  const base = { valor_hora_seca: 280, valor_hora_operada: 360, ativo: true };

  it("aceita vínculo por equipamento com id", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(true);
  });

  it("aceita vínculo por tipo com tipo_equipamento", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      vinculo: "tipo",
      tipo_equipamento: "carregadeira",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita vínculo por equipamento sem id", () => {
    const r = precoHoraMaquinaSchema.safeParse({ ...base, vinculo: "equipamento" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "equipamento_id")).toBe(true);
    }
  });

  it("rejeita vínculo por tipo sem tipo_equipamento", () => {
    const r = precoHoraMaquinaSchema.safeParse({ ...base, vinculo: "tipo" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "tipo_equipamento")).toBe(true);
    }
  });

  it("rejeita valor seca zero", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      valor_hora_seca: 0,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita valor operada negativo", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      valor_hora_operada: -10,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(false);
  });
});

describe("precoFundacaoSchema", () => {
  it("aceita diâmetro e valor positivos", () => {
    const r = precoFundacaoSchema.safeParse({
      diametro_broca_mm: 300,
      valor_metro: 90,
      ativo: true,
    });
    expect(r.success).toBe(true);
  });
  it("rejeita diâmetro zero", () => {
    const r = precoFundacaoSchema.safeParse({
      diametro_broca_mm: 0,
      valor_metro: 90,
      ativo: true,
    });
    expect(r.success).toBe(false);
  });
  it("rejeita valor por metro negativo", () => {
    const r = precoFundacaoSchema.safeParse({
      diametro_broca_mm: 300,
      valor_metro: -1,
      ativo: true,
    });
    expect(r.success).toBe(false);
  });
});

describe("precoMobilizacaoSchema", () => {
  it("aceita descrição e valor válidos", () => {
    const r = precoMobilizacaoSchema.safeParse({
      descricao: "Mobilização escavadeira",
      valor: 850,
      ativo: true,
    });
    expect(r.success).toBe(true);
  });
  it("rejeita valor zero", () => {
    const r = precoMobilizacaoSchema.safeParse({
      descricao: "Mobilização",
      valor: 0,
      ativo: true,
    });
    expect(r.success).toBe(false);
  });
  it("rejeita descrição curta", () => {
    const r = precoMobilizacaoSchema.safeParse({ descricao: "", valor: 850, ativo: true });
    expect(r.success).toBe(false);
  });
});
