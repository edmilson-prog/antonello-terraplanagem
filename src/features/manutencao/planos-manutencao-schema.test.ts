import { describe, expect, it } from "vitest";
import { planoManutencaoSchema } from "@/features/manutencao/planos-manutencao-schema";

describe("planoManutencaoSchema", () => {
  const base = { descricao: "Troca de óleo", intervalo_horas: 250, ativo: true };

  it("aceita vínculo por equipamento com id", () => {
    const r = planoManutencaoSchema.safeParse({
      ...base,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(true);
  });

  it("aceita vínculo por tipo com tipo_equipamento", () => {
    const r = planoManutencaoSchema.safeParse({
      ...base,
      vinculo: "tipo",
      tipo_equipamento: "trator_esteira",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita vínculo por equipamento sem id", () => {
    const r = planoManutencaoSchema.safeParse({ ...base, vinculo: "equipamento" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "equipamento_id")).toBe(true);
    }
  });

  it("rejeita vínculo por tipo sem tipo_equipamento", () => {
    const r = planoManutencaoSchema.safeParse({ ...base, vinculo: "tipo" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "tipo_equipamento")).toBe(true);
    }
  });

  it("rejeita intervalo zero", () => {
    const r = planoManutencaoSchema.safeParse({
      ...base,
      intervalo_horas: 0,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita descrição curta", () => {
    const r = planoManutencaoSchema.safeParse({
      ...base,
      descricao: "ab",
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(false);
  });
});
