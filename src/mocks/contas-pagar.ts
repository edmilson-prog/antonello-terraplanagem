import type { ContaPagar } from "@/shared/types";

export const contasPagar: ContaPagar[] = [
  {
    id: "cp-001",
    descricao: "Abastecimento Junho",
    fornecedor: "Posto Ipiranga",
    categoria: "diesel",
    valor: 1800,
    vencimento: "2026-07-05",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-25T10:00:00.000Z",
    updated_at: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "cp-002",
    descricao: "Revisão escavadeira 10t",
    fornecedor: "Mecânica Silva",
    categoria: "manutencao",
    valor: 3200,
    vencimento: "2026-06-15", // edge case: vencida em aberto
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "cp-003",
    descricao: "Folha de pagamento Junho",
    fornecedor: null, // edge case: sem fornecedor
    categoria: "folha",
    valor: 8500,
    vencimento: "2026-07-05",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-25T10:00:00.000Z",
    updated_at: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "cp-004",
    descricao: "Borrachas e câmaras",
    fornecedor: "Borracharia Rápida",
    categoria: "fornecedor",
    valor: 450,
    vencimento: "2026-06-28",
    status: "liquidada", // edge case: já paga
    pago_em: "2026-06-27",
    created_at: "2026-06-20T09:00:00.000Z",
    updated_at: "2026-06-27T15:00:00.000Z",
  },
  {
    id: "cp-005",
    descricao: "Material de escritório",
    fornecedor: null, // edge case: sem fornecedor
    categoria: "outro",
    valor: 280,
    vencimento: "2026-07-15",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-28T10:00:00.000Z",
    updated_at: "2026-06-28T10:00:00.000Z",
  },
];
