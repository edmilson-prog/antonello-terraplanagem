import { createFileRoute } from "@tanstack/react-router";
import { RedefinirSenhaPage } from "@/features/auth/redefinir-senha-page";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha · Antonello Terraplanagem" },
      {
        name: "description",
        content: "Defina uma nova senha de acesso à retaguarda da Antonello Terraplanagem.",
      },
    ],
  }),
  component: RedefinirSenhaPage,
});
