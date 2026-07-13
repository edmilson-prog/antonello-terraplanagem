import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { horasApontadasNoPeriodo } from "@/features/dashboard/derivacoes";
import { intervaloPeriodo } from "@/features/dashboard/periodo";
import {
  dataReferenciaOperacional,
  serieDiariaHoras,
} from "@/features/dashboard-operacional/derivacoes";
import { serieDecorativa } from "@/features/dashboard-operacional/serie-decorativa";
import { MiniSparkline } from "@/features/dashboard-operacional/components/mini-sparkline";
import { numero } from "@/features/retaguarda/format";

export function CardHorasApontadas() {
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const { isLoading, error, retry } = useMockResource(apontamentos);

  const referencia = useMemo(
    () => dataReferenciaOperacional(ordens, apontamentos, faturamentos, contasReceber),
    [ordens, apontamentos, faturamentos, contasReceber],
  );
  const intervaloMes = useMemo(() => intervaloPeriodo("mes", referencia), [referencia]);
  const horas = useMemo(
    () => horasApontadasNoPeriodo(apontamentos, intervaloMes),
    [apontamentos, intervaloMes],
  );
  const serie = useMemo(
    () => serieDiariaHoras(apontamentos, referencia),
    [apontamentos, referencia],
  );
  const serieVisual = useMemo(() => serieDecorativa(serie), [serie]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border bg-card p-5 shadow-sm">
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

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
        Horas apontadas
      </span>
      <div className="mt-2 font-mono text-2xl font-bold text-card-foreground">
        {numero.format(horas)} h
      </div>
      <p className="text-xs text-muted-foreground">no mês</p>
      <div className="mt-3">
        <MiniSparkline
          dados={serieVisual}
          formatar={(v) => `${numero.format(v)} h`}
          mostrarTooltip={false}
        />
      </div>
      <p className="mt-1 text-[10px] text-foreground-faint">Últimos 7 dias</p>
    </div>
  );
}
