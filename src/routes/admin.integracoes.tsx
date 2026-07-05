import { createFileRoute } from "@tanstack/react-router";
import { IntegracoesPage } from "@/features/integracoes";

export const Route = createFileRoute("/admin/integracoes")({
  head: () => ({
    meta: [{ title: "Integrações · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: IntegracoesPage,
});
