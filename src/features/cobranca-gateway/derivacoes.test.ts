import { describe, it, expect } from "vitest";
import { cobrancaDaConta, gerarLinhaDigitavelMock, gerarPixCopiaColaMock } from "./derivacoes";
import type { CobrancaGateway } from "@/shared/types";

const cobrancas: CobrancaGateway[] = [
  {
    id: "cob-x",
    conta_receber_id: "cr-x",
    provedor: "mercado_pago",
    status: "pendente",
    linha_digitavel: "123",
    pix_copia_cola: "pix",
    valor: 100,
    emitida_em: "2026-06-01T00:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

describe("cobrancaDaConta", () => {
  it("retorna a cobrança da conta quando existe", () => {
    expect(cobrancaDaConta("cr-x", cobrancas)?.id).toBe("cob-x");
  });

  it("retorna null quando a conta não tem cobrança", () => {
    expect(cobrancaDaConta("cr-inexistente", cobrancas)).toBeNull();
  });
});

describe("gerarLinhaDigitavelMock", () => {
  it("gera uma string não vazia, longa o bastante para parecer uma linha digitável", () => {
    const linha = gerarLinhaDigitavelMock("cob-001");
    expect(linha.length).toBeGreaterThan(20);
  });

  it("é determinística para o mesmo id", () => {
    expect(gerarLinhaDigitavelMock("cob-001")).toBe(gerarLinhaDigitavelMock("cob-001"));
  });
});

describe("gerarPixCopiaColaMock", () => {
  it("gera uma string contendo o id da cobrança", () => {
    const pix = gerarPixCopiaColaMock("cob-001");
    expect(pix).toContain("cob-001");
    expect(pix.length).toBeGreaterThan(10);
  });
});
