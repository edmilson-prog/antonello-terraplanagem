import { describe, it, expect } from "vitest";
import { ordemSchema } from "@/features/ordem-servico/ordem-schema";

const base = { cliente_id: "cl-001", obra_nome: "Obra X", modelo_cobranca: "hora_maquina" as const };

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
    const comDiam = ordemSchema.safeParse({ ...base, modelo_cobranca: "por_metro", diametro_broca_mm: 300 });
    expect(comDiam.success).toBe(true);
  });
  it("rejeita metragem zero/negativa", () => {
    expect(
      ordemSchema.safeParse({ ...base, modelo_cobranca: "por_metro", diametro_broca_mm: 300, metragem_executada: 0 }).success,
    ).toBe(false);
  });
});
