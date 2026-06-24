import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/shared/components/empty-state";
import { StatusOrdemBadge } from "@/features/operador/status-ordem-badge";
import { ordensOperador } from "@/mocks/ordens-operador";
import type { OrdemStatus } from "@/shared/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ordens/")({
  head: () => ({ meta: [{ title: "Minhas OS · Antonello" }] }),
  component: MinhasOrdensPage,
});

const filtros: { id: "todas" | OrdemStatus; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "aberta", label: "Abertas" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluídas" },
];

function MinhasOrdensPage() {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["id"]>("todas");
  const [busca, setBusca] = useState("");

  const ordens = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ordensOperador.filter((o) => {
      if (filtro !== "todas" && o.status !== filtro) return false;
      if (!termo) return true;
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.cliente_nome.toLowerCase().includes(termo) ||
        o.obra.toLowerCase().includes(termo)
      );
    });
  }, [filtro, busca]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por número, cliente ou obra"
          className="h-11 pl-9"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {filtros.map((f) => {
            const ativo = filtro === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
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
