import { createFileRoute } from "@tanstack/react-router";
import { MapaObraPage } from "@/features/operador/components/mapa-obra-page";

export const Route = createFileRoute("/app/ordens/$ordemId/mapa")({
  component: MapaObraRoute,
});

function MapaObraRoute() {
  const { ordemId } = Route.useParams();
  return <MapaObraPage ordemId={ordemId} />;
}
