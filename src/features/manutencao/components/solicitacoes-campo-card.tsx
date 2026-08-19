import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { PROBLEMA_MANUTENCAO } from "@/features/registros-campo/tipos";
import { formatData, formatHorimetro } from "@/shared/lib/format";
import type { SolicitacaoCampo } from "@/features/registros-campo/retaguarda-derivacoes";
import type { Equipamento, Operador } from "@/shared/types";

/*
 * Chamados abertos pelo operador no app de campo que ainda não viraram ordem.
 *
 * Este card é o que faltava para o ciclo fechar: a Onda 18 deu à retaguarda a
 * manutenção corretiva, a Onda 22 fez a solicitação chegar do campo — mas até
 * aqui ninguém no escritório via o pedido. O operador apertava "solicitar
 * manutenção" no celular e o chamado morria no aparelho dele.
 *
 * "Máquina parada" vem primeiro e em vermelho porque é hora ociosa correndo
 * agora. Cada linha leva à abertura da ordem já preenchida com o que o
 * operador relatou.
 */

interface Props {
  solicitacoes: SolicitacaoCampo[];
  equipamentos: Equipamento[];
  operadores: Operador[];
}

export function SolicitacoesCampoCard({ solicitacoes, equipamentos, operadores }: Props) {
  const paradas = solicitacoes.filter((s) => s.dados.urgencia === "maquina_parada").length;

  return (
    <CardSecao
      titulo="Chamados do campo"
      icone="lucide:radio"
      acessorio={
        paradas > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
            <Icon icon="lucide:circle-alert" className="h-3.5 w-3.5" />
            {paradas} parada{paradas === 1 ? "" : "s"}
          </span>
        ) : (
          <CardPill>
            {solicitacoes.length} aberto{solicitacoes.length === 1 ? "" : "s"}
          </CardPill>
        )
      }
      bodyClassName="p-2"
    >
      {solicitacoes.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhum chamado do campo aguardando ordem.
        </p>
      ) : (
        <ul>
          {solicitacoes.map((s) => {
            const equipamento = equipamentos.find((e) => e.id === s.equipamento_id);
            const operador = operadores.find((o) => o.id === s.operador_id);
            const problema = PROBLEMA_MANUTENCAO[s.dados.problema];
            const parada = s.dados.urgencia === "maquina_parada";

            return (
              <li key={s.id}>
                <Link
                  to="/admin/manutencao/nova"
                  search={{ solicitacao: s.id }}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface/60"
                >
                  <span
                    className={
                      parada
                        ? "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-destructive/15 text-destructive"
                        : "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"
                    }
                  >
                    <Icon icon={problema.icone} className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {equipamento?.nome ?? "Equipamento removido"} · {problema.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {operador?.nome ?? "Operador"} · {formatData(s.registrado_em.slice(0, 10))}
                      {s.dados.horimetro != null ? ` · ${formatHorimetro(s.dados.horimetro)}` : ""}
                    </span>
                  </span>
                  {parada ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                      Parada
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">pode aguardar</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </CardSecao>
  );
}
