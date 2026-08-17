import { describe, it, expect } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { apontamentos } from "@/mocks/apontamentos";
import { abastecimentos } from "@/mocks/abastecimentos";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { componentesCusto } from "@/mocks/componentes-custo";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import {
  custoHoraPorEquipamento,
  resumoCustoHora,
  type CustoHoraEquipamento,
} from "@/features/custo-hora/derivacoes";
import { montarCsvCustoHora, nomeArquivoCustoHora } from "@/features/custo-hora/exportar-csv";

const PERIODO = "2026-06";

const resultados = () =>
  custoHoraPorEquipamento(
    equipamentos,
    PERIODO,
    componentesCusto,
    abastecimentos,
    registrosManutencao,
    apontamentos,
    precosHoraMaquina,
  );

/** Linha mínima para exercitar os casos-limite sem depender dos mocks. */
function linha(patch: Partial<CustoHoraEquipamento>): CustoHoraEquipamento {
  return {
    equipamento_id: "eq-x",
    periodo: PERIODO,
    horas_trabalhadas: 0,
    custo_diesel: 0,
    custo_manutencao: 0,
    custo_fixo_rateado: 0,
    custo_variavel: 0,
    custo_total: 0,
    custo_por_hora: null,
    preco_hora: null,
    margem_hora: null,
    detalhamento: [],
    configuracao_incompleta: false,
    ...patch,
  };
}

describe("resumoCustoHora", () => {
  it("pondera o custo médio pelas horas, não pela média dos equipamentos", () => {
    // 1000/100h e 100/10h: média simples das taxas daria 10, mas o ponderado
    // também é 10 — então usamos taxas diferentes para o teste valer.
    const resumo = resumoCustoHora([
      linha({ horas_trabalhadas: 100, custo_total: 1000, custo_por_hora: 10 }),
      linha({ horas_trabalhadas: 10, custo_total: 500, custo_por_hora: 50 }),
    ]);
    // (1000 + 500) / 110 = 13,64 — e não (10 + 50) / 2 = 30.
    expect(resumo.custoMedioHora).toBeCloseTo(13.64, 2);
    expect(resumo.horas).toBe(110);
    expect(resumo.custoTotal).toBe(1500);
  });

  it("devolve custo médio nulo quando ninguém trabalhou no mês", () => {
    const resumo = resumoCustoHora([linha({ horas_trabalhadas: 0, custo_total: 300 })]);
    expect(resumo.custoMedioHora).toBeNull();
  });

  it("calcula a margem média só sobre quem tem preço e custo apurados", () => {
    const resumo = resumoCustoHora([
      // 40% de margem
      linha({ horas_trabalhadas: 10, custo_total: 600, custo_por_hora: 60, preco_hora: 100 }),
      // 20% de margem
      linha({ horas_trabalhadas: 10, custo_total: 800, custo_por_hora: 80, preco_hora: 100 }),
      // sem preço: fica de fora da média em vez de contar como margem zero
      linha({ horas_trabalhadas: 10, custo_total: 500, custo_por_hora: 50, preco_hora: null }),
    ]);
    expect(resumo.margemMediaPct).toBeCloseTo(30, 2);
  });

  it("devolve margem média nula quando nenhum equipamento tem preço", () => {
    const resumo = resumoCustoHora([linha({ horas_trabalhadas: 8, custo_por_hora: 50 })]);
    expect(resumo.margemMediaPct).toBeNull();
  });

  it("conta os equipamentos operando abaixo do custo", () => {
    const resumo = resumoCustoHora([
      linha({ margem_hora: -12 }),
      linha({ margem_hora: 30 }),
      linha({ margem_hora: null }),
      linha({ margem_hora: -1 }),
    ]);
    expect(resumo.margensNegativas).toBe(2);
  });

  it("soma o diesel separado do custo total", () => {
    const resumo = resumoCustoHora([
      linha({ custo_diesel: 100, custo_total: 250 }),
      linha({ custo_diesel: 40, custo_total: 90 }),
    ]);
    expect(resumo.custoDiesel).toBe(140);
    expect(resumo.custoTotal).toBe(340);
  });

  it("roda sobre os dados reais do mês sem quebrar", () => {
    const resumo = resumoCustoHora(resultados());
    expect(resumo.horas).toBeGreaterThan(0);
    expect(resumo.custoTotal).toBeGreaterThan(0);
  });
});

describe("montarCsvCustoHora", () => {
  const nome = (id: string) =>
    ({ "eq-1": "Escavadeira 320D", "eq-2": 'Caçamba "grande"' })[id] ?? id;

  it("usa ponto e vírgula e vírgula decimal, para o Excel pt-BR", () => {
    const csv = montarCsvCustoHora(
      [
        linha({
          equipamento_id: "eq-1",
          horas_trabalhadas: 148,
          custo_por_hora: 232.5,
          preco_hora: 400,
          margem_hora: 167.5,
          custo_total: 34410,
        }),
      ],
      nome,
    );
    const [cabecalho, primeira] = csv.split("\r\n");
    expect(cabecalho).toBe(
      "Equipamento;Horas no mês;Custo/hora;Preço/hora;Margem/hora;Custo total",
    );
    expect(primeira).toBe("Escavadeira 320D;148,00;232,50;400,00;167,50;34410,00");
  });

  it("deixa a célula vazia quando o valor não existe, em vez de escrever zero", () => {
    const csv = montarCsvCustoHora(
      [linha({ equipamento_id: "eq-1", custo_por_hora: null, preco_hora: null })],
      nome,
    );
    expect(csv.split("\r\n")[1]).toBe("Escavadeira 320D;0,00;;;;0,00");
  });

  it("escapa aspas no nome do equipamento", () => {
    const csv = montarCsvCustoHora([linha({ equipamento_id: "eq-2" })], nome);
    expect(csv.split("\r\n")[1]).toContain('"Caçamba ""grande"""');
  });

  it("gera só o cabeçalho quando não há linhas", () => {
    expect(montarCsvCustoHora([], nome).split("\r\n")).toHaveLength(1);
  });
});

describe("nomeArquivoCustoHora", () => {
  it("carrega o período no nome do arquivo", () => {
    expect(nomeArquivoCustoHora("2026-06")).toBe("custo-hora-2026-06.csv");
  });
});
