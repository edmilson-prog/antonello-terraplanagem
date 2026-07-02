import type { Comprovante } from "@/shared/types";

// 5 comprovantes cobrindo os edge cases do PRD-011: 1 pendente, 2 assinados
// (um deles de OS por_metro), 1 recusado com motivo. os_id/cliente_id
// referenciam OS fechadas reais de ordens-servico.ts; resumo_servico é o
// texto que montarResumoServico() geraria para aquela OS (ver derivacoes.ts).
const ASSINATURA_MOCK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export const comprovantes: Comprovante[] = [
  {
    id: "cmp-001",
    numero: "CMP-2026-0001",
    os_id: "os-010",
    cliente_id: "cl-001",
    resumo_servico:
      "Obra: Nivelamento acesso — galpão\nPeríodo: 15/06/2026 a 15/06/2026\nEquipamentos: Trator de Esteira D6\nTotal de horas: 7h",
    assinante_nome: null,
    assinatura_url: null,
    status: "pendente",
    motivo_recusa: null,
    gerado_em: "2026-06-16T08:00:00.000Z",
    assinado_em: null,
    created_at: "2026-06-16T08:00:00.000Z",
    updated_at: "2026-06-16T08:00:00.000Z",
  },
  {
    id: "cmp-002",
    numero: "CMP-2026-0002",
    os_id: "os-009",
    cliente_id: "cl-004",
    resumo_servico:
      "Obra: Estaqueamento bloco C\nPeríodo: 16/06/2026 a 16/06/2026\nEquipamentos: —\nMetragem executada: 30 m (broca 300 mm)",
    assinante_nome: "João da Silva",
    assinatura_url: ASSINATURA_MOCK,
    status: "assinado",
    motivo_recusa: null,
    gerado_em: "2026-06-17T08:00:00.000Z",
    assinado_em: "2026-06-17T10:00:00.000Z",
    created_at: "2026-06-17T08:00:00.000Z",
    updated_at: "2026-06-17T10:00:00.000Z",
  },
  {
    id: "cmp-003",
    numero: "CMP-2026-0003",
    os_id: "os-008",
    cliente_id: "cl-002",
    resumo_servico:
      "Obra: Remoção de entulho — obra paralisada\nPeríodo: 17/06/2026 a 17/06/2026\nEquipamentos: Caminhão Caçamba Basculante\nTotal de horas: 8h",
    assinante_nome: null,
    assinatura_url: null,
    status: "recusado",
    motivo_recusa:
      "Cliente contesta o uso do caminhão-caçamba sem tarifa cadastrada; horas serão revisadas antes de nova emissão.",
    gerado_em: "2026-06-18T08:00:00.000Z",
    assinado_em: null,
    created_at: "2026-06-18T08:00:00.000Z",
    updated_at: "2026-06-18T11:30:00.000Z",
  },
  {
    id: "cmp-004",
    numero: "CMP-2026-0004",
    os_id: "os-007",
    cliente_id: "cl-001",
    resumo_servico:
      "Obra: Terraplenagem pátio industrial — fase 2\nPeríodo: 18/06/2026 a 19/06/2026\nEquipamentos: Escavadeira Hidráulica Caterpillar 320D, Escavadeira 10t\nTotal de horas: 22h",
    assinante_nome: null,
    assinatura_url: null,
    status: "pendente",
    motivo_recusa: null,
    gerado_em: "2026-06-20T08:00:00.000Z",
    assinado_em: null,
    created_at: "2026-06-20T08:00:00.000Z",
    updated_at: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "cmp-005",
    numero: "CMP-2026-0005",
    os_id: "os-003",
    cliente_id: "cl-003",
    resumo_servico:
      "Obra: Pavimentação Rua das Acácias\nPeríodo: 23/06/2026 a 23/06/2026\nEquipamentos: Escavadeira 10t\nTotal de horas: 18h",
    assinante_nome: "Antônio Ferreira (Secretaria de Obras)",
    assinatura_url: ASSINATURA_MOCK,
    status: "assinado",
    motivo_recusa: null,
    gerado_em: "2026-06-24T08:00:00.000Z",
    assinado_em: "2026-06-24T09:15:00.000Z",
    created_at: "2026-06-24T08:00:00.000Z",
    updated_at: "2026-06-24T09:15:00.000Z",
  },
];
