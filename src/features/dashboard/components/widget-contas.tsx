import { Link } from "@tanstack/react-router";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { resumoContasPendentes } from "@/features/dashboard/derivacoes";
import { KpiCard } from "@/features/dashboard/components/kpi-card";

export function WidgetContas() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();
  const { isLoading, error, retry } = useMockResource(contasReceber);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KpiCard rotulo="Contas vencidas" valor="" isLoading />
        <KpiCard rotulo="A vencer" valor="" isLoading />
      </div>
    );
  }

  if (error) {
    return <KpiCard rotulo="Contas" valor="" error={error} onRetry={retry} className="sm:col-span-2" />;
  }

  const resumo = resumoContasPendentes(contasReceber, contasPagar, new Date());

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Link to="/admin/financeiro" className="block">
        <KpiCard
          icone="lucide:alert-triangle"
          rotulo="Contas vencidas"
          valor={String(resumo.vencidas)}
          variante={resumo.vencidas > 0 ? "alerta" : "neutro"}
        />
      </Link>
      <Link to="/admin/financeiro" className="block">
        <KpiCard icone="lucide:calendar-clock" rotulo="A vencer" valor={String(resumo.aVencer)} />
      </Link>
    </div>
  );
}
