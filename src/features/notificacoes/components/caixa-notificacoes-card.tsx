import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { agruparPorDia, horaDaNotificacao } from "@/features/notificacoes/derivacoes";
import { canaisDaNotificacao } from "@/features/notificacoes/retaguarda-derivacoes";
import {
  CATEGORIA_LABEL,
  ChipCanal,
  TileNotificacao,
} from "@/features/notificacoes/retaguarda-labels";
import { formatData } from "@/shared/lib/format";
import type { Notificacao, NotificacaoEntrega } from "@/shared/types";
import { cn } from "@/lib/utils";

// "Caixa de notificações" do UI kit: lista agrupada por dia, com tile por
// categoria, selo de crítico, chips de canal e ponto de não lida. Clicar marca
// como lida — é a única interação da linha, como no kit.

interface Props {
  itens: Notificacao[];
  entregas: NotificacaoEntrega[];
  onMarcarLida: (id: string) => void;
}

export function CaixaNotificacoesCard({ itens, entregas, onMarcarLida }: Props) {
  const grupos = agruparPorDia(itens);

  return (
    <CardSecao
      titulo="Caixa de notificações"
      icone="lucide:bell"
      acessorio={<CardPill>{itens.length} eventos</CardPill>}
    >
      {grupos.length === 0 ? (
        <p className="p-12 text-center text-sm text-muted-foreground">
          Nenhuma notificação neste filtro.
        </p>
      ) : (
        grupos.map((grupo) => (
          <div key={grupo.dia}>
            <div className="flex items-center gap-2.5 border-b bg-surface/50 px-4 py-2">
              <span className="font-display text-[11px] font-bold uppercase tracking-wider text-foreground">
                {grupo.dia}
              </span>
              <span className="font-mono text-[11px] text-foreground-faint">
                {formatData(grupo.itens[0].created_at.slice(0, 10))}
              </span>
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[11px] text-foreground-faint">
                {grupo.itens.length}
              </span>
            </div>

            {grupo.itens.map((n) => {
              const nova = n.lida_em === null;
              const critico = n.prioridade === "critico";
              const canais = canaisDaNotificacao(n.id, entregas);

              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => nova && onMarcarLida(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition-colors last:border-b-0",
                    nova ? "bg-primary/[0.04] hover:bg-primary/[0.08]" : "hover:bg-surface/50",
                    !nova && "cursor-default",
                  )}
                >
                  <TileNotificacao categoria={n.categoria} critico={critico} />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{n.titulo}</span>
                      {critico ? (
                        <span className="inline-flex items-center rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10.5px] font-semibold text-destructive">
                          Crítico
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted-foreground">
                      {n.mensagem}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full border border-steel/40 bg-steel/15 px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                        {CATEGORIA_LABEL[n.categoria]}
                      </span>
                      {canais.map((c) => (
                        <ChipCanal
                          key={c.canal}
                          canal={c.canal}
                          status={c.status}
                          motivo={c.motivo}
                        />
                      ))}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-mono text-[11px] text-foreground-faint">
                      {horaDaNotificacao(n.created_at)}
                    </span>
                    {nova ? (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="não lida" />
                    ) : (
                      <Icon
                        icon="lucide:check"
                        className="h-3.5 w-3.5 text-foreground-faint"
                        aria-label="lida"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))
      )}
    </CardSecao>
  );
}
