import { createFileRoute } from "@tanstack/react-router";
import { SolicitarManutencaoPage } from "@/features/operador/components/solicitar-manutencao-page";

export const Route = createFileRoute("/app/ordens/$ordemId/manutencao")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <SolicitarManutencaoPage ordemId={ordemId} />;
}
