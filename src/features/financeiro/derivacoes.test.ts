import { describe, it, expect } from "vitest";
import { contaVencida, resumoCaixa, agregadoMensalPorData, recebimentosPorForma, comprovantesRecentes } from "./derivacoes";
import type { ContaReceber, ContaPagar } from "@/shared/types";

describe("contaVencida", () => {
  it("aberta com vencimento passado → vencida", () => {
    expect(contaVencida({ status: "aberta", vencimento: "2026-06-01" }, "2026-06-30")).toBe(true);
  });

  it("aberta com vencimento futuro → não vencida", () => {
    expect(contaVencida({ status: "aberta", vencimento: "2026-07-10" }, "2026-06-30")).toBe(false);
  });

  it("liquidada com vencimento passado → não vencida (já recebida)", () => {
    expect(contaVencida({ status: "liquidada", vencimento: "2026-06-01" }, "2026-06-30")).toBe(
      false,
    );
  });

  it("vencimento exatamente hoje → não vencida (estritamente <)", () => {
    expect(contaVencida({ status: "aberta", vencimento: "2026-06-30" }, "2026-06-30")).toBe(false);
  });
});

describe("resumoCaixa", () => {
  const receber: ContaReceber[] = [
    {
      id: "r1",
      faturamento_id: "f1",
      cliente_id: "c1",
      valor: 5000,
      vencimento: "2026-07-01",
      status: "aberta",
      recebido_em: null,
      forma_recebimento: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "r2",
      faturamento_id: "f2",
      cliente_id: "c2",
      valor: 3000,
      vencimento: "2026-07-01",
      status: "liquidada",
      recebido_em: "2026-06-25",
      forma_recebimento: "pix",
      created_at: "",
      updated_at: "",
    },
  ];
  const pagar: ContaPagar[] = [
    {
      id: "p1",
      descricao: "Diesel",
      fornecedor: null,
      categoria: "diesel",
      valor: 2000,
      vencimento: "2026-07-01",
      status: "aberta",
      pago_em: null,
      documento: null,
      forma_pagamento: null,
      observacao: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "p2",
      descricao: "Pago",
      fornecedor: null,
      categoria: "outro",
      valor: 1000,
      vencimento: "2026-06-15",
      status: "liquidada",
      pago_em: "2026-06-14",
      documento: null,
      forma_pagamento: null,
      observacao: null,
      created_at: "",
      updated_at: "",
    },
  ];

  it("totalReceber conta só abertas (5000)", () => {
    expect(resumoCaixa(receber, pagar).totalReceber).toBe(5000);
  });

  it("totalPagar conta só abertas (2000)", () => {
    expect(resumoCaixa(receber, pagar).totalPagar).toBe(2000);
  });

  it("saldoPrevisto = totalReceber - totalPagar (3000)", () => {
    expect(resumoCaixa(receber, pagar).saldoPrevisto).toBe(3000);
  });
});

const CR_LIQUIDADA: ContaReceber = {
  id: "cr-004",
  faturamento_id: "fat-006",
  cliente_id: "cl-002",
  valor: 3500,
  vencimento: "2026-06-20",
  status: "liquidada",
  recebido_em: "2026-06-25",
  forma_recebimento: "pix",
  created_at: "2026-05-21T10:00:00.000Z",
  updated_at: "2026-06-25T14:00:00.000Z",
};

const CR_ABERTA: ContaReceber = {
  id: "cr-001",
  faturamento_id: "fat-001",
  cliente_id: "cl-003",
  valor: 5220,
  vencimento: "2026-07-24",
  status: "aberta",
  recebido_em: null,
  forma_recebimento: null,
  created_at: "2026-06-24T09:00:00.000Z",
  updated_at: "2026-06-24T09:00:00.000Z",
};

describe("agregadoMensalPorData", () => {
  it("agrega valores por mês de uma data arbitrária do item, últimos N meses", () => {
    const resultado = agregadoMensalPorData(
      [CR_LIQUIDADA],
      (c: ContaReceber) => c.recebido_em,
      (c: ContaReceber) => c.valor,
      "2026-06-30",
      3,
    );
    expect(resultado).toHaveLength(3);
    expect(resultado[2].mes).toBe("2026-06");
    expect(resultado[2].valor).toBe(3500);
    expect(resultado[0].valor).toBe(0);
  });

  it("ignora itens com data nula", () => {
    const resultado = agregadoMensalPorData(
      [CR_ABERTA],
      (c: ContaReceber) => c.recebido_em,
      (c: ContaReceber) => c.valor,
      "2026-06-30",
      1,
    );
    expect(resultado[0].valor).toBe(0);
  });
});

describe("recebimentosPorForma", () => {
  it("agrupa contas liquidadas por forma de recebimento", () => {
    const resultado = recebimentosPorForma([CR_LIQUIDADA, CR_ABERTA]);
    expect(resultado).toEqual([{ forma: "pix", valor: 3500, quantidade: 1 }]);
  });

  it("retorna lista vazia quando não há contas liquidadas", () => {
    expect(recebimentosPorForma([CR_ABERTA])).toEqual([]);
  });
});

describe("comprovantesRecentes", () => {
  it("retorna só contas liquidadas, mais recentes primeiro", () => {
    const resultado = comprovantesRecentes([CR_ABERTA, CR_LIQUIDADA], 5);
    expect(resultado).toEqual([CR_LIQUIDADA]);
  });

  it("respeita o limite informado", () => {
    const outraLiquidada: ContaReceber = { ...CR_LIQUIDADA, id: "cr-009", recebido_em: "2026-06-26" };
    const resultado = comprovantesRecentes([CR_LIQUIDADA, outraLiquidada], 1);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("cr-009");
  });
});
