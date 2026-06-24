import { createFileRoute } from "@tanstack/react-router";
import { RetaguardaShell } from "@/features/retaguarda/retaguarda-shell";

export const Route = createFileRoute("/admin")({
  component: RetaguardaShell,
});
