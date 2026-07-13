import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { EstadoIA, InsightGerencial } from "@/features/ia/types";

interface CardInsightProps {
  gerar: () => Promise<InsightGerencial>;
  vazio?: boolean;
}

export function CardInsight({ gerar, vazio = false }: CardInsightProps) {
  const [estado, setEstado] = useState<EstadoIA>("ocioso");
  const [insight, setInsight] = useState<InsightGerencial | null>(null);

  const carregar = async () => {
    setEstado("processando");
    try {
      const resultado = await gerar();
      setInsight(resultado);
      setEstado("resultado");
    } catch {
      setEstado("erro");
    }
  };

  useEffect(() => {
    if (!vazio) void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vazio]);

  if (vazio) return null;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
          <Icon icon="lucide:sparkles" className="h-3.5 w-3.5 text-primary" />
          Insight IA
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={carregar}
          disabled={estado === "processando"}
          className="h-7 gap-1 text-xs"
        >
          <Icon
            icon="lucide:refresh-cw"
            className={cn("h-3 w-3", estado === "processando" && "animate-spin")}
          />
          Regenerar
        </Button>
      </div>
      {estado === "processando" ? <Skeleton className="mt-3 h-10 w-full" /> : null}
      {estado === "erro" ? (
        <p className="mt-3 text-sm text-muted-foreground">
          IA indisponível — os números acima seguem confiáveis, só o resumo em texto não pôde ser
          gerado.
        </p>
      ) : null}
      {estado === "resultado" && insight ? (
        <p className="mt-3 text-sm text-foreground">{insight.texto}</p>
      ) : null}
    </div>
  );
}
