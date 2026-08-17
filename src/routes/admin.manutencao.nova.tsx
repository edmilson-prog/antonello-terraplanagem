import { createFileRoute } from "@tanstack/react-router";
import { NovaManutencaoPage } from "@/features/manutencao/components/nova-manutencao-page";

export const Route = createFileRoute("/admin/manutencao/nova")({
  head: () => ({
    meta: [
      { title: "Nova manutenção · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaManutencaoPage,
});
