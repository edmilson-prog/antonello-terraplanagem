import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/features/dashboard";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard da Retaguarda · Antonello" },
      {
        name: "description",
        content:
          "Indicadores operacionais da Antonello Terraplanagem — equipamentos, ordens e faturamento.",
      },
      { property: "og:title", content: "Dashboard da Retaguarda · Antonello" },
      {
        property: "og:description",
        content: "Visão geral da operação: equipamentos, ordens de serviço e faturamento.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});
