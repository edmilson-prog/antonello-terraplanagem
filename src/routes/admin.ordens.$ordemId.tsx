import { createFileRoute, notFound } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { OrdemDetalheRetaguarda } from "@/features/ordem-servico";

export const Route = createFileRoute("/admin/ordens/$ordemId")({
  loader: ({ params }) => {
    if (!ordensStore.obter(params.ordemId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdemDetalheAdminRoute,
});

function OrdemDetalheAdminRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheRetaguarda ordemId={ordemId} />;
}
