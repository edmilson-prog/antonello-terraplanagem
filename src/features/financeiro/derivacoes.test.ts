import { describe, it, expect } from "vitest";
import { contaVencida, resumoCaixa } from "./derivacoes";
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
