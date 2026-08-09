import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

export interface FaixaIndicadoresProps {
  executado: number;
  recebido: number;
  osAbertas: number;
  osFechadasNoPeriodo: number;
  contasVencidas: number;
  contasAVencer: number;
  alertasManutencao: number;
}

// Indicadores que o dashboard já mostrava antes do UI kit e que o novo desenho
// não tem entre os 4 KPIs-herói. Ficam numa faixa compacta logo abaixo, para
// não competir com a hierarquia do kit — decisão do usuário (2026-08-09).
export function FaixaIndicadores({
  executado,
  recebido,
  osAbertas,
  osFechadasNoPeriodo,
  contasVencidas,
  contasAVencer,
  alertasManutencao,
}: FaixaIndicadoresProps) {
  return (
    <section className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-xl border bg-card shadow-sm sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
      <Item
        rotulo="Executado"
        valor={formatBRL(executado)}
        rodape="fechadas, sem fatura"
        icone="lucide:hammer"
        para="/admin/faturamento"
      />
      <Item
        rotulo="Recebido"
        valor={formatBRL(recebido)}
        rodape="no período"
        icone="lucide:banknote"
        para="/admin/financeiro"
      />
      <Item
        rotulo="OS abertas"
        valor={String(osAbertas)}
        rodape="aguardando início"
        icone="lucide:folder-open"
        para="/admin/ordens"
      />
      <Item
        rotulo="Fechadas"
        valor={String(osFechadasNoPeriodo)}
        rodape="no período"
        icone="lucide:check-circle"
        para="/admin/ordens"
      />
      <Item
        rotulo="Contas vencidas"
        valor={String(contasVencidas)}
        rodape={`${contasAVencer} a vencer`}
        icone="lucide:alert-triangle"
        alerta={contasVencidas > 0}
        para="/admin/financeiro"
      />
      <Item
        rotulo="Alertas manut."
        valor={String(alertasManutencao)}
        rodape={alertasManutencao > 0 ? "próxima ou vencida" : "tudo em dia"}
        icone="lucide:wrench"
        alerta={alertasManutencao > 0}
        para="/admin/manutencao"
      />
    </section>
  );
}

function Item({
  rotulo,
  valor,
  rodape,
  icone,
  alerta,
  para,
}: {
  rotulo: string;
  valor: string;
  rodape: string;
  icone: string;
  alerta?: boolean;
  para: string;
}) {
  return (
    <Link
      to={para}
      className="flex min-w-0 items-center gap-2.5 px-3.5 py-3 transition-colors hover:bg-surface"
    >
      <Icon
        icon={icone}
        aria-hidden
        className={cn("h-4 w-4 shrink-0", alerta ? "text-destructive" : "text-primary")}
      />
      <div className="min-w-0">
        <div className="font-display text-[9.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </div>
        <div
          className={cn(
            "truncate font-mono text-sm font-bold",
            alerta ? "text-destructive" : "text-foreground",
          )}
        >
          {valor}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{rodape}</div>
      </div>
    </Link>
  );
}
