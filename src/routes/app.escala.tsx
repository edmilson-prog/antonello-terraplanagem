import { createFileRoute } from "@tanstack/react-router";
import { EscalaPage } from "@/features/operador/components/escala-page";

export const Route = createFileRoute("/app/escala")({
  head: () => ({
    meta: [
      { title: "Minha escala · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EscalaPage,
});
