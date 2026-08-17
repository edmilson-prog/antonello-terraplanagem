import { describe, it, expect } from "vitest";
import {
  margemPorCliente,
  resumoRentabilidade,
  type RentabilidadeObra,
} from "@/features/rentabilidade/derivacoes";

function obra(patch: Partial<RentabilidadeObra>): RentabilidadeObra {
  return {
    os_id: "os-x",
    os_numero: "OS-000",
    cliente_id: "cl-1",
    periodo: "2026-06",
    receita: 0,
    custo: 0,
    margem: 0,
    margem_percentual: null,
    custo_incompleto: false,
    composicao_receita: [],
    composicao_custo: [],
    ...patch,
  };
}

describe("resumoRentabilidade", () => {
  it("soma receita e custo e deriva o resultado", () => {
    const resumo = resumoRentabilidade([
      { receita: 41000, custo: 24100, margem: 16900 },
      { receita: 19800, custo: 12400, margem: 7400 },
    ]);
    expect(resumo.receita).toBe(60800);
    expect(resumo.custo).toBe(36500);
    expect(resumo.resultado).toBe(24300);
  });

  it("usa a margem do agregado, não a média das margens", () => {
    // Uma obra pequena com margem enorme não pode puxar o número do mês.
    const resumo = resumoRentabilidade([
      { receita: 100, custo: 10, margem: 90 }, // 90%
      { receita: 100000, custo: 90000, margem: 10000 }, // 10%
    ]);
    // Agregado: 10090 / 100100 = 0,1008 (10,08%) — e não (0,9 + 0,1) / 2 = 0,5.
    // A escala é fração, como margem_percentual das linhas — é o que
    // formatPercentual espera.
    expect(resumo.margemPercentual).toBeCloseTo(0.1008, 4);
  });

  it("devolve margem nula quando não houve receita, em vez de dividir por zero", () => {
    const resumo = resumoRentabilidade([{ receita: 0, custo: 500, margem: -500 }]);
    expect(resumo.margemPercentual).toBeNull();
    expect(resumo.resultado).toBe(-500);
  });

  it("conta as linhas no prejuízo", () => {
    const resumo = resumoRentabilidade([
      { receita: 100, custo: 120, margem: -20 },
      { receita: 100, custo: 80, margem: 20 },
      { receita: 100, custo: 101, margem: -1 },
    ]);
    expect(resumo.comPrejuizo).toBe(2);
  });

  it("é neutro para lista vazia", () => {
    const resumo = resumoRentabilidade([]);
    expect(resumo).toEqual({
      receita: 0,
      custo: 0,
      resultado: 0,
      margemPercentual: null,
      comPrejuizo: 0,
    });
  });
});

describe("margemPorCliente", () => {
  it("consolida várias obras do mesmo cliente numa linha", () => {
    const linhas = margemPorCliente([
      obra({ cliente_id: "cl-1", receita: 41000, custo: 24100, margem: 16900 }),
      obra({ cliente_id: "cl-1", receita: 12500, custo: 8100, margem: 4400 }),
    ]);
    expect(linhas).toHaveLength(1);
    expect(linhas[0].receita).toBe(53500);
    expect(linhas[0].custo).toBe(32200);
    expect(linhas[0].margem).toBe(21300);
    expect(linhas[0].obras).toBe(2);
  });

  it("ordena da maior margem percentual para a menor", () => {
    const linhas = margemPorCliente([
      obra({ cliente_id: "baixa", receita: 100, custo: 84 }),
      obra({ cliente_id: "alta", receita: 100, custo: 61 }),
      obra({ cliente_id: "media", receita: 100, custo: 67 }),
    ]);
    expect(linhas.map((l) => l.cliente_id)).toEqual(["alta", "media", "baixa"]);
  });

  it("calcula a margem percentual sobre o total do cliente, não por obra", () => {
    const linhas = margemPorCliente([
      obra({ cliente_id: "cl-1", receita: 1000, custo: 500 }),
      obra({ cliente_id: "cl-1", receita: 1000, custo: 900 }),
    ]);
    // 600 de margem sobre 2000 de receita = 30%, expresso como fração.
    expect(linhas[0].margemPercentual).toBeCloseTo(0.3, 4);
  });

  it("aceita cliente sem receita sem quebrar a ordenação", () => {
    const linhas = margemPorCliente([
      obra({ cliente_id: "com-receita", receita: 100, custo: 50 }),
      obra({ cliente_id: "sem-receita", receita: 0, custo: 0 }),
    ]);
    expect(linhas[0].cliente_id).toBe("com-receita");
    expect(linhas[1].margemPercentual).toBeNull();
  });

  it("é vazio quando não há obras", () => {
    expect(margemPorCliente([])).toEqual([]);
  });
});
