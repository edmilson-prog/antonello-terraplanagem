import type { AvisoWhatsApp } from "@/shared/types";

// Avisos disparados ao fechar OS (ver src/mocks/ordens-servico.ts):
// - os-007 (cl-001, "Construtora Horizonte Ltda.", telefone válido) → enviado
// - os-011 (cl-003, "Prefeitura...", telefone null) → falha_telefone_invalido
// Nenhum dado novo de OS/cliente foi necessário: os dois casos já existiam no seed.
export const avisosWhatsApp: AvisoWhatsApp[] = [
  {
    id: "aviso-001",
    os_id: "os-007",
    cliente_id: "cl-001",
    provedor: "evolution_api",
    status: "enviado",
    mensagem_preview:
      "Olá, Construtora Horizonte Ltda.! O serviço da obra Terraplenagem pátio industrial — fase 2 (OS OS-2026-0045) foi concluído. Qualquer dúvida, estamos à disposição — Antonello Terraplanagem.",
    enviado_em: "2026-06-19T17:05:00.000Z",
    created_at: "2026-06-19T17:05:00.000Z",
  },
  {
    id: "aviso-002",
    os_id: "os-011",
    cliente_id: "cl-003",
    provedor: "meta_cloud_api",
    status: "falha_telefone_invalido",
    mensagem_preview: "",
    enviado_em: "2026-06-29T12:35:00.000Z",
    created_at: "2026-06-29T12:35:00.000Z",
  },
];
