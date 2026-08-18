import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { PRIORIDADE_LABEL } from "@/features/notificacoes/retaguarda-labels";
import type { CanalNotificacao, PrioridadeNotificacao } from "@/shared/types";
import { cn } from "@/lib/utils";

// Prévia ao vivo do kit: mostra como o aviso vai chegar na tela bloqueada
// (push) e na lista do app (in-app), mais o resumo do envio. Só desenha o que
// os canais escolhidos realmente vão produzir.

const PRIORIDADE_CLASSE: Record<PrioridadeNotificacao, string> = {
  normal: "border-steel/40 bg-steel/15 text-muted-foreground",
  alta: "border-primary/50 bg-primary/15 text-foreground",
  critico: "border-destructive/40 bg-destructive/15 text-destructive",
};

interface Props {
  titulo: string;
  mensagem: string;
  prioridade: PrioridadeNotificacao;
  acao: string;
  canais: CanalNotificacao[];
  destinatarios: number;
  aparelhos: number;
  quando: string;
  vinculo: string | null;
}

export function PreviaNotificacao({
  titulo,
  mensagem,
  prioridade,
  acao,
  canais,
  destinatarios,
  aparelhos,
  quando,
  vinculo,
}: Props) {
  const temPush = canais.includes("push");
  const temApp = canais.includes("app");
  const critico = prioridade === "critico";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Icon icon="lucide:smartphone" className="h-4 w-4 text-primary" />
          <span className="font-display text-[13px] font-bold uppercase tracking-wider text-foreground">
            Prévia
          </span>
        </div>

        {temPush ? (
          <>
            <div className="mb-2 font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
              Push · tela do aparelho
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                  A
                </span>
                <span className="text-[11.5px] font-semibold text-foreground">
                  Antonello · Campo
                </span>
                <span className="ml-auto font-mono text-[10.5px] text-foreground-faint">
                  {quando === "Agora" ? "agora" : quando}
                </span>
                {critico ? (
                  <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                    Crítico
                  </span>
                ) : null}
              </div>
              <div className="text-[13px] font-semibold text-foreground">
                {titulo || "Título do aviso"}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {mensagem || "A mensagem aparece aqui, no máximo duas linhas na tela bloqueada."}
              </div>
              {acao ? (
                <div className="mt-2 inline-flex rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-primary">
                  {acao}
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {temApp ? (
          <>
            <div
              className={cn(
                "mb-2 font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint",
                temPush && "mt-4",
              )}
            >
              In-app · lista do app de campo
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-primary/[0.05] p-3">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                  critico
                    ? "border-destructive/35 bg-destructive/15 text-destructive"
                    : "border-primary/30 bg-primary/15 text-primary",
                )}
              >
                <Icon icon="lucide:bell" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-foreground">
                  {titulo || "Título do aviso"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {mensagem || "Mensagem do aviso."}
                </span>
              </span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            </div>
          </>
        ) : null}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Icon icon="lucide:arrow-up-right" className="h-4 w-4 text-primary" />
          <span className="font-display text-[13px] font-bold uppercase tracking-wider text-foreground">
            Resumo do envio
          </span>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Destinatários"
            valor={destinatarios > 0 ? String(destinatarios) : "nenhum selecionado"}
            vazio={destinatarios === 0}
          />
          <Linha rotulo="Aparelhos com push" valor={String(aparelhos)} />
          <Linha
            rotulo="Canal"
            valor={
              temPush && temApp ? "In-app + push" : temPush ? "Somente push" : "Somente in-app"
            }
          />
          <Linha rotulo="Vínculo" valor={vinculo ?? "nenhum"} vazio={!vinculo} />
          <Linha rotulo="Ação" valor={acao || "nenhuma"} vazio={!acao} />
          <Linha rotulo="Envio" valor={quando} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Prioridade</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              PRIORIDADE_CLASSE[prioridade],
            )}
          >
            {PRIORIDADE_LABEL[prioridade]}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon
          icon={critico ? "lucide:circle-alert" : "lucide:info"}
          className={cn("mt-0.5 h-4 w-4 shrink-0", critico && "text-destructive")}
        />
        {critico ? (
          <p>
            Aviso <strong className="text-foreground">crítico</strong> ignora o horário silencioso e
            o limite de push por hora. Use só para segurança e paralisação de frente.
          </p>
        ) : (
          <p>
            Avisos normais respeitam o horário silencioso e o limite de push por hora definidos em{" "}
            <strong className="text-foreground">Preferências</strong>. O que for barrado aparece na
            central como <strong className="text-foreground">não enviado</strong>, com o motivo.
          </p>
        )}
      </div>
    </div>
  );
}
