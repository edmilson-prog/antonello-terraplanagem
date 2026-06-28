import { describe, it, expect } from "vitest";
import { formatHorimetro, formatDocumento, formatTelefone } from "./format";

describe("formatHorimetro", () => {
  it("formata inteiro com sufixo h e milhar pt-BR", () => {
    expect(formatHorimetro(8432)).toBe("8.432 h");
  });
  it("mantém uma casa decimal quando há fração", () => {
    expect(formatHorimetro(9876.5)).toBe("9.876,5 h");
  });
});

describe("formatDocumento", () => {
  it("formata CPF", () => {
    expect(formatDocumento("52998224725")).toBe("529.982.247-25");
  });
  it("formata CNPJ", () => {
    expect(formatDocumento("11222333000181")).toBe("11.222.333/0001-81");
  });
  it("retorna travessão para nulo/vazio", () => {
    expect(formatDocumento(null)).toBe("—");
  });
});

describe("formatTelefone", () => {
  it("formata celular de 11 dígitos", () => {
    expect(formatTelefone("44999990001")).toBe("(44) 99999-0001");
  });
  it("formata fixo de 10 dígitos", () => {
    expect(formatTelefone("4432210000")).toBe("(44) 3221-0000");
  });
  it("retorna travessão para nulo", () => {
    expect(formatTelefone(null)).toBe("—");
  });
});
