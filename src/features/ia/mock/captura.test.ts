import { describe, expect, it } from "vitest";
import { lerHorimetro } from "@/features/ia/mock/captura";

describe("lerHorimetro", () => {
  it("returns a value close to the given base", async () => {
    const valor = await lerHorimetro(new Blob(), { base: 1500.4, delayMs: 0 });
    expect(valor).toBe(1500.4);
  });

  it("returns a fixed plausible value when no base is given", async () => {
    const valor = await lerHorimetro(new Blob(), { delayMs: 0 });
    expect(valor).toBe(1234.5);
  });

  it("throws when simularFalha is set", async () => {
    await expect(lerHorimetro(new Blob(), { delayMs: 0, simularFalha: true })).rejects.toThrow(
      "Não foi possível ler o horímetro da foto.",
    );
  });
});
