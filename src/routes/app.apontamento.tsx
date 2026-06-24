import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/app/apontamento")({
  head: () => ({
    meta: [
      { title: "Apontamento de Horímetro · Antonello" },
      {
        name: "description",
        content:
          "Apontamento de horímetro de início e fim do turno no app do operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <EmptyState
      icone={ClipboardList}
      titulo="Apontamento em construção"
      descricao="Em breve: check-in do equipamento, leitura de horímetro de início e fim, e foto do hodômetro."
    />
  ),
});
