import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  titulo?: string;
  descricao?: string;
  /** Ícone Iconify (ex.: "lucide:truck"). Tem prioridade sobre `icone`. */
  icon?: string;
  /** Compatibilidade: componente de ícone lucide. */
  icone?: LucideIcon;
  /** CTA opcional renderizado abaixo do texto. */
  acao?: ReactNode;
  className?: string;
}

export function EmptyState({
  titulo = "Em construção",
  descricao = "Esta área ainda está sendo preparada. Em breve você verá tudo funcionando por aqui.",
  icon,
  icone: Icone = Construction,
  acao,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon ? (
          <Icon icon={icon} className="h-8 w-8" />
        ) : (
          <Icone className="h-8 w-8" strokeWidth={2.25} />
        )}
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-foreground">{titulo}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>
      </div>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  );
}
