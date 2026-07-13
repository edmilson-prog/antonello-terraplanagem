import { createFileRoute, notFound } from "@tanstack/react-router";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { FaturamentoDetalhe } from "@/features/faturamento";

export const Route = createFileRoute("/admin/faturamento/$faturamentoId")({
  loader: ({ params }) => {
    if (!faturamentosStore.obter(params.faturamentoId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${faturamentosStore.obter(params.faturamentoId)?.numero ?? "Faturamento"} · Antonello`,
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FaturamentoDetalheRoute,
});

function FaturamentoDetalheRoute() {
  const { faturamentoId } = Route.useParams();
  return <FaturamentoDetalhe faturamentoId={faturamentoId} />;
}
