import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/shared/components/empty-state";
import { SyncBadge } from "@/shared/components/sync-badge";
import {
  StatusOSBadge,
  STATUS_OS_LABEL,
  TIPO_SERVICO_LABEL,
} from "@/features/ordem-servico/labels";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { clientesStore } from "@/features/clientes/clientes-store";
import type { StatusOS } from "@/shared/types";
import { cn } from "@/lib/utils";

type FiltroId = "todas" | StatusOS;
const FILTROS: { id: FiltroId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "aberta", label: STATUS_OS_LABEL.aberta },
  { id: "em_andamento", label: STATUS_OS_LABEL.em_andamento },
  { id: "fechada", label: STATUS_OS_LABEL.fechada },
];

export function OrdensOperadorPage() {
  const todas = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<FiltroId>("todas");

  const minhas = useMemo(
    () => ordensDoOperador(todas, apontamentos, getOperadorLogadoId()),
    [todas, apontamentos],
  );

  const ordens = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return minhas.filter((o) => {
      if (filtro !== "todas" && statusEfetivoOS(o, apontamentos) !== filtro) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.obra_nome.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [minhas, q, filtro, apontamentos]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número, cliente ou obra"
          className="h-11 pl-9"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                filtro === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface/50 text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {ordens.length === 0 ? (
        <EmptyState
          icon="lucide:file-text"
          titulo="Nenhuma OS encontrada"
          descricao="Ajuste os filtros ou aguarde a recepção atribuir uma nova ordem."
        />
      ) : (
        <ul className="space-y-3">
          {ordens.map((o) => {
            const cliente = clientesStore.getById(o.cliente_id);
            return (
              <li key={o.id}>
                <Link
                  to="/app/ordens/$ordemId"
                  params={{ ordemId: o.id }}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/60 active:bg-surface"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {o.numero}
                      </span>
                      <StatusOSBadge status={statusEfetivoOS(o, apontamentos)} />
                    </div>
                    <div className="truncate font-display text-base font-bold text-card-foreground">
                      {cliente?.nome ?? "Cliente"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {o.obra_nome}
                      {o.tipo_servico ? ` · ${TIPO_SERVICO_LABEL[o.tipo_servico]}` : ""}
                    </div>
                    {o.pendente_sync ? <SyncBadge /> : null}
                  </div>
                  <Icon
                    icon="lucide:chevron-right"
                    className="h-5 w-5 shrink-0 text-foreground-faint"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
