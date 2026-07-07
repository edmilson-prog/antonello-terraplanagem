import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { utilizacaoPorEquipamentoNoPeriodo } from "@/features/gerencial/derivacoes";
import type { PeriodoGerencial } from "@/features/gerencial/periodo-gerencial";

interface Props {
  periodo: PeriodoGerencial;
}

export function GraficoUtilizacaoDiesel({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const abastecimentos = abastecimentosStore.useTodos();
  const apontamentos = apontamentosStore.useTodos();

  const dados = useMemo(
    () =>
      utilizacaoPorEquipamentoNoPeriodo(equipamentos, abastecimentos, apontamentos, periodo)
        .filter((d) => d.consumo_medio_l_h != null)
        .map((d) => ({ nome: d.equipamento.nome, consumo: d.consumo_medio_l_h as number })),
    [equipamentos, abastecimentos, apontamentos, periodo],
  );
  const { isLoading, error, retry } = useMockResource(dados);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">
          Utilização e consumo (l/h)
        </h2>
        <p className="text-xs text-muted-foreground">Consumo médio por hora, por equipamento</p>
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
          icon="lucide:fuel"
          titulo="Sem abastecimento no período"
          descricao="Nenhum equipamento tem abastecimento registrado no período selecionado."
        />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, dados.length * 40)}>
          <BarChart data={dados} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis type="category" dataKey="nome" stroke="var(--color-muted-foreground)" fontSize={11} width={160} />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-card-foreground)",
              }}
              formatter={(v: number) => `${v.toFixed(1)} l/h`}
            />
            <Bar dataKey="consumo" fill="var(--color-terra, #A2622F)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
