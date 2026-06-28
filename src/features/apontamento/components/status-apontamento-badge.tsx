import type { StatusApontamento } from "@/shared/types";
import { cn } from "@/lib/utils";

const config: Record<StatusApontamento, { label: string; classe: string }> = {
  em_andamento: {
    label: "Em andamento",
    classe: "bg-primary/20 text-foreground border-primary/50",
  },
  finalizado: {
    label: "Finalizado",
    classe: "bg-secondary-soft/25 text-foreground border-secondary/40",
  },
};

interface Props {
  status: StatusApontamento;
  className?: string;
}

export function StatusApontamentoBadge({ status, className }: Props) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.classe,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}
