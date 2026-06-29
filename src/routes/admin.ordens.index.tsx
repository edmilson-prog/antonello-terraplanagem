import { createFileRoute } from "@tanstack/react-router";
import { OrdensRetaguardaPage } from "@/features/ordem-servico";

export const Route = createFileRoute("/admin/ordens/")({
  head: () => ({
    meta: [
      { title: "Ordens de Serviço · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdensRetaguardaPage,
});
