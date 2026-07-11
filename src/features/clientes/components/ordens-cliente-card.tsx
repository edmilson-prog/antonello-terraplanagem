import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardPill, CardSecao } from "@/shared/components/card-secao";
import { StatusOSBadge } from "@/features/ordem-servico/labels";
import type { StatusOS } from "@/shared/types";

export interface OrdemClienteView {
  id: string;
  numero: string;
  obraNome: string;
  status: StatusOS;
  horas: string;
  valor: string;
}

export function OrdensClienteCard({ ordens }: { ordens: OrdemClienteView[] }) {
  return (
    <CardSecao
      titulo="Ordens de Serviço"
      icone="lucide:clipboard-list"
      acessorio={<CardPill>{ordens.length} vinculadas</CardPill>}
      bodyClassName="p-2"
    >
      {ordens.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:clipboard-x" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Nenhuma OS registrada para este cliente.</p>
        </div>
      ) : (
        <ul>
          {ordens.map((os) => (
            <li key={os.id} className="not-first:border-t not-first:border-border">
              <Link
                to="/admin/ordens/$ordemId"
                params={{ ordemId: os.id }}
                className="flex items-center gap-3.5 rounded-lg px-3 py-3 hover:bg-surface/50 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="w-16 shrink-0 font-mono text-[13px] font-bold text-foreground">
                  {os.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {os.obraNome}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground-faint">
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:clock" className="h-3 w-3" />
                      {os.horas}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:banknote" className="h-3 w-3" />
                      {os.valor}
                    </span>
                  </div>
                </div>
                <StatusOSBadge status={os.status} className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
