import { describe, it, expect } from "vitest";
import { planosManutencao } from "./planos-manutencao";

describe("mocks/planos-manutencao", () => {
  it("tem 4 planos", () => {
    expect(planosManutencao).toHaveLength(4);
  });

  it("pm-004 está inativo", () => {
    const p = planosManutencao.find((x) => x.id === "pm-004");
    expect(p?.ativo).toBe(false);
  });

  it("pm-003 é vinculado por tipo de equipamento, não por equipamento específico", () => {
    const p = planosManutencao.find((x) => x.id === "pm-003");
    expect(p?.equipamento_id).toBeNull();
    expect(p?.tipo_equipamento).toBe("trator_esteira");
  });

  it("todo plano tem exatamente um de equipamento_id/tipo_equipamento preenchido", () => {
    for (const p of planosManutencao) {
      const vinculos = [p.equipamento_id, p.tipo_equipamento].filter((v) => v !== null);
      expect(vinculos).toHaveLength(1);
    }
  });

  it("intervalos são distintos entre os planos", () => {
    const intervalos = new Set(planosManutencao.map((p) => p.intervalo_horas));
    expect(intervalos.size).toBe(planosManutencao.length);
  });
});
