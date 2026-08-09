import { createFileRoute } from "@tanstack/react-router";
import { MedicaoPage } from "@/features/operador/components/medicao-page";

export const Route = createFileRoute("/app/ordens/$ordemId/medicao")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <MedicaoPage ordemId={ordemId} />;
}
