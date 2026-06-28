import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

// Afford. visual de offline: marca um registro ainda não sincronizado com a
// central. O motor de sync real é o PRD-000/003; aqui é apenas indicador.
export function SyncBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-steel/40 bg-steel/15 px-2.5 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      <Icon icon="lucide:cloud-off" className="h-3.5 w-3.5" />
      Pendente de sincronização
    </span>
  );
}
