import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  titulo?: string;
  descricao?: string;
  icone?: LucideIcon;
  className?: string;
}

export function EmptyState({
  titulo = "Em construção",
  descricao = "Esta área ainda está sendo preparada. Em breve você verá tudo funcionando por aqui.",
  icone: Icone = Construction,
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
        <Icone className="h-8 w-8" strokeWidth={2.25} />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-foreground">{titulo}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>
      </div>
    </div>
  );
}
