import { createFileRoute } from "@tanstack/react-router";
import { OrdensRetaguardaPage } from "@/features/ordem-servico";
import type { StatusOS } from "@/shared/types";

interface OrdensSearch {
  status?: StatusOS;
}

const STATUS_VALIDOS: StatusOS[] = ["aberta", "em_andamento", "fechada"];

export const Route = createFileRoute("/admin/ordens/")({
  validateSearch: (raw: Record<string, unknown>): OrdensSearch => ({
    status: STATUS_VALIDOS.includes(raw.status as StatusOS) ? (raw.status as StatusOS) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ordens de Serviço · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdensRoute,
});

function OrdensRoute() {
  const { status } = Route.useSearch();
  return <OrdensRetaguardaPage statusInicial={status} />;
}
