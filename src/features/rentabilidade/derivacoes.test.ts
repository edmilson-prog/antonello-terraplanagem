import { describe, it, expect } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { apontamentos } from "@/mocks/apontamentos";
import { abastecimentos } from "@/mocks/abastecimentos";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { componentesCusto } from "@/mocks/componentes-custo";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { faturamentos } from "@/mocks/faturamentos";
import { ordensServico } from "@/mocks/ordens-servico";
import {
  rentabilidadePorEquipamento,
  rentabilidadePorTodosEquipamentos,
  rentabilidadePorObra,
  rentabilidadePorTodasAsObras,
} from "@/features/rentabilidade/derivacoes";

const PERIODO = "2026-06";

function eq(id: string) {
  const e = equipamentos.find((x) => x.id === id);
  if (!e) throw new Error(`equipamento ${id} ausente no mock`);
  return e;
}

const ARGS_EQUIPAMENTO = () =>
  [
    componentesCusto,
    abastecimentos,
    registrosManutencao,
    apontamentos,
    precosHoraMaquina,
    faturamentos,
  ] as const;

const ARGS_OBRA = () =>
  [
    equipamentos,
    componentesCusto,
    abastecimentos,
    registrosManutencao,
    apontamentos,
    precosHoraMaquina,
  ] as const;

