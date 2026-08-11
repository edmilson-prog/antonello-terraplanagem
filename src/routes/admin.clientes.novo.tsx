import { createFileRoute } from "@tanstack/react-router";
import { NovoClientePage } from "@/features/clientes/components/novo-cliente-page";

export const Route = createFileRoute("/admin/clientes/novo")({
  head: () => ({
    meta: [{ title: "Novo cliente · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: NovoClientePage,
});
