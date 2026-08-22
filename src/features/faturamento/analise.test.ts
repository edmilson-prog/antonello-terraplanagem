import { describe, it, expect } from "vitest";
import {
  porCliente,
  porEquipamento,
  rangeDePreset,
  resumoDoPeriodo,
  serieMensal,
} from "@/features/faturamento/analise";
import type { Cliente, Equipamento, Faturamento, FaturamentoItem } from "@/shared/types";

function item(over: Partial<FaturamentoItem> = {}): FaturamentoItem {
  return {
    id: "it-1",
    tipo: "hora_maquina",
    descricao: "Escavadeira — 10 h operada",
    origem_id: "eq-1",
    hora_tipo: "operada",
    quantidade: 10,
    valor_unitario: 400,
    valor_total: 4000,
    sem_preco: false,
    ...over,
  };
}

function fat(over: Partial<Faturamento> = {}): Faturamento {
  return {
    id: "fat-1",
    numero: "FAT-2026-0001",
    os_id: "os-1",
    cliente_id: "cl-1",
    modelo_cobranca: "hora_maquina",
    itens: [item()],
    desconto: 0,
    valor_total: 4000,
    observacao: null,
    status: "faturado",
    gerado_em: "2026-03-10T12:00:00.000Z",
    faturado_em: "2026-03-10T12:00:00.000Z",
    created_at: "2026-03-10T12:00:00.000Z",
    updated_at: "2026-03-10T12:00:00.000Z",
    ...over,
  };
}

const EQUIPAMENTOS = [
  { id: "eq-1", nome: "ESCAVADEIRA CAT 320" },
  { id: "eq-2", nome: "CAÇAMBA" },
] as Equipamento[];

const CLIENTES = [
  { id: "cl-1", nome: "CONSTRUTORA HORIZONTE" },
  { id: "cl-2", nome: "VALE VERDE" },
] as Cliente[];

describe("serieMensal", () => {
  it("base sem nota faturada devolve série vazia — não um mês zerado", () => {
    expect(serieMensal([])).toEqual([]);
  });

  it("rascunho não entra na série", () => {
    expect(serieMensal([fat({ status: "rascunho", faturado_em: null })])).toEqual([]);
  });

  it("agrupa por mês de faturamento e ordena cronologicamente", () => {
    const serie = serieMensal([
      fat({ id: "a", faturado_em: "2026-05-02T12:00:00.000Z" }),
      fat({ id: "b", faturado_em: "2026-03-10T12:00:00.000Z" }),
      fat({ id: "c", faturado_em: "2026-03-28T12:00:00.000Z" }),
    ]);

    expect(serie.map((m) => m.mes)).toEqual(["2026-03", "2026-05"]);
    expect(serie[0].valor).toBe(8000);
    expect(serie[0].horas_faturadas).toBe(20);
    expect(serie[0].rotulo).toBe("Mar/26");
  });

  it("mês sem faturamento não vira ponto zero entre dois meses faturados", () => {
    // Um zero interpolado desenharia uma queda que não houve — a empresa pode
    // simplesmente não ter fechado nota naquele mês.
    const serie = serieMensal([
      fat({ id: "a", faturado_em: "2026-01-10T12:00:00.000Z" }),
      fat({ id: "b", faturado_em: "2026-04-10T12:00:00.000Z" }),
    ]);

    expect(serie.map((m) => m.mes)).toEqual(["2026-01", "2026-04"]);
  });

  it("horas faturadas contam só itens de hora-máquina", () => {
    const serie = serieMensal([
      fat({
        itens: [
          item({ quantidade: 10 }),
          item({ id: "mob", tipo: "mobilizacao", quantidade: 1, valor_total: 900 }),
        ],
        valor_total: 4900,
      }),
    ]);

    expect(serie[0].horas_faturadas).toBe(10);
    expect(serie[0].valor).toBe(4900);
  });
});

