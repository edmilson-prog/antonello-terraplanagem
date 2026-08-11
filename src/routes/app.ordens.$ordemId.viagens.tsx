import { createFileRoute } from "@tanstack/react-router";
import { ViagensPage } from "@/features/operador/components/viagens-page";

export const Route = createFileRoute("/app/ordens/$ordemId/viagens")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <ViagensPage ordemId={ordemId} />;
}
