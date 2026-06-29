/* eslint-disable react-refresh/only-export-components */
import type { ModeloCobranca, StatusOS } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_OS_LABEL: Record<StatusOS, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  fechada: "Fechada",
};

export const STATUS_OS: StatusOS[] = ["aberta", "em_andamento", "fechada"];

export const MODELO_LABEL: Record<ModeloCobranca, string> = {
  hora_maquina: "Hora-máquina",
  por_metro: "Por metro",
};

const STATUS_CLASSE: Record<StatusOS, string> = {
  aberta: "bg-steel/20 text-foreground border-steel/40",
  em_andamento: "bg-primary/20 text-foreground border-primary/50",
  fechada: "bg-secondary-soft/25 text-foreground border-secondary/40",
};

export function StatusOSBadge({ status, className }: { status: StatusOS; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_OS_LABEL[status]}
    </span>
  );
}
