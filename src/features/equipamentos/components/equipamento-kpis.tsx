import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import type { KpiEquipamento, KpisEquipamento } from "@/features/equipamentos/derivacoes";

export function EquipamentoKpis({ kpis }: { kpis: KpisEquipamento }) {
  const itens: KpiEquipamento[] = [
    kpis.horimetro,
    kpis.horasMes,
    kpis.disponibilidade,
    kpis.receitaMes,
  ];
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {itens.map((kpi) => (
        <KpiCard key={kpi.rotulo} kpi={kpi} />
      ))}
    </section>
  );
}

function KpiCard({ kpi }: { kpi: KpiEquipamento }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {kpi.rotulo}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary">
          <Icon icon={kpi.icone} className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 font-display text-3xl font-bold text-foreground">{kpi.valor}</div>

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
