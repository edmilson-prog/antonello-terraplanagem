import { describe, expect, it } from "vitest";
import { showcaseDoOperador } from "./operador-showcase-data";

describe("showcaseDoOperador", () => {
  it("é determinístico: mesmo id → mesmo resultado", () => {
    const a = showcaseDoOperador("op-123");
    const b = showcaseDoOperador("op-123");
    expect(a).toEqual(b);
  });

  it("varia entre ids diferentes", () => {
    const a = showcaseDoOperador("op-aaa");
    const b = showcaseDoOperador("op-bbb");
    // Pelo menos um campo observável difere.
    expect(a.kpis.horasApontadas.valor).not.toEqual(b.kpis.horasApontadas.valor);
  });

  it("produz o formato esperado", () => {
    const s = showcaseDoOperador("op-xyz");
    expect(s.apontamentos.length).toBeGreaterThanOrEqual(3);
    expect(s.ordens.length).toBeGreaterThanOrEqual(3);
    expect(s.horasSemana.barras).toHaveLength(8);
    expect(s.equipamentos.length).toBeGreaterThanOrEqual(2);
    expect(["up", "down", null]).toContain(s.kpis.horasApontadas.trendDir);
    // Cada barra tem pct entre 0 e 100.
    for (const barra of s.horasSemana.barras) {
      expect(barra.pct).toBeGreaterThanOrEqual(0);
      expect(barra.pct).toBeLessThanOrEqual(100);
    }
  });
});
