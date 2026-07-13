import { createFileRoute } from "@tanstack/react-router";
import { FaturamentoPage } from "@/features/faturamento";

export const Route = createFileRoute("/admin/faturamento/")({
  head: () => ({
    meta: [{ title: "Faturamento · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: FaturamentoPage,
});
