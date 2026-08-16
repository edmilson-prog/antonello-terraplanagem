import { createFileRoute } from "@tanstack/react-router";
import { ParametrosPage } from "@/features/parametros";

export const Route = createFileRoute("/admin/parametros/")({
  head: () => ({
    meta: [{ title: "Parâmetros · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ParametrosPage,
});
