import { describe, expect, it } from "vitest";
import { somenteDigitos, parseValorInput, formatValorInput } from "@/features/precos/money";

describe("somenteDigitos", () => {
  it("remove tudo que não é dígito", () => {
    expect(somenteDigitos("R$ 1.234,56")).toBe("123456");
    expect(somenteDigitos("")).toBe("");
    expect(somenteDigitos("abc")).toBe("");
  });
});

describe("parseValorInput", () => {
  it("interpreta dígitos como centavos e retorna reais", () => {
    expect(parseValorInput("")).toBe(0);
    expect(parseValorInput("5")).toBe(0.05);
    expect(parseValorInput("500")).toBe(5);
    expect(parseValorInput("123456")).toBe(1234.56);
  });
  it("ignora máscara existente", () => {
    expect(parseValorInput("R$ 9,90")).toBe(9.9);
    expect(parseValorInput("1.234,56")).toBe(1234.56);
  });
});

describe("formatValorInput", () => {
  it("formata reais com 2 casas e separador de milhar (sem R$)", () => {
    expect(formatValorInput(0.05)).toBe("0,05");
    expect(formatValorInput(5)).toBe("5,00");
    expect(formatValorInput(1234.56)).toBe("1.234,56");
  });
  it("faz round-trip com parseValorInput", () => {
    expect(parseValorInput(formatValorInput(1234.56))).toBe(1234.56);
    expect(parseValorInput(formatValorInput(9.9))).toBe(9.9);
  });
});
