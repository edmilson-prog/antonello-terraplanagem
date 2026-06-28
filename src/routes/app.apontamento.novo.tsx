import { createFileRoute } from "@tanstack/react-router";
import { IniciarApontamentoForm } from "@/features/apontamento/components/iniciar-apontamento-form";

export const Route = createFileRoute("/app/apontamento/novo")({
  head: () => ({
    meta: [
      { title: "Novo apontamento · Antonello" },
      {
        name: "description",
        content: "Iniciar um apontamento de horímetro no app do operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: IniciarApontamentoForm,
});
