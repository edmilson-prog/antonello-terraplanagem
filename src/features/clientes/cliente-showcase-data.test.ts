import { describe, expect, it } from "vitest";
import { showcaseDoCliente } from "./cliente-showcase-data";

describe("showcaseDoCliente", () => {
  it("é determinístico: mesmo id → mesmo resultado", () => {
    expect(showcaseDoCliente("cl-123")).toEqual(showcaseDoCliente("cl-123"));
  });

  it("varia entre ids diferentes", () => {
    const a = showcaseDoCliente("cl-aaa");
    const b = showcaseDoCliente("cl-bbb");
    expect(a.kpis.faturado.valor).not.toEqual(b.kpis.faturado.valor);
  });

  it("produz o formato esperado", () => {
    const s = showcaseDoCliente("cl-xyz");
    expect(s.porOS.length).toBeGreaterThanOrEqual(4);
    expect(s.recebimentos.length).toBeGreaterThanOrEqual(3);
    expect(s.kpis.saldoReceber.alerta).toBe(true);
    expect(s.kpis.saldoReceber.spark).not.toBeNull();
    expect(typeof s.cadastrais.email).toBe("string");
    expect(typeof s.origemMigracao).toBe("string");
  });
});
