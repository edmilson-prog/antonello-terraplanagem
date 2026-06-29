import type { PrecoFundacao } from "@/shared/types";

// 3 diâmetros com valores distintos. Edge: 1 inativo (pf-003), 1 sem descrição.
export const precosFundacao: PrecoFundacao[] = [
  {
    id: "pf-001",
    diametro_broca_mm: 300,
    valor_metro: 90,
    descricao: "Estaca escavada Ø300mm",
    ativo: true,
    created_at: "2025-03-01T12:00:00.000Z",
    updated_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "pf-002",
    diametro_broca_mm: 400,
    valor_metro: 130,
    descricao: "Estaca escavada Ø400mm",
    ativo: true,
    created_at: "2025-03-01T12:00:00.000Z",
    updated_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "pf-003",
    diametro_broca_mm: 500,
    valor_metro: 175,
    descricao: null,
    ativo: false,
    created_at: "2024-09-10T12:00:00.000Z",
    updated_at: "2025-11-05T12:00:00.000Z",
  },
];
