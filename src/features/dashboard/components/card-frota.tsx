import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { TIPO_ICONE, EquipamentoStatusBadge } from "@/features/equipamentos/labels";
import type { Equipamento, EquipamentoStatus } from "@/shared/types";

export interface CardFrotaProps {
  equipamentos: Equipamento[]; // já filtrados para os ativos
  limite?: number;
}

const ORDEM_STATUS: Record<EquipamentoStatus, number> = {
  em_uso: 0,
  manutencao: 1,
  disponivel: 2,
};

// Situação operacional da frota — em uso primeiro, manutenção logo abaixo.
export function CardFrota({ equipamentos, limite = 6 }: CardFrotaProps) {
  const ordenados = [...equipamentos]
    .sort((a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] || a.nome.localeCompare(b.nome))
    .slice(0, limite);

  return (
    <CardSecao
      titulo="Frota"
      icone="lucide:truck"
      acessorio={
        <CardPill>
          {equipamentos.length} equipamento{equipamentos.length === 1 ? "" : "s"}
        </CardPill>
      }
      bodyClassName="p-2"
    >
      {ordenados.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum equipamento ativo cadastrado.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {ordenados.map((e) => (
            <li key={e.id}>
              <Link
                to="/admin/equipamentos/$equipamentoId"
                params={{ equipamentoId: e.id }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
              >
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"
                >
                  <Icon icon={TIPO_ICONE[e.tipo]} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
                  {e.nome}
                </span>
                <EquipamentoStatusBadge status={e.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
