/* eslint-disable react-refresh/only-export-components */
import type { ProvedorWhatsApp, StatusAvisoWhatsApp } from "@/shared/types";
import { cn } from "@/lib/utils";

export const PROVEDOR_WHATSAPP_LABEL: Record<ProvedorWhatsApp, string> = {
  evolution_api: "Evolution API",
  evolution_go: "Evolution GO",
  meta_cloud_api: "WhatsApp Cloud API (Meta)",
  openwa: "OpenWA",
  waha: "WAHA",
};

export const STATUS_AVISO_LABEL: Record<StatusAvisoWhatsApp, string> = {
  enviado: "Enviado",
  falha_telefone_invalido: "Falha — telefone inválido",
  falha_sessao_desconectada: "Falha — sessão do WhatsApp desconectada",
  falha_envio: "Falha ao enviar",
};

const STATUS_AVISO_CLASS: Record<StatusAvisoWhatsApp, string> = {
  enviado: "bg-secondary/25 text-foreground border-secondary/50",
  falha_telefone_invalido: "bg-destructive/10 text-destructive border-destructive/30",
  falha_sessao_desconectada: "bg-destructive/10 text-destructive border-destructive/30",
  falha_envio: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusAvisoBadge({
  status,
  className,
}: {
  status: StatusAvisoWhatsApp;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_AVISO_CLASS[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_AVISO_LABEL[status]}
    </span>
  );
}
