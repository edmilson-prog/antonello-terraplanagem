import { createFileRoute } from "@tanstack/react-router";
import { FichaEquipamentoPage } from "@/features/operador/components/ficha-equipamento-page";

export const Route = createFileRoute("/app/ordens/$ordemId/equipamento")({
  component: FichaEquipamentoRoute,
});

function FichaEquipamentoRoute() {
  const { ordemId } = Route.useParams();
  return <FichaEquipamentoPage ordemId={ordemId} />;
}
