import { createFileRoute } from "@tanstack/react-router";
import { NovaContaPagarPage } from "@/features/financeiro/components/nova-conta-pagar-page";

export const Route = createFileRoute("/admin/financeiro/contas-pagar/novo")({
  head: () => ({
    meta: [
      { title: "Novo pagamento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaContaPagarPage,
});
