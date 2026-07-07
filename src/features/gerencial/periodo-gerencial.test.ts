import { describe, it, expect } from "vitest";
import {
  periodoTerminandoEm,
  mesesDoPeriodo,
  periodoAnterior,
  intervaloDias,
  intervaloDatas,
} from "./periodo-gerencial";

describe("periodoTerminandoEm", () => {
  it("tipo mes: mesInicio === mesFim", () => {
    expect(periodoTerminandoEm("mes", "2026-06")).toEqual({
      tipo: "mes",
      mesInicio: "2026-06",
      mesFim: "2026-06",
    });
  });

  it("tipo trimestre: 3 meses terminando em mesFim", () => {
    expect(periodoTerminandoEm("trimestre", "2026-06")).toEqual({
      tipo: "trimestre",
      mesInicio: "2026-04",
      mesFim: "2026-06",
    });
  });

  it("tipo ano: 12 meses terminando em mesFim, cruzando o ano anterior", () => {
    expect(periodoTerminandoEm("ano", "2026-06")).toEqual({
      tipo: "ano",
      mesInicio: "2025-07",
      mesFim: "2026-06",
    });
  });

  it("tipo personalizado exige mesInicio e o usa exatamente", () => {
    expect(periodoTerminandoEm("personalizado", "2026-06", "2026-01")).toEqual({
      tipo: "personalizado",
      mesInicio: "2026-01",
      mesFim: "2026-06",
    });
  });

  it("tipo personalizado sem mesInicio lança erro", () => {
    expect(() => periodoTerminandoEm("personalizado", "2026-06")).toThrow();
  });
});

describe("mesesDoPeriodo", () => {
  it("lista os meses do intervalo, inclusive", () => {
    expect(mesesDoPeriodo({ tipo: "trimestre", mesInicio: "2026-04", mesFim: "2026-06" })).toEqual([
      "2026-04",
      "2026-05",
      "2026-06",
    ]);
  });

  it("período de um mês só retorna aquele mês", () => {
    expect(mesesDoPeriodo({ tipo: "mes", mesInicio: "2026-06", mesFim: "2026-06" })).toEqual([
      "2026-06",
    ]);
  });

  it("cruza a virada de ano corretamente", () => {
    expect(mesesDoPeriodo({ tipo: "personalizado", mesInicio: "2025-12", mesFim: "2026-02" })).toEqual([
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });
});

describe("periodoAnterior", () => {
  it("desloca o período inteiro para trás mantendo o mesmo tamanho", () => {
    expect(
      periodoAnterior({ tipo: "trimestre", mesInicio: "2026-04", mesFim: "2026-06" }),
    ).toEqual({ tipo: "trimestre", mesInicio: "2026-01", mesFim: "2026-03" });
  });

  it("funciona para período de 1 mês", () => {
    expect(periodoAnterior({ tipo: "mes", mesInicio: "2026-06", mesFim: "2026-06" })).toEqual({
      tipo: "mes",
      mesInicio: "2026-05",
      mesFim: "2026-05",
    });
  });
});

describe("intervaloDias", () => {
  it("vai do dia 1 do mesInicio ao último dia do mesFim", () => {
    expect(intervaloDias({ tipo: "trimestre", mesInicio: "2026-04", mesFim: "2026-06" })).toEqual({
      de: "2026-04-01",
      ate: "2026-06-30",
    });
  });

  it("respeita fevereiro não bissexto", () => {
    expect(intervaloDias({ tipo: "mes", mesInicio: "2026-02", mesFim: "2026-02" })).toEqual({
      de: "2026-02-01",
      ate: "2026-02-28",
    });
  });
});

describe("intervaloDatas", () => {
  it("gera Date UTC do início do mesInicio ao fim do mesFim", () => {
    const { inicio, fim } = intervaloDatas({ tipo: "mes", mesInicio: "2026-06", mesFim: "2026-06" });
    expect(inicio.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-06-30T23:59:59.999Z");
  });
});
