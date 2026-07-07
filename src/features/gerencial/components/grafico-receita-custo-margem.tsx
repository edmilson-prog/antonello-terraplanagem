import { useMemo } from "react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { serieMensalCustoMargem } from "@/features/gerencial/derivacoes";
import { brl } from "@/features/retaguarda/format";

interface Props {
  meses: string[];
}

export function GraficoReceitaCustoMargem({ meses }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const apontamentos = apontamentosStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const faturamentos = faturamentosStore.useTodos();

  const serie = useMemo(
    () =>
      serieMensalCustoMargem(
        meses,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ),
    [meses, equipamentos, componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina, faturamentos],
  );
  const { isLoading, error, retry } = useMockResource(serie);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">
          Receita × Custo × Margem
        </h2>
        <p className="text-xs text-muted-foreground">
          Só cobre modelo hora-máquina (único com custo modelado); pode ser menor que o
          faturamento total do período.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[280px] w-full" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={serie} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="rotulo" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-card-foreground)",
              }}
              formatter={(v: number) => brl.format(v)}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} />
            <Bar dataKey="receita" name="Receita" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="custo" name="Custo" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="margem" name="Margem" stroke="var(--color-foreground)" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
