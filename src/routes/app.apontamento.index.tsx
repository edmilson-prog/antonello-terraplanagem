import { createFileRoute } from "@tanstack/react-router";
import { ApontamentosPage } from "@/features/apontamento/components/apontamentos-page";

export const Route = createFileRoute("/app/apontamento/")({
  head: () => ({
    meta: [
      { title: "Apontamento de Horímetro · Antonello" },
      {
        name: "description",
        content:
          "Meus apontamentos de horímetro: iniciar, finalizar e acompanhar as horas no app do operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ApontamentosPage,
});
