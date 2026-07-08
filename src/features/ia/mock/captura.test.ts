import { describe, expect, it } from "vitest";
import { lerCupomAbastecimento, lerHorimetro, transcreverVoz } from "@/features/ia/mock/captura";

describe("lerHorimetro", () => {
  it("returns a value close to the given base", async () => {
    const valor = await lerHorimetro(new Blob(), { base: 1500.4, delayMs: 0 });
    expect(valor).toBe(1500.4);
  });

  it("rounds a base value to one decimal place", async () => {
    const valor = await lerHorimetro(new Blob(), { base: 8432.04, delayMs: 0 });
    expect(valor).toBe(8432.0);
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

describe("transcreverVoz", () => {
  it("returns a plausible observação phrase", async () => {
    const texto = await transcreverVoz("observacao", { delayMs: 0 });
    expect(texto).toBe("Serviço executado sem intercorrências.");
  });

  it("returns a numeric string close to the given horimetro base", async () => {
    const texto = await transcreverVoz("horimetro", { delayMs: 0, horimetroBase: 850.2 });
    expect(texto).toBe("850.2");
  });
});

describe("lerCupomAbastecimento", () => {
  it("returns plausible litros and valor", async () => {
    const leitura = await lerCupomAbastecimento(new Blob(), { delayMs: 0 });
    expect(leitura.litros).toBe(95.4);
    expect(leitura.valor).toBe(600.07);
  });

  it("throws when simularFalha is set", async () => {
    await expect(
      lerCupomAbastecimento(new Blob(), { delayMs: 0, simularFalha: true }),
    ).rejects.toThrow("Não foi possível ler o cupom.");
  });
});
