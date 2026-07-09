import { createFileRoute } from "@tanstack/react-router";
import { OperadorLoginPage } from "@/features/auth/operador-login-page";

export const Route = createFileRoute("/app/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar · Antonello Campo" },
      {
        name: "description",
        content: "Acesso do operador de campo à plataforma de gestão da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OperadorLoginPage,
});
