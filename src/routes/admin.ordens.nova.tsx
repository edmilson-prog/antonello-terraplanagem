import { createFileRoute } from "@tanstack/react-router";
import { NovaOrdemPage } from "@/features/ordem-servico/components/nova-ordem-page";

export const Route = createFileRoute("/admin/ordens/nova")({
  head: () => ({
    meta: [
      { title: "Nova OS · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaOrdemPage,
});
