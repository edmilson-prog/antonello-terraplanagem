import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import {
  SituacaoRegistroBadge,
  TIPO_MANUTENCAO_LABEL,
  descreverManutencao,
} from "@/features/manutencao/labels";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { brlExato } from "@/features/retaguarda/format";
import { formatData } from "@/shared/lib/format";
import type { OrdemManutencao } from "@/features/manutencao/resumo-mes";
import type { PlanoManutencao } from "@/shared/types";
import { cn } from "@/lib/utils";

// Tabela "Ordens de manutenção" do UI kit. A linha leva para a conclusão da
// ordem — que é onde o custo é confirmado e passa a contar no Custo da Hora.
// Ordem já concluída não é clicável: não há o que fazer nela.

interface Props {
  ordens: OrdemManutencao[];
  planos: PlanoManutencao[];
}

export function OrdensManutencaoCard({ ordens, planos }: Props) {
  const navigate = useNavigate();

  const abrir = (registroId: string) =>
    navigate({ to: "/admin/manutencao/registrar/$registroId", params: { registroId } });

  return (
    <CardSecao
      titulo="Ordens de manutenção"
      icone="lucide:wrench"
      acessorio={<CardPill>{ordens.length} no mês</CardPill>}
    >
      {ordens.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma manutenção neste mês.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left font-mono text-xs uppercase tracking-wide text-foreground-faint">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium">Custo</th>
                <th className="px-4 py-3 text-right font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map(({ registro, equipamento, data }) => {
                const encerrada = registro.status === "realizada";
                return (
                  <tr
                    key={registro.id}
                    onClick={encerrada ? undefined : () => void abrir(registro.id)}
                    className={cn(
                      "border-b transition-colors last:border-b-0",
                      !encerrada && "cursor-pointer hover:bg-surface/50",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{formatData(data.slice(0, 10))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-primary">
                          <Icon
                            icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:truck"}
                            className="h-3.5 w-3.5"
                            aria-hidden
                          />
                        </span>
                        <span className="font-medium text-foreground">
                          {equipamento?.nome ?? "Equipamento removido"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                          registro.tipo === "corretiva"
                            ? "border-primary/50 bg-primary/15 text-foreground"
                            : "border-steel/40 bg-steel/15 text-muted-foreground",
                        )}
                      >
                        {TIPO_MANUTENCAO_LABEL[registro.tipo]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {descreverManutencao(registro, planos)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono",
                        registro.custo == null && "text-foreground-faint",
                      )}
                    >
                      {registro.custo != null ? brlExato.format(registro.custo) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SituacaoRegistroBadge situacao={registro.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardSecao>
  );
}
