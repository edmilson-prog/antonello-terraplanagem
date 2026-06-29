/* eslint-disable react-refresh/only-export-components */
import type { StatusOrcamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export const STATUS_ORCAMENTO: StatusOrcamento[] = ["rascunho", "enviado", "aprovado", "recusado"];

// Sem token verde no design system: aprovado usa `secondary` (terra). recusado = destructive.
const STATUS_CLASSE: Record<StatusOrcamento, string> = {
  rascunho: "bg-steel/20 text-foreground border-steel/40",
  enviado: "bg-primary/20 text-foreground border-primary/50",
  aprovado: "bg-secondary/25 text-foreground border-secondary/50",
  recusado: "bg-destructive/15 text-foreground border-destructive/40",
};

export function StatusOrcamentoBadge({
  status,
  className,
}: {
  status: StatusOrcamento;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_ORCAMENTO_LABEL[status]}
    </span>
  );
}
