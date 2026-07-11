import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseSemana } from "@/features/operadores/operador-showcase-data";

export function HorasSemanaCard({ semana }: { semana: ShowcaseSemana }) {
  const picoPct = Math.max(...semana.barras.map((b) => b.pct));
  return (
    <CardSecao titulo="Horas por semana" icone="lucide:bar-chart-3" bodyClassName="p-4">
      <div className="flex h-24 items-end gap-2">
        {semana.barras.map((b) => (
          <div
            key={b.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <div
              className={
                b.pct === picoPct
                  ? "w-full max-w-[26px] rounded-t bg-primary"
                  : "w-full max-w-[26px] rounded-t bg-primary/60"
              }
              style={{ height: `${b.pct}%` }}
            />
            <span className="font-mono text-[10px] text-foreground-faint">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Média <b className="text-foreground">{semana.mediaHoras}</b>/semana
        </span>
        <span>
          Pico <b className="text-foreground">{semana.picoHoras}</b> ({semana.picoLabel})
        </span>
      </div>
    </CardSecao>
  );
}
