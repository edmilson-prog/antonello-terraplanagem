import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { pipelineConsolidadoNoPeriodo } from "@/features/gerencial/derivacoes";
import type { PeriodoGerencial } from "@/features/gerencial/periodo-gerencial";
import { brl } from "@/features/retaguarda/format";

interface Props {
  periodo: PeriodoGerencial;
}

export function PipelineConsolidadoCard({ periodo }: Props) {
  const navigate = useNavigate();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const equipamentos = equipamentosStore.useAll();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const precosFundacao = precoFundacaoStore.useAll();

  const pipeline = useMemo(
    () =>
      pipelineConsolidadoNoPeriodo(
        ordens,
        apontamentos,
        faturamentos,
        contasReceber,
        equipamentos,
        precosHoraMaquina,
        precosFundacao,
        periodo,
      ),
    [
      ordens,
      apontamentos,
      faturamentos,
      contasReceber,
      equipamentos,
      precosHoraMaquina,
      precosFundacao,
      periodo,
    ],
  );
  const { isLoading, error, retry } = useMockResource(pipeline);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-display text-base font-bold text-card-foreground">
        Pipeline consolidado do período
      </h2>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/ordens" })}
            className="rounded-lg border bg-surface/50 p-4 text-left transition-colors hover:bg-surface"
          >
            <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
              Executado
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-card-foreground">
              {brl.format(pipeline.executado)}
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/faturamento" })}
            className="rounded-lg border bg-surface/50 p-4 text-left transition-colors hover:bg-surface"
          >
            <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
              Faturado
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-card-foreground">
              {brl.format(pipeline.faturado)}
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/financeiro" })}
            className="rounded-lg border bg-surface/50 p-4 text-left transition-colors hover:bg-surface"
          >
            <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
              Recebido
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-card-foreground">
              {brl.format(pipeline.recebido)}
            </div>
          </button>
        </div>
      )}
    </section>
  );
}
