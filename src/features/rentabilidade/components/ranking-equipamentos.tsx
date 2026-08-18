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
import { Icon } from "@iconify/react";
import { KpiHeroi } from "@/shared/components/kpi-heroi";
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
import {
  resumoRentabilidade,
  rentabilidadePorTodosEquipamentos,
  type RentabilidadeEquipamento,
} from "@/features/rentabilidade/derivacoes";
import { formatPercentual } from "@/features/rentabilidade/format";
import { DetalheEquipamentoDialog } from "@/features/rentabilidade/components/detalhe-equipamento-dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { mesAnterior } from "@/shared/lib/periodo-mensal";
import { variacaoPercentual } from "@/features/gerencial/derivacoes";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function RankingEquipamentos({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useCompletos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();

  const [selecionado, setSelecionado] = useState<RentabilidadeEquipamento | null>(null);

  const calcular = useMemo(
    () => (mes: string) =>
      rentabilidadePorTodosEquipamentos(
        equipamentos,
        mes,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ),
    [
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    ],
  );

  const resultados = useMemo(
    () => calcular(periodo).sort((a, b) => b.margem - a.margem),
    [calcular, periodo],
  );

  const resumo = useMemo(() => resumoRentabilidade(resultados), [resultados]);
  const resumoAnterior = useMemo(
    () => resumoRentabilidade(calcular(mesAnterior(periodo))),
    [calcular, periodo],
  );

  // Sparklines: os 6 meses até o período, como na aba de obras.
  const series = useMemo(() => {
    const meses: string[] = [];
    let m = periodo;
    for (let i = 0; i < 6; i++) {
      meses.unshift(m);
      m = mesAnterior(m);
    }
    const resumos = meses.map((mes) => resumoRentabilidade(calcular(mes)));
    return {
      margem: resumos.map((r) => r.margemPercentual ?? 0),
      resultado: resumos.map((r) => r.resultado),
      receita: resumos.map((r) => r.receita),
    };
  }, [calcular, periodo]);

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";
  const numeroDaOS = (osId: string) => ordens.find((o) => o.id === osId)?.numero ?? osId;

  const semFaturamentoNoPeriodo = !faturamentos.some((f) => f.gerado_em.slice(0, 7) === periodo);

  if (semFaturamentoNoPeriodo) {
    return (
      <EmptyState
        icon="lucide:trending-up"
        titulo="Sem faturamento no período"
        descricao="Nenhum faturamento foi gerado neste mês, então não há receita para calcular rentabilidade por equipamento."
      />
    );
  }

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

  const dadosGrafico = resultados.map((r) => ({
    nome: nomeDoEquipamento(r.equipamento_id),
    margem: r.margem,
  }));

  return (
    <div className="space-y-6">
      {/* Mesmos KPIs-herói da aba de obras — o kit desenha só a visão por OS,
          mas as duas abas mostram o mesmo tipo de número. */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiHeroi
          rotulo="Margem média"
          valor={formatPercentual(resumo.margemPercentual)}
          icone="lucide:trending-up"
          alerta={resumo.margemPercentual != null && resumo.margemPercentual < 0}
          variacao={
            resumo.margemPercentual != null && resumoAnterior.margemPercentual != null
              ? variacaoPercentual(resumo.margemPercentual, resumoAnterior.margemPercentual)
              : null
          }
          rodape="vs. mês anterior"
          spark={series.margem}
        />
        <KpiHeroi
          rotulo="Resultado no mês"
          valor={formatBRL(resumo.resultado)}
          icone="lucide:wallet"
          alerta={resumo.resultado < 0}
          rodape="receita − custo"
          spark={series.resultado}
        />
        <KpiHeroi
          rotulo="Receita"
          valor={formatBRL(resumo.receita)}
          icone="lucide:credit-card"
          variacao={variacaoPercentual(resumo.receita, resumoAnterior.receita)}
          rodape="vs. mês anterior"
          spark={series.receita}
          para="/admin/faturamento"
        />
        <KpiHeroi
          rotulo="Custo total"
          valor={formatBRL(resumo.custo)}
          icone="lucide:calculator"
          rodape="diesel + manutenção + componentes"
          para="/admin/custo-hora"
        />
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <Icon
            icon="lucide:triangle-alert"
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0",
              resumo.comPrejuizo > 0 ? "text-destructive" : "text-primary",
            )}
          />
          <div className="min-w-0">
            <div className="font-display text-[9.5px] font-semibold uppercase tracking-widest text-foreground-faint">
              Equipamentos com prejuízo
            </div>
            <div
              className={cn(
                "truncate font-mono text-sm font-bold",
                resumo.comPrejuizo > 0 ? "text-destructive" : "text-foreground",
              )}
            >
              {resumo.comPrejuizo}{" "}
              <span className="text-[11px] font-normal text-muted-foreground">
                {resumo.comPrejuizo === 1 ? "máquina no vermelho" : "máquinas no vermelho"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {!isLoading ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-bold text-card-foreground">
            Margem por equipamento
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
                width={160}
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
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Horas</th>
                <th className="px-4 py-3 font-medium">Receita</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium">Margem %</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.equipamento_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {nomeDoEquipamento(r.equipamento_id)}
                    {r.custo_incompleto ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Custo incompleto
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatHorimetro(r.horas_trabalhadas)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.receita)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.custo)}</td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      r.margem < 0 && "text-destructive",
                    )}
                  >
                    {formatBRL(r.margem)}
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

      <DetalheEquipamentoDialog
        equipamentoNome={selecionado ? nomeDoEquipamento(selecionado.equipamento_id) : null}
        resultado={selecionado}
        numeroDaOS={numeroDaOS}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      />
    </div>
  );
}
