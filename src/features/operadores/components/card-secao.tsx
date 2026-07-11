import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface CardSecaoProps {
  titulo: string;
  icone: string;
  acessorio?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

// Casca padrão dos cards de atividade do detalhe do operador (header com ícone
// + título + acessório à direita). Mantém o ritmo visual consistente entre cards.
export function CardSecao({
  titulo,
  icone,
  acessorio,
  children,
  className,
  bodyClassName,
}: CardSecaoProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-primary">
          <Icon icon={icone} className="h-4 w-4" />
        </span>
        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider text-foreground">
          {titulo}
        </h3>
        {acessorio ? <div className="ml-auto">{acessorio}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function CardPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}
