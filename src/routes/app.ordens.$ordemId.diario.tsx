import { createFileRoute } from "@tanstack/react-router";
import { DiarioObraPage } from "@/features/operador/components/diario-obra-page";

export const Route = createFileRoute("/app/ordens/$ordemId/diario")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <DiarioObraPage ordemId={ordemId} />;
}
