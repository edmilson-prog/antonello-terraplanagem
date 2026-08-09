import { createFileRoute } from "@tanstack/react-router";
import { NotificacoesPage } from "@/features/operador/components/notificacoes-page";

export const Route = createFileRoute("/app/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NotificacoesPage,
});
