import { describe, expect, it } from "vitest";
import { proximoNumeroORC } from "@/features/orcamentos/numero-orcamento";

describe("proximoNumeroORC", () => {
  it("começa em 0001 quando não há orçamentos do ano", () => {
    expect(proximoNumeroORC([], 2026)).toBe("ORC-2026-0001");
  });

  it("incrementa a partir do maior sequencial do ano", () => {
    const orcs = [{ numero: "ORC-2026-0001" }, { numero: "ORC-2026-0003" }];
    expect(proximoNumeroORC(orcs, 2026)).toBe("ORC-2026-0004");
  });

  it("ignora outros anos e outros prefixos", () => {
    const orcs = [{ numero: "ORC-2025-0099" }, { numero: "FAT-2026-0050" }];
    expect(proximoNumeroORC(orcs, 2026)).toBe("ORC-2026-0001");
  });
});
