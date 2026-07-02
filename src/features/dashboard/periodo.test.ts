import { describe, it, expect } from "vitest";
import { intervaloPeriodo, estaNoIntervalo } from "./periodo";

describe("intervaloPeriodo", () => {
  const agora = new Date("2026-07-02T15:30:00.000Z");

  it("hoje: do início do dia local até agora", () => {
    const { inicio, fim } = intervaloPeriodo("hoje", agora);
    expect(inicio.getDate()).toBe(agora.getDate());
    expect(inicio.getMonth()).toBe(agora.getMonth());
    expect(inicio.getHours()).toBe(0);
    expect(inicio.getMinutes()).toBe(0);
    expect(fim).toBe(agora);
  });

  it("semana: 7 dias corridos até agora", () => {
    const { inicio, fim } = intervaloPeriodo("semana", agora);
    expect(fim).toBe(agora);
    expect(agora.getTime() - inicio.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("mes: do dia 1 (00:00 local) do mês corrente até agora", () => {
    const { inicio, fim } = intervaloPeriodo("mes", agora);
    expect(inicio.getDate()).toBe(1);
    expect(inicio.getMonth()).toBe(agora.getMonth());
    expect(inicio.getHours()).toBe(0);
    expect(fim).toBe(agora);
  });
});

describe("estaNoIntervalo", () => {
  const intervalo = {
    inicio: new Date("2026-07-01T00:00:00.000Z"),
    fim: new Date("2026-07-02T15:30:00.000Z"),
  };

  it("true quando o timestamp cai dentro do intervalo", () => {
    expect(estaNoIntervalo("2026-07-01T12:00:00.000Z", intervalo)).toBe(true);
  });

  it("true nos limites (inclusive)", () => {
    expect(estaNoIntervalo("2026-07-01T00:00:00.000Z", intervalo)).toBe(true);
    expect(estaNoIntervalo("2026-07-02T15:30:00.000Z", intervalo)).toBe(true);
  });

  it("false quando é anterior ao início", () => {
    expect(estaNoIntervalo("2026-06-30T23:59:59.000Z", intervalo)).toBe(false);
  });

  it("false quando é posterior ao fim", () => {
    expect(estaNoIntervalo("2026-07-02T15:30:01.000Z", intervalo)).toBe(false);
  });

  it("false para null/undefined", () => {
    expect(estaNoIntervalo(null, intervalo)).toBe(false);
    expect(estaNoIntervalo(undefined, intervalo)).toBe(false);
  });
});
