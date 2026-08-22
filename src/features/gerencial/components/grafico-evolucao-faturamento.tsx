import { useMemo, useState } from "react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { serieMensalFaturamento } from "@/features/gerencial/derivacoes";
import { metaMensalStore } from "@/features/gerencial/meta-mensal-store";
import { brl } from "@/features/retaguarda/format";

interface Props {
  meses: string[];
}

export function GraficoEvolucaoFaturamento({ meses }: Props) {
  const faturamentos = faturamentosStore.useTodos();
  const [meta, definirMeta] = metaMensalStore.useMetaMensal();
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [rascunhoMeta, setRascunhoMeta] = useState(String(meta));

  const serie = useMemo(() => serieMensalFaturamento(meses, faturamentos), [meses, faturamentos]);
  const { isLoading, error, retry } = combinarEstados({
    estado: faturamentosStore.useEstado(),
    retry: faturamentosStore.retry,
  });

  const salvarMeta = () => {
    const valor = Number(rascunhoMeta);
    if (Number.isFinite(valor) && valor >= 0) definirMeta(valor);
    setEditandoMeta(false);
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-card-foreground">
            Evolução do faturamento
          </h2>
          <p className="text-xs text-muted-foreground">Faturado por mês, com meta de referência</p>
        </div>
        {editandoMeta ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={rascunhoMeta}
              onChange={(e) => setRascunhoMeta(e.target.value)}
              className="h-8 w-32"
            />
            <Button size="sm" onClick={salvarMeta}>
              Salvar
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setRascunhoMeta(String(meta));
              setEditandoMeta(true);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Icon icon="lucide:target" className="h-3.5 w-3.5" />
            Meta: {brl.format(meta)}
          </button>
        )}
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
            <Bar
              dataKey="faturado"
              name="Faturado"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
            <ReferenceLine
              y={meta}
              stroke="var(--color-destructive)"
              strokeDasharray="6 4"
              label={{
                value: "Meta",
                position: "insideTopRight",
                fill: "var(--color-destructive)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="faturado"
              name="Tendência"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