describe("features/rentabilidade/derivacoes", () => {
  describe("rentabilidadePorEquipamento", () => {
    it("eq-001: receita só do faturamento rascunho (fat-002); margem negativa (custo real > preço)", () => {
      const r = rentabilidadePorEquipamento(eq("eq-001"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.horas_trabalhadas).toBe(12);
      expect(r.receita).toBe(4320);
      expect(r.custo).toBe(6201.6);
      expect(r.margem).toBe(-1881.6);
      expect(r.margem_percentual).toBeCloseTo(-0.4356, 3);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_receita).toHaveLength(1);
      expect(r.composicao_receita[0]).toMatchObject({ faturamento_id: "fat-002", valor: 4320 });
    });

    it("eq-002: receita soma faturado (fat-001) + rascunho (fat-002); margem positiva", () => {
      const r = rentabilidadePorEquipamento(eq("eq-002"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(8120);
      expect(r.custo).toBe(2378.8);
      expect(r.margem).toBe(5741.2);
      expect(r.margem_percentual).toBeCloseTo(0.707, 3);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_receita).toHaveLength(2);
    });

    it("eq-003: sem apontamento ligado a OS — receita zero, custo incompleto", () => {
      const r = rentabilidadePorEquipamento(eq("eq-003"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(0);
      expect(r.margem).toBe(0);
      expect(r.margem_percentual).toBeNull();
      expect(r.custo_incompleto).toBe(true);
    });

    it("eq-004: sem horas no período — receita zero, custo incompleto", () => {
      const r = rentabilidadePorEquipamento(eq("eq-004"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.horas_trabalhadas).toBe(0);
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(0);
      expect(r.custo_incompleto).toBe(true);
    });

    it("eq-005: item sem_preco (fat-003) — receita zero mas custo real; prejuízo, sem custo_incompleto", () => {
      const r = rentabilidadePorEquipamento(eq("eq-005"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(3976);
      expect(r.margem).toBe(-3976);
      expect(r.margem_percentual).toBeNull();
      expect(r.custo_incompleto).toBe(false); // tem componentes ativos — o problema é o preço, não o custo
    });

    it("eq-006: nenhuma OS que o usa foi faturada ainda — receita zero, prejuízo aparente", () => {
      const r = rentabilidadePorEquipamento(eq("eq-006"), PERIODO, ...ARGS_EQUIPAMENTO());
      // custo real: 21h (ap-004 9h + ap-010 7h + ap-011 5h, todas finalizadas em 2026-06)
      // × R$40/h (cc-009) = 840 + fixo 350 (cc-008) + diesel 555.1 (abst-007) = 1745.1
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(1745.1);
      expect(r.margem).toBe(-1745.1);
      expect(r.custo_incompleto).toBe(false);
    });

    it("eq-007: receita > 0 (fat-008) mas configuração de custo incompleta — margem calculada porém sinalizada", () => {
      const r = rentabilidadePorEquipamento(eq("eq-007"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.horas_trabalhadas).toBe(16);
      expect(r.receita).toBe(1560);
      expect(r.custo).toBe(700);
      expect(r.margem).toBe(860);
      expect(r.margem_percentual).toBeCloseTo(0.5513, 3);
      expect(r.custo_incompleto).toBe(true);
    });
  });

  describe("rentabilidadePorTodosEquipamentos", () => {
    it("retorna um resultado por equipamento ativo, excluindo inativos (eq-008)", () => {
      const resultados = rentabilidadePorTodosEquipamentos(
        equipamentos,
        PERIODO,
        ...ARGS_EQUIPAMENTO(),
      );
      expect(resultados).toHaveLength(7);
      expect(resultados.some((r) => r.equipamento_id === "eq-008")).toBe(false);
    });
  });

  describe("rentabilidadePorObra", () => {
    function osById(id: string) {
      const os = ordensServico.find((o) => o.id === id);
      if (!os) throw new Error(`OS ${id} ausente no mock`);
      return os;
    }
    function faturamentosDaOSNoPeriodo(osId: string) {
      return faturamentos.filter((f) => f.os_id === osId && f.gerado_em.slice(0, 7) === PERIODO);
    }

    it("os-003: um equipamento, faturado, margem positiva", () => {
      const r = rentabilidadePorObra(
        osById("os-003"),
        faturamentosDaOSNoPeriodo("os-003"),
        PERIODO,
        ...ARGS_OBRA(),
      );
      expect(r.receita).toBe(5220);
      expect(r.custo).toBe(1529.28);
      expect(r.margem).toBe(3690.72);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_custo).toHaveLength(1);
      expect(r.composicao_custo[0]).toMatchObject({ equipamento_id: "eq-002", horas: 18 });
    });

    it("os-007: multi-equipamento (rascunho), margem positiva porém estreita", () => {
      const r = rentabilidadePorObra(
        osById("os-007"),
        faturamentosDaOSNoPeriodo("os-007"),
        PERIODO,
        ...ARGS_OBRA(),
      );
      expect(r.receita).toBe(8070);
      expect(r.custo).toBe(7051.2);
      expect(r.margem).toBe(1018.8);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_custo).toHaveLength(2);
    });

    it("os-008: sem_preco no item — receita zero, prejuízo (obra com prejuízo, edge case exigido)", () => {
      const r = rentabilidadePorObra(
        osById("os-008"),
        faturamentosDaOSNoPeriodo("os-008"),
        PERIODO,
        ...ARGS_OBRA(),
      );
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(3976);
      expect(r.margem).toBe(-3976);
      expect(r.margem_percentual).toBeNull();
      expect(r.custo_incompleto).toBe(false);
    });

    it("os-009: por_metro, usa eq-007 (custo incompleto) — margem positiva mas sinalizada", () => {
      const r = rentabilidadePorObra(
        osById("os-009"),
        faturamentosDaOSNoPeriodo("os-009"),
        PERIODO,
        ...ARGS_OBRA(),
      );
      expect(r.receita).toBe(2700);
      expect(r.custo).toBe(218.75);
      expect(r.margem).toBe(2481.25);
      expect(r.custo_incompleto).toBe(true);
    });

    it("os-011: nova OS (eq-007), margem positiva mas sinalizada", () => {
      const r = rentabilidadePorObra(
        osById("os-011"),
        faturamentosDaOSNoPeriodo("os-011"),
        PERIODO,
        ...ARGS_OBRA(),
      );
      expect(r.receita).toBe(1560);
      expect(r.custo).toBe(262.5);
      expect(r.margem).toBe(1297.5);
      expect(r.custo_incompleto).toBe(true);
    });
  });

  describe("rentabilidadePorTodasAsObras", () => {
    it("retorna só as obras com ao menos um faturamento gerado no período (5 obras)", () => {
      const resultados = rentabilidadePorTodasAsObras(
        ordensServico,
        faturamentos,
        PERIODO,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados).toHaveLength(5);
      const ids = resultados.map((r) => r.os_id).sort();
      expect(ids).toEqual(["os-003", "os-007", "os-008", "os-009", "os-011"].sort());
      // os-010 (fechada, SEM fatura) e os-001/002/004/005/006 (sem fatura confirmada) ficam de fora
      expect(resultados.some((r) => r.os_id === "os-010")).toBe(false);
    });

    it("inclui ao menos uma obra com margem negativa (prejuízo)", () => {
      const resultados = rentabilidadePorTodasAsObras(
        ordensServico,
        faturamentos,
        PERIODO,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados.some((r) => r.margem < 0)).toBe(true);
    });

    it("retorna vazio para um período sem nenhum faturamento", () => {
      const resultados = rentabilidadePorTodasAsObras(
        ordensServico,
        faturamentos,
        "2025-01",
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados).toHaveLength(0);
    });
  });
});
