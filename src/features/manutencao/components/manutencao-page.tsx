import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { CardPill } from "@/shared/components/card-secao";
import { SeletorMes } from "@/shared/components/seletor-mes";
import { PlanosTab } from "@/features/manutencao/components/planos-tab";
import { ConsumoAnomaloTab } from "@/features/manutencao/components/consumo-anomalo-tab";
import { OrdensManutencaoCard } from "@/features/manutencao/components/ordens-manutencao-card";
import { PlanosHorimetroCard } from "@/features/manutencao/components/planos-horimetro-card";
import { SolicitacoesCampoCard } from "@/features/manutencao/components/solicitacoes-campo-card";
import { registrosCampoRetaguardaStore } from "@/features/registros-campo/registros-campo-retaguarda-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { solicitacoesPendentes } from "@/features/registros-campo/retaguarda-derivacoes";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { indicadoresPorEquipamento } from "@/features/diesel/derivacoes";
import { alertasManutencao, antecedenciaConfigurada } from "@/features/manutencao/derivacoes";
import { manutencaoPreditiva } from "@/features/dashboard-operacional/derivacoes";
import {
  ordensDoMes,
  resumoManutencaoMes,
  equipamentosEmManutencao,
  serieOrdensPorMes,
} from "@/features/manutencao/resumo-mes";
import {
  descreverManutencao,
  SITUACAO_REGISTRO_LABEL,
  TIPO_MANUTENCAO_LABEL,
} from "@/features/manutencao/labels";
import { alertasConsumoAnomalo } from "@/features/ia/mock/analitico";
import { baixarCsv, campoCsv, montarCsv, numeroCsv } from "@/shared/lib/exportar-csv";
import { mesAnterior, mesReferencia, rotuloMes } from "@/shared/lib/periodo-mensal";
import { brlExato } from "@/features/retaguarda/format";
import { formatData, formatHorimetro } from "@/shared/lib/format";

const MES_ATUAL = mesReferencia(new Date());

const CABECALHO_CSV = ["Data", "Equipamento", "Tipo", "Descrição", "Custo", "Situação"] as const;

