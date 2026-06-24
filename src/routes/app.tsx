import { createFileRoute } from "@tanstack/react-router";
import { OperadorShell } from "@/features/operador/operador-shell";

export const Route = createFileRoute("/app")({
  component: OperadorShell,
});
