import { describe, it, expect } from "vitest";
import { abastecimentos } from "@/mocks/abastecimentos";
import { apontamentos } from "@/mocks/apontamentos";
import { equipamentos } from "@/mocks/equipamentos";
import {
  abastecimentosDoEquipamento,
  apontamentosFinalizadosDoEquipamento,
  totalLitros,
  totalHoras,
  consumoMedioLh,
  custoAbastecimento,
  indicadoresPorEquipamento,
} from "@/features/diesel/derivacoes";

describe("features/diesel/derivacoes", () => {
  describe("abastecimentosDoEquipamento", () => {
    it("filtra só os abastecimentos do equipamento pedido", () => {
      const result = abastecimentosDoEquipamento(abastecimentos, "eq-001");
      expect(result).toHaveLength(2);
      expect(result.every((a) => a.equipamento_id === "eq-001")).toBe(true);
    });

    it("retorna lista vazia para equipamento sem abastecimento", () => {
      expect(abastecimentosDoEquipamento(abastecimentos, "eq-003")).toHaveLength(0);
    });

    it("respeita o filtro de período", () => {
      const result = abastecimentosDoEquipamento(abastecimentos, "eq-001", {
        de: "2026-06-20",
        ate: "2026-06-30",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("abst-002");
    });
  });

  describe("apontamentosFinalizadosDoEquipamento", () => {
    it("filtra só apontamentos finalizados do equipamento", () => {
      const result = apontamentosFinalizadosDoEquipamento(apontamentos, "eq-002");
      expect(result).toHaveLength(2);
      expect(result.every((a) => a.status === "finalizado")).toBe(true);
    });

    it("exclui apontamentos em_andamento", () => {
      const result = apontamentosFinalizadosDoEquipamento(apontamentos, "eq-001");
      expect(result.some((a) => a.id === "ap-001")).toBe(false);
    });
  });

  describe("totalLitros / totalHoras", () => {
    it("soma litros dos abastecimentos de eq-001", () => {
      expect(totalLitros(abastecimentosDoEquipamento(abastecimentos, "eq-001"))).toBe(343);
    });

    it("soma horas dos apontamentos finalizados de eq-002", () => {
      expect(totalHoras(apontamentosFinalizadosDoEquipamento(apontamentos, "eq-002"))).toBe(28);
    });

    it("retorna 0 para listas vazias", () => {
      expect(totalLitros([])).toBe(0);
      expect(totalHoras([])).toBe(0);
    });
  });

  describe("consumoMedioLh", () => {
    it("calcula litros/horas arredondado a 1 casa", () => {
      expect(consumoMedioLh(343, 12, 2)).toBe(28.6);
    });

    it("retorna null quando não há abastecimentos (qtd 0), mesmo com horas > 0", () => {
      expect(consumoMedioLh(0, 6.5, 0)).toBeNull();
    });

    it("retorna null quando não há horas", () => {
      expect(consumoMedioLh(100, 0, 1)).toBeNull();
    });
  });

  describe("custoAbastecimento", () => {
    it("usa custo_total quando presente", () => {
      const a = abastecimentos.find((x) => x.id === "abst-002")!;
      expect(custoAbastecimento(a)).toBe(1041.6);
    });

    it("deriva de litros × preço/litro quando só o preço está presente", () => {
      const a = { ...abastecimentos[0], custo_total: null, preco_litro: 6 };
      expect(custoAbastecimento(a)).toBe(a.litros * 6);
    });

    it("retorna null quando não há nenhum dado de custo", () => {
      const a = abastecimentos.find((x) => x.id === "abst-001")!;
      expect(custoAbastecimento(a)).toBeNull();
    });
  });

  describe("indicadoresPorEquipamento", () => {
    const indicadores = indicadoresPorEquipamento(equipamentos, abastecimentos, apontamentos);

    it("gera um indicador por equipamento ativo (exclui eq-008, inativo)", () => {
      expect(indicadores).toHaveLength(7);
      expect(indicadores.some((i) => i.equipamento.id === "eq-008")).toBe(false);
    });

    it("eq-001: 343 L, 12 h, consumo 28.6 l/h", () => {
      const i = indicadores.find((x) => x.equipamento.id === "eq-001")!;
      expect(i.litros_periodo).toBe(343);
      expect(i.horas_periodo).toBe(12);
      expect(i.consumo_medio_l_h).toBe(28.6);
    });

    it("eq-003: sem abastecimento → consumo null, apesar de ter horas", () => {
      const i = indicadores.find((x) => x.equipamento.id === "eq-003")!;
      expect(i.litros_periodo).toBe(0);
      expect(i.horas_periodo).toBe(6.5);
      expect(i.consumo_medio_l_h).toBeNull();
    });

    it("eq-004: sem abastecimento e sem apontamentos → tudo zero/null", () => {
      const i = indicadores.find((x) => x.equipamento.id === "eq-004")!;
      expect(i.litros_periodo).toBe(0);
      expect(i.horas_periodo).toBe(0);
      expect(i.consumo_medio_l_h).toBeNull();
    });

    it("eq-005: 310 L, 8 h, consumo 38.8 l/h (litros alto)", () => {
      const i = indicadores.find((x) => x.equipamento.id === "eq-005")!;
      expect(i.litros_periodo).toBe(310);
      expect(i.consumo_medio_l_h).toBe(38.8);
    });
  });
});
