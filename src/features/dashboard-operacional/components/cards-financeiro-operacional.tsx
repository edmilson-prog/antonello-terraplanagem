import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
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
import {
  TileOperacional,
  TileRodape,
} from "@/features/dashboard-operacional/components/tile-operacional";
import { formatBRL } from "@/features/retaguarda/format";

export function CardsFinanceiroOperacional() {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const precosFund = precoFundacaoStore.useAll();
  const { isLoading, error, retry } = combinarEstados(
    { estado: ordensStore.useEstado(), retry: ordensStore.retry },
    { estado: apontamentosStore.useEstado(), retry: apontamentosStore.retry },
    { estado: faturamentosStore.useEstado(), retry: faturamentosStore.retry },
    { estado: contasReceberStore.useEstado(), retry: contasReceberStore.retry },
    { estado: equipamentosStore.useEstado(), retry: equipamentosStore.retry },
    { estado: precoHoraMaquinaStore.useEstado(), retry: precoHoraMaquinaStore.retry },
    { estado: precoFundacaoStore.useEstado(), retry: precoFundacaoStore.retry },
  );

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
    [
      ordens,
      apontamentos,
      faturamentos,
      contasReceber,
      equipamentos,
      precosHM,
      precosFund,
      intervaloMes,
    ],
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
    [
      ordens,
      apontamentos,
      faturamentos,
      contasReceber,
      equipamentos,
      precosHM,
      precosFund,
      intervaloAnterior,
    ],
  );
  const serieExecutado = useMemo(
    () =>
      serieDecorativa(
        serieDiariaExecutado(
          ordens,
          apontamentos,
          faturamentos,
          equipamentos,
          precosHM,
          precosFund,
          referencia,
        ),
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
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
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
      rodape: "serviço executado no mês",
    },
    {
      rotulo: "Faturado",
      valor: pipeline.faturado,
      anterior: pipelineAnterior.faturado,
      serie: serieFaturado,
      cor: "var(--color-secondary)",
      rodape: "vs. mês anterior",
    },
    {
      rotulo: "Recebido",
      valor: pipeline.recebido,
      anterior: pipelineAnterior.recebido,
      serie: serieRecebido,
      cor: "var(--color-primary)",
      rodape: "vs. mês anterior",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <TileOperacional key={card.rotulo} rotulo={card.rotulo} valor={formatBRL(card.valor)} mono>
          <TileRodape>
            <span className="flex items-center gap-1.5">
              <VariacaoBadge variacao={variacaoPercentual(card.valor, card.anterior)} />
              {card.rodape}
            </span>
          </TileRodape>
          <div className="mt-3">
            <MiniSparkline
              dados={card.serie}
              formatar={formatBRL}
              cor={card.cor}
              mostrarTooltip={false}
            />
          </div>
        </TileOperacional>
      ))}
    </div>
  );
}
