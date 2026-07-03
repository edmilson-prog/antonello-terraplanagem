import { describe, it, expect } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { apontamentos } from "@/mocks/apontamentos";
import { abastecimentos } from "@/mocks/abastecimentos";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { componentesCusto } from "@/mocks/componentes-custo";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import {
  horasTrabalhadasNoPeriodo,
  custoDieselNoPeriodo,
  custoManutencaoNoPeriodo,
  componentesAtivosDoEquipamento,
  custoHoraEquipamento,
  custoHoraPorEquipamento,
} from "@/features/custo-hora/derivacoes";

const PERIODO = "2026-06";

describe("features/custo-hora/derivacoes", () => {
  describe("horasTrabalhadasNoPeriodo", () => {
    it("soma as horas finalizadas do equipamento no período", () => {
      expect(horasTrabalhadasNoPeriodo(apontamentos, "eq-002", PERIODO)).toBe(28);
    });

    it("ignora apontamentos em_andamento", () => {
      expect(horasTrabalhadasNoPeriodo(apontamentos, "eq-005", PERIODO)).toBe(8);
    });

    it("retorna 0 para equipamento sem apontamentos no período", () => {
      expect(horasTrabalhadasNoPeriodo(apontamentos, "eq-004", PERIODO)).toBe(0);
    });
  });

  describe("custoDieselNoPeriodo", () => {
    it("soma o custo dos abastecimentos do equipamento no período", () => {
      expect(custoDieselNoPeriodo(abastecimentos, "eq-001", PERIODO)).toBe(1041.6);
    });

    it("trata abastecimento sem nenhum dado de custo como 0", () => {
      expect(custoDieselNoPeriodo(abastecimentos, "eq-005", PERIODO)).toBe(0);
    });
  });

  describe("custoManutencaoNoPeriodo", () => {
    it("soma só registros realizados dentro do período", () => {
      expect(custoManutencaoNoPeriodo(registrosManutencao, "eq-001", PERIODO)).toBe(420);
    });

    it("ignora registro realizado fora do período", () => {
      expect(custoManutencaoNoPeriodo(registrosManutencao, "eq-002", PERIODO)).toBe(0);
    });

    it("ignora registros ainda 'prevista'", () => {
      expect(custoManutencaoNoPeriodo(registrosManutencao, "eq-006", PERIODO)).toBe(0);
    });
  });

  describe("componentesAtivosDoEquipamento", () => {
    it("exclui componentes inativos", () => {
      const ativos = componentesAtivosDoEquipamento(componentesCusto, "eq-002");
      expect(ativos.every((c) => c.ativo)).toBe(true);
      expect(ativos.some((c) => c.descricao.includes("revisão anterior"))).toBe(false);
    });

    it("retorna lista vazia para equipamento sem componentes", () => {
      expect(componentesAtivosDoEquipamento(componentesCusto, "eq-003")).toHaveLength(0);
    });
  });

  describe("custoHoraEquipamento", () => {
    it("calcula o custo/hora completo e sinaliza margem negativa (eq-001)", () => {
      const eq001 = equipamentos.find((e) => e.id === "eq-001")!;
      const resultado = custoHoraEquipamento(
        eq001,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.horas_trabalhadas).toBe(12);
      expect(resultado.custo_diesel).toBe(1041.6);
      expect(resultado.custo_manutencao).toBe(420);
      expect(resultado.custo_fixo_rateado).toBe(4200);
      expect(resultado.custo_variavel).toBe(540);
      expect(resultado.custo_total).toBe(6201.6);
      expect(resultado.custo_por_hora).toBe(516.8);
      expect(resultado.preco_hora).toBe(360);
      expect(resultado.margem_hora).toBe(-156.8);
      expect(resultado.configuracao_incompleta).toBe(false);
      expect(resultado.detalhamento).toHaveLength(4);
    });

    it("calcula margem positiva e ignora manutenção fora do período (eq-002)", () => {
      const eq002 = equipamentos.find((e) => e.id === "eq-002")!;
      const resultado = custoHoraEquipamento(
        eq002,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.custo_manutencao).toBe(0);
      expect(resultado.custo_fixo_rateado).toBe(380);
      expect(resultado.custo_por_hora).toBe(84.96);
      expect(resultado.margem_hora).toBe(205.04);
    });

    it("custo_por_hora é null quando não há horas no período (eq-004)", () => {
      const eq004 = equipamentos.find((e) => e.id === "eq-004")!;
      const resultado = custoHoraEquipamento(
        eq004,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.horas_trabalhadas).toBe(0);
      expect(resultado.custo_por_hora).toBeNull();
      expect(resultado.configuracao_incompleta).toBe(true);
    });

    it("sinaliza configuração incompleta quando não há componente ativo, mesmo com horas (eq-003)", () => {
      const eq003 = equipamentos.find((e) => e.id === "eq-003")!;
      const resultado = custoHoraEquipamento(
        eq003,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.horas_trabalhadas).toBe(6.5);
      expect(resultado.custo_total).toBe(0);
      expect(resultado.custo_por_hora).toBe(0);
      expect(resultado.configuracao_incompleta).toBe(true);
    });

    it("margem_hora é null quando não há preço ativo, mesmo com custo/hora calculado (eq-005)", () => {
      const eq005 = equipamentos.find((e) => e.id === "eq-005")!;
      const resultado = custoHoraEquipamento(
        eq005,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.custo_por_hora).toBe(497);
      expect(resultado.preco_hora).toBeNull();
      expect(resultado.margem_hora).toBeNull();
    });
  });

  describe("custoHoraPorEquipamento", () => {
    it("retorna um resultado por equipamento ativo, excluindo inativos", () => {
      const resultados = custoHoraPorEquipamento(
        equipamentos,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados).toHaveLength(7);
      expect(resultados.some((r) => r.equipamento_id === "eq-008")).toBe(false);
    });
  });
});
