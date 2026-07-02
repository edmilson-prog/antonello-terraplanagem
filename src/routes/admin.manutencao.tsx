import { createFileRoute } from "@tanstack/react-router";
import { ManutencaoPage } from "@/features/manutencao";

export const Route = createFileRoute("/admin/manutencao")({
  head: () => ({
    meta: [
      { title: "Manutenção · Antonello" },
      {
        name: "description",
        content:
          "Planos de manutenção preventiva e alertas por horímetro da frota da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ManutencaoPage,
});
