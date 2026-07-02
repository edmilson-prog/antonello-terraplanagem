import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { PeriodoFiltro } from "@/features/dashboard/components/periodo-filtro";
import { WidgetOsPorStatus } from "@/features/dashboard/components/widget-os-por-status";
import { WidgetHorasPeriodo } from "@/features/dashboard/components/widget-horas-periodo";
import { WidgetPipelineFinanceiro } from "@/features/dashboard/components/widget-pipeline-financeiro";
import { WidgetContas } from "@/features/dashboard/components/widget-contas";
import { WidgetAlertasManutencao } from "@/features/dashboard/components/widget-alertas-manutencao";
import { WidgetAtalhos } from "@/features/dashboard/components/widget-atalhos";
import { intervaloPeriodo, type PeriodoDashboard } from "@/features/dashboard/periodo";

export function AdminDashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>("hoje");
  const intervalo = useMemo(() => intervaloPeriodo(periodo, new Date()), [periodo]);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Dashboard"
        descricao="Visão geral da operação — equipamentos, ordens e faturamento."
        acoes={<PeriodoFiltro periodo={periodo} onChange={setPeriodo} />}
      />

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Ordens e horas
        </h2>
        <WidgetOsPorStatus intervalo={intervalo} />
        <WidgetHorasPeriodo intervalo={intervalo} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Financeiro
        </h2>
        <WidgetPipelineFinanceiro intervalo={intervalo} />
        <WidgetContas />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Manutenção e atalhos
        </h2>
        <WidgetAlertasManutencao />
        <WidgetAtalhos />
      </section>
    </div>
  );
}
