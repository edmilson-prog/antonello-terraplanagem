import { cn } from "@/lib/utils";

interface VariacaoBadgeProps {
  variacao: number | null;
}

// Badge de variação % vs mês anterior — dado real (variacaoPercentual, PRD-016),
// distinto da série decorativa dos gráficos.
export function VariacaoBadge({ variacao }: VariacaoBadgeProps) {
  if (variacao === null) return null;
  const positiva = variacao >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
        positiva ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
      )}
    >
      {positiva ? "+" : ""}
      {variacao.toFixed(2)}%
    </span>
  );
}
