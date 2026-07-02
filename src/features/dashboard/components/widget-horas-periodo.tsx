import { Link } from "@tanstack/react-router";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { horasApontadasNoPeriodo } from "@/features/dashboard/derivacoes";
import { formatHorimetro } from "@/shared/lib/format";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import type { IntervaloPeriodo } from "@/features/dashboard/periodo";

export function WidgetHorasPeriodo({ intervalo }: { intervalo: IntervaloPeriodo }) {
  const apontamentos = apontamentosStore.useTodos();
  const { isLoading, error, retry } = useMockResource(apontamentos);

  if (isLoading) return <KpiCard rotulo="Horas apontadas" valor="" isLoading />;
  if (error) return <KpiCard rotulo="Horas apontadas" valor="" error={error} onRetry={retry} />;

  const horas = horasApontadasNoPeriodo(apontamentos, intervalo);

  return (
    <Link to="/admin/ordens" className="block">
      <KpiCard
        icone="lucide:clock"
        rotulo="Horas apontadas"
        valor={formatHorimetro(horas)}
        descricao="no período selecionado"
      />
    </Link>
  );
}
