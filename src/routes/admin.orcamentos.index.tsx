import { createFileRoute } from "@tanstack/react-router";
import { OrcamentosPage } from "@/features/orcamentos";

export const Route = createFileRoute("/admin/orcamentos/")({
  head: () => ({
    meta: [
      { title: "Orçamentos · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrcamentosPage,
});
