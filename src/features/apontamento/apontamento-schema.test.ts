import { describe, it, expect } from "vitest";
import { iniciarApontamentoSchema, finalizarApontamentoSchema } from "./apontamento-schema";

describe("iniciarApontamentoSchema", () => {
  it("aceita entrada mínima válida", () => {
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "eq-1", horimetro_inicial: 100 }).success,
    ).toBe(true);
  });

  it("exige equipamento", () => {
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "", horimetro_inicial: 100 }).success,
    ).toBe(false);
  });

  it("rejeita horímetro negativo ou não numérico", () => {
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "eq-1", horimetro_inicial: -1 }).success,
    ).toBe(false);
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "eq-1", horimetro_inicial: Number.NaN })
        .success,
    ).toBe(false);
  });

  it("rejeita observação acima de 280 caracteres", () => {
    expect(
      iniciarApontamentoSchema.safeParse({
        equipamento_id: "eq-1",
        horimetro_inicial: 1,
        observacao: "x".repeat(281),
      }).success,
    ).toBe(false);
  });
});

describe("finalizarApontamentoSchema", () => {
  it("aceita número válido e rejeita negativo/NaN", () => {
    expect(finalizarApontamentoSchema.safeParse({ horimetro_final: 10 }).success).toBe(true);
    expect(finalizarApontamentoSchema.safeParse({ horimetro_final: -1 }).success).toBe(false);
    expect(finalizarApontamentoSchema.safeParse({ horimetro_final: Number.NaN }).success).toBe(false);
  });
});
