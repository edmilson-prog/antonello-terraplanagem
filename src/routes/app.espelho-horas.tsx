import { createFileRoute } from "@tanstack/react-router";
import { EspelhoHorasPage } from "@/features/operador/components/espelho-horas-page";

export const Route = createFileRoute("/app/espelho-horas")({
  head: () => ({
    meta: [
      { title: "Espelho de horas · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EspelhoHorasPage,
});
