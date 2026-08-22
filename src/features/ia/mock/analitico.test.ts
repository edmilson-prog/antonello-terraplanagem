import { describe, expect, it } from "vitest";
import {
  alertasConsumoAnomalo,
  avaliarRiscoClientes,
  detectarAnomalias,
  gerarInsight,
  preverCaixa,
} from "@/features/ia/mock/analitico";
import type { Apontamento, Cliente, ContaReceber, Equipamento } from "@/shared/types";
import type { IndicadorDieselEquipamento } from "@/features/diesel/derivacoes";

function apontamento(overrides: Partial<Apontamento>): Apontamento {
  return {
    id: "ap-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: null,
    horimetro_inicial: 100,
    horimetro_final: 108,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-10T08:00:00.000Z",
    finalizado_em: "2026-06-10T16:00:00.000Z",
    created_at: "2026-06-10T08:00:00.000Z",
    updated_at: "2026-06-10T16:00:00.000Z",
    ...overrides,
  };
}

describe("detectarAnomalias", () => {
  it("flags a single apontamento with more than 16 worked hours as an atypical jump", () => {
    const lista = [apontamento({ id: "ap-1", horas_trabalhadas: 18 })];
    const anomalias = detectarAnomalias(lista);
    expect(anomalias).toEqual([
      {
        apontamento_id: "ap-1",
        motivo: "Salto de horímetro atípico (18h em um único apontamento)",
        severidade: "alerta",
      },
    ]);
  });

  it("flags same-day same-equipment apontamentos totalling more than 14h", () => {
    const lista = [
      apontamento({ id: "ap-1", horas_trabalhadas: 8, iniciado_em: "2026-06-10T06:00:00.000Z" }),
      apontamento({ id: "ap-2", horas_trabalhadas: 8, iniciado_em: "2026-06-10T14:00:00.000Z" }),
    ];
    const anomalias = detectarAnomalias(lista);
    expect(anomalias.map((a) => a.apontamento_id)).toEqual(["ap-1", "ap-2"]);
    expect(anomalias[0].motivo).toContain("Horas do equipamento acima do padrão do dia");
  });

  it("flags apontamentos with the same equipamento, operador, horimetro_inicial and day as a possible duplicate", () => {
    const lista = [
      apontamento({ id: "ap-1", horas_trabalhadas: 4, horimetro_inicial: 200 }),
      apontamento({ id: "ap-2", horas_trabalhadas: 4, horimetro_inicial: 200 }),
    ];
    const anomalias = detectarAnomalias(lista);
    expect(anomalias.some((a) => a.motivo === "Possível apontamento duplicado")).toBe(true);
  });

  it("returns nothing for a normal, isolated apontamento", () => {
    expect(detectarAnomalias([apontamento({})])).toEqual([]);
  });
});

describe("gerarInsight", () => {
  it("references the real faturamento and margem numbers with their variação", async () => {
    const insight = await gerarInsight(
      { totalAtual: 11000, totalAnterior: 10000, margemAtual: 5500, margemAnterior: 5000 },
      { delayMs: 0 },
    );
    expect(insight.texto).toContain("R$ 11.000,00");
    expect(insight.texto).toContain("alta de 10%");
    expect(insight.texto).toContain("R$ 5.500,00");
  });

  it("handles a zero anterior period without a broken percentage", async () => {
    const insight = await gerarInsight(
      { totalAtual: 1000, totalAnterior: 0, margemAtual: 500, margemAnterior: 0 },
      { delayMs: 0 },
    );
    expect(insight.texto).toContain("sem comparação");
  });
});

function equipamento(id: string): Equipamento {
  return {
    id,
    nome: id,
    tipo: "escavadeira",
    capacidade: "18 toneladas",
    horimetro_atual: 1000,
    identificador: null,
    status: "disponivel",
    ativo: true,
    marca: null,
    ano: null,
    propriedade: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    aquisicao_forma: null,
    aquisicao_parcelas: null,
    descricao: null,
  };
}

function indicador(id: string, consumo: number, qtd = 3): IndicadorDieselEquipamento {
  return {
    equipamento: equipamento(id),
    litros_periodo: consumo * 10,
    horas_periodo: 10,
    consumo_medio_l_h: consumo,
    qtd_abastecimentos: qtd,
  };
}

