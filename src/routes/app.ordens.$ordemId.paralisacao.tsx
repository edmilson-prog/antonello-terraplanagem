import { createFileRoute } from "@tanstack/react-router";
import { ParalisacaoPage } from "@/features/operador/components/paralisacao-page";

export const Route = createFileRoute("/app/ordens/$ordemId/paralisacao")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ordemId } = Route.useParams();
  return <ParalisacaoPage ordemId={ordemId} />;
}
