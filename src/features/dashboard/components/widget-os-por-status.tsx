import { Link } from "@tanstack/react-router";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { contagemOSPorStatus } from "@/features/dashboard/derivacoes";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import type { IntervaloPeriodo } from "@/features/dashboard/periodo";

export function WidgetOsPorStatus({ intervalo }: { intervalo: IntervaloPeriodo }) {
  const todas = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const { isLoading, error, retry } = useMockResource(todas);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard rotulo="Abertas" valor="" isLoading />
        <KpiCard rotulo="Em andamento" valor="" isLoading />
        <KpiCard rotulo="Fechadas no período" valor="" isLoading />
      </div>
    );
  }

  if (error) {
    return (
      <KpiCard
        rotulo="OS por status"
        valor=""
        error={error}
        onRetry={retry}
        className="sm:col-span-3"
      />
    );
  }

  const contagem = contagemOSPorStatus(todas, apontamentos, intervalo);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link to="/admin/ordens" search={{ status: "aberta" }} className="block">
        <KpiCard icone="lucide:folder-open" rotulo="Abertas" valor={String(contagem.abertas)} />
      </Link>
      <Link to="/admin/ordens" search={{ status: "em_andamento" }} className="block">
        <KpiCard icone="lucide:loader" rotulo="Em andamento" valor={String(contagem.emAndamento)} />
      </Link>
      <Link to="/admin/ordens" search={{ status: "fechada" }} className="block">
        <KpiCard
          icone="lucide:check-circle"
          rotulo="Fechadas no período"
          valor={String(contagem.fechadasNoPeriodo)}
        />
      </Link>
    </div>
  );
}
