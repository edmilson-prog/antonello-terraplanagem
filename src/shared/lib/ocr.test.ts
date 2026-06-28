import { describe, it, expect } from "vitest";
import { lerHorimetroDaFoto, OCR_VALOR_SIMULADO } from "./ocr";

describe("lerHorimetroDaFoto", () => {
  it("resolve um valor simulado quando não recebe base", async () => {
    const valor = await lerHorimetroDaFoto(new Blob(), { delayMs: 0 });
    expect(valor).toBe(OCR_VALOR_SIMULADO);
  });

  it("resolve a base arredondada a 1 casa quando recebe base", async () => {
    const valor = await lerHorimetroDaFoto(new Blob(), { base: 8432.04, delayMs: 0 });
    expect(valor).toBe(8432);
  });

  it("rejeita quando simularFalha é true (exercita o fallback manual)", async () => {
    await expect(
      lerHorimetroDaFoto(new Blob(), { delayMs: 0, simularFalha: true }),
    ).rejects.toThrow();
  });
});
