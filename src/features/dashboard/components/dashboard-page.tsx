import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { PeriodoFiltro } from "@/features/dashboard/components/periodo-filtro";
import { WidgetOsPorStatus } from "@/features/dashboard/components/widget-os-por-status";
import { WidgetHorasPeriodo } from "@/features/dashboard/components/widget-horas-periodo";
import { WidgetPipelineFinanceiro } from "@/features/dashboard/components/widget-pipeline-financeiro";
import { WidgetContas } from "@/features/dashboard/components/widget-contas";
import { WidgetAlertasManutencao } from "@/features/dashboard/components/widget-alertas-manutencao";
import { WidgetAtalhos } from "@/features/dashboard/components/widget-atalhos";
import { PainelOperacional } from "@/features/dashboard-operacional";
import { intervaloPeriodo, type PeriodoDashboard } from "@/features/dashboard/periodo";

export function AdminDashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>("hoje");
  const intervalo = useMemo(() => intervaloPeriodo(periodo, new Date()), [periodo]);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Dashboard"
        descricao="Visão geral da operação — equipamentos, ordens e faturamento."
      />

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="flex justify-end">
            <PeriodoFiltro periodo={periodo} onChange={setPeriodo} />
          </div>

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
        </TabsContent>

        <TabsContent value="operacional">
          <PainelOperacional />
        </TabsContent>
      </Tabs>
    </div>
  );
}
