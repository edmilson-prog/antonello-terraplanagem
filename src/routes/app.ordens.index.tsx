import { createFileRoute } from "@tanstack/react-router";
import { MinhasOSPage } from "@/features/operador/components/minhas-os-page";

export const Route = createFileRoute("/app/ordens/")({
  head: () => ({
    meta: [
      { title: "Minhas OS · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MinhasOSPage,
});
