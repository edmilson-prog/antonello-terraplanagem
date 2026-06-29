import type { PrecoMobilizacao } from "@/shared/types";

// 2 itens. Edge: pm-002 com descrição longa.
export const precosMobilizacao: PrecoMobilizacao[] = [
  {
    id: "pm-001",
    descricao: "Mobilização e desmobilização de escavadeira até 50 km do pátio",
    valor: 850,
    ativo: true,
    created_at: "2025-04-01T12:00:00.000Z",
    updated_at: "2026-02-15T12:00:00.000Z",
  },
  {
    id: "pm-002",
    descricao:
      "Transporte em prancha na região metropolitana, ida e volta no mesmo dia, equipamento de médio porte, com escolta quando exigida pela legislação municipal de trânsito",
    valor: 1200,
    ativo: true,
    created_at: "2025-04-01T12:00:00.000Z",
    updated_at: "2026-02-15T12:00:00.000Z",
  },
];
