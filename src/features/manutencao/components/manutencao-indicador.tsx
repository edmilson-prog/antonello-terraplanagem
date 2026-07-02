import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import type { StatusManutencao } from "@/shared/types";

const CLASSE: Record<"proxima" | "vencida", string> = {
  proxima: "bg-primary/20 text-foreground border-primary/50",
  vencida: "bg-destructive/15 text-destructive border-destructive/40",
};

const LABEL: Record<"proxima" | "vencida", string> = {
  proxima: "Revisão próxima",
  vencida: "Revisão vencida",
};

// Indicador OPERACIONAL: recebe só `status`, nunca custo/valor (RF-010). Não
// renderiza nada para "em_dia"/null — o operador só é alertado quando há algo
// a fazer.
export function ManutencaoIndicador({ status }: { status: StatusManutencao | null }) {
  if (status !== "proxima" && status !== "vencida") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        CLASSE[status],
      )}
    >
      <Icon icon="lucide:wrench" className="h-3 w-3" />
      {LABEL[status]}
    </span>
  );
}
