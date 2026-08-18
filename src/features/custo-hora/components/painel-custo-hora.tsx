import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  custoHoraPorEquipamento,
  resumoCustoHora,
  type CustoHoraEquipamento,
} from "@/features/custo-hora/derivacoes";
import { totalLitros } from "@/features/diesel/derivacoes";
import { variacaoPercentual } from "@/features/gerencial/derivacoes";
import { ComposicaoCustoCard } from "@/features/custo-hora/components/composicao-custo-card";
import { PrecoTabelaCard } from "@/features/custo-hora/components/preco-tabela-card";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { mesAnterior } from "@/shared/lib/periodo-mensal";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function PainelCustoHora({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useCompletos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();

  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const calcular = useMemo(
    () => (mes: string) =>
      custoHoraPorEquipamento(
        equipamentos,
        mes,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ),
    [
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    ],
  );

  const resultados = useMemo(
    () => calcular(periodo).sort((a, b) => (b.custo_por_hora ?? -1) - (a.custo_por_hora ?? -1)),
    [calcular, periodo],
  );

  const resumo = useMemo(() => resumoCustoHora(resultados), [resultados]);
  const resumoAnterior = useMemo(
    () => resumoCustoHora(calcular(mesAnterior(periodo))),
    [calcular, periodo],
  );

  // Série dos 6 meses até o período, para os sparklines. É recálculo puro sobre
  // dados já em memória — nenhuma consulta a mais.
  const series = useMemo(() => {
    const meses: string[] = [];
    let m = periodo;
    for (let i = 0; i < 6; i++) {
      meses.unshift(m);
      m = mesAnterior(m);
    }
    const resumos = meses.map((mes) => resumoCustoHora(calcular(mes)));
    return {
      custoMedio: resumos.map((r) => r.custoMedioHora ?? 0),
      horas: resumos.map((r) => r.horas),
      margem: resumos.map((r) => r.margemMediaPct ?? 0),
    };
  }, [calcular, periodo]);

  const litrosNoMes = useMemo(
    () => totalLitros(abastecimentos.filter((a) => a.abastecido_em.slice(0, 7) === periodo)),
    [abastecimentos, periodo],
  );

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";

  // O card lateral acompanha a tabela: sem seleção explícita, mostra o primeiro
  // (o de maior custo/hora). Trocar de mês não deve deixar um id órfão.
  const selecionado: CustoHoraEquipamento | null =
    resultados.find((r) => r.equipamento_id === selecionadoId) ?? resultados[0] ?? null;

  useEffect(() => {
    setSelecionadoId(null);
  }, [periodo]);

  if (componentesCusto.length === 0) {
    return (
      <EmptyState
        icon="lucide:calculator"
        titulo="Configure os componentes de custo"
        descricao="Cadastre ao menos um componente de custo (fixo mensal ou variável por hora) na aba Componentes de Custo para começar a calcular o custo por hora."
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

  return (
    <div className="space-y-4">
      {/* KPIs-herói do kit */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiHeroi
          rotulo="Custo médio da hora"
          valor={resumo.custoMedioHora != null ? formatBRL(resumo.custoMedioHora) : "—"}
          icone="lucide:calculator"
          rodape="ponderado pelas horas"
          spark={series.custoMedio}
        />
        <KpiHeroi
          rotulo="Horas apontadas"
          valor={formatHorimetro(resumo.horas)}
          icone="lucide:clock"
          variacao={variacaoPercentual(resumo.horas, resumoAnterior.horas)}
          rodape="vs. mês anterior"
          spark={series.horas}
          para="/admin/ordens"
        />
        <KpiHeroi
          rotulo="Diesel no mês"
          valor={formatBRL(resumo.custoDiesel)}
          icone="lucide:fuel"
          rodape={
            litrosNoMes > 0
              ? `${litrosNoMes.toLocaleString("pt-BR")} L consumidos`
              : "sem abastecimentos"
          }
          para="/admin/diesel"
        />
        <KpiHeroi
          rotulo="Margem média"
          valor={resumo.margemMediaPct != null ? `${Math.round(resumo.margemMediaPct)}%` : "—"}
          icone="lucide:trending-up"
          variacao={
            resumo.margemMediaPct != null && resumoAnterior.margemMediaPct != null
              ? variacaoPercentual(resumo.margemMediaPct, resumoAnterior.margemMediaPct)
              : null
          }
          rodape="vs. mês anterior"
          spark={series.margem}
        />
      </section>

      {/* Indicadores que a tela já mostrava e que não estão entre os KPIs do kit */}
      <section className="grid grid-cols-2 divide-x divide-border overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <Icon icon="lucide:wallet" aria-hidden className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="font-display text-[9.5px] font-semibold uppercase tracking-widest text-foreground-faint">
              Custo total no período
            </div>
            <div className="truncate font-mono text-sm font-bold text-foreground">
              {formatBRL(resumo.custoTotal)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <Icon
            icon="lucide:triangle-alert"
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0",
              resumo.margensNegativas > 0 ? "text-destructive" : "text-primary",
            )}
          />
          <div className="min-w-0">
            <div className="font-display text-[9.5px] font-semibold uppercase tracking-widest text-foreground-faint">
              Margem negativa
            </div>
            <div
              className={cn(
                "truncate font-mono text-sm font-bold",
                resumo.margensNegativas > 0 ? "text-destructive" : "text-foreground",
              )}
            >
              {resumo.margensNegativas}{" "}
              <span className="text-[11px] font-normal text-muted-foreground">
                {resumo.margensNegativas === 1 ? "equipamento" : "equipamentos"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <CardSecao
            titulo="Custo por equipamento"
            icone="lucide:calculator"
            acessorio={
              <CardPill>
                {resultados.length} {resultados.length === 1 ? "equipamento" : "equipamentos"}
              </CardPill>
            }
          >
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                      <th className="px-4 py-3 font-medium">Equipamento</th>
                      <th className="px-4 py-3 text-right font-medium">Horas</th>
                      <th className="px-4 py-3 text-right font-medium">Custo/h</th>
                      <th className="px-4 py-3 text-right font-medium">Preço/h</th>
                      <th className="px-4 py-3 text-right font-medium">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((r) => {
                      const ativo = selecionado?.equipamento_id === r.equipamento_id;
                      return (
                        <tr
                          key={r.equipamento_id}
                          onClick={() => setSelecionadoId(r.equipamento_id)}
                          aria-selected={ativo}
                          className={cn(
                            "cursor-pointer border-b last:border-b-0 transition-colors hover:bg-surface/50",
                            ativo && "bg-primary/5",
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  "grid h-6 w-6 shrink-0 place-items-center rounded-md",
                                  ativo
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-surface text-primary",
                                )}
                              >
                                <Icon icon="lucide:truck" className="h-3.5 w-3.5" aria-hidden />
                              </span>
                              <span className="font-medium text-foreground">
                                {nomeDoEquipamento(r.equipamento_id)}
                              </span>
                              {r.configuracao_incompleta ? (
                                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                                  Config. incompleta
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {formatHorimetro(r.horas_trabalhadas)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {r.custo_por_hora != null ? formatBRL(r.custo_por_hora) : "Sem horas"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {r.preco_hora != null ? formatBRL(r.preco_hora) : "Sem preço"}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-mono font-semibold",
                              r.margem_hora != null && r.margem_hora < 0 && "text-destructive",
                            )}
                          >
                            {r.margem_hora != null ? formatBRL(r.margem_hora) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardSecao>

          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
            <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              O custo da hora soma <strong className="text-foreground">diesel</strong>,{" "}
              <strong className="text-foreground">manutenção</strong> e os{" "}
              <strong className="text-foreground">componentes de custo</strong> do equipamento,
              rateados pelas horas apontadas no mês. Valores ficam restritos a este módulo,
              Financeiro e Rentabilidade.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <ComposicaoCustoCard
            equipamentoNome={selecionado ? nomeDoEquipamento(selecionado.equipamento_id) : null}
            resultado={selecionado}
          />
          <PrecoTabelaCard
            equipamentoNome={selecionado ? nomeDoEquipamento(selecionado.equipamento_id) : null}
            resultado={selecionado}
          />
        </div>
      </div>
    </div>
  );
}
