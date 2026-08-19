import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp, Clock, Receipt, CalendarRange } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, numero } from "@/features/retaguarda/format";
import { exportarFaturamentoPdf } from "@/features/retaguarda/export-faturamento-pdf";
import {
  porCliente,
  porEquipamento,
  rangeDePreset,
  resumoDoPeriodo,
  serieMensal,
  type PeriodoPreset,
} from "@/features/faturamento/analise";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
import type { FaturamentoMes } from "@/shared/types";
import { cn } from "@/lib/utils";

const CORES = ["#FFB300", "#A2622F", "#717A82", "#C07B43", "#2C2719"];

export function AnaliseTab() {
  const faturamentos = faturamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const clientes = clientesStore.useAll();
  const { isLoading, error, retry } = combinarEstados(
    { estado: faturamentosStore.useEstado(), retry: faturamentosStore.retry },
    { estado: equipamentosStore.useEstado(), retry: equipamentosStore.retry },
    { estado: clientesStore.useEstado(), retry: clientesStore.retry },
  );

  const meses = useMemo(() => serieMensal(faturamentos), [faturamentos]);

  const [preset, setPreset] = useState<PeriodoPreset>("6m");
  const [rangeManual, setRangeManual] = useState<{ de: string; ate: string } | null>(null);

  // O recorte depende dos meses que EXISTEM na base, e a base chega depois da
  // primeira renderização. Guardar o range só quando a pessoa mexe nele
  // (`rangeManual`) evita congelar um intervalo calculado sobre lista vazia.
  const { de, ate } = rangeManual ?? rangeDePreset(preset, meses);

  const aplicarPreset = (p: PeriodoPreset) => {
    setPreset(p);
    setRangeManual(p === "custom" ? rangeDePreset("custom", meses) : null);
  };

  const {
    meses: mesesFiltrados,
    totalHoras,
    totalValor,
    ticketMedio,
  } = useMemo(() => resumoDoPeriodo(meses, { de, ate }), [meses, de, ate]);

  const equipamentosFiltrados = useMemo(
    () => porEquipamento(faturamentos, equipamentos, de, ate),
    [faturamentos, equipamentos, de, ate],
  );

  const clientesFiltrados = useMemo(
    () => porCliente(faturamentos, clientes, de, ate),
    [faturamentos, clientes, de, ate],
  );

  const totalHorasPeriodo = totalHoras;
  const totalValorPeriodo = totalValor;
  const semDados = mesesFiltrados.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center"
      >
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <CalendarRange className="h-4 w-4" />
            Período
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "3m", label: "Últimos 3 meses" },
                { id: "6m", label: "Últimos 6 meses" },
                { id: "ytd", label: "Ano atual" },
                { id: "custom", label: "Personalizado" },
              ] as { id: PeriodoPreset; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => aplicarPreset(opt.id)}
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

          <div className="ml-auto flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-mono uppercase text-foreground-faint">De</Label>
              <SeletorMes
                valor={de}
                meses={meses}
                aoMudar={(v) => {
                  setPreset("custom");
                  setRangeManual({ de: v, ate: v > ate ? v : ate });
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-mono uppercase text-foreground-faint">Até</Label>
              <SeletorMes
                valor={ate}
                meses={meses}
                aoMudar={(v) => {
                  setPreset("custom");
                  setRangeManual({ de: v < de ? v : de, ate: v });
                }}
              />
            </div>
            <Button
              onClick={() =>
                exportarFaturamentoPdf({
                  meses: mesesFiltrados,
                  equipamentos: equipamentosFiltrados,
                  clientes: clientesFiltrados,
                  periodo: { de, ate },
                })
              }
              disabled={semDados}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi rotulo="Faturamento total" valor={brl.format(totalValorPeriodo)} icone={Receipt} />
        <Kpi
          rotulo="Horas faturadas"
          valor={`${numero.format(totalHorasPeriodo)} h`}
          icone={Clock}
        />
        <Kpi rotulo="Ticket médio / hora" valor={brl.format(ticketMedio)} icone={TrendingUp} />
      </div>

      {semDados ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          {meses.length === 0
            ? "Nenhuma nota faturada ainda — a análise aparece quando a primeira OS for faturada."
            : "Sem faturamento no período selecionado."}
        </div>
      ) : (
        <>
          <Card titulo="Faturamento mensal" descricao="Valor faturado por mês (R$)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mesesFiltrados} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card titulo="Horas faturadas por equipamento" descricao="Horas trabalhadas no período">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={equipamentosFiltrados}
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
                    dataKey="equipamento_nome"
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
                    formatter={(v: number) => `${numero.format(v)} h`}
                  />
                  <Bar dataKey="horas" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card
              titulo="Faturamento por cliente"
              descricao="Participação no faturamento do período"
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={clientesFiltrados}
                    dataKey="valor"
                    nameKey="cliente_nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={2}
                  >
                    {clientesFiltrados.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} stroke="var(--color-card)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-card-foreground)",
                    }}
                    formatter={(v: number) => brl.format(v)}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card titulo="Detalhamento mensal" descricao="Horas e valores por mês">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                    <th className="py-2 pr-4">Mês</th>
                    <th className="py-2 pr-4">Horas faturadas</th>
                    <th className="py-2 pr-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {mesesFiltrados.map((m) => (
                    <tr key={m.mes} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{m.rotulo}</td>
                      <td className="py-2 pr-4 font-mono">{numero.format(m.horas_faturadas)} h</td>
                      <td className="py-2 pr-4 text-right font-mono font-semibold">
                        {brl.format(m.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="py-2 pr-4">Total</td>
                    <td className="py-2 pr-4 font-mono">{numero.format(totalHorasPeriodo)} h</td>
                    <td className="py-2 pr-4 text-right font-mono">
                      {brl.format(totalValorPeriodo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// Só oferece meses que têm faturamento. Listar todo o calendário permitiria
// escolher um recorte que a base garantidamente não cobre.
function SeletorMes({
  valor,
  meses,
  aoMudar,
}: {
  valor: string;
  meses: FaturamentoMes[];
  aoMudar: (v: string) => void;
}) {
  return (
    <Select value={valor} onValueChange={aoMudar} disabled={meses.length === 0}>
      <SelectTrigger className="h-9 w-[140px]">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {meses.map((m) => (
          <SelectItem key={m.mes} value={m.mes}>
            {m.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Kpi({
  rotulo,
  valor,
  icone: Icone,
}: {
  rotulo: string;
  valor: string;
  icone: LucideIcon;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
          {rotulo}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icone className="h-4 w-4" />
        </div>
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
