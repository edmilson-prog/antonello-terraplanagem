import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import { escalar0a100 } from "@/shared/lib/sparkline-escala";
import { cn } from "@/lib/utils";

// Indicador-herói do UI kit: rótulo, valor em mono, selo de variação, rodapé e
// sparkline no canto. Nasceu local no dashboard (Onda 11) e virou compartilhado
// quando o Custo da Hora (Onda 14) precisou do mesmo tile — em vez de uma
// quarta cópia (Faturamento e Financeiro ainda têm as suas).
//
// `para` é opcional: sem ele o tile é um bloco estático, com ele vira link.

export interface KpiHeroiProps {
  rotulo: string;
  valor: string;
  icone: string;
  rodape?: ReactNode;
  /** Variação percentual vs. período anterior; null esconde o selo. */
  variacao?: number | null;
  /** Série absoluta — é escalada internamente para o contrato do Sparkline. */
  spark?: number[];
  alerta?: boolean;
  para?: string;
  className?: string;
}

export function KpiHeroi({
  rotulo,
  valor,
  icone,
  rodape,
  variacao,
  spark,
  alerta,
  para,
  className,
}: KpiHeroiProps) {
  const conteudo = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </span>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            alerta ? "bg-destructive/15 text-destructive" : "bg-surface text-primary",
          )}
        >
          <Icon icon={icone} className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-2xl font-bold",
            alerta ? "text-destructive" : "text-foreground",
          )}
        >
          {valor}
        </span>
        <TrendBadge variacao={variacao ?? null} />
      </div>
      {rodape ? <div className="mt-1.5 text-xs text-muted-foreground">{rodape}</div> : null}
      {spark && spark.length > 1 ? (
        <Sparkline
          pontos={escalar0a100(spark)}
          className="absolute bottom-3.5 right-3.5 h-6 w-16"
        />
      ) : null}
    </>
  );

  const classes = cn(
    "relative block overflow-hidden rounded-xl border bg-card p-4 shadow-sm",
    para && "transition-colors hover:border-primary/40",
    className,
  );

  if (!para) return <div className={classes}>{conteudo}</div>;

  return (
    <Link to={para} className={classes}>
      {conteudo}
    </Link>
  );
}

// Variação vs. período anterior no formato do UI kit (seta + inteiro).
function TrendBadge({ variacao }: { variacao: number | null }) {
  if (variacao === null) return null;
  const positiva = variacao >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
        positiva ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
      )}
    >
      <Icon
        icon={positiva ? "lucide:arrow-up-right" : "lucide:arrow-down-right"}
        className="h-3 w-3"
      />
      {Math.abs(Math.round(variacao))}%
    </span>
  );
}
