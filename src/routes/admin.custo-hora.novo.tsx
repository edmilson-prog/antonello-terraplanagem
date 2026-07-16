import { createFileRoute } from "@tanstack/react-router";
import { NovoCustoPage } from "@/features/custo-hora/components/novo-custo-page";

export const Route = createFileRoute("/admin/custo-hora/novo")({
  head: () => ({
    meta: [
      { title: "Novo lançamento de custo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoCustoPage,
});
