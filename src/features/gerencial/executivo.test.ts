import { describe, it, expect } from "vitest";
import {
  curvaABC,
  diasUteisNoMes,
  faixasABC,
  horasDisponiveisNoPeriodo,
  utilizacaoFrota,
} from "@/features/gerencial/executivo";
import type { MargemCliente } from "@/features/rentabilidade/derivacoes";
import type { Apontamento, Equipamento } from "@/shared/types";

function cliente(id: string, receita: number): MargemCliente {
  return {
    cliente_id: id,
    receita,
    custo: 0,
    margem: receita,
    margemPercentual: receita > 0 ? 1 : null,
    obras: 1,
  };
}

describe("curvaABC", () => {
  it("ordena por receita e classifica pelo acumulado", () => {
    // 70 + 20 + 6 + 4 = 100. O primeiro fecha 70% (A); o segundo começa em 70%
    // (< 80%, ainda A) e leva a 90%; o terceiro começa em 90% (B); o quarto
    // começa em 96% (C).
    const linhas = curvaABC([cliente("d", 4), cliente("a", 70), cliente("c", 6), cliente("b", 20)]);
    expect(linhas.map((l) => l.cliente_id)).toEqual(["a", "b", "c", "d"]);
    expect(linhas.map((l) => l.classe)).toEqual(["A", "A", "B", "C"]);
  });

  it("mantém na curva A quem cruza o corte, para o corte ser atingível", () => {
    // Um cliente sozinho com 100% da receita começa em 0% — é curva A, não C.
    const linhas = curvaABC([cliente("unico", 1000)]);
    expect(linhas[0].classe).toBe("A");
    expect(linhas[0].acumulado).toBeCloseTo(1, 6);
  });

  it("calcula participação e acumulado como fração", () => {
    const linhas = curvaABC([cliente("a", 75), cliente("b", 25)]);
    expect(linhas[0].participacao).toBeCloseTo(0.75, 6);
    expect(linhas[1].participacao).toBeCloseTo(0.25, 6);
    expect(linhas[1].acumulado).toBeCloseTo(1, 6);
  });

  it("é vazio quando não há receita, em vez de dividir por zero", () => {
    expect(curvaABC([cliente("a", 0)])).toEqual([]);
    expect(curvaABC([])).toEqual([]);
  });
});

describe("faixasABC", () => {
  it("consolida as três faixas somando participação", () => {
    const faixas = faixasABC(curvaABC([cliente("a", 70), cliente("b", 20), cliente("c", 10)]));
    expect(faixas.map((f) => f.classe)).toEqual(["A", "B", "C"]);
    // a começa em 0% e b em 70% — os dois abaixo do corte de 80%, ambos curva A.
    expect(faixas[0].clientes).toBe(2);
    expect(faixas[0].receita).toBeCloseTo(0.9, 6);
    // c começa em 90%, ainda abaixo dos 95% que fecham a curva B.
    expect(faixas[1].clientes).toBe(1);
    expect(faixas[2].clientes).toBe(0);
  });

  it("chega na curva C quando a cauda é longa", () => {
    // Um cliente grande e seis pequenos: os últimos entram já acima de 95%.
    const linhas = curvaABC([
      cliente("grande", 900),
      ...Array.from({ length: 6 }, (_, i) => cliente(`p${i}`, 25)),
    ]);
    const faixas = faixasABC(linhas);
    expect(faixas[2].clientes).toBeGreaterThan(0);
    expect(linhas.at(-1)?.classe).toBe("C");
  });

  it("devolve as três faixas mesmo quando alguma está vazia", () => {
    const faixas = faixasABC(curvaABC([cliente("unico", 500)]));
    expect(faixas).toHaveLength(3);
    expect(faixas[1].clientes).toBe(0);
    expect(faixas[1].receita).toBe(0);
  });
});

