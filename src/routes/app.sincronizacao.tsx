import { createFileRoute } from "@tanstack/react-router";
import { SincronizacaoPage } from "@/features/operador/components/sincronizacao-page";

export const Route = createFileRoute("/app/sincronizacao")({
  head: () => ({
    meta: [
      { title: "Sincronização · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SincronizacaoPage,
});
