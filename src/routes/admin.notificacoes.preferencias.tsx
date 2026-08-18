import { createFileRoute } from "@tanstack/react-router";
import { PreferenciasNotificacaoPage } from "@/features/notificacoes/components/preferencias-page";

export const Route = createFileRoute("/admin/notificacoes/preferencias")({
  head: () => ({
    meta: [
      { title: "Preferências de notificação · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PreferenciasNotificacaoPage,
});
