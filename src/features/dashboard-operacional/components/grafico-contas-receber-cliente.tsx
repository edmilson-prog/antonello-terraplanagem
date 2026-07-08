import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberPorCliente, dataReferenciaOperacional } from "@/features/dashboard-operacional/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";

export function GraficoContasReceberCliente() {
  const contasReceber = contasReceberStore.useTodas();
  const clientes = clientesStore.useAll();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const { isLoading, error, retry } = useMockResource(contasReceber);

  const referencia = useMemo(
    () => dataReferenciaOperacional(ordens, apontamentos, faturamentos, contasReceber),
    [ordens, apontamentos, faturamentos, contasReceber],
  );
  const dados = useMemo(
    () => contasReceberPorCliente(contasReceber, clientes, referencia.toISOString()),
    [contasReceber, clientes, referencia],
  );

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">Contas a receber por cliente</h2>
        <p className="text-xs text-muted-foreground">Em aberto — vencidas × a vencer</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button type="button" onClick={retry} className="text-sm font-semibold text-primary hover:underline">
            Tentar novamente
          </button>
        </div>
      ) : dados.length === 0 ? (
        <EmptyState
          icon="lucide:receipt"
          titulo="Nenhuma conta em aberto"
          descricao="Não há contas a receber pendentes no momento."
        />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, dados.length * 44)}>
          <BarChart data={dados} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis
              type="category"
              dataKey="cliente_nome"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              width={140}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-card-foreground)",
              }}
              formatter={(v: number) => formatBRL(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="vencida" name="Vencida" stackId="contas" fill="var(--color-destructive)" />
            <Bar dataKey="aVencer" name="A vencer" stackId="contas" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
