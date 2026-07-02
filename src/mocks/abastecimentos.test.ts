import { describe, it, expect } from "vitest";
import { abastecimentos } from "@/mocks/abastecimentos";
import { equipamentos } from "@/mocks/equipamentos";
import type { Abastecimento } from "@/shared/types";

describe("mocks/abastecimentos", () => {
  it("tem 8 registros", () => {
    expect(abastecimentos).toHaveLength(8);
  });

  it("todos os ids são únicos", () => {
    const ids = abastecimentos.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todo equipamento_id existe em mocks/equipamentos", () => {
    const idsValidos = new Set(equipamentos.map((e) => e.id));
    for (const a of abastecimentos) {
      expect(idsValidos.has(a.equipamento_id)).toBe(true);
    }
  });

  it("litros é sempre positivo", () => {
    for (const a of abastecimentos) {
      expect(a.litros).toBeGreaterThan(0);
    }
  });

  it("horímetro é sempre não-negativo", () => {
    for (const a of abastecimentos) {
      expect(a.horimetro).toBeGreaterThanOrEqual(0);
    }
  });

  it("inclui ao menos um abastecimento sem nenhum dado de custo (registrado por operador)", () => {
    expect(
      abastecimentos.some((a) => a.custo_total === null && a.preco_litro === null),
    ).toBe(true);
  });

  it("inclui o edge case de litros alto (>= 300)", () => {
    expect(abastecimentos.some((a) => a.litros >= 300)).toBe(true);
  });

  it("inclui o edge case de custo total sem preço por litro", () => {
    expect(
      abastecimentos.some((a) => a.custo_total !== null && a.preco_litro === null),
    ).toBe(true);
  });

  it("eq-003, eq-004 e eq-008 não têm nenhum abastecimento", () => {
    for (const id of ["eq-003", "eq-004", "eq-008"]) {
      expect(abastecimentos.some((a) => a.equipamento_id === id)).toBe(false);
    }
  });

  it("horímetro é não-decrescente por equipamento ao longo do tempo", () => {
    const porEquipamento = new Map<string, Abastecimento[]>();
    for (const a of abastecimentos) {
      const lista = porEquipamento.get(a.equipamento_id) ?? [];
      lista.push(a);
      porEquipamento.set(a.equipamento_id, lista);
    }
    for (const lista of porEquipamento.values()) {
      const ordenada = [...lista].sort((a, b) => a.abastecido_em.localeCompare(b.abastecido_em));
      for (let i = 1; i < ordenada.length; i++) {
        expect(ordenada[i].horimetro).toBeGreaterThanOrEqual(ordenada[i - 1].horimetro);
      }
    }
  });
});
