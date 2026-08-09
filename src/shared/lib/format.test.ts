import { describe, it, expect } from "vitest";
import {
  formatHorimetro,
  formatDocumento,
  formatTelefone,
  formatDataHora,
  formatDataExtensa,
  formatDiaCurto,
  formatHoraCurta,
  iniciaisDoNome,
  rotuloDiaRelativo,
} from "./format";

describe("formatDataExtensa", () => {
  it("usa o dia da semana sem o sufixo -feira", () => {
    // 10/07/2026 é uma sexta-feira.
    expect(formatDataExtensa(new Date(2026, 6, 10))).toBe("sexta, 10 de julho");
  });
});

describe("formatDiaCurto", () => {
  it("abrevia o dia da semana e mostra dia/mês", () => {
    expect(formatDiaCurto(new Date(2026, 6, 10))).toBe("sex, 10/07");
  });
});

describe("formatHoraCurta", () => {
  it("retorna travessão para nulo e inválido", () => {
    expect(formatHoraCurta(null)).toBe("—");
    expect(formatHoraCurta("não-é-data")).toBe("—");
  });
});

describe("rotuloDiaRelativo", () => {
  const referencia = new Date(2026, 6, 10, 15);

  it("nomeia hoje e ontem", () => {
    expect(rotuloDiaRelativo("2026-07-10", referencia)).toBe("Hoje");
    expect(rotuloDiaRelativo("2026-07-09", referencia)).toBe("Ontem");
  });

  it("usa a data curta para dias mais antigos", () => {
    expect(rotuloDiaRelativo("2026-07-08", referencia)).toBe("qua, 08/07");
  });
});

describe("iniciaisDoNome", () => {
  it("usa a primeira letra do primeiro e do último nome", () => {
    expect(iniciaisDoNome("Adelar Machado")).toBe("AM");
    expect(iniciaisDoNome("Vilson dos Santos Prediger")).toBe("VP");
  });
  it("devolve uma letra para nome único", () => {
    expect(iniciaisDoNome("Nelson")).toBe("N");
  });
  it("ignora espaços extras", () => {
    expect(iniciaisDoNome("  ivo   scherer  ")).toBe("IS");
  });
  it("devolve interrogação para nome vazio", () => {
    expect(iniciaisDoNome("   ")).toBe("?");
  });
});

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

describe("formatDataHora", () => {
  it("retorna travessão para null", () => {
    expect(formatDataHora(null)).toBe("—");
  });

  it("retorna travessão para ISO inválido", () => {
    expect(formatDataHora("não-é-data")).toBe("—");
  });

  it("formata uma data ISO válida incluindo o ano", () => {
    expect(formatDataHora("2026-06-27T07:15:00.000Z")).toContain("2026");
  });
});
