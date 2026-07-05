import type { CobrancaGateway } from "@/shared/types";

// Cobranças emitidas via gateway para contas ainda em aberto (cr-001, cr-005 —
// ver src/mocks/contas-receber.ts). Nenhuma cobrança aqui está "paga": o
// fluxo de confirmação é sempre simulado em runtime via
// cobrancasStore.simularWebhookPago, nunca hardcoded no seed (evita
// contradizer o status "aberta" das contas correspondentes).
export const cobrancasGateway: CobrancaGateway[] = [
  {
    id: "cob-001",
    conta_receber_id: "cr-001",
    provedor: "mercado_pago",
    status: "pendente",
    linha_digitavel: "34191.79001 01043.510047 91020.150008 1 96380000522000",
    pix_copia_cola:
      "00020126580014br.gov.bcb.pix0136cob-00152040000530398654045220.005802BR5913ANTONELLO TERR6009SAO PAULO62070503***6304A1B2",
    valor: 5220,
    emitida_em: "2026-06-28T10:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-28T10:00:00.000Z",
    updated_at: "2026-06-28T10:00:00.000Z",
  },
  {
    id: "cob-002",
    conta_receber_id: "cr-005",
    provedor: "asaas",
    status: "pendente",
    linha_digitavel: null, // gerado só via PIX neste provedor/emissão
    pix_copia_cola:
      "00020126580014br.gov.bcb.pix0136cob-00252040000530398654047800.005802BR5913ANTONELLO TERR6009SAO PAULO62070503***6304C3D4",
    valor: 7800,
    emitida_em: "2026-06-30T09:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-30T09:00:00.000Z",
    updated_at: "2026-06-30T09:00:00.000Z",
  },
];
