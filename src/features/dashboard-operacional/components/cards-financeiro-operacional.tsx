import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { pipelineFinanceiroPeriodo } from "@/features/dashboard/derivacoes";
import { intervaloPeriodo } from "@/features/dashboard/periodo";
import { variacaoPercentual } from "@/features/gerencial/derivacoes";
import {
  dataReferenciaOperacional,
  intervaloMesAnterior,
  serieDiariaExecutado,
  serieDiariaFaturamento,
  serieDiariaRecebido,
} from "@/features/dashboard-operacional/derivacoes";
import { serieDecorativa } from "@/features/dashboard-operacional/serie-decorativa";
import { MiniSparkline } from "@/features/dashboard-operacional/components/mini-sparkline";
import { VariacaoBadge } from "@/features/dashboard-operacional/components/variacao-badge";
import { formatBRL } from "@/features/retaguarda/format";

export function CardsFinanceiroOperacional() {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const precosFund = precoFundacaoStore.useAll();
  const { isLoading, error, retry } = useMockResource(faturamentos);

  const referencia = useMemo(
    () => dataReferenciaOperacional(ordens, apontamentos, faturamentos, contasReceber),
    [ordens, apontamentos, faturamentos, contasReceber],
  );
  const intervaloMes = useMemo(() => intervaloPeriodo("mes", referencia), [referencia]);
  const intervaloAnterior = useMemo(() => intervaloMesAnterior(referencia), [referencia]);
  const pipeline = useMemo(
    () =>
      pipelineFinanceiroPeriodo(
        ordens,
        apontamentos,
        faturamentos,
        contasReceber,
        equipamentos,
        precosHM,
        precosFund,
        intervaloMes,
      ),
    [ordens, apontamentos, faturamentos, contasReceber, equipamentos, precosHM, precosFund, intervaloMes],
  );
  const pipelineAnterior = useMemo(
    () =>
      pipelineFinanceiroPeriodo(
        ordens,
        apontamentos,
        faturamentos,
        contasReceber,
        equipamentos,
        precosHM,
        precosFund,
        intervaloAnterior,
      ),
    [ordens, apontamentos, faturamentos, contasReceber, equipamentos, precosHM, precosFund, intervaloAnterior],
  );
  const serieExecutado = useMemo(
    () =>
      serieDecorativa(
        serieDiariaExecutado(ordens, apontamentos, faturamentos, equipamentos, precosHM, precosFund, referencia),
      ),
    [ordens, apontamentos, faturamentos, equipamentos, precosHM, precosFund, referencia],
  );
  const serieFaturado = useMemo(
    () => serieDecorativa(serieDiariaFaturamento(faturamentos, referencia)),
    [faturamentos, referencia],
  );
  const serieRecebido = useMemo(
    () => serieDecorativa(serieDiariaRecebido(contasReceber, referencia)),
    [contasReceber, referencia],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border bg-card p-5 shadow-sm sm:col-span-3">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button type="button" onClick={retry} className="mt-2 text-sm font-semibold text-primary hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  const cards = [
    {
      rotulo: "Executado",
      valor: pipeline.executado,
      anterior: pipelineAnterior.executado,
      serie: serieExecutado,
      cor: "var(--color-steel)",
    },
    {
      rotulo: "Faturado",
      valor: pipeline.faturado,
      anterior: pipelineAnterior.faturado,
      serie: serieFaturado,
      cor: "var(--color-secondary)",
    },
    {
      rotulo: "Recebido",
      valor: pipeline.recebido,
      anterior: pipelineAnterior.recebido,
      serie: serieRecebido,
      cor: "var(--color-primary)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.rotulo} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
              {card.rotulo}
            </span>
            <VariacaoBadge variacao={variacaoPercentual(card.valor, card.anterior)} />
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-card-foreground">{formatBRL(card.valor)}</div>
          <p className="text-xs text-muted-foreground">no mês</p>
          <div className="mt-3">
            <MiniSparkline dados={card.serie} formatar={formatBRL} cor={card.cor} mostrarTooltip={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
