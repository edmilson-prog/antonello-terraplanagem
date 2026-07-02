import { describe, expect, it } from "vitest";
import { proximoNumeroCMP } from "@/features/comprovantes/numero-comprovante";

describe("proximoNumeroCMP", () => {
  it("começa em 0001 quando não há comprovantes do ano", () => {
    expect(proximoNumeroCMP([], 2026)).toBe("CMP-2026-0001");
  });

  it("incrementa a partir do maior sequencial do ano", () => {
    const comprovantes = [{ numero: "CMP-2026-0001" }, { numero: "CMP-2026-0003" }];
    expect(proximoNumeroCMP(comprovantes, 2026)).toBe("CMP-2026-0004");
  });

  it("ignora outros anos e outros prefixos", () => {
    const comprovantes = [{ numero: "CMP-2025-0099" }, { numero: "ORC-2026-0050" }];
    expect(proximoNumeroCMP(comprovantes, 2026)).toBe("CMP-2026-0001");
  });
});
