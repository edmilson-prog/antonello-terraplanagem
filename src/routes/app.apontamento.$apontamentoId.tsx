import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ApontamentoDetalhe,
  ApontamentoNaoEncontrado,
} from "@/features/apontamento/components/apontamento-detalhe";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export const Route = createFileRoute("/app/apontamento/$apontamentoId")({
  loader: ({ params }) => {
    if (!apontamentosStore.obter(params.apontamentoId)) throw notFound();
    return null;
  },
  head: () => ({
    meta: [
      { title: "Apontamento · Antonello" },
      {
        name: "description",
        content: "Detalhe e finalização de um apontamento de horímetro no app do operador.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RouteComponent,
  notFoundComponent: ApontamentoNaoEncontrado,
});

function RouteComponent() {
  const { apontamentoId } = Route.useParams();
  return <ApontamentoDetalhe apontamentoId={apontamentoId} />;
}
