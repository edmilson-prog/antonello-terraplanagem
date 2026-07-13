import { cn } from "@/lib/utils";

export interface FiltroChipItem {
  id: string;
  label: string;
  tone?: "info" | "success" | "warn" | "neutral";
}

export interface FiltroChipsProps {
  itens: FiltroChipItem[];
  ativo: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}

const TONE_LED_CLASSE: Record<NonNullable<FiltroChipItem["tone"]>, string> = {
  success: "text-primary",
  warn: "text-destructive",
  info: "text-steel",
  neutral: "text-muted-foreground",
};

export function FiltroChips({ itens, ativo, onChange, counts }: FiltroChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group">
      {itens.map((item) => {
        const selecionado = item.id === ativo;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selecionado}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              selecionado
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40",
            )}
          >
            {item.tone ? (
              <span
                className={cn("h-1.5 w-1.5 rounded-full bg-current", TONE_LED_CLASSE[item.tone])}
              />
            ) : null}
            {item.label}
            <span className={selecionado ? "text-primary-foreground/80" : "text-foreground-faint"}>
              · {counts[item.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
