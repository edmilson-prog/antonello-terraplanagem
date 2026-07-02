import { createFileRoute } from "@tanstack/react-router";
import { DieselPage } from "@/features/diesel";

export const Route = createFileRoute("/admin/diesel")({
  head: () => ({
    meta: [
      { title: "Diesel · Antonello" },
      {
        name: "description",
        content: "Consumo e utilização de diesel por equipamento da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DieselPage,
});
