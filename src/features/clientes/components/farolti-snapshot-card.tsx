import type { JSX } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData } from "@/shared/lib/format";
import type { Cliente } from "@/shared/types";

// Snapshot congelado, importado do ERP legado (FarolTI) na migração do
// cadastro. Não é recalculado ao vivo pelo sistema — por isso a banda
// tracejada "aço" e o badge de "congelado", em vez do visual dos cards reais.
export function FaroltiSnapshotCard({
  cliente,
  origemMigracao,
}: {
  cliente: Cliente;
  origemMigracao: string;
}): JSX.Element | null {
  if (cliente.cli_codigo_legado == null) return null;

  const curva = cliente.legado_curva_abc;

  return (
    <section className="rounded-xl border border-dashed border-steel/40 bg-surface/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Histórico no ERP legado (FarolTI)
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Snapshot importado no cadastro (código {cliente.cli_codigo_legado}) — não é
            recalculado ao vivo pelo sistema.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-steel/40 bg-steel/15 px-2.5 py-0.5 text-xs font-medium text-foreground">
          <Icon icon="lucide:snowflake" className="h-3.5 w-3.5" />
          Importado · congelado
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Celula
          rotulo="Faturado (LTV)"
          valor={cliente.legado_ltv != null ? formatBRL(cliente.legado_ltv) : "—"}
        />
        <Celula
          rotulo="Ticket médio"
          valor={
            cliente.legado_ticket_medio != null ? formatBRL(cliente.legado_ticket_medio) : "—"
          }
        />
        <Celula
          rotulo="OS realizadas"
          valor={cliente.legado_frequencia_os != null ? String(cliente.legado_frequencia_os) : "—"}
        />
        <Celula
          rotulo="Curva ABC"
          valor={curva ?? "—"}
          valorClassName={curva === "A" ? "text-primary" : undefined}
        />
        <Celula rotulo="Primeira OS" valor={formatData(cliente.legado_primeira_os ?? null)} />
        <Celula rotulo="Última OS" valor={formatData(cliente.legado_ultima_os ?? null)} />
        <Celula
          rotulo="Recência"
          valor={
            cliente.legado_recencia_dias != null ? `${cliente.legado_recencia_dias} dias` : "—"
          }
        />
        <Celula rotulo="Origem" valor={origemMigracao} />
      </div>
    </section>
  );
}

function Celula({
  rotulo,
  valor,
  valorClassName,
}: {
  rotulo: string;
  valor: string;
  valorClassName?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
        {rotulo}
      </div>
      <div className={cn("mt-1 font-mono text-sm text-foreground", valorClassName)}>{valor}</div>
    </div>
  );
}
