import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { LinhaBarra } from "@/shared/components/linha-barra";
import { EmptyState } from "@/shared/components/empty-state";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { comprasDieselStore } from "@/features/diesel/compras-diesel-store";
import { parametrosStore } from "@/features/parametros/parametros-store";
import {
  indicadoresPorEquipamento,
  custoAbastecimento,
  type PeriodoFiltro,
} from "@/features/diesel/derivacoes";
import { estadoDoTanque } from "@/features/diesel/tanque";
import { TanqueCard } from "@/features/diesel/components/tanque-card";
import { baixarCsv, campoCsv, montarCsv, numeroCsv } from "@/shared/lib/exportar-csv";
import { brlExato, numero } from "@/features/retaguarda/format";
import { formatHorimetro, formatDataHora } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

type PeriodoPreset = "30d" | "90d" | "tudo";

const ROTULO_PRESET: Record<PeriodoPreset, string> = {
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
  tudo: "todo o período",
};

function periodoDePreset(preset: PeriodoPreset): PeriodoFiltro | undefined {
  if (preset === "tudo") return undefined;
  const dias = preset === "30d" ? 30 : 90;
  const hoje = new Date();
  const de = new Date(hoje);
  de.setDate(de.getDate() - dias);
  return { de: de.toISOString().slice(0, 10), ate: hoje.toISOString().slice(0, 10) };
}

const CABECALHO_CSV = [
  "Data",
  "Equipamento",
  "Origem",
  "Horímetro",
  "Litros",
  "R$/L",
  "Valor",
] as const;