export function ManutencaoPage() {
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useCompletos();
  const abastecimentos = abastecimentosStore.useCompletos();
  const apontamentos = apontamentosStore.useTodos();
  const registrosCampo = registrosCampoRetaguardaStore.useTodos();
  const operadores = operadoresStore.useAll();
  const [periodo, setPeriodo] = useState(MES_ATUAL);

  const alertas = alertasManutencao(equipamentos, planos, registros);
  const indicadores = indicadoresPorEquipamento(equipamentos, abastecimentos, apontamentos);
  const alertasConsumo = alertasConsumoAnomalo(indicadores);

  const ordens = useMemo(
    () => ordensDoMes(registros, equipamentos, periodo),
    [registros, equipamentos, periodo],
  );
  const resumo = useMemo(() => resumoManutencaoMes(registros, periodo), [registros, periodo]);
  const parados = useMemo(
    () => equipamentosEmManutencao(registros, equipamentos),
    [registros, equipamentos],
  );
  const linhasPlano = useMemo(
    () => manutencaoPreditiva(equipamentos, planos, registros),
    [equipamentos, planos, registros],
  );
  const spark = useMemo(() => serieOrdensPorMes(registros, periodo), [registros, periodo]);
  // Sem recorte de mês: um chamado sem ordem continua sendo um chamado sem
  // ordem no mês seguinte, e é justamente o antigo que não pode sumir de vista.
  const chamados = useMemo(
    () => solicitacoesPendentes(registrosCampo, registros),
    [registrosCampo, registros],
  );

  const vencidos = alertas.filter((a) => a.status === "vencida").length;
  const proximos = alertas.filter((a) => a.status === "proxima").length;
  const antecedencia = antecedenciaConfigurada();

  const exportar = () => {
    if (ordens.length === 0) {
      toast.error("Nada para exportar neste mês.");
      return;
    }
    const csv = montarCsv(
      CABECALHO_CSV,
      ordens.map(({ registro, equipamento, data }) => [
        campoCsv(formatData(data.slice(0, 10))),
        campoCsv(equipamento?.nome ?? "Equipamento removido"),
        TIPO_MANUTENCAO_LABEL[registro.tipo],
        campoCsv(descreverManutencao(registro, planos)),
        numeroCsv(registro.custo),
        SITUACAO_REGISTRO_LABEL[registro.status],
      ]),
    );
    baixarCsv(`manutencao-${periodo}.csv`, csv);
    toast.success(`Planilha de ${rotuloMes(periodo)} baixada.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Manutenção
        </h1>
        <CardPill>{rotuloMes(periodo)}</CardPill>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="gap-2" onClick={exportar}>
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            Exportar
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin/manutencao/nova">
              <Icon icon="lucide:wrench" className="h-4 w-4" />
              Nova manutenção
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manutencao">
        <TabsList>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="consumo">
            Consumo (IA){alertasConsumo.length > 0 ? ` (${alertasConsumo.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manutencao" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <SeletorMes periodo={periodo} onChange={setPeriodo} maximo={MES_ATUAL} />
          </div>

          <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiHeroi
              rotulo="Manutenções no mês"
              valor={String(resumo.total)}
              icone="lucide:wrench"
              rodape={`${resumo.preventivas} preventivas · ${resumo.corretivas} corretivas`}
              spark={spark}
            />
            <KpiHeroi
              rotulo="Custo de manutenção"
              valor={brlExato.format(resumo.custo)}
              icone="lucide:calculator"
              rodape={<VariacaoCusto variacao={resumo.variacaoCusto} periodo={periodo} />}
            />
            <KpiHeroi
              rotulo="Em manutenção"
              valor={String(parados.length)}
              icone="lucide:truck"
              rodape={
                parados.length > 0
                  ? parados.map((e) => e.nome).join(" · ")
                  : "nenhuma máquina parada"
              }
            />
            <KpiHeroi
              rotulo="Planos a vencer"
              valor={String(proximos)}
              icone="lucide:gauge"
              alerta={vencidos > 0}
              rodape={
                <>
                  próximas {formatHorimetro(antecedencia)}
                  {vencidos > 0 ? (
                    <>
                      {" · "}
                      <strong className="font-semibold text-destructive">
                        {vencidos} {vencidos === 1 ? "vencido" : "vencidos"}
                      </strong>
                    </>
                  ) : null}
                </>
              }
            />
          </section>

          <div className="grid items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-4">
              <OrdensManutencaoCard ordens={ordens} planos={planos} />

              <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
                <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Manutenções concluídas alimentam o{" "}
                  <strong className="text-foreground">Custo da Hora</strong> do equipamento no mês
                  da conclusão. O alerta antecipado de{" "}
                  <strong className="text-foreground">{formatHorimetro(antecedencia)}</strong> é
                  definido em <strong className="text-foreground">Parâmetros</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SolicitacoesCampoCard
                solicitacoes={chamados}
                equipamentos={equipamentos}
                operadores={operadores}
              />
              <PlanosHorimetroCard linhas={linhasPlano} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="planos" className="mt-4">
          <PlanosTab planos={planos} equipamentos={equipamentos} />
        </TabsContent>

        <TabsContent value="consumo" className="mt-4">
          <ConsumoAnomaloTab alertas={alertasConsumo} equipamentos={equipamentos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Custo subindo é notícia ruim, então a variação vai no rodapé pintada ao
// contrário do selo verde/vermelho padrão do KpiHeroi — é assim que o UI kit
// desenha este indicador.
function VariacaoCusto({ variacao, periodo }: { variacao: number | null; periodo: string }) {
  if (variacao === null) return <>sem base no mês anterior</>;

  const anterior = rotuloMes(mesAnterior(periodo)).split(" ")[0].toLowerCase();
  const subiu = variacao > 0;
  return (
    <>
      vs. {anterior}{" "}
      <strong className={subiu ? "font-semibold text-destructive" : "font-semibold text-primary"}>
        {subiu ? "+" : ""}
        {Math.round(variacao)}%
      </strong>
    </>
  );
}
