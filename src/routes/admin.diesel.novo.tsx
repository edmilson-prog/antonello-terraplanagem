import { createFileRoute } from "@tanstack/react-router";
import { NovoAbastecimentoPage } from "@/features/diesel/components/novo-abastecimento-page";

export const Route = createFileRoute("/admin/diesel/novo")({
  head: () => ({
    meta: [
      { title: "Novo abastecimento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoAbastecimentoPage,
});
