import { cn } from "@/lib/utils";

export interface StatusFilterChipItem {
  id: string;
  label: string;
  tone?: "info" | "success" | "warn" | "neutral";
}

interface StatusFilterChipsProps {
  itens: StatusFilterChipItem[];
  ativo: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}

const TONE_CLASSE: Record<NonNullable<StatusFilterChipItem["tone"]>, string> = {
  info: "text-secondary",
  success: "text-primary",
  warn: "text-primary",
  neutral: "text-muted-foreground",
};

// Chips de filtro por status com contador — reuso entre Ordens, Orçamentos e
// Comprovantes (padrão visual do UI kit de retaguarda).
export function StatusFilterChips({ itens, ativo, onChange, counts }: StatusFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {itens.map((item) => {
        const isAtivo = item.id === ativo;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isAtivo}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isAtivo
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {item.tone ? (
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-current",
                  isAtivo ? "text-primary-foreground" : TONE_CLASSE[item.tone],
                )}
              />
            ) : null}
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-mono",
                isAtivo ? "bg-primary-foreground/20" : "bg-card",
              )}
            >
              {counts[item.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
