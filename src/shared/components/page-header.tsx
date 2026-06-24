import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  className?: string;
}

export function PageHeader({ titulo, descricao, acoes, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {titulo}
        </h1>
        {descricao ? (
          <p className="text-sm text-muted-foreground md:text-base">{descricao}</p>
        ) : null}
      </div>
      {acoes ? <div className="flex items-center gap-2">{acoes}</div> : null}
    </div>
  );
}
