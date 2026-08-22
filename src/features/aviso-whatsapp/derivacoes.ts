import type { AvisoWhatsApp, Cliente, OrdemServico } from "@/shared/types";

export function avisoDaOS(osId: string, avisos: AvisoWhatsApp[]): AvisoWhatsApp | null {
  return avisos.find((a) => a.os_id === osId) ?? null;
}

// Texto REAL enviado ao cliente pela Edge Function `waha-enviar-texto`.
// Nunca cita valor ou preço — barreira financeira do PRD-009.
export function montarMensagemAviso(os: OrdemServico, cliente: Cliente): string {
  return `Olá, ${cliente.nome}! O serviço da obra ${os.obra_nome} (OS ${os.numero}) foi concluído. Qualquer dúvida, estamos à disposição — Antonello Terraplanagem.`;
}

export function telefoneParaChatId(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  return `55${digitos}@c.us`;
}
