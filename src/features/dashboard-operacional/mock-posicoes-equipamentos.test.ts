import { describe, expect, it } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { posicoesEquipamentos } from "./mock-posicoes-equipamentos";

describe("posicoesEquipamentos", () => {
  it("define uma posição para cada equipamento mockado", () => {
    for (const equipamento of equipamentos) {
      const posicao = posicoesEquipamentos.find((p) => p.equipamento_id === equipamento.id);
      expect(posicao, `sem posição para ${equipamento.id}`).toBeDefined();
    }
  });

  it("mantém lat/lng em faixas geográficas válidas", () => {
    for (const posicao of posicoesEquipamentos) {
      expect(posicao.lat).toBeGreaterThanOrEqual(-90);
      expect(posicao.lat).toBeLessThanOrEqual(90);
      expect(posicao.lng).toBeGreaterThanOrEqual(-180);
      expect(posicao.lng).toBeLessThanOrEqual(180);
    }
  });

  it("mantém os pins próximos entre si (mesmo canteiro, raio < ~1km)", () => {
    const lats = posicoesEquipamentos.map((p) => p.lat);
    const lngs = posicoesEquipamentos.map((p) => p.lng);
    expect(Math.max(...lats) - Math.min(...lats)).toBeLessThan(0.01);
    expect(Math.max(...lngs) - Math.min(...lngs)).toBeLessThan(0.01);
  });

  it("não tem ids duplicados", () => {
    const ids = posicoesEquipamentos.map((p) => p.equipamento_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
