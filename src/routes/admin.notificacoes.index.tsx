import { createFileRoute } from "@tanstack/react-router";
import { CentralNotificacoesPage } from "@/features/notificacoes/components/central-retaguarda-page";

export const Route = createFileRoute("/admin/notificacoes/")({
  head: () => ({
    meta: [{ title: "Notificações · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: CentralNotificacoesPage,
});
