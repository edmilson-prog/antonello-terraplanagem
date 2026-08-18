import { createFileRoute } from "@tanstack/react-router";
import { NovaNotificacaoPage } from "@/features/notificacoes/components/nova-notificacao-page";

export const Route = createFileRoute("/admin/notificacoes/nova")({
  head: () => ({
    meta: [
      { title: "Nova notificação · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaNotificacaoPage,
});