describe("diasUteisNoMes", () => {
  it("conta segunda a sexta", () => {
    // Junho/2026: 30 dias, começa numa segunda — 22 dias úteis.
    expect(diasUteisNoMes("2026-06", "seg_sex")).toBe(22);
  });

  it("conta segunda a sábado", () => {
    expect(diasUteisNoMes("2026-06", "seg_sab")).toBe(26);
  });

  it("trata 'personalizado' como segunda a sexta", () => {
    expect(diasUteisNoMes("2026-06", "personalizado")).toBe(diasUteisNoMes("2026-06", "seg_sex"));
  });

  it("acerta fevereiro bissexto", () => {
    // Fevereiro/2024 tem 29 dias e 21 dias úteis (seg-sex).
    expect(diasUteisNoMes("2024-02", "seg_sex")).toBe(21);
  });
});

describe("horasDisponiveisNoPeriodo", () => {
  it("multiplica jornada pelos dias úteis de cada mês", () => {
    expect(horasDisponiveisNoPeriodo(["2026-06"], 8, "seg_sex")).toBe(176); // 22 × 8
  });

  it("soma os meses do período", () => {
    const junho = horasDisponiveisNoPeriodo(["2026-06"], 8, "seg_sex");
    const julho = horasDisponiveisNoPeriodo(["2026-07"], 8, "seg_sex");
    expect(horasDisponiveisNoPeriodo(["2026-06", "2026-07"], 8, "seg_sex")).toBe(junho + julho);
  });

  it("acompanha a jornada configurada", () => {
    expect(horasDisponiveisNoPeriodo(["2026-06"], 10, "seg_sex")).toBe(220);
  });
});

describe("utilizacaoFrota", () => {
  const equipamento = (id: string, ativo = true): Equipamento =>
    ({ id, nome: id, ativo }) as Equipamento;

  const apontamento = (equipamentoId: string, horas: number): Apontamento =>
    ({
      id: `ap-${equipamentoId}-${horas}`,
      equipamento_id: equipamentoId,
      status: "finalizado",
      horas_trabalhadas: horas,
      finalizado_em: "2026-06-15T12:00:00.000Z",
    }) as Apontamento;

  it("calcula horas ÷ disponível por equipamento", () => {
    const linhas = utilizacaoFrota(
      [equipamento("eq-1")],
      [apontamento("eq-1", 88)],
      ["2026-06"],
      8,
      "seg_sex",
    );
    // 88 de 176 disponíveis = 50%.
    expect(linhas[0].utilizacao).toBeCloseTo(0.5, 6);
    expect(linhas[0].disponivel).toBe(176);
  });

  it("ordena do mais utilizado para o menos", () => {
    const linhas = utilizacaoFrota(
      [equipamento("baixo"), equipamento("alto")],
      [apontamento("baixo", 20), apontamento("alto", 150)],
      ["2026-06"],
      8,
      "seg_sex",
    );
    expect(linhas.map((l) => l.equipamento_id)).toEqual(["alto", "baixo"]);
  });

  it("deixa passar de 100% quando a máquina rodou além da jornada padrão", () => {
    const linhas = utilizacaoFrota(
      [equipamento("eq-1")],
      [apontamento("eq-1", 200)],
      ["2026-06"],
      8,
      "seg_sex",
    );
    // Não é erro: hora extra e sábado existem. Truncar em 100% esconderia isso.
    expect(linhas[0].utilizacao).toBeGreaterThan(1);
  });

  it("ignora equipamento inativo", () => {
    const linhas = utilizacaoFrota(
      [equipamento("ativo"), equipamento("inativo", false)],
      [],
      ["2026-06"],
      8,
      "seg_sex",
    );
    expect(linhas).toHaveLength(1);
    expect(linhas[0].equipamento_id).toBe("ativo");
  });

  it("devolve utilização nula quando não há horas disponíveis", () => {
    const linhas = utilizacaoFrota([equipamento("eq-1")], [], ["2026-06"], 0, "seg_sex");
    expect(linhas[0].utilizacao).toBeNull();
  });
});
