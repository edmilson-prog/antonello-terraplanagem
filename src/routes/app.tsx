import { createFileRoute, redirect } from "@tanstack/react-router";
import { OperadorShell } from "@/features/operador/operador-shell";
import { lerSessaoOperador } from "@/features/auth/operador-session";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app/entrar") return;
    if (!lerSessaoOperador()) {
      throw redirect({ to: "/app/entrar" });
    }
  },
  component: OperadorShell,
});
