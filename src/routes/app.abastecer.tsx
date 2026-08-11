import { createFileRoute } from "@tanstack/react-router";
import { AbastecerPage } from "@/features/operador/components/abastecer-page";

export const Route = createFileRoute("/app/abastecer")({
  head: () => ({
    meta: [
      { title: "Abastecer · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AbastecerPage,
});
