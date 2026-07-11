import { describe, expect, it } from "vitest";
import { showcaseDoEquipamento } from "./equipamento-showcase-data";

describe("showcaseDoEquipamento", () => {
  it("é determinístico: mesmo id → mesmo resultado", () => {
    expect(showcaseDoEquipamento("eq-123")).toEqual(showcaseDoEquipamento("eq-123"));
  });

  it("varia entre ids diferentes", () => {
    const a = showcaseDoEquipamento("eq-aaa");
    const b = showcaseDoEquipamento("eq-bbb");
    expect(a.kpis.horasMes.valor).not.toEqual(b.kpis.horasMes.valor);
  });

  it("produz o formato esperado", () => {
    const s = showcaseDoEquipamento("eq-xyz");
    expect(s.leiturasHorimetro.length).toBeGreaterThanOrEqual(3);
    expect(s.utilizacaoSemana.barras).toHaveLength(8);
    expect(s.kpis.receitaMes.spark).toBeNull();
    expect(["up", "down", null]).toContain(s.kpis.horasMes.trendDir);
    expect(typeof s.fichaTecnica.marcaModelo).toBe("string");
    expect(typeof s.fichaTecnica.ano).toBe("string");
    for (const barra of s.utilizacaoSemana.barras) {
      expect(barra.pct).toBeGreaterThanOrEqual(0);
      expect(barra.pct).toBeLessThanOrEqual(100);
    }
  });
});
