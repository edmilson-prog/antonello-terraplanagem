import type { ContaReceber } from "@/shared/types";

// Derivadas dos faturamentos confirmados (PRD-004).
// fat-001 (cl-003, 5220, faturado 2026-06-24) e fat-004 (cl-004, 2700, faturado 2026-06-17)
// são os únicos com status "faturado". fat-005/006/007 = referências futuras.
export const contasReceber: ContaReceber[] = [
  {
    id: "cr-001",
    faturamento_id: "fat-001",
    cliente_id: "cl-003",
    valor: 5220,
    vencimento: "2026-07-24", // faturado_em 2026-06-24 + 30 dias
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-24T09:00:00.000Z",
    updated_at: "2026-06-24T09:00:00.000Z",
  },
  {
    id: "cr-002",
    faturamento_id: "fat-004",
    cliente_id: "cl-004",
    valor: 2700,
    vencimento: "2026-07-17", // faturado_em 2026-06-17 + 30 dias
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-17T08:30:00.000Z",
    updated_at: "2026-06-17T08:30:00.000Z",
  },
  {
    id: "cr-003",
    faturamento_id: "fat-005",
    cliente_id: "cl-001",
    valor: 12000,
    vencimento: "2026-06-10", // edge case: vencida em aberto
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-05-11T10:00:00.000Z",
    updated_at: "2026-05-11T10:00:00.000Z",
  },
  {
    id: "cr-004",
    faturamento_id: "fat-006",
    cliente_id: "cl-002",
    valor: 3500,
    vencimento: "2026-06-20",
    status: "liquidada", // edge case: recebida via PIX
    recebido_em: "2026-06-25",
    forma_recebimento: "pix",
    created_at: "2026-05-21T10:00:00.000Z",
    updated_at: "2026-06-25T14:00:00.000Z",
  },
  {
    id: "cr-005",
    faturamento_id: "fat-007",
    cliente_id: "cl-003",
    valor: 7800,
    vencimento: "2026-08-05", // a vencer (prazo maior)
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-06T10:00:00.000Z",
    updated_at: "2026-06-06T10:00:00.000Z",
  },
];
