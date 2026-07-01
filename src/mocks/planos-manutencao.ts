import type { PlanoManutencao } from "@/shared/types";

// 4 planos: 3 por equipamento específico + 1 por tipo. Edge cases: 1 inativo
// (pm-004), intervalos distintos (250/500/1000/300h).
export const planosManutencao: PlanoManutencao[] = [
  {
    id: "pm-001",
    equipamento_id: "eq-001",
    tipo_equipamento: null,
    descricao: "Troca de óleo e filtros do motor",
    intervalo_horas: 250,
    ativo: true,
    created_at: "2026-01-10T08:00:00.000Z",
    updated_at: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "pm-002",
    equipamento_id: "eq-002",
    tipo_equipamento: null,
    descricao: "Revisão geral do sistema hidráulico",
    intervalo_horas: 500,
    ativo: true,
    created_at: "2025-11-05T08:00:00.000Z",
    updated_at: "2025-11-05T08:00:00.000Z",
  },
  {
    id: "pm-003",
    equipamento_id: null,
    tipo_equipamento: "trator_esteira",
    descricao: "Revisão de esteiras e rolamentos",
    intervalo_horas: 1000,
    ativo: true,
    created_at: "2026-03-01T08:00:00.000Z",
    updated_at: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "pm-004",
    equipamento_id: "eq-004",
    tipo_equipamento: null,
    descricao: "Troca de óleo hidráulico", // edge case: plano inativo
    intervalo_horas: 300,
    ativo: false,
    created_at: "2025-09-15T08:00:00.000Z",
    updated_at: "2026-02-20T08:00:00.000Z",
  },
];
