import { createFileRoute } from "@tanstack/react-router";
import { NotificacoesPage } from "@/features/notificacoes";

export const Route = createFileRoute("/app/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações · Antonello" },
      {
        name: "description",
        content: "Avisos da retaguarda para o operador no app de campo da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NotificacoesPage,
});
