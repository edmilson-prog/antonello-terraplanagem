import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import {
  carregar,
  sincronizarFilaLidas,
  useNaoLidas,
} from "@/features/notificacoes/notificacoes-store";
import { reafirmarInscricao, registrarServiceWorker } from "@/features/notificacoes/push";

// De quanto em quanto tempo reconsultar com o app aberto. Sem Realtime para o
// operador (token opaco, sem sessão nativa do Supabase), a entrega imediata é
// papel do Web Push; esta reconsulta é a rede de segurança para quem está com
// o push desligado ou num navegador sem suporte.
const INTERVALO_RECONSULTA_MS = 60_000;

interface MensagemDoServiceWorker {
  tipo?: string;
  url?: string;
}

/**
 * Sino do cabeçalho do app de campo (PRD-020). Além do badge, é aqui que vive
 * o ciclo de atualização — o componente monta uma vez, junto do OperadorShell.
 */
export function SinoNotificacoes() {
  const naoLidas = useNaoLidas();
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      await registrarServiceWorker();
      await reafirmarInscricao();
      await carregar();
    })();

    const aoVoltarAoFoco = () => {
      if (document.visibilityState === "visible") void carregar();
    };
    const aoReconectar = () => {
      void sincronizarFilaLidas().then(carregar);
    };
    const aoReceberDoServiceWorker = (evento: MessageEvent<MensagemDoServiceWorker>) => {
      const dados = evento.data;
      if (dados?.tipo === "notificacao-recebida") void carregar();
      // Fallback para navegadores cujo WindowClient não expõe navigate().
      if (dados?.tipo === "navegar" && dados.url) void navigate({ to: dados.url });
    };

    document.addEventListener("visibilitychange", aoVoltarAoFoco);
    window.addEventListener("online", aoReconectar);
    navigator.serviceWorker?.addEventListener("message", aoReceberDoServiceWorker);
    const intervalo = window.setInterval(() => void carregar(), INTERVALO_RECONSULTA_MS);

    return () => {
      document.removeEventListener("visibilitychange", aoVoltarAoFoco);
      window.removeEventListener("online", aoReconectar);
      navigator.serviceWorker?.removeEventListener("message", aoReceberDoServiceWorker);
      window.clearInterval(intervalo);
    };
  }, [navigate]);

  return (
    <Link
      to="/app/notificacoes"
      aria-label={
        naoLidas > 0
          ? `Notificações — ${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}`
          : "Notificações"
      }
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-lg",
        "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon icon="lucide:bell" className="h-[19px] w-[19px]" />
      {naoLidas > 0 ? (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold leading-none text-primary-foreground"
        >
          {naoLidas > 9 ? "9+" : naoLidas}
        </span>
      ) : null}
    </Link>
  );
}
