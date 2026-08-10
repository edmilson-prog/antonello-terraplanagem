import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { cn } from "@/lib/utils";
import { carregar, marcarLidas, useNotificacoes } from "@/features/notificacoes/notificacoes-store";
import {
  agruparPorDia,
  aparenciaDaNotificacao,
  horaDaNotificacao,
} from "@/features/notificacoes/derivacoes";
import type { Notificacao } from "@/shared/types";

/*
 * Central de notificações do operador (PRD-020) — a tela `notif` do kit
 * `ui_kits/app-campo/CampoApp.jsx`: agrupada por dia, ícone-tile por tipo,
 * hora em mono à direita e o ponto de não lida.
 *
 * O cabeçalho da tela (título e voltar) vem do OperadorShell, então aqui fica
 * só a ação de "marcar lidas" — mesmo padrão das outras telas do app.
 */

function LinhaNotificacao({ notificacao }: { notificacao: Notificacao }) {
  const { icone, tom } = aparenciaDaNotificacao(notificacao.tipo);
  const naoLida = notificacao.lida_em === null;

  const conteudo = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex h-9 w-9 flex-none items-center justify-center rounded-lg",
          tom === "alerta" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
        )}
      >
        <Icon icon={icone} className="h-[18px] w-[18px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-card-foreground">
          {notificacao.titulo}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
          {notificacao.mensagem}
        </span>
      </span>

      <span className="flex flex-none flex-col items-end gap-1.5">
        <span className="font-mono text-[10.5px] font-medium text-foreground-faint">
          {horaDaNotificacao(notificacao.created_at)}
        </span>
        {naoLida ? (
          <span className="h-2 w-2 rounded-full bg-primary" aria-label="Não lida" role="img" />
        ) : null}
      </span>
    </>
  );

  // Toque mínimo de 44px em ambos os casos — o operador usa isto com luva.
  const classes = cn(
    "flex w-full items-start gap-3 px-4 py-3 text-left min-h-[44px]",
    naoLida && "bg-primary/[0.04]",
  );

  if (notificacao.os_id) {
    return (
      <Link
        to="/app/ordens/$ordemId"
        params={{ ordemId: notificacao.os_id }}
        className={cn(classes, "transition-colors hover:bg-muted/50")}
      >
        {conteudo}
      </Link>
    );
  }

  return <div className={classes}>{conteudo}</div>;
}

export function NotificacoesPage() {
  const { itens, isLoading, error, offline } = useNotificacoes();

  useEffect(() => {
    void carregar();
  }, []);

  const naoLidas = itens.filter((n) => n.lida_em === null).length;
  const grupos = agruparPorDia(itens);

  // Só mostra esqueleto na primeira carga; um refresh em cima de dado que já
  // está na tela não deve fazer a lista piscar.
  if (isLoading && itens.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error && itens.length === 0) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar suas notificações.
        </p>
        <Button variant="outline" onClick={() => void carregar()} className="gap-2">
          <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <EmptyState
        icon="lucide:bell"
        titulo="Nenhuma notificação"
        descricao="Avisos da retaguarda sobre suas OS, manutenções e apontamentos aparecem aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {offline ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-faint">
            <Icon icon="lucide:cloud-off" className="h-3 w-3" />
            Sem sinal · salvo no aparelho
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-faint">
            {naoLidas > 0 ? `${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}` : "Em dia"}
          </span>
        )}

        {naoLidas > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => void marcarLidas()} className="gap-1.5">
            <Icon icon="lucide:check-check" className="h-4 w-4" />
            Marcar lidas
          </Button>
        ) : null}
      </div>

      {grupos.map((grupo) => (
        <section key={grupo.dia} className="space-y-2">
          <h2 className="font-display text-xs font-bold uppercase tracking-wide text-foreground-faint">
            {grupo.dia}
          </h2>
          <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
            {grupo.itens.map((n) => (
              <LinhaNotificacao key={n.id} notificacao={n} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