export function DieselPage() {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useCompletos();
  const compras = comprasDieselStore.useTodas();
  const parametros = parametrosStore.useParametros();
  const [preset, setPreset] = useState<PeriodoPreset>("30d");

  const periodo = useMemo(() => periodoDePreset(preset), [preset]);
  const equipamentosAtivos = useMemo(() => equipamentos.filter((e) => e.ativo), [equipamentos]);
  const indicadores = useMemo(
    () => indicadoresPorEquipamento(equipamentos, abastecimentos, apontamentos, periodo),
    [equipamentos, abastecimentos, apontamentos, periodo],
  );

  // Filtra por equipamento ATIVO também (não só por período), para bater com
  // indicadoresPorEquipamento — que já exclui equipamentos inativos.
  const abastecimentosDoPeriodo = useMemo(() => {
    const idsAtivos = new Set(equipamentosAtivos.map((e) => e.id));
    return abastecimentos
      .filter((a) => {
        if (!idsAtivos.has(a.equipamento_id)) return false;
        if (!periodo) return true;
        const dia = a.abastecido_em.slice(0, 10);
        return dia >= periodo.de && dia <= periodo.ate;
      })
      .sort((a, b) => b.abastecido_em.localeCompare(a.abastecido_em));
  }, [abastecimentos, equipamentosAtivos, periodo]);

  const tanque = useMemo(
    () => estadoDoTanque(compras, abastecimentos, parametros?.tanque_capacidade_litros ?? 0),
    [compras, abastecimentos, parametros],
  );

  const totalLitrosPeriodo = abastecimentosDoPeriodo.reduce((s, a) => s + a.litros, 0);
  const totalCustoPeriodo = abastecimentosDoPeriodo.reduce(
    (s, a) => s + (custoAbastecimento(a) ?? 0),
    0,
  );
  // Preço médio ponderado: só entram os abastecimentos que têm custo apurado,
  // senão o litro sairia barato por causa dos registros sem preço.
  const comCusto = abastecimentosDoPeriodo.filter((a) => custoAbastecimento(a) != null);
  const litrosComCusto = comCusto.reduce((s, a) => s + a.litros, 0);
  const precoMedio = litrosComCusto > 0 ? totalCustoPeriodo / litrosComCusto : null;

  const totalHorasPeriodo = indicadores.reduce((s, i) => s + i.horas_periodo, 0);
  const consumoMedioFrota = totalHorasPeriodo > 0 ? totalLitrosPeriodo / totalHorasPeriodo : null;

  const nomeDoEquipamento = (id: string) =>
    equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento";

  const comConsumo = useMemo(
    () =>
      indicadores
        .filter((i) => i.consumo_medio_l_h != null)
        .sort((a, b) => (b.consumo_medio_l_h ?? 0) - (a.consumo_medio_l_h ?? 0)),
    [indicadores],
  );
  const maiorConsumo = comConsumo[0]?.consumo_medio_l_h ?? 0;

  const exportar = () => {
    if (abastecimentosDoPeriodo.length === 0) {
      toast.error("Nada para exportar neste período.");
      return;
    }
    const csv = montarCsv(
      CABECALHO_CSV,
      abastecimentosDoPeriodo.map((a) => [
        campoCsv(formatDataHora(a.abastecido_em)),
        campoCsv(nomeDoEquipamento(a.equipamento_id)),
        a.origem === "tanque" ? "Tanque interno" : campoCsv(a.local ?? "Externo"),
        numeroCsv(a.horimetro, 1),
        numeroCsv(a.litros),
        numeroCsv(a.preco_litro),
        numeroCsv(custoAbastecimento(a)),
      ]),
    );
    baixarCsv(`diesel-${preset}.csv`, csv);
    toast.success("Planilha baixada.");
  };

  const semDados = abastecimentos.length === 0 && compras.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Diesel
        </h1>
        <CardPill>{ROTULO_PRESET[preset]}</CardPill>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="gap-2" onClick={exportar}>
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            Exportar
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/diesel/compra">
              <Icon icon="lucide:database" className="h-4 w-4" />
              Comprar diesel
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin/diesel/novo">
              <Icon icon="lucide:fuel" className="h-4 w-4" />
              Novo abastecimento
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["30d", "90d", "tudo"] as const).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={preset === p ? "secondary" : "ghost"}
            onClick={() => setPreset(p)}
          >
            {p === "tudo" ? "Tudo" : p === "30d" ? "30 dias" : "90 dias"}
          </Button>
        ))}
      </div>

      {semDados ? (
        <EmptyState
          icon="lucide:fuel"
          titulo="Sem dados de diesel"
          descricao="Nenhum abastecimento ou compra registrado ainda."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiHeroi
              rotulo="Diesel no período"
              valor={brlExato.format(totalCustoPeriodo)}
              icone="lucide:fuel"
              rodape={`${abastecimentosDoPeriodo.length} abastecimentos`}
            />
            <KpiHeroi
              rotulo="Litros no período"
              valor={`${numero.format(totalLitrosPeriodo)} L`}
              icone="lucide:gauge"
              rodape={ROTULO_PRESET[preset]}
            />
            <KpiHeroi
              rotulo="Preço médio do litro"
              valor={precoMedio != null ? brlExato.format(precoMedio) : "—"}
              icone="lucide:dollar-sign"
              rodape={
                tanque.custoMedioLitro != null
                  ? `tanque ${brlExato.format(tanque.custoMedioLitro)}`
                  : "sem preço no tanque"
              }
            />
            <KpiHeroi
              rotulo="Consumo médio"
              valor={consumoMedioFrota != null ? `${numero.format(consumoMedioFrota)} L/h` : "—"}
              icone="lucide:truck"
              rodape="frota em operação"
            />
          </section>

          <div className="grid items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-4">
              <CardSecao
                titulo="Abastecimentos"
                icone="lucide:fuel"
                acessorio={<CardPill>{abastecimentosDoPeriodo.length} no período</CardPill>}
              >
                {abastecimentosDoPeriodo.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    Nenhum abastecimento neste período.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                          <th className="px-4 py-3 font-medium">Data</th>
                          <th className="px-4 py-3 font-medium">Equipamento</th>
                          <th className="px-4 py-3 font-medium">Origem</th>
                          <th className="px-4 py-3 text-right font-medium">Horímetro</th>
                          <th className="px-4 py-3 text-right font-medium">Litros</th>
                          <th className="px-4 py-3 text-right font-medium">R$/L</th>
                          <th className="px-4 py-3 text-right font-medium">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {abastecimentosDoPeriodo.map((a) => {
                          const custo = custoAbastecimento(a);
                          return (
                            <tr key={a.id} className="border-b last:border-b-0 hover:bg-surface/50">
                              <td className="px-4 py-3 font-mono text-xs">
                                {formatDataHora(a.abastecido_em)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-primary">
                                    <Icon icon="lucide:truck" className="h-3.5 w-3.5" aria-hidden />
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {nomeDoEquipamento(a.equipamento_id)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {a.origem === "tanque" ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                    <Icon icon="lucide:database" className="h-3 w-3" />
                                    Tanque interno
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {a.local ?? "Externo"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {formatHorimetro(a.horimetro)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {numero.format(a.litros)} L
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {a.preco_litro != null ? brlExato.format(a.preco_litro) : "—"}
                              </td>
                              <td
                                className={cn(
                                  "px-4 py-3 text-right font-mono",
                                  custo == null && "text-foreground-faint",
                                )}
                              >
                                {custo != null ? brlExato.format(custo) : "—"}
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
                  Cada abastecimento entra no cálculo do{" "}
                  <strong className="text-foreground">Custo da Hora</strong> pelo horímetro do
                  equipamento. Compras de diesel geram uma conta em{" "}
                  <strong className="text-foreground">Financeiro › Contas a pagar</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <CardSecao
                titulo="Consumo por equipamento"
                icone="lucide:gauge"
                acessorio={<CardPill>L/h no período</CardPill>}
                bodyClassName="p-4"
              >
                {comConsumo.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Sem horas apontadas para calcular consumo.
                  </p>
                ) : (
                  <ul className="space-y-3.5">
                    {comConsumo.map((i) => (
                      <LinhaBarra
                        key={i.equipamento.id}
                        icone="lucide:truck"
                        titulo={i.equipamento.nome}
                        valor={`${numero.format(i.consumo_medio_l_h ?? 0)} L/h`}
                        proporcao={maiorConsumo > 0 ? (i.consumo_medio_l_h ?? 0) / maiorConsumo : 0}
                        rodape={`${numero.format(i.litros_periodo)} L em ${formatHorimetro(i.horas_periodo)}`}
                      />
                    ))}
                  </ul>
                )}
              </CardSecao>

              <TanqueCard tanque={tanque} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
