import { describe, it, expect } from "vitest";
import { componentesCusto } from "@/mocks/componentes-custo";
import { equipamentos } from "@/mocks/equipamentos";

describe("mocks/componentes-custo", () => {
  it("tem 9 registros", () => {
    expect(componentesCusto).toHaveLength(9);
  });

  it("todos os ids são únicos", () => {
    const ids = componentesCusto.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todo equipamento_id existe em mocks/equipamentos", () => {
    const idsValidos = new Set(equipamentos.map((e) => e.id));
    for (const c of componentesCusto) {
      expect(idsValidos.has(c.equipamento_id)).toBe(true);
    }
  });

  it("valor é sempre positivo", () => {
    for (const c of componentesCusto) {
      expect(c.valor).toBeGreaterThan(0);
    }
  });

  it("tipo é sempre fixo_mensal ou variavel_hora (diesel/manutenção nunca são manuais)", () => {
    for (const c of componentesCusto) {
      expect(["fixo_mensal", "variavel_hora"]).toContain(c.tipo);
    }
  });

  it("inclui ao menos um componente inativo", () => {
    expect(componentesCusto.some((c) => !c.ativo)).toBe(true);
  });

  it("eq-003 não tem nenhum componente configurado (configuração incompleta)", () => {
    expect(componentesCusto.some((c) => c.equipamento_id === "eq-003")).toBe(false);
  });

  it("eq-004 não tem nenhum componente configurado (configuração incompleta)", () => {
    expect(componentesCusto.some((c) => c.equipamento_id === "eq-004")).toBe(false);
  });
});
