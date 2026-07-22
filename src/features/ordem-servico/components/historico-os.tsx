import { Icon } from "@iconify/react";
import { formatDataHora } from "@/shared/lib/format";

export interface EventoHistoricoOS {
  data: string; // ISO 8601
  titulo: string;
  subtitulo: string;
  icone: string;
}

// Linha do tempo de eventos reais da OS (orçamento de origem, abertura,
// fechamento, faturamento, comprovante) — monta a partir de timestamps já
// existentes nas entidades relacionadas, sem inventar um conceito novo.
export function HistoricoOS({ eventos }: { eventos: EventoHistoricoOS[] }) {
  if (eventos.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Sem eventos registrados ainda.</p>;
  }

  const ordenados = [...eventos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <ul className="divide-y divide-border">
      {ordenados.map((e, i) => (
        <li key={i} className="flex items-start gap-3 p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
            <Icon icon={e.icone} className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">{e.titulo}</div>
            <div className="text-xs text-muted-foreground">
              {formatDataHora(e.data)} · {e.subtitulo}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
