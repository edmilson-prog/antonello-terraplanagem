import type { RegistroManutencao } from "@/shared/types";

// 5 registros derivados do horímetro dos equipamentos (src/mocks/equipamentos.ts).
// Edge cases: eq-001 "vencida" (rm-001), histórico com custo (rm-002), eq-002
// "próxima" (rm-003), histórico sem custo (rm-004), eq-006 "em dia" (rm-005).
export const registrosManutencao: RegistroManutencao[] = [
  {
    id: "rm-001",
    equipamento_id: "eq-001",
    plano_id: "pm-001",
    horimetro_previsto: 8400, // atual 8432 → vencida (32h além da marca)
    horimetro_realizado: null,
    status: "prevista",
    custo: null,
    observacao: null,
    realizada_em: null,
    created_at: "2026-06-20T14:00:00.000Z",
    updated_at: "2026-06-20T14:00:00.000Z",
  },
  {
    id: "rm-002",
    equipamento_id: "eq-001",
    plano_id: "pm-001",
    horimetro_previsto: 8150,
    horimetro_realizado: 8158,
    status: "realizada", // ciclo anterior do mesmo plano — recém-realizada, com custo
    custo: 420,
    observacao: "Óleo e filtro trocados, sem intercorrências.",
    realizada_em: "2026-06-20T14:00:00.000Z",
    created_at: "2026-04-05T08:00:00.000Z",
    updated_at: "2026-06-20T14:00:00.000Z",
  },
  {
    id: "rm-003",
    equipamento_id: "eq-002",
    plano_id: "pm-002",
    horimetro_previsto: 5135, // atual 5120 → faltam 15h ≤ antecedência (20h) → próxima
    horimetro_realizado: null,
    status: "prevista",
    custo: null,
    observacao: null,
    realizada_em: null,
    created_at: "2026-01-15T09:00:00.000Z",
    updated_at: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "rm-004",
    equipamento_id: "eq-002",
    plano_id: "pm-002",
    horimetro_previsto: 4635,
    horimetro_realizado: 4630,
    status: "realizada", // ciclo anterior — sem custo registrado
    custo: null,
    observacao: null,
    realizada_em: "2026-01-15T09:00:00.000Z",
    created_at: "2025-08-10T08:00:00.000Z",
    updated_at: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "rm-005",
    equipamento_id: "eq-006",
    plano_id: "pm-003",
    horimetro_previsto: 4500, // atual 4205 → faltam 295h → em dia
    horimetro_realizado: null,
    status: "prevista",
    custo: null,
    observacao: null,
    realizada_em: null,
    created_at: "2026-03-01T08:00:00.000Z",
    updated_at: "2026-03-01T08:00:00.000Z",
  },
];
