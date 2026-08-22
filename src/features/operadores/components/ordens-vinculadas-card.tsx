import { Icon } from "@iconify/react";
import { CardPill, CardSecao } from "@/shared/components/card-secao";
import { StatusOSBadge } from "@/features/ordem-servico/labels";
import type { LinhaOrdem } from "@/features/operadores/derivacoes";

export function OrdensVinculadasCard({ ordens }: { ordens: LinhaOrdem[] }) {
  if (ordens.length === 0) {
    return (
      <CardSecao titulo="Ordens de Serviço" icone="lucide:clipboard-list" bodyClassName="p-6">
        <p className="text-center text-sm text-muted-foreground">
          Este operador não é responsável por nenhuma OS nem apontou horas em uma.
        </p>
      </CardSecao>
    );
  }

  return (
    <CardSecao
      titulo="Ordens de Serviço"
      icone="lucide:clipboard-list"
      acessorio={<CardPill>{ordens.length} vinculadas</CardPill>}
      bodyClassName="p-2"
    >
      <ul>
        {ordens.map((os) => (
          <li
            key={os.id}
            className="flex items-center gap-3.5 rounded-lg px-3 py-3 not-first:border-t not-first:border-border hover:bg-surface/50"
          >
            <span className="w-16 shrink-0 font-mono text-[13px] font-bold text-foreground">
              {os.numero}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{os.titulo}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground-faint">
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:user" className="h-3 w-3" />
                  {os.clienteNome}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:clock" className="h-3 w-3" />
                  {os.horas}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:calendar" className="h-3 w-3" />
                  {os.desde}
                </span>
              </div>
            </div>
            <StatusOSBadge status={os.status} className="shrink-0" />
          </li>
        ))}
      </ul>
    </CardSecao>
  );
}
