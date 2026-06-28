import { describe, it, expect } from "vitest";
import { isCpf, isCnpj, isCpfOuCnpj } from "./validators";

describe("isCpf", () => {
  it("aceita CPF válido (com e sem máscara)", () => {
    expect(isCpf("529.982.247-25")).toBe(true);
    expect(isCpf("52998224725")).toBe(true);
  });
  it("rejeita dígito verificador errado", () => {
    expect(isCpf("529.982.247-24")).toBe(false);
  });
  it("rejeita sequência repetida e tamanho errado", () => {
    expect(isCpf("111.111.111-11")).toBe(false);
    expect(isCpf("123")).toBe(false);
  });
});

describe("isCnpj", () => {
  it("aceita CNPJ válido (com e sem máscara)", () => {
    expect(isCnpj("11.222.333/0001-81")).toBe(true);
    expect(isCnpj("11222333000181")).toBe(true);
  });
  it("rejeita dígito verificador errado", () => {
    expect(isCnpj("11.222.333/0001-80")).toBe(false);
  });
  it("rejeita sequência repetida e tamanho errado", () => {
    expect(isCnpj("00000000000000")).toBe(false);
    expect(isCnpj("123")).toBe(false);
  });
});

describe("isCpfOuCnpj", () => {
  it("aceita CPF e CNPJ válidos pelo comprimento", () => {
    expect(isCpfOuCnpj("529.982.247-25")).toBe(true);
    expect(isCpfOuCnpj("11.222.333/0001-81")).toBe(true);
  });
  it("rejeita comprimento que não é 11 nem 14", () => {
    expect(isCpfOuCnpj("12345")).toBe(false);
  });
});
