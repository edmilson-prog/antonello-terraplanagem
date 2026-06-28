import type { StatusApontamento } from "@/shared/types";
import { cn } from "@/lib/utils";
import { STATUS_APONTAMENTO_LABEL } from "@/features/apontamento/labels";

const classePorStatus: Record<StatusApontamento, string> = {
  em_andamento: "bg-primary/20 text-foreground border-primary/50",
  finalizado: "bg-secondary-soft/25 text-foreground border-secondary/40",
};

interface Props {
  status: StatusApontamento;
  className?: string;
}

export function StatusApontamentoBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        classePorStatus[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_APONTAMENTO_LABEL[status]}
    </span>
  );
}
