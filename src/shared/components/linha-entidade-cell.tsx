import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface LinhaEntidadeCellProps {
  variante: "icone" | "avatar";
  icone?: string;
  iniciais?: string;
  titulo: ReactNode;
  subtitulo?: ReactNode;
}

export function LinhaEntidadeCell({
  variante,
  icone,
  iniciais,
  titulo,
  subtitulo,
}: LinhaEntidadeCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center bg-primary/15 text-primary",
          variante === "avatar" ? "rounded-full font-display text-xs font-bold" : "rounded-lg",
        )}
      >
        {variante === "avatar" ? (
          iniciais
        ) : (
          <Icon icon={icone ?? "lucide:circle"} className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{titulo}</div>
        {subtitulo ? (
          <div className="truncate text-xs text-foreground-faint">{subtitulo}</div>
        ) : null}
      </div>
    </div>
  );
}
