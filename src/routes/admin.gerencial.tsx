import { createFileRoute } from "@tanstack/react-router";
import { GerencialPage } from "@/features/gerencial";

export const Route = createFileRoute("/admin/gerencial")({
  head: () => ({
    meta: [
      { title: "Painel Gerencial · Antonello" },
      {
        name: "description",
        content: "Evolução de faturamento, margem, horas e rankings — visão gerencial consolidada.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: GerencialPage,
});
