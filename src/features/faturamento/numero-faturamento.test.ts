import { describe, it, expect } from "vitest";
import { proximoNumeroFAT } from "@/features/faturamento/numero-faturamento";

describe("proximoNumeroFAT", () => {
  it("começa em 0001 quando não há faturas no ano", () => {
    expect(proximoNumeroFAT([], 2026)).toBe("FAT-2026-0001");
  });

  it("incrementa o maior do ano e ignora outros anos", () => {
    const fats = [{ numero: "FAT-2026-0004" }, { numero: "FAT-2025-0099" }, { numero: "FAT-2026-0002" }];
    expect(proximoNumeroFAT(fats, 2026)).toBe("FAT-2026-0005");
  });
});
