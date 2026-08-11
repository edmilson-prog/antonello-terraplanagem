import { createFileRoute } from "@tanstack/react-router";
import { PranchaPage } from "@/features/operador/components/prancha-page";

export const Route = createFileRoute("/app/ordens/$ordemId/prancha")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <PranchaPage ordemId={ordemId} />;
}
