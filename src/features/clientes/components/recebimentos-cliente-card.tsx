import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import type { ClienteRecebimento } from "@/features/clientes/cliente-showcase-data";

export function RecebimentosClienteCard({ recebimentos }: { recebimentos: ClienteRecebimento[] }) {
  return (
    <CardSecao titulo="Recebimentos" icone="lucide:banknote" bodyClassName="p-2">
      <ul>
        {recebimentos.map((r) => (
          <li key={r.id} className="not-first:border-t not-first:border-border">
            <div className="flex items-center gap-3.5 px-3 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                <Icon icon={r.icone} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">{r.titulo}</div>
                <div className="mt-0.5 text-[11px] text-foreground-faint">{r.quando}</div>
              </div>
              <span className="shrink-0 font-mono text-foreground font-semibold">{r.valor}</span>
            </div>
          </li>
        ))}
      </ul>
    </CardSecao>
  );
}
