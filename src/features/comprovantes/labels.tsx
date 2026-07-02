/* eslint-disable react-refresh/only-export-components */
import type { StatusComprovante } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_COMPROVANTE_LABEL: Record<StatusComprovante, string> = {
  pendente: "Pendente",
  assinado: "Assinado",
  recusado: "Recusado",
};

export const STATUS_COMPROVANTE: StatusComprovante[] = ["pendente", "assinado", "recusado"];

// Sem token verde no design system: assinado usa `secondary` (terra). recusado = destructive.
const STATUS_CLASSE: Record<StatusComprovante, string> = {
  pendente: "bg-primary/20 text-foreground border-primary/50",
  assinado: "bg-secondary/25 text-foreground border-secondary/50",
  recusado: "bg-destructive/15 text-foreground border-destructive/40",
};

export function StatusComprovanteBadge({
  status,
  className,
}: {
  status: StatusComprovante;
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
      {STATUS_COMPROVANTE_LABEL[status]}
    </span>
  );
}
