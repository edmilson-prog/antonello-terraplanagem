import { createFileRoute, notFound } from "@tanstack/react-router";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { OrcamentoDetalhe } from "@/features/orcamentos";

export const Route = createFileRoute("/admin/orcamentos/$orcamentoId")({
  loader: ({ params }) => {
    if (!orcamentosStore.obter(params.orcamentoId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `${orcamentosStore.obter(params.orcamentoId)?.numero ?? "Orçamento"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrcamentoDetalheRoute,
});

function OrcamentoDetalheRoute() {
  const { orcamentoId } = Route.useParams();
  return <OrcamentoDetalhe orcamentoId={orcamentoId} />;
}
