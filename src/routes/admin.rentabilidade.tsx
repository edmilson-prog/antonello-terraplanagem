import { createFileRoute } from "@tanstack/react-router";
import { RentabilidadePage } from "@/features/rentabilidade";

export const Route = createFileRoute("/admin/rentabilidade")({
  head: () => ({
    meta: [
      { title: "Rentabilidade · Antonello" },
      {
        name: "description",
        content: "Rentabilidade por equipamento e por obra — receita menos custo no período.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RentabilidadePage,
});
