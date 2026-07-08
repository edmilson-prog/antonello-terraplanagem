import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface BadgeAnomaliaProps {
  motivo: string;
  severidade: "atencao" | "alerta";
}

export function BadgeAnomalia({ motivo, severidade }: BadgeAnomaliaProps) {
  return (
    <span
      title={motivo}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        severidade === "alerta"
          ? "bg-destructive/10 text-destructive"
          : "bg-secondary/10 text-secondary",
      )}
    >
      <Icon icon="lucide:sparkles" className="h-3 w-3" />
      <Icon icon="lucide:alert-triangle" className="h-3 w-3" />
      Anomalia
    </span>
  );
}
