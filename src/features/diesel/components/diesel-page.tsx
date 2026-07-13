import { useMemo, useState } from "react";
import { Fuel, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import {
  indicadoresPorEquipamento,
  custoAbastecimento,
  type PeriodoFiltro,
} from "@/features/diesel/derivacoes";
import { RegistrarAbastecimentoDialog } from "@/features/diesel/components/registrar-abastecimento-dialog";
import { brlExato, numero } from "@/features/retaguarda/format";
import { formatHorimetro, formatDataHora } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

type PeriodoPreset = "30d" | "90d" | "tudo";

function periodoDePreset(preset: PeriodoPreset): PeriodoFiltro | undefined {
  if (preset === "tudo") return undefined;
  const dias = preset === "30d" ? 30 : 90;
  const hoje = new Date();
  const de = new Date(hoje);
  de.setDate(de.getDate() - dias);
  return { de: de.toISOString().slice(0, 10), ate: hoje.toISOString().slice(0, 10) };
}

export function DieselPage() {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const [preset, setPreset] = useState<PeriodoPreset>("30d");
  const [dialogAberto, setDialogAberto] = useState(false);

  const periodo = useMemo(() => periodoDePreset(preset), [preset]);
  const equipamentosAtivos = useMemo(() => equipamentos.filter((e) => e.ativo), [equipamentos]);
  const indicadores = useMemo(
    () => indicadoresPorEquipamento(equipamentos, abastecimentos, apontamentos, periodo),
    [equipamentos, abastecimentos, apontamentos, periodo],
  );

  // Filtra por equipamento ATIVO também (não só por período), para bater com
  // indicadoresPorEquipamento — que já exclui equipamentos inativos. Sem
  // isso, "Custo no período" poderia divergir de "Litros no período" se um
  // equipamento desativado tivesse abastecimento com custo registrado.
  const abastecimentosDoPeriodo = useMemo(() => {
    const idsAtivos = new Set(equipamentosAtivos.map((e) => e.id));
    return abastecimentos.filter((a) => {
      if (!idsAtivos.has(a.equipamento_id)) return false;
      if (!periodo) return true;
      const data = a.abastecido_em.slice(0, 10);
      return data >= periodo.de && data <= periodo.ate;
    });
  }, [abastecimentos, equipamentosAtivos, periodo]);

  const totalLitrosPeriodo = indicadores.reduce((s, i) => s + i.litros_periodo, 0);
  const totalCustoPeriodo = abastecimentosDoPeriodo.reduce(
    (s, a) => s + (custoAbastecimento(a) ?? 0),
    0,
  );

  const semDados = abastecimentos.length === 0;

  const dadosGrafico = indicadores
    .filter((i) => i.consumo_medio_l_h !== null)
    .map((i) => ({ nome: i.equipamento.nome, consumo: i.consumo_medio_l_h ?? 0 }))
    .sort((a, b) => b.consumo - a.consumo);

  const listaAbastecimentos = [...abastecimentos].sort((a, b) =>
    b.abastecido_em.localeCompare(a.abastecido_em),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Diesel"
        descricao="Consumo e utilização por equipamento."
        acoes={
          <Button
            onClick={() => setDialogAberto(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Registrar abastecimento
          </Button>
        }
      />

      {semDados ? (
        <EmptyState
          icone={Fuel}
          titulo="Sem dados de diesel"
          descricao="Nenhum abastecimento registrado ainda."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "30d", label: "Últimos 30 dias" },
                { id: "90d", label: "Últimos 90 dias" },
                { id: "tudo", label: "Tudo" },
              ] as { id: PeriodoPreset; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreset(opt.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  preset === opt.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Kpi rotulo="Litros no período" valor={`${numero.format(totalLitrosPeriodo)} L`} />
            <Kpi rotulo="Custo no período" valor={brlExato.format(totalCustoPeriodo)} />
          </div>

          {dadosGrafico.length > 0 ? (
            <Card titulo="Consumo médio por equipamento" descricao="Litros por hora trabalhada">
              <ResponsiveContainer width="100%" height={280}>
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
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-card-foreground)",
                    }}
                    formatter={(v: number) => `${numero.format(v)} L/h`}
                  />
                  <Bar dataKey="consumo" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ) : null}

          <Card
            titulo="Indicadores por equipamento"
            descricao="Consumo médio e utilização no período"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                    <th className="py-2 pr-4">Equipamento</th>
                    <th className="py-2 pr-4">Litros</th>
                    <th className="py-2 pr-4">Horas</th>
                    <th className="py-2 pr-4">Consumo médio</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.map((i) => (
                    <tr key={i.equipamento.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{i.equipamento.nome}</td>
                      <td className="py-2 pr-4 font-mono">{numero.format(i.litros_periodo)} L</td>
                      <td className="py-2 pr-4 font-mono">{formatHorimetro(i.horas_periodo)}</td>
                      <td className="py-2 pr-4 font-mono">
                        {i.consumo_medio_l_h != null
                          ? `${numero.format(i.consumo_medio_l_h)} L/h`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card titulo="Abastecimentos" descricao="Histórico completo, mais recentes primeiro">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Equipamento</th>
                    <th className="py-2 pr-4">Litros</th>
                    <th className="py-2 pr-4">Horímetro</th>
                    <th className="py-2 pr-4">Custo</th>
                    <th className="py-2 pr-4">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {listaAbastecimentos.map((a) => {
                    const eq = equipamentos.find((e) => e.id === a.equipamento_id);
                    const custo = custoAbastecimento(a);
                    return (
                      <tr key={a.id} className="border-b last:border-b-0">
                        <td className="py-2 pr-4 font-mono">{formatDataHora(a.abastecido_em)}</td>
                        <td className="py-2 pr-4">{eq?.nome ?? "Equipamento"}</td>
                        <td className="py-2 pr-4 font-mono">{numero.format(a.litros)} L</td>
                        <td className="py-2 pr-4 font-mono">{formatHorimetro(a.horimetro)}</td>
                        <td className="py-2 pr-4 font-mono">
                          {custo != null ? brlExato.format(custo) : "—"}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">{a.local ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <RegistrarAbastecimentoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        equipamentos={equipamentosAtivos}
      />
    </div>
  );
}

function Kpi({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
        {rotulo}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-card-foreground">{valor}</div>
    </div>
  );
}

function Card({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">{titulo}</h2>
        {descricao ? <p className="text-xs text-muted-foreground">{descricao}</p> : null}
      </div>
      {children}
    </section>
  );
}
