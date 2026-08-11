import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useNaoLidas } from "@/features/notificacoes/notificacoes-store";

/**
 * Sino do app de campo (PRD-020) — só o badge. O ciclo de atualização (service
 * worker, reinscrição de push e reconsulta) mora em `useCicloNotificacoes`,
 * montado pelo OperadorShell: com o UI kit o sino passou a viver no cabeçalho
 * da aba "Hoje", que desmonta ao trocar de aba, e o ciclo não pode morrer junto.
 */
export function SinoNotificacoes({ className }: { className?: string }) {
  const naoLidas = useNaoLidas();

  return (
    <Link
      to="/app/notificacoes"
      aria-label={
        naoLidas > 0
          ? `Notificações — ${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}`
          : "Notificações"
      }
      className={cn(
        "relative grid h-11 w-11 shrink-0 place-items-center rounded-[11px] border",
        "text-muted-foreground transition-colors hover:border-border-strong hover:text-primary",
        className,
      )}
    >
      <Icon icon="lucide:bell" className="h-[19px] w-[19px]" />
      {naoLidas > 0 ? (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-[9px] bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground"
        >
          {naoLidas > 9 ? "9+" : naoLidas}
        </span>
      ) : null}
    </Link>
  );
}
