import { createFileRoute } from "@tanstack/react-router";
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
import { Download, TrendingUp, Clock, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { brl, numero } from "@/features/retaguarda/format";
import { exportarFaturamentoPdf } from "@/features/retaguarda/export-faturamento-pdf";
import {
  faturamentoMensal,
  faturamentoPorEquipamento,
  faturamentoPorCliente,
} from "@/mocks/faturamento";

export const Route = createFileRoute("/admin/faturamento")({
  head: () => ({
    meta: [
      { title: "Faturamento · Antonello" },
      {
        name: "description",
        content: "Faturamento da Antonello Terraplanagem — horas, valores e exportação em PDF.",
      },
    ],
  }),
  component: FaturamentoPage,
});

const CORES = ["#FFB300", "#A2622F", "#717A82", "#C07B43", "#2C2719"];

function FaturamentoPage() {
  const totalValor = faturamentoMensal.reduce((s, m) => s + m.valor, 0);
  const totalHoras = faturamentoMensal.reduce((s, m) => s + m.horas_faturadas, 0);
  const ticketMedio = totalValor / totalHoras;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Faturamento"
        descricao="Visão consolidada dos últimos 6 meses com exportação em PDF."
        acoes={
          <Button
            onClick={exportarFaturamentoPdf}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi
          rotulo="Faturamento total"
          valor={brl.format(totalValor)}
          icone={Receipt}
        />
        <Kpi
          rotulo="Horas faturadas"
          valor={`${numero.format(totalHoras)} h`}
          icone={Clock}
        />
        <Kpi
          rotulo="Ticket médio / hora"
          valor={brl.format(ticketMedio)}
          icone={TrendingUp}
        />
      </div>

      <Card titulo="Faturamento mensal" descricao="Valor faturado por mês (R$)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={faturamentoMensal} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="rotulo"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
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
              data={faturamentoPorEquipamento}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
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

        <Card titulo="Faturamento por cliente" descricao="Participação no faturamento total">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={faturamentoPorCliente}
                dataKey="valor"
                nameKey="cliente_nome"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={55}
                paddingAngle={2}
              >
                {faturamentoPorCliente.map((_, i) => (
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
              {faturamentoMensal.map((m) => (
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
                <td className="py-2 pr-4 font-mono">{numero.format(totalHoras)} h</td>
                <td className="py-2 pr-4 text-right font-mono">{brl.format(totalValor)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
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
        {descricao ? (
          <p className="text-xs text-muted-foreground">{descricao}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