describe("alertasConsumoAnomalo", () => {
  it("flags an equipamento whose consumo is 30%+ above the fleet average", () => {
    const indicadores = [indicador("eq-1", 10), indicador("eq-2", 10), indicador("eq-3", 16)];
    const alertas = alertasConsumoAnomalo(indicadores);
    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toMatchObject({ equipamento_id: "eq-3", consumo_medio_l_h: 16 });
    expect(alertas[0].percentual_acima).toBeGreaterThanOrEqual(30);
  });

  it("returns nothing when fewer than 2 equipamentos have enough data", () => {
    const indicadores = [
      indicador("eq-1", 10),
      { ...indicador("eq-2", 30), qtd_abastecimentos: 1 },
    ];
    expect(alertasConsumoAnomalo(indicadores)).toEqual([]);
  });

  it("returns nothing when no equipamento is above the threshold", () => {
    const indicadores = [indicador("eq-1", 10), indicador("eq-2", 10.5), indicador("eq-3", 9.8)];
    expect(alertasConsumoAnomalo(indicadores)).toEqual([]);
  });
});

function conta(overrides: Partial<ContaReceber>): ContaReceber {
  return {
    id: "cr-1",
    faturamento_id: "fat-1",
    cliente_id: "cli-1",
    valor: 1000,
    vencimento: "2026-07-20",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-20T00:00:00.000Z",
    updated_at: "2026-06-20T00:00:00.000Z",
    ...overrides,
  };
}

function cliente(id: string, nome: string): Cliente {
  return {
    id,
    nome,
    documento: null,
    telefone: null,
    ativo: true,
    nome_fantasia: null,
    segmento: null,
    email: null,
    endereco: null,
    cidade: null,
    contato_nome: null,
    contato_papel: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

describe("preverCaixa", () => {
  it("buckets open contas by due date into 30/60/90 day windows", () => {
    const contas = [
      conta({ id: "cr-1", valor: 1000, vencimento: "2026-07-10" }),
      conta({ id: "cr-2", valor: 2000, vencimento: "2026-08-15" }),
      conta({ id: "cr-3", valor: 500, vencimento: "2026-10-01" }),
    ];
    const previsao = preverCaixa(contas, { hojeISO: "2026-07-01" });
    expect(previsao).toEqual([
      { dias: 30, valor_previsto: 1000 },
      { dias: 60, valor_previsto: 3000 },
      { dias: 90, valor_previsto: 3000 },
    ]);
  });

  it("ignores already-liquidated contas", () => {
    const contas = [conta({ status: "liquidada", vencimento: "2026-07-05" })];
    const previsao = preverCaixa(contas, { hojeISO: "2026-07-01" });
    expect(previsao.every((p) => p.valor_previsto === 0)).toBe(true);
  });

  it("excludes already-overdue contas from the cash-flow projection (they're risk, not incoming cash)", () => {
    const contas = [conta({ id: "cr-1", valor: 1000, vencimento: "2026-06-15" })];
    const previsao = preverCaixa(contas, { hojeISO: "2026-07-01" });
    expect(previsao.every((p) => p.valor_previsto === 0)).toBe(true);
  });
});

describe("avaliarRiscoClientes", () => {
  it("flags a cliente with 2+ overdue contas as alto risco", () => {
    const contas = [
      conta({ id: "cr-1", cliente_id: "cli-1", vencimento: "2026-06-01" }),
      conta({ id: "cr-2", cliente_id: "cli-1", vencimento: "2026-06-10" }),
    ];
    const riscos = avaliarRiscoClientes(contas, [cliente("cli-1", "Obras Silva")], {
      hojeISO: "2026-07-01",
    });
    expect(riscos).toEqual([
      { cliente_id: "cli-1", nivel: "alto", motivo: "2 contas vencidas — Obras Silva" },
    ]);
  });

  it("flags a cliente with exactly 1 overdue conta as medio risco", () => {
    const contas = [conta({ id: "cr-1", cliente_id: "cli-1", vencimento: "2026-06-01" })];
    const riscos = avaliarRiscoClientes(contas, [cliente("cli-1", "Obras Silva")], {
      hojeISO: "2026-07-01",
    });
    expect(riscos).toEqual([
      { cliente_id: "cli-1", nivel: "medio", motivo: "1 conta vencida — Obras Silva" },
    ]);
  });

  it("does not flag a cliente with no overdue contas", () => {
    const contas = [conta({ cliente_id: "cli-1", vencimento: "2026-08-01" })];
    expect(
      avaliarRiscoClientes(contas, [cliente("cli-1", "Obras Silva")], { hojeISO: "2026-07-01" }),
    ).toEqual([]);
  });
});
