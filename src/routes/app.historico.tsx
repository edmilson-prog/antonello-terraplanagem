import { createFileRoute } from "@tanstack/react-router";
import { HistoricoPage } from "@/features/operador/components/historico-page";

export const Route = createFileRoute("/app/historico")({
  head: () => ({
    meta: [
      { title: "Histórico · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: HistoricoPage,
});
