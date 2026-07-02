import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  rotulo: string;
  valor: string;
  icone?: string;
  descricao?: string;
  variante?: "neutro" | "alerta";
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

// Card de indicador do dashboard. Cada widget trata seu próprio loading/erro
// (RNF-001): falha em um card nunca derruba os demais.
export function KpiCard({
  rotulo,
  valor,
  icone = "lucide:activity",
  descricao,
  variante = "neutro",
  isLoading,
  error,
  onRetry,
  className,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-7 w-14" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">{rotulo}</span>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Icon icon="lucide:rotate-cw" className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("h-full rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">{rotulo}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            variante === "alerta" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
          )}
        >
          <Icon icon={icone} className="h-4 w-4" />
        </span>
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-2xl font-bold",
          variante === "alerta" ? "text-destructive" : "text-card-foreground",
        )}
      >
        {valor}
      </div>
      {descricao ? <div className="mt-1 text-xs text-muted-foreground">{descricao}</div> : null}
    </div>
  );
}
