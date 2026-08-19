import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import type { KpiCliente, KpisCliente } from "@/features/clientes/derivacoes";

export interface ClienteKpisProps {
  kpis: KpisCliente;
}

// Os quatro KPIs já vêm prontos de `montarPainelCliente`. Antes, metade era
// sorteada e a outra metade chegava por props que sobrescreviam o sorteio —
// arranjo que existia só para o valor real vencer o de exemplo.
export function ClienteKpis({ kpis }: ClienteKpisProps) {
  const itens: KpiCliente[] = [kpis.faturado, kpis.saldoReceber, kpis.osAtivas, kpis.orcamentos];
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {itens.map((kpi) => (
        <KpiCard key={kpi.rotulo} kpi={kpi} />
      ))}
    </section>
  );
}

function KpiCard({ kpi }: { kpi: KpiCliente }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {kpi.rotulo}
        </span>
        <span
          className={
            kpi.alerta
              ? "grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive"
              : "grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary"
          }
        >
          <Icon icon={kpi.icone} className="h-4 w-4" />
        </span>
      </div>

      <div
        className={
          kpi.alerta
            ? "mt-3 font-display text-3xl font-bold text-destructive"
            : "mt-3 font-display text-3xl font-bold text-foreground"
        }
      >
        {kpi.valor}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {kpi.trendDir ? (
          <span
            className={
              kpi.trendDir === "up"
                ? "inline-flex items-center gap-0.5 font-semibold text-primary"
                : "inline-flex items-center gap-0.5 font-semibold text-destructive"
            }
          >
            <Icon
              icon={kpi.trendDir === "up" ? "lucide:trending-up" : "lucide:trending-down"}
              className="h-3 w-3"
            />
            {kpi.trendPct}%
          </span>
        ) : null}
        <span>{kpi.rodape}</span>
      </div>

      {kpi.spark ? (
        <Sparkline pontos={kpi.spark} className="absolute bottom-3.5 right-3.5 h-6 w-16" />
      ) : null}
    </div>
  );
}
