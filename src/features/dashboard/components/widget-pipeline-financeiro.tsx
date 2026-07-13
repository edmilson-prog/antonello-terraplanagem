import { Link } from "@tanstack/react-router";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { pipelineFinanceiroPeriodo } from "@/features/dashboard/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import type { IntervaloPeriodo } from "@/features/dashboard/periodo";

export function WidgetPipelineFinanceiro({ intervalo }: { intervalo: IntervaloPeriodo }) {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const precosFund = precoFundacaoStore.useAll();
  const { isLoading, error, retry } = useMockResource(faturamentos);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard rotulo="Executado" valor="" isLoading />
        <KpiCard rotulo="Faturado" valor="" isLoading />
        <KpiCard rotulo="Recebido" valor="" isLoading />
      </div>
    );
  }

  if (error) {
    return (
      <KpiCard
        rotulo="Pipeline financeiro"
        valor=""
        error={error}
        onRetry={retry}
        className="sm:col-span-3"
      />
    );
  }

  const pipeline = pipelineFinanceiroPeriodo(
    ordens,
    apontamentos,
    faturamentos,
    contasReceber,
    equipamentos,
    precosHM,
    precosFund,
    intervalo,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link to="/admin/faturamento" className="block">
        <KpiCard
          icone="lucide:hammer"
          rotulo="Executado"
          valor={formatBRL(pipeline.executado)}
          descricao="fechadas, sem fatura"
        />
      </Link>
      <Link to="/admin/faturamento" className="block">
        <KpiCard
          icone="lucide:receipt"
          rotulo="Faturado"
          valor={formatBRL(pipeline.faturado)}
          descricao="no período"
        />
      </Link>
      <Link to="/admin/financeiro" className="block">
        <KpiCard
          icone="lucide:banknote"
          rotulo="Recebido"
          valor={formatBRL(pipeline.recebido)}
          descricao="no período"
        />
      </Link>
    </div>
  );
}
