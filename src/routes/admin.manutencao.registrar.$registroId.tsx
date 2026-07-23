import { createFileRoute } from "@tanstack/react-router";
import { RegistrarManutencaoPage } from "@/features/manutencao/components/registrar-manutencao-page";

export const Route = createFileRoute("/admin/manutencao/registrar/$registroId")({
  head: () => ({
    meta: [
      { title: "Registrar manutenção · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { registroId } = Route.useParams();
  return <RegistrarManutencaoPage registroId={registroId} />;
}
