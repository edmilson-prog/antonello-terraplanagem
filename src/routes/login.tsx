import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/login-page";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · Antonello Terraplanagem" },
      {
        name: "description",
        content:
          "Acesso da equipe à plataforma de gestão da Antonello Terraplanagem — operadores, recepção e proprietário.",
      },
      { property: "og:title", content: "Entrar · Antonello Terraplanagem" },
      {
        property: "og:description",
        content: "Acesso da equipe à plataforma de gestão da Antonello Terraplanagem.",
      },
      { property: "og:url", content: "https://antonello-terraplanagem.lovable.app/login" },
    ],
    links: [{ rel: "canonical", href: "https://antonello-terraplanagem.lovable.app/login" }],
  }),
  component: LoginPage,
});
