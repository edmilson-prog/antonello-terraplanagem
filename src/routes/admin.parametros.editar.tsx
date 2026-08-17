import { createFileRoute } from "@tanstack/react-router";
import { ConfiguracoesPage } from "@/features/parametros";

export const Route = createFileRoute("/admin/parametros/editar")({
  head: () => ({
    meta: [{ title: "Configurações · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ConfiguracoesPage,
});
