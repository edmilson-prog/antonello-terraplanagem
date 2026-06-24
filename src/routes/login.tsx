import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/login-page";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · Antonello Terraplanagem" },
      { name: "description", content: "Acesso à plataforma de gestão Antonello Terraplanagem." },
    ],
  }),
  component: LoginPage,
});
