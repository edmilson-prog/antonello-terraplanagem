import { describe, it, expect } from "vitest";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";

describe("proximoNumeroOS", () => {
  it("incrementa o maior sufixo do ano e faz zero-pad", () => {
    const ordens = [{ numero: "OS-2026-0042" }, { numero: "OS-2026-0007" }, { numero: "OS-2025-9999" }];
    expect(proximoNumeroOS(ordens, 2026)).toBe("OS-2026-0043");
  });
  it("começa em 0001 quando não há OS no ano", () => {
    expect(proximoNumeroOS([], 2026)).toBe("OS-2026-0001");
    expect(proximoNumeroOS([{ numero: "OS-2025-0050" }], 2026)).toBe("OS-2026-0001");
  });
});
