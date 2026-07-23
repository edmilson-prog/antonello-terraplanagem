import { createFileRoute } from "@tanstack/react-router";
import { NovoOrcamentoPage } from "@/features/orcamentos/components/novo-orcamento-page";

export const Route = createFileRoute("/admin/orcamentos/novo")({
  head: () => ({
    meta: [
      { title: "Novo orçamento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoOrcamentoPage,
});
