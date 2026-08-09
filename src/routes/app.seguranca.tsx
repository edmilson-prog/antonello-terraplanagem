import { createFileRoute } from "@tanstack/react-router";
import { SegurancaPage } from "@/features/operador/components/seguranca-page";

export const Route = createFileRoute("/app/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança · App de Campo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SegurancaPage,
});
