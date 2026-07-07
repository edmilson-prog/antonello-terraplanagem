import { describe, it, expect } from "vitest";
import {
  serieMensalFaturamento,
  serieMensalCustoMargem,
  variacaoPercentual,
  horasPorEquipamentoNoPeriodo,
  rankingEquipamentosPorMargem,
  rankingObrasPorMargem,
} from "./derivacoes";
import { equipamentos } from "@/mocks/equipamentos";
import { apontamentos } from "@/mocks/apontamentos";
import { faturamentos } from "@/mocks/faturamentos";
import { ordensServico } from "@/mocks/ordens-servico";
import { componentesCusto } from "@/mocks/componentes-custo";
import { abastecimentos } from "@/mocks/abastecimentos";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";

describe("variacaoPercentual", () => {
  it("calcula a variação percentual normal", () => {
    expect(variacaoPercentual(120, 100)).toBe(20);
    expect(variacaoPercentual(80, 100)).toBe(-20);
  });

  it("retorna null quando o anterior é zero (evita Infinity)", () => {
    expect(variacaoPercentual(100, 0)).toBeNull();
  });
});

describe("serieMensalFaturamento", () => {
  it("soma valor_total das faturas com status faturado no mês, por mês", () => {
    const serie = serieMensalFaturamento(
      ["2026-01", "2026-02", "2026-06"],
      faturamentos,
    );
    expect(serie).toHaveLength(3);
    expect(serie[0]).toEqual({ mes: "2026-01", rotulo: "Janeiro 2026", faturado: 5920 }); // 3600 + 2320
    expect(serie[1].faturado).toBe(8520); // 5040 + 3480
    expect(serie[2].mes).toBe("2026-06");
  });

  it("mês sem nenhuma fatura confirmada retorna 0, não quebra", () => {
    const serie = serieMensalFaturamento(["2025-01"], faturamentos);
    expect(serie[0].faturado).toBe(0);
  });
});

describe("serieMensalCustoMargem", () => {
  it("deriva receita/custo/margem por mês a partir da rentabilidade por equipamento", () => {
    const serie = serieMensalCustoMargem(
      ["2026-01"],
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    );
    expect(serie).toHaveLength(1);
    expect(serie[0].receita).toBeGreaterThan(0);
    expect(serie[0].margem).toBe(serie[0].receita - serie[0].custo);
  });
});

describe("horasPorEquipamentoNoPeriodo", () => {
  it("soma horas de vários meses do período para o mesmo equipamento", () => {
    const resultado = horasPorEquipamentoNoPeriodo(equipamentos, apontamentos, {
      tipo: "personalizado",
      mesInicio: "2026-01",
      mesFim: "2026-02",
    });
    const eq001 = resultado.find((r) => r.equipamento_id === "eq-001");
    expect(eq001?.horas).toBe(24); // 10 (jan) + 14 (fev)
  });
});

describe("rankingEquipamentosPorMargem", () => {
  it("acumula margem de vários meses por equipamento e ordena desc", () => {
    const ranking = rankingEquipamentosPorMargem(
      equipamentos,
      { tipo: "personalizado", mesInicio: "2026-01", mesFim: "2026-02" },
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    );
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].margem).toBeGreaterThanOrEqual(ranking[i].margem);
    }
  });
});

describe("rankingObrasPorMargem", () => {
  it("retorna uma entrada por OS com fatura no período, sem duplicar", () => {
    const ranking = rankingObrasPorMargem(
      ordensServico,
      faturamentos,
      { tipo: "mes", mesInicio: "2026-01", mesFim: "2026-01" },
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    const ids = ranking.map((r) => r.os_id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ranking.some((r) => r.os_id === "os-h01a")).toBe(true);
  });
});
