import { createFileRoute } from "@tanstack/react-router";
import { NovoOperadorPage } from "@/features/operadores/components/novo-operador-page";

export const Route = createFileRoute("/admin/operadores/novo")({
  head: () => ({
    meta: [{ title: "Novo operador · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: NovoOperadorPage,
});
