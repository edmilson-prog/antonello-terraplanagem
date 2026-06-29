import { createFileRoute } from "@tanstack/react-router";
import { IniciarApontamentoForm } from "@/features/apontamento/components/iniciar-apontamento-form";

interface NovoApontamentoSearch {
  os?: string;
}

export const Route = createFileRoute("/app/apontamento/novo")({
  validateSearch: (raw: Record<string, unknown>): NovoApontamentoSearch => ({
    os: typeof raw.os === "string" ? raw.os : undefined,
  }),
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
  component: NovoApontamentoRoute,
});

function NovoApontamentoRoute() {
  const { os } = Route.useSearch();
  return <IniciarApontamentoForm osIdInicial={os} />;
}
