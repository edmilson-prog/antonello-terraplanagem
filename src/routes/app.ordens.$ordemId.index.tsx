import { createFileRoute } from "@tanstack/react-router";
import { OrdemDetalheOperador } from "@/features/ordem-servico";

export const Route = createFileRoute("/app/ordens/$ordemId/")({
  component: OrdemDetalheRoute,
});

function OrdemDetalheRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheOperador ordemId={ordemId} />;
}
