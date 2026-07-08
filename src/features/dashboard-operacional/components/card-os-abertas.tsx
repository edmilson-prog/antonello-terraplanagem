import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contagemOSPorStatus } from "@/features/dashboard/derivacoes";
import { intervaloPeriodo } from "@/features/dashboard/periodo";
import { dataReferenciaOperacional, serieDiariaOSAbertas } from "@/features/dashboard-operacional/derivacoes";
import { serieDecorativa } from "@/features/dashboard-operacional/serie-decorativa";

export function CardOsAbertas() {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const { isLoading, error, retry } = useMockResource(ordens);

  const referencia = useMemo(
    () => dataReferenciaOperacional(ordens, apontamentos, faturamentos, contasReceber),
    [ordens, apontamentos, faturamentos, contasReceber],
  );
  const intervaloMes = useMemo(() => intervaloPeriodo("mes", referencia), [referencia]);
  const contagem = useMemo(
    () => contagemOSPorStatus(ordens, apontamentos, intervaloMes),
    [ordens, apontamentos, intervaloMes],
  );
  const serie = useMemo(() => serieDiariaOSAbertas(ordens, referencia), [ordens, referencia]);
  const serieVisual = useMemo(() => serieDecorativa(serie, 2), [serie]);

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
        <button type="button" onClick={retry} className="mt-2 text-sm font-semibold text-primary hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">OS abertas</span>
      <div className="mt-2 font-mono text-2xl font-bold text-card-foreground">{contagem.abertas}</div>
      <p className="text-xs text-muted-foreground">{contagem.emAndamento} em andamento</p>
      <div className="mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={serieVisual} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="valor" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[10px] text-foreground-faint">Novas OS abertas · últimos 7 dias</p>
    </div>
  );
}
