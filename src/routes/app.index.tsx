import { createFileRoute } from "@tanstack/react-router";
import { HojePage } from "@/features/operador/components/hoje-page";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Hoje · App de Campo · Antonello" },
      {
        name: "description",
        content: "Resumo do turno, equipamento em uso e OS do dia para o operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: HojePage,
});
