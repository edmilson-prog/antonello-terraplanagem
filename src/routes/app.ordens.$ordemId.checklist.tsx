import { createFileRoute } from "@tanstack/react-router";
import { ChecklistPage } from "@/features/operador/components/checklist-page";

export const Route = createFileRoute("/app/ordens/$ordemId/checklist")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <ChecklistPage ordemId={ordemId} />;
}
