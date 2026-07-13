import { describe, it, expect } from "vitest";
import {
  serieMensalFaturamento,
  serieMensalCustoMargem,
  variacaoPercentual,
  horasPorEquipamentoNoPeriodo,
  rankingEquipamentosPorMargem,
  rankingObrasPorMargem,
} from "./derivacoes";
import {
  rentabilidadePorTodosEquipamentos,
  rentabilidadePorTodasAsObras,
} from "@/features/rentabilidade/derivacoes";
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
    const serie = serieMensalFaturamento(["2026-01", "2026-02", "2026-06"], faturamentos);
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

  it("soma receita/custo/margem/horas de eq-001 entre jan e fev (não sobrescreve)", () => {
    const jan = rentabilidadePorTodosEquipamentos(
      equipamentos,
      "2026-01",
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    );
    const fev = rentabilidadePorTodosEquipamentos(
      equipamentos,
      "2026-02",
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    );
    const janEq001 = jan.find((r) => r.equipamento_id === "eq-001");
    const fevEq001 = fev.find((r) => r.equipamento_id === "eq-001");
    expect(janEq001).toBeDefined();
    expect(fevEq001).toBeDefined();

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
    const eq001 = ranking.find((r) => r.equipamento_id === "eq-001");
    expect(eq001).toBeDefined();

    // Cada mês já vem arredondado (round2) pelo cálculo de rentabilidade;
    // somar dois valores de 2 casas pode gerar erro de ponto flutuante na
    // 3ª casa (ex.: 0.1 + 0.2), daí toBeCloseTo em vez de toBe.
    expect(eq001!.receita).toBeCloseTo(janEq001!.receita + fevEq001!.receita, 2);
    expect(eq001!.custo).toBeCloseTo(janEq001!.custo + fevEq001!.custo, 2);
    expect(eq001!.margem).toBeCloseTo(janEq001!.margem + fevEq001!.margem, 2);
    expect(eq001!.horas_trabalhadas).toBeCloseTo(
      janEq001!.horas_trabalhadas + fevEq001!.horas_trabalhadas,
      2,
    );
  });
});

describe("rankingObrasPorMargem", () => {
  it("retorna uma entrada por OS com fatura no período, sem duplicar, ao longo de vários meses", () => {
    // Nos mocks, cada OS histórica (os-h01a, os-h02a, ...) tem numeração e
    // faturamento fechados em um único mês — não há OS com faturamento em
    // dois meses distintos para exercitar a soma "mesma OS em 2 meses". Por
    // isso este teste cobre o que os mocks realmente permitem: o loop
    // mês-a-mês sobre um período de 2 meses (jan+fev) sem duplicar OS e sem
    // misturar valores entre OS de meses diferentes — usa
    // rentabilidadePorTodasAsObras (mês a mês) como fonte de verdade.
    const periodo = { tipo: "personalizado" as const, mesInicio: "2026-01", mesFim: "2026-02" };
    const ranking = rankingObrasPorMargem(
      ordensServico,
      faturamentos,
      periodo,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    const ids = ranking.map((r) => r.os_id);
    expect(new Set(ids).size).toBe(ids.length);

    const jan = rentabilidadePorTodasAsObras(
      ordensServico,
      faturamentos,
      "2026-01",
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    const fev = rentabilidadePorTodasAsObras(
      ordensServico,
      faturamentos,
      "2026-02",
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    const janOsH01a = jan.find((r) => r.os_id === "os-h01a");
    const fevOsH02a = fev.find((r) => r.os_id === "os-h02a");
    expect(janOsH01a).toBeDefined();
    expect(fevOsH02a).toBeDefined();

    // os-h01a só existe em janeiro e os-h02a só em fevereiro (OS distintas
    // por mês nos mocks) — o valor no ranking do período deve bater
    // exatamente com o cálculo de um único mês, sem soma espúria de outro
    // mês vazando para dentro dessa OS.
    const rankingOsH01a = ranking.find((r) => r.os_id === "os-h01a");
    const rankingOsH02a = ranking.find((r) => r.os_id === "os-h02a");
    expect(rankingOsH01a).toBeDefined();
    expect(rankingOsH02a).toBeDefined();
    expect(rankingOsH01a!.receita).toBeCloseTo(janOsH01a!.receita, 2);
    expect(rankingOsH01a!.custo).toBeCloseTo(janOsH01a!.custo, 2);
    expect(rankingOsH01a!.margem).toBeCloseTo(janOsH01a!.margem, 2);
    expect(rankingOsH02a!.receita).toBeCloseTo(fevOsH02a!.receita, 2);
    expect(rankingOsH02a!.custo).toBeCloseTo(fevOsH02a!.custo, 2);
    expect(rankingOsH02a!.margem).toBeCloseTo(fevOsH02a!.margem, 2);
  });
});
