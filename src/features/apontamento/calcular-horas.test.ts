import { describe, it, expect } from "vitest";
import { calcularHoras } from "./calcular-horas";

describe("calcularHoras", () => {
  it("subtrai final - inicial", () => {
    expect(calcularHoras(1200, 1208.5)).toBe(8.5);
  });

  it("arredonda para 1 casa decimal (sem drift de float)", () => {
    expect(calcularHoras(1200.1, 1208.3)).toBe(8.2);
  });

  it("retorna 0 quando final === inicial", () => {
    expect(calcularHoras(500, 500)).toBe(0);
  });
});
