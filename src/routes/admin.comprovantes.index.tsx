import { createFileRoute } from "@tanstack/react-router";
import { ComprovantesPage } from "@/features/comprovantes";

export const Route = createFileRoute("/admin/comprovantes/")({
  head: () => ({
    meta: [{ title: "Comprovantes · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ComprovantesPage,
});
