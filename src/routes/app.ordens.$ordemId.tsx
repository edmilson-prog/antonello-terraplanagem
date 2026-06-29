import { createFileRoute, notFound } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { OrdemDetalheOperador, OrdemNaoEncontrada } from "@/features/ordem-servico";

export const Route = createFileRoute("/app/ordens/$ordemId")({
  loader: ({ params }) => {
    if (!ordensStore.obter(params.ordemId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [{ title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` }],
  }),
  component: OrdemDetalheRoute,
  notFoundComponent: OrdemNaoEncontrada,
});

function OrdemDetalheRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheOperador ordemId={ordemId} />;
}
