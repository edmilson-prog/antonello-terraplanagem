import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import {
  rentabilidadePorTodasAsObras,
  type RentabilidadeObra,
} from "@/features/rentabilidade/derivacoes";
import { formatPercentual } from "@/features/rentabilidade/format";
import { DetalheObraDialog } from "@/features/rentabilidade/components/detalhe-obra-dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function RankingObras({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const clientes = clientesStore.useAll();

  const [selecionado, setSelecionado] = useState<RentabilidadeObra | null>(null);

  const resultados = useMemo(
    () =>
      rentabilidadePorTodasAsObras(
        ordens,
        faturamentos,
        periodo,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ).sort((a, b) => b.margem - a.margem),
    [
      ordens,
      faturamentos,
      periodo,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    ],
  );

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";
  const obraNome = (osId: string) => ordens.find((o) => o.id === osId)?.obra_nome ?? null;
  const nomeDoCliente = (clienteId: string) =>
    clientes.find((c) => c.id === clienteId)?.nome ?? "Cliente";

  const receitaTotal = resultados.reduce((s, r) => s + r.receita, 0);
  const custoTotal = resultados.reduce((s, r) => s + r.custo, 0);
  const margemTotal = receitaTotal - custoTotal;
  const comPrejuizo = resultados.filter((r) => r.margem < 0).length;

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!isLoading && resultados.length === 0) {
    return (
      <EmptyState
        icon="lucide:building-2"
        titulo="Sem obras faturadas no período"
        descricao="Nenhuma obra teve faturamento gerado neste mês."
      />
    );
  }

  const dadosGrafico = resultados.map((r) => ({
    nome: r.os_numero,
    margem: r.margem,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard
          rotulo="Receita faturada"
          valor={formatBRL(receitaTotal)}
          icone="lucide:receipt"
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Custo total"
          valor={formatBRL(custoTotal)}
          icone="lucide:wallet"
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Margem total"
          valor={formatBRL(margemTotal)}
          icone="lucide:trending-up"
          variante={margemTotal < 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Obras com prejuízo"
          valor={String(comPrejuizo)}
          icone="lucide:triangle-alert"
          variante={comPrejuizo > 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
      </div>

      {!isLoading ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-bold text-card-foreground">
            Margem por obra
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(220, dadosGrafico.length * 40)}>
            <BarChart
              data={dadosGrafico}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis
                type="category"
                dataKey="nome"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                width={120}
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
              <Bar dataKey="margem" radius={[0, 4, 4, 0]}>
                {dadosGrafico.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.margem < 0 ? "var(--color-destructive)" : "var(--color-primary)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                <th className="px-4 py-3 font-medium">Obra</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Receita</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium">Margem %</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.os_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {r.os_numero}
                    {obraNome(r.os_id) ? (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {obraNome(r.os_id)}
                      </span>
                    ) : null}
                    {r.custo_incompleto ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Custo incompleto
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground">{nomeDoCliente(r.cliente_id)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.receita)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.custo)}</td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      r.margem < 0 && "text-destructive",
                    )}
                  >
                    {formatBRL(r.margem)}
                    {r.margem < 0 ? (
                      <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-normal text-destructive">
                        Prejuízo
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPercentual(r.margem_percentual)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelecionado(r)}>
                      Ver detalhamento
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DetalheObraDialog
        osNumero={selecionado?.os_numero ?? null}
        obraNome={selecionado ? obraNome(selecionado.os_id) : null}
        resultado={selecionado}
        nomeDoEquipamento={nomeDoEquipamento}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      />
    </div>
  );
}
