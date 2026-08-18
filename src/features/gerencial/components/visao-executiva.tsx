import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { LinhaBarra } from "@/shared/components/linha-barra";
import { EmptyState } from "@/shared/components/empty-state";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { serieMensalCustoMargem, variacaoPercentual } from "@/features/gerencial/derivacoes";
import { curvaABC, faixasABC, utilizacaoFrota } from "@/features/gerencial/executivo";
import {
  margemPorCliente,
  rentabilidadePorTodasAsObras,
} from "@/features/rentabilidade/derivacoes";
import { formatPercentual } from "@/features/rentabilidade/format";
import {
  mesesDoPeriodo,
  periodoAnterior,
  type PeriodoGerencial,
} from "@/features/gerencial/periodo-gerencial";
import { useParametroNumero, useParametroTexto } from "@/features/parametros/uso";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import type { DiasUteis } from "@/shared/types";
import { cn } from "@/lib/utils";

// Aba "Visão executiva" — o desenho do UI kit (`screen-painel`) por inteiro.
// Os blocos analíticos que já existiam ficam na aba ao lado, intactos.

const TOP_CLIENTES = 5;

interface Props {
  periodo: PeriodoGerencial;
}

export function VisaoExecutiva({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useCompletos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const clientes = clientesStore.useAll();

  // Base do percentual de utilização — os dois parâmetros existem justamente
  // para isto, e esta tela é o primeiro lugar que os consulta.
  const jornada = useParametroNumero("jornada_horas", 8);
  const diasUteis = useParametroTexto("dias_uteis", "seg_sex") as DiasUteis;

  const meses = useMemo(() => mesesDoPeriodo(periodo), [periodo]);
  const mesesAnterior = useMemo(() => mesesDoPeriodo(periodoAnterior(periodo)), [periodo]);

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
    [
      meses,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    ],
  );

  const serieAnterior = useMemo(
    () =>
      serieMensalCustoMargem(
        mesesAnterior,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ),
    [
      mesesAnterior,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    ],
  );

  const totais = useMemo(() => somar(serie), [serie]);
  const totaisAnterior = useMemo(() => somar(serieAnterior), [serieAnterior]);

  const horas = useMemo(
    () =>
      apontamentos
        .filter(
          (a) =>
            a.status === "finalizado" &&
            a.finalizado_em != null &&
            meses.includes(a.finalizado_em.slice(0, 7)),
        )
        .reduce((s, a) => s + (a.horas_trabalhadas ?? 0), 0),
    [apontamentos, meses],
  );

  const osNoPeriodo = useMemo(
    () =>
      new Set(
        faturamentos.filter((f) => meses.includes(f.gerado_em.slice(0, 7))).map((f) => f.os_id),
      ).size,
    [faturamentos, meses],
  );

  // Clientes do período inteiro — o kit mostra o acumulado, não um mês.
  const porCliente = useMemo(() => {
    const obras = meses.flatMap((mes) =>
      rentabilidadePorTodasAsObras(
        ordens,
        faturamentos,
        mes,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ),
    );
    return margemPorCliente(obras);
  }, [
    meses,
    ordens,
    faturamentos,
    equipamentos,
    componentesCusto,
    abastecimentos,
    registrosManutencao,
    apontamentos,
    precosHoraMaquina,
  ]);

  const abc = useMemo(() => curvaABC(porCliente), [porCliente]);
  const faixas = useMemo(() => faixasABC(abc), [abc]);
  const topClientes = useMemo(
    () => [...porCliente].sort((a, b) => b.receita - a.receita).slice(0, TOP_CLIENTES),
    [porCliente],
  );

  const utilizacao = useMemo(
    () => utilizacaoFrota(equipamentos, apontamentos, meses, jornada, diasUteis),
    [equipamentos, apontamentos, meses, jornada, diasUteis],
  );

  const nomeDoCliente = (id: string) => clientes.find((c) => c.id === id)?.nome ?? "Cliente";
  const nomeDoEquipamento = (id: string) =>
    equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento";

  if (totais.receita === 0 && horas === 0) {
    return (
      <EmptyState
        icon="lucide:line-chart"
        titulo="Sem movimento no período"
        descricao="Nenhum faturamento gerado nem hora apontada no intervalo escolhido."
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiHeroi
          rotulo="Receita no período"
          valor={formatBRL(totais.receita)}
          icone="lucide:credit-card"
          variacao={variacaoPercentual(totais.receita, totaisAnterior.receita)}
          rodape="vs. período anterior"
          spark={serie.map((p) => p.receita)}
          para="/admin/faturamento"
        />
        <KpiHeroi
          rotulo="Resultado"
          valor={formatBRL(totais.margem)}
          icone="lucide:wallet"
          alerta={totais.margem < 0}
          rodape="receita − custo"
          spark={serie.map((p) => p.margem)}
        />
        <KpiHeroi
          rotulo="Margem média"
          valor={formatPercentual(totais.margemPercentual)}
          icone="lucide:trending-up"
          alerta={totais.margemPercentual != null && totais.margemPercentual < 0}
          variacao={
            totais.margemPercentual != null && totaisAnterior.margemPercentual != null
              ? variacaoPercentual(totais.margemPercentual, totaisAnterior.margemPercentual)
              : null
          }
          rodape="vs. período anterior"
          para="/admin/rentabilidade"
        />
        <KpiHeroi
          rotulo="Horas apontadas"
          valor={formatHorimetro(horas)}
          icone="lucide:clock"
          rodape={osNoPeriodo > 0 ? `${osNoPeriodo} OS faturadas` : "nenhuma OS faturada"}
          para="/admin/ordens"
        />
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <ResultadoPorMes serie={serie} />
          <TopClientesCard linhas={topClientes} nomeDoCliente={nomeDoCliente} />
        </div>

        <div className="space-y-4">
          <CurvaAbcCard faixas={faixas} />
          <UtilizacaoFrotaCard
            linhas={utilizacao}
            nomeDoEquipamento={nomeDoEquipamento}
            jornada={jornada}
            diasUteis={diasUteis}
          />

          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
            <Icon icon="lucide:lock" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Visão restrita à retaguarda — consolida{" "}
              <strong className="text-foreground">OS</strong>,{" "}
              <strong className="text-foreground">Faturamento</strong> e{" "}
              <strong className="text-foreground">Custo da Hora</strong>. Os números são sempre
              recalculados na leitura; nenhum mês fica congelado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function somar(serie: { receita: number; custo: number; margem: number }[]) {
  const receita = serie.reduce((s, p) => s + p.receita, 0);
  const custo = serie.reduce((s, p) => s + p.custo, 0);
  const margem = receita - custo;
  return {
    receita,
    custo,
    margem,
    // Fração, como o resto do projeto (ver features/rentabilidade/format).
    margemPercentual: receita > 0 ? margem / receita : null,
  };
}

function ResultadoPorMes({ serie }: { serie: { mes: string; rotulo: string; margem: number }[] }) {
  const valores = serie.map((p) => p.margem);
  const maior = Math.max(...valores, 0);
  const media = valores.length > 0 ? valores.reduce((s, v) => s + v, 0) / valores.length : 0;
  const pico = serie.reduce(
    (melhor, p) => (p.margem > (melhor?.margem ?? -Infinity) ? p : melhor),
    serie[0],
  );

  return (
    <CardSecao
      titulo="Resultado por mês"
      icone="lucide:line-chart"
      acessorio={<CardPill>receita − custo</CardPill>}
      bodyClassName="p-4"
    >
      <div className="flex h-44 items-end gap-1.5">
        {serie.map((ponto) => {
          const altura = maior > 0 ? Math.max(2, (ponto.margem / maior) * 100) : 2;
          const negativo = ponto.margem < 0;
          return (
            <div key={ponto.mes} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  title={`${ponto.rotulo}: ${formatBRL(ponto.margem)}`}
                  className={cn(
                    "w-full rounded-t",
                    negativo
                      ? "bg-destructive"
                      : ponto.mes === pico?.mes
                        ? "bg-primary"
                        : "bg-primary/40",
                  )}
                  style={{ height: `${negativo ? 6 : altura}%` }}
                />
              </div>
              <span className="w-full truncate text-center font-mono text-[10px] text-foreground-faint">
                {ponto.rotulo.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          Média <strong className="font-mono text-foreground">{formatBRL(media)}</strong>/mês
        </span>
        {pico ? (
          <span>
            Pico <strong className="font-mono text-foreground">{formatBRL(pico.margem)}</strong> (
            {pico.rotulo})
          </span>
        ) : null}
      </div>
    </CardSecao>
  );
}

function TopClientesCard({
  linhas,
  nomeDoCliente,
}: {
  linhas: { cliente_id: string; receita: number; margemPercentual: number | null; obras: number }[];
  nomeDoCliente: (id: string) => string;
}) {
  return (
    <CardSecao
      titulo="Top clientes"
      icone="lucide:users"
      acessorio={<CardPill>{linhas.length} no topo</CardPill>}
    >
      {linhas.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhum cliente com obra faturada no período.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 text-right font-medium">Obras</th>
                <th className="px-4 py-3 text-right font-medium">Receita</th>
                <th className="px-4 py-3 text-right font-medium">Margem</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.cliente_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-primary">
                        <Icon icon="lucide:building-2" className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="font-medium text-foreground">
                        {nomeDoCliente(linha.cliente_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{linha.obras}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatBRL(linha.receita)}</td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono font-semibold",
                      linha.margemPercentual != null &&
                        linha.margemPercentual < 0 &&
                        "text-destructive",
                    )}
                  >
                    {formatPercentual(linha.margemPercentual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardSecao>
  );
}

function CurvaAbcCard({
  faixas,
}: {
  faixas: { classe: string; clientes: number; receita: number }[];
}) {
  const total = faixas.reduce((s, f) => s + f.clientes, 0);

  return (
    <CardSecao titulo="Curva ABC de clientes" icone="lucide:trending-up" bodyClassName="p-4">
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Sem receita por cliente no período.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {faixas.map((faixa) => (
            <LinhaBarra
              key={faixa.classe}
              prefixo={
                <span className="w-14 shrink-0 font-display text-[13px] font-bold text-primary">
                  Curva {faixa.classe}
                </span>
              }
              titulo={
                <span className="text-[12.5px] font-normal text-muted-foreground">
                  {faixa.clientes} {faixa.clientes === 1 ? "cliente" : "clientes"} ·{" "}
                  {Math.round(faixa.receita * 100)}% da receita
                </span>
              }
              valor={`${Math.round(faixa.receita * 100)}%`}
              proporcao={faixa.receita}
            />
          ))}
        </ul>
      )}
    </CardSecao>
  );
}

function UtilizacaoFrotaCard({
  linhas,
  nomeDoEquipamento,
  jornada,
  diasUteis,
}: {
  linhas: {
    equipamento_id: string;
    horas: number;
    disponivel: number;
    utilizacao: number | null;
  }[];
  nomeDoEquipamento: (id: string) => string;
  jornada: number;
  diasUteis: DiasUteis;
}) {
  const rotuloDias = diasUteis === "seg_sab" ? "seg a sáb" : "seg a sex";

  return (
    <CardSecao
      titulo="Utilização da frota"
      icone="lucide:truck"
      acessorio={<CardPill>horas ÷ disponível</CardPill>}
      bodyClassName="p-4"
    >
      {linhas.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nenhum equipamento ativo.</p>
      ) : (
        <>
          <ul className="space-y-3.5">
            {linhas.map((linha) => (
              <LinhaBarra
                key={linha.equipamento_id}
                icone="lucide:truck"
                titulo={nomeDoEquipamento(linha.equipamento_id)}
                valor={linha.utilizacao != null ? `${Math.round(linha.utilizacao * 100)}%` : "—"}
                proporcao={linha.utilizacao ?? 0}
                rodape={`${formatHorimetro(linha.horas)} de ${formatHorimetro(linha.disponivel)} disponíveis`}
              />
            ))}
          </ul>
          <p className="mt-3 border-t pt-3 text-[11px] text-muted-foreground">
            Disponível = jornada de {jornada}h × dias úteis ({rotuloDias}), conforme{" "}
            <strong className="text-foreground">Parâmetros</strong>. Não desconta feriados.
          </p>
        </>
      )}
    </CardSecao>
  );
}
