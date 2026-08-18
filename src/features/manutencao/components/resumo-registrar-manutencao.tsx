import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { StatusManutencaoBadge, SituacaoRegistroBadge } from "@/features/manutencao/labels";
import { calcularStatusManutencao } from "@/features/manutencao/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import type { Equipamento, PlanoManutencao, RegistroManutencao } from "@/shared/types";

interface Props {
  registro: RegistroManutencao;
  equipamento: Equipamento;
  plano: PlanoManutencao | null;
  horimetroRealizado: string;
  custo: string;
}

export function ResumoRegistrarManutencao({
  registro,
  equipamento,
  plano,
  horimetroRealizado,
  custo,
}: Props) {
  const custoNum = Number(custo) || 0;
  const previsto = registro.horimetro_previsto;
  const deCiclo = plano != null && previsto != null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:wrench" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{equipamento.nome}</div>
            <div className="text-xs text-muted-foreground">
              {plano?.descricao ?? registro.descricao ?? "Manutenção"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {previsto != null ? (
            <Linha rotulo="Horímetro previsto" valor={formatHorimetro(previsto)} />
          ) : registro.horimetro_abertura != null ? (
            <Linha
              rotulo="Horímetro na abertura"
              valor={formatHorimetro(registro.horimetro_abertura)}
            />
          ) : null}
          <Linha
            rotulo="Horímetro realizado"
            valor={
              horimetroRealizado.trim() ? formatHorimetro(Number(horimetroRealizado)) : "a definir"
            }
            vazio={!horimetroRealizado.trim()}
          />
          <Linha
            rotulo="Custo"
            valor={custoNum > 0 ? formatBRL(custoNum) : "a definir"}
            vazio={custoNum === 0}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Situação</span>
          {deCiclo ? (
            <StatusManutencaoBadge
              status={calcularStatusManutencao(equipamento.horimetro_atual, previsto)}
            />
          ) : (
            <SituacaoRegistroBadge situacao={registro.status} />
          )}
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        {deCiclo ? (
          <p>
            Ao confirmar, o ciclo do plano é <strong className="text-foreground">reiniciado</strong>{" "}
            a partir do horímetro realizado — a próxima manutenção deste plano volta a aparecer em{" "}
            <strong className="text-foreground">Alertas</strong> quando vencer de novo.
          </p>
        ) : (
          <p>
            Esta ordem não veio de um plano, então{" "}
            <strong className="text-foreground">não abre um próximo ciclo</strong>. O custo
            informado passa a contar no <strong className="text-foreground">Custo da Hora</strong>{" "}
            do equipamento no mês da conclusão.
          </p>
        )}
      </div>
    </div>
  );
}
