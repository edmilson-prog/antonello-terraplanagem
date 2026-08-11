import { describe, it, expect } from "vitest";
import { primeiroNome, saudacaoPorHora } from "./saudacao";

describe("saudacaoPorHora", () => {
  it("cobre as três faixas do dia", () => {
    expect(saudacaoPorHora(6)).toBe("Bom dia");
    expect(saudacaoPorHora(11)).toBe("Bom dia");
    expect(saudacaoPorHora(12)).toBe("Boa tarde");
    expect(saudacaoPorHora(17)).toBe("Boa tarde");
    expect(saudacaoPorHora(18)).toBe("Boa noite");
    expect(saudacaoPorHora(23)).toBe("Boa noite");
  });
});

describe("primeiroNome", () => {
  it("devolve só o primeiro nome", () => {
    expect(primeiroNome("Vilson dos Santos Prediger")).toBe("Vilson");
  });
  it("ignora espaços em volta", () => {
    expect(primeiroNome("  Nelson  ")).toBe("Nelson");
  });
});
