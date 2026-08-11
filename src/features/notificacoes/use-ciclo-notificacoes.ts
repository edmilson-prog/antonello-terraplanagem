import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { carregar, sincronizarFilaLidas } from "@/features/notificacoes/notificacoes-store";
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
 * Ciclo de atualização das notificações (PRD-020): registra o service worker,
 * reafirma a inscrição de push e mantém a lista fresca por reconsulta.
 *
 * Vive separado do sino porque, com o UI kit, o sino passou a morar no
 * cabeçalho da aba "Hoje" — que desmonta ao trocar de aba. O ciclo precisa
 * seguir vivo em todas as telas, então quem o monta é o OperadorShell, uma vez.
 */
export function useCicloNotificacoes({ ativo = true }: { ativo?: boolean } = {}): void {
  const navigate = useNavigate();

  useEffect(() => {
    // Na tela de login não há sessão: nada de service worker nem de push antes
    // do operador entrar — mesmo comportamento de antes do porte, quando o
    // sino só existia depois do shell autenticado.
    if (!ativo) return;

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
  }, [navigate, ativo]);
}
