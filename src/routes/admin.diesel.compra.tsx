import { createFileRoute } from "@tanstack/react-router";
import { NovaCompraDieselPage } from "@/features/diesel/components/nova-compra-diesel-page";

export const Route = createFileRoute("/admin/diesel/compra")({
  head: () => ({
    meta: [
      { title: "Compra de diesel · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaCompraDieselPage,
});
