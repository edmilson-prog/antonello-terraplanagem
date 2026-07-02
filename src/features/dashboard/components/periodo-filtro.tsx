import { cn } from "@/lib/utils";
import type { PeriodoDashboard } from "@/features/dashboard/periodo";

const OPCOES: { id: PeriodoDashboard; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
];

export function PeriodoFiltro({
  periodo,
  onChange,
}: {
  periodo: PeriodoDashboard;
  onChange: (periodo: PeriodoDashboard) => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-surface/50 p-1">
      {OPCOES.map((op) => (
        <button
          key={op.id}
          type="button"
          onClick={() => onChange(op.id)}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            periodo === op.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
