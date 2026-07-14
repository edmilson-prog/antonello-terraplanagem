import { Icon } from "@iconify/react";

export interface StatItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape?: string;
  alerta?: boolean;
  mono?: boolean; // valor em font-mono; default true
}

// Faixa de estatísticas REAIS (sem sparkline/trend) para as páginas de detalhe
// transacionais. Reusa a estética do KpiCard (cliente-kpis), só com dado real.
export function StatStrip({ itens }: { itens: StatItem[] }) {
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {itens.map((s) => (
        <StatTile key={s.rotulo} stat={s} />
      ))}
    </section>
  );
}

function StatTile({ stat }: { stat: StatItem }) {
  const mono = stat.mono ?? true;
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {stat.rotulo}
        </span>
        <span
          className={
            stat.alerta
              ? "grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive"
              : "grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary"
          }
        >
          <Icon icon={stat.icone} className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div
        className={
          (stat.alerta ? "text-destructive" : "text-foreground") +
          (mono ? " font-mono" : " font-display") +
          " mt-3 text-2xl font-bold"
        }
      >
        {stat.valor}
      </div>
      {stat.rodape ? (
        <div className="mt-1.5 text-xs text-muted-foreground">{stat.rodape}</div>
      ) : null}
    </div>
  );
}
