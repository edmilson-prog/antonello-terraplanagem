import { describe, it, expect } from "vitest";
import { ordemSchema, ordemCriacaoSchema } from "@/features/ordem-servico/ordem-schema";

const base = {
  cliente_id: "cl-001",
  obra_nome: "Obra X",
  modelo_cobranca: "hora_maquina" as const,
};

describe("ordemSchema", () => {
  it("aceita hora_maquina válida", () => {
    expect(ordemSchema.safeParse(base).success).toBe(true);
  });
  it("rejeita obra curta", () => {
    expect(ordemSchema.safeParse({ ...base, obra_nome: "" }).success).toBe(false);
  });
  it("rejeita sem cliente", () => {
    expect(ordemSchema.safeParse({ ...base, cliente_id: "" }).success).toBe(false);
  });
  it("por_metro exige diâmetro", () => {
    const semDiam = ordemSchema.safeParse({ ...base, modelo_cobranca: "por_metro" });
    expect(semDiam.success).toBe(false);
    const comDiam = ordemSchema.safeParse({
      ...base,
      modelo_cobranca: "por_metro",
      diametro_broca_mm: 300,
    });
    expect(comDiam.success).toBe(true);
  });

  it("ordemSchema aceita tipo_servico ausente (edição não exige)", () => {
    expect(ordemSchema.safeParse(base).success).toBe(true);
  });

  it("ordemCriacaoSchema exige tipo_servico", () => {
    const semTipo = ordemCriacaoSchema.safeParse(base);
    expect(semTipo.success).toBe(false);
    const comTipo = ordemCriacaoSchema.safeParse({ ...base, tipo_servico: "terraplenagem" });
    expect(comTipo.success).toBe(true);
  });

  it("ordemCriacaoSchema ainda exige diâmetro em por_metro", () => {
    const r = ordemCriacaoSchema.safeParse({
      ...base,
      tipo_servico: "drenagem",
      modelo_cobranca: "por_metro",
    });
    expect(r.success).toBe(false);
  });

  it("aceita equipamento_previsto_id e inicio_previsto opcionais", () => {
    const r = ordemSchema.safeParse({
      ...base,
      equipamento_previsto_id: "eq-001",
      inicio_previsto: "2026-08-01",
    });
    expect(r.success).toBe(true);
  });
});
