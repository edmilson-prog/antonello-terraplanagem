/* eslint-disable react-refresh/only-export-components */
import type { ProvedorGateway, StatusCobranca } from "@/shared/types";
import { cn } from "@/lib/utils";

export const PROVEDOR_GATEWAY_LABEL: Record<ProvedorGateway, string> = {
  mercado_pago: "Mercado Pago",
  asaas: "Asaas",
};

export const STATUS_COBRANCA_LABEL: Record<StatusCobranca, string> = {
  pendente: "Pendente",
  paga: "Paga",
  cancelada: "Cancelada",
};

const STATUS_COBRANCA_CLASS: Record<StatusCobranca, string> = {
  pendente: "bg-steel/20 text-foreground border-steel/40",
  paga: "bg-secondary/25 text-foreground border-secondary/50",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusCobrancaBadge({
  status,
  className,
}: {
  status: StatusCobranca;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_COBRANCA_CLASS[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_COBRANCA_LABEL[status]}
    </span>
  );
}
