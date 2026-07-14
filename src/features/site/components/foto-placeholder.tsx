import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface FotoPlaceholderProps {
  icone: string;
  legenda: string;
  className?: string;
}

// Bloco visual temporário no lugar de uma foto real (obra/frota) ainda não
// recebida do cliente — trocar por <img> assim que as fotos chegarem.
export function FotoPlaceholder({ icone, legenda, className }: FotoPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-gradient-to-br from-surface to-card p-4 text-center",
        className,
      )}
    >
      <Icon icon={icone} className="h-8 w-8 text-primary" aria-hidden />
      <p className="text-xs font-medium text-muted-foreground">{legenda}</p>
    </div>
  );
}
