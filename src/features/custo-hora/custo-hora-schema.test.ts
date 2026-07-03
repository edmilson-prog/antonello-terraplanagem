import { describe, it, expect } from "vitest";
import { componenteCustoSchema } from "@/features/custo-hora/custo-hora-schema";

describe("features/custo-hora/custo-hora-schema", () => {
  const valido = {
    equipamento_id: "eq-001",
    descricao: "Parcela FINAME",
    tipo: "fixo_mensal" as const,
    valor: 4200,
    ativo: true,
  };

  it("aceita um payload válido", () => {
    expect(componenteCustoSchema.safeParse(valido).success).toBe(true);
  });

  it("rejeita equipamento_id vazio", () => {
    const resultado = componenteCustoSchema.safeParse({ ...valido, equipamento_id: "" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita descrição muito curta", () => {
    const resultado = componenteCustoSchema.safeParse({ ...valido, descricao: "A" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita valor zero ou negativo", () => {
    expect(componenteCustoSchema.safeParse({ ...valido, valor: 0 }).success).toBe(false);
    expect(componenteCustoSchema.safeParse({ ...valido, valor: -10 }).success).toBe(false);
  });

  it("rejeita tipo fora de fixo_mensal/variavel_hora", () => {
    const resultado = componenteCustoSchema.safeParse({ ...valido, tipo: "diesel" });
    expect(resultado.success).toBe(false);
  });
});
