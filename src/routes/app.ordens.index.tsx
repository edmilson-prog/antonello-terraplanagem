import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/shared/components/empty-state";
import { StatusOrdemBadge } from "@/features/operador/status-ordem-badge";
import { useOrdens } from "@/features/operador/ordens-store";
import type { OrdemStatus } from "@/shared/types";
import { cn } from "@/lib/utils";

type FiltroId = "todas" | OrdemStatus;

const FILTROS_VALIDOS: FiltroId[] = ["todas", "aberta", "em_andamento", "concluida"];

interface OrdensSearch {
  q: string;
  status: FiltroId;
}

export const Route = createFileRoute("/app/ordens/")({
  validateSearch: (raw: Record<string, unknown>): OrdensSearch => {
    const q = typeof raw.q === "string" ? raw.q : "";
    const status =
      typeof raw.status === "string" && FILTROS_VALIDOS.includes(raw.status as FiltroId)
        ? (raw.status as FiltroId)
        : "todas";
    return { q, status };
  },
  head: () => ({ meta: [{ title: "Minhas OS · Antonello" }] }),
  component: MinhasOrdensPage,
});

const filtros: { id: FiltroId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "aberta", label: "Abertas" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluídas" },
];

function MinhasOrdensPage() {
  const { q, status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const todas = useOrdens();

  const ordens = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todas.filter((o) => {
      if (status !== "todas" && o.status !== status) return false;
      if (!termo) return true;
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.cliente_nome.toLowerCase().includes(termo) ||
        o.obra.toLowerCase().includes(termo)
      );
    });
  }, [status, q, todas]);

  const setBusca = (valor: string) =>
    navigate({
      search: (prev) => ({ ...prev, q: valor }),
      replace: true,
    });

  const setStatus = (novo: FiltroId) =>
    navigate({
      search: (prev) => ({ ...prev, status: novo }),
      replace: true,
    });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por número, cliente ou obra"
          className="h-11 pl-9"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {filtros.map((f) => {
            const ativo = status === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatus(f.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  ativo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface/50 text-muted-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {ordens.length === 0 ? (
        <EmptyState
          icone={FileText}
          titulo="Nenhuma OS encontrada"
          descricao="Ajuste os filtros ou aguarde a recepção atribuir uma nova ordem."
        />
      ) : (
        <ul className="space-y-3">
          {ordens.map((o) => (
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
                    <StatusOrdemBadge status={o.status} />
                  </div>
                  <div className="truncate font-display text-base font-bold text-card-foreground">
                    {o.cliente_nome}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{o.obra}</div>
                  <div className="truncate text-[11px] text-foreground-faint">
                    {o.equipamento_nome}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-foreground-faint" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
