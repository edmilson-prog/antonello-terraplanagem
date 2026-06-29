/* eslint-disable react-refresh/only-export-components */
import type { StatusFaturamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_FATURAMENTO_LABEL: Record<StatusFaturamento, string> = {
  rascunho: "Rascunho",
  faturado: "Faturado",
};

export const STATUS_FATURAMENTO: StatusFaturamento[] = ["rascunho", "faturado"];

const STATUS_CLASSE: Record<StatusFaturamento, string> = {
  rascunho: "bg-steel/20 text-foreground border-steel/40",
  faturado: "bg-primary/20 text-foreground border-primary/50",
};

export function StatusFaturamentoBadge({
  status,
  className,
}: {
  status: StatusFaturamento;
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
      {STATUS_FATURAMENTO_LABEL[status]}
    </span>
  );
}
