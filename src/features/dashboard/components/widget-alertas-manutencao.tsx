import { Link } from "@tanstack/react-router";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { contagemAlertasManutencao } from "@/features/dashboard/derivacoes";
import { KpiCard } from "@/features/dashboard/components/kpi-card";

export function WidgetAlertasManutencao() {
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const { isLoading, error, retry } = useMockResource(equipamentos);

  if (isLoading) return <KpiCard rotulo="Alertas de manutenção" valor="" isLoading />;
  if (error)
    return <KpiCard rotulo="Alertas de manutenção" valor="" error={error} onRetry={retry} />;

  const total = contagemAlertasManutencao(equipamentos, planos, registros);

  return (
    <Link to="/admin/manutencao" className="block">
      <KpiCard
        icone="lucide:wrench"
        rotulo="Alertas de manutenção"
        valor={String(total)}
        descricao={total > 0 ? "próxima ou vencida" : "tudo em dia"}
        variante={total > 0 ? "alerta" : "neutro"}
      />
    </Link>
  );
}
