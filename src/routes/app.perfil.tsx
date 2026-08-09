import { createFileRoute } from "@tanstack/react-router";
import { PerfilPage } from "@/features/operador/components/perfil-page";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil · App de Campo · Antonello" },
      {
        name: "description",
        content: "Perfil e logout do operador no app de campo da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PerfilPage,
});
