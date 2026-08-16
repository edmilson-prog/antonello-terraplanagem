import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface DataRowProps {
  icone: string;
  rotulo: string;
  children: ReactNode;
  className?: string;
}

// Linha "ícone + rótulo + valor" dos cards de leitura da retaguarda —
// o `DataRow` do UI kit. Feature-specific até aqui (cada detalhe tinha a sua
// cópia local); vive em shared a partir da tela de Parâmetros, que monta os
// cards inteiros a partir de uma lista declarativa.
export function DataRow({ icone, rotulo, children, className }: DataRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border py-3 last:border-b-0",
        className,
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon icon={icone} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </div>
        <div className="mt-0.5 break-words text-[13.5px] font-medium text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
