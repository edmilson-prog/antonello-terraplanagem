import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { horasPorEquipamentoNoPeriodo } from "@/features/gerencial/derivacoes";
import type { PeriodoGerencial } from "@/features/gerencial/periodo-gerencial";
import { numero } from "@/features/retaguarda/format";

interface Props {
  periodo: PeriodoGerencial;
}

export function GraficoHorasEquipamento({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();

  const dados = useMemo(
    () =>
      horasPorEquipamentoNoPeriodo(equipamentos, apontamentos, periodo).filter((d) => d.horas > 0),
    [equipamentos, apontamentos, periodo],
  );
  const { isLoading, error, retry } = useMockResource(dados);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">
          Horas por equipamento
        </h2>
        <p className="text-xs text-muted-foreground">Horas trabalhadas no período selecionado</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : dados.length === 0 ? (
        <EmptyState
          icon="lucide:clock"
          titulo="Sem horas no período"
          descricao="Nenhum equipamento teve apontamento finalizado no período selecionado."
        />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, dados.length * 40)}>
          <BarChart
            data={dados}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis
              type="category"
              dataKey="equipamento_nome"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              width={160}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-card-foreground)",
              }}
              formatter={(v: number) => `${numero.format(v)} h`}
            />
            <Bar dataKey="horas" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
