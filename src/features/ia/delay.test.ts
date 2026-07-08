import { describe, expect, it } from "vitest";
import { comDelay } from "@/features/ia/delay";

describe("comDelay", () => {
  it("resolves with the given value after the delay", async () => {
    const resultado = await comDelay("valor", 0);
    expect(resultado).toBe("valor");
  });

  it("defaults to a non-zero delay when none is given", async () => {
    const inicio = Date.now();
    await comDelay(1, 20);
    expect(Date.now() - inicio).toBeGreaterThanOrEqual(15);
  });
});