describe("porEquipamento", () => {
  it("soma por equipamento e ignora mobilização", () => {
    const linhas = porEquipamento(
      [
        fat({
          id: "a",
          itens: [
            item({ origem_id: "eq-1", quantidade: 10, valor_total: 4000 }),
            item({ id: "i2", origem_id: "eq-2", quantidade: 4, valor_total: 1200 }),
            item({ id: "i3", tipo: "mobilizacao", origem_id: "eq-1", valor_total: 900 }),
          ],
        }),
      ],
      EQUIPAMENTOS,
      "2026-01",
      "2026-12",
    );

    expect(linhas).toEqual([
      { equipamento_id: "eq-1", equipamento_nome: "ESCAVADEIRA CAT 320", horas: 10, valor: 4000 },
      { equipamento_id: "eq-2", equipamento_nome: "CAÇAMBA", horas: 4, valor: 1200 },
    ]);
  });

  it("respeita o recorte de período em vez de escalar o total", () => {
    // O bug antigo: o filtro multiplicava os totais fixos por uma razão, então
    // "últimos 3 meses" devolvia uma FRAÇÃO de todo equipamento que já
    // trabalhou — inclusive os que não trabalharam no recorte.
    const linhas = porEquipamento(
      [
        fat({ id: "a", faturado_em: "2026-03-10T12:00:00.000Z" }),
        fat({
          id: "b",
          faturado_em: "2026-08-10T12:00:00.000Z",
          itens: [item({ origem_id: "eq-2" })],
        }),
      ],
      EQUIPAMENTOS,
      "2026-08",
      "2026-08",
    );

    expect(linhas.map((l) => l.equipamento_id)).toEqual(["eq-2"]);
  });

  it("equipamento apagado do cadastro não vira nome inventado", () => {
    const linhas = porEquipamento(
      [fat({ itens: [item({ origem_id: "eq-sumiu" })] })],
      EQUIPAMENTOS,
      "2026-01",
      "2026-12",
    );

    expect(linhas[0].equipamento_nome).toBe("Equipamento removido");
  });
});

describe("porCliente", () => {
  it("soma por cliente e ordena por valor", () => {
    const linhas = porCliente(
      [
        fat({ id: "a", cliente_id: "cl-1", valor_total: 4000 }),
        fat({ id: "b", cliente_id: "cl-2", valor_total: 9000 }),
        fat({ id: "c", cliente_id: "cl-1", valor_total: 1000 }),
      ],
      CLIENTES,
      "2026-01",
      "2026-12",
    );

    expect(linhas).toEqual([
      { cliente_id: "cl-2", cliente_nome: "VALE VERDE", valor: 9000 },
      { cliente_id: "cl-1", cliente_nome: "CONSTRUTORA HORIZONTE", valor: 5000 },
    ]);
  });
});

describe("rangeDePreset", () => {
  const meses = serieMensal([
    fat({ id: "a", faturado_em: "2026-01-10T12:00:00.000Z" }),
    fat({ id: "b", faturado_em: "2026-02-10T12:00:00.000Z" }),
    fat({ id: "c", faturado_em: "2026-03-10T12:00:00.000Z" }),
    fat({ id: "d", faturado_em: "2026-04-10T12:00:00.000Z" }),
  ]);

  it("base vazia devolve período vazio, não datas fabricadas", () => {
    expect(rangeDePreset("6m", [])).toEqual({ de: "", ate: "" });
  });

  it("3m pega os três últimos meses COM faturamento", () => {
    expect(rangeDePreset("3m", meses)).toEqual({ de: "2026-02", ate: "2026-04" });
  });

  it("pedir mais meses do que existem não estoura o começo da série", () => {
    expect(rangeDePreset("6m", meses)).toEqual({ de: "2026-01", ate: "2026-04" });
  });

  it("ytd começa em janeiro do ano do último mês", () => {
    expect(rangeDePreset("ytd", meses)).toEqual({ de: "2026-01", ate: "2026-04" });
  });
});

describe("resumoDoPeriodo", () => {
  const meses = serieMensal([
    fat({ id: "a", faturado_em: "2026-01-10T12:00:00.000Z" }),
    fat({ id: "b", faturado_em: "2026-02-10T12:00:00.000Z" }),
  ]);

  it("soma só o recorte", () => {
    const r = resumoDoPeriodo(meses, { de: "2026-02", ate: "2026-02" });
    expect(r.totalValor).toBe(4000);
    expect(r.totalHoras).toBe(10);
    expect(r.ticketMedio).toBe(400);
  });

  it("sem hora faturada o ticket é zero, não NaN", () => {
    const r = resumoDoPeriodo([], { de: "2026-01", ate: "2026-12" });
    expect(r.ticketMedio).toBe(0);
    expect(Number.isNaN(r.ticketMedio)).toBe(false);
  });
});
