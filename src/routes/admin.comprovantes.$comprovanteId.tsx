import { createFileRoute, notFound } from "@tanstack/react-router";
import { comprovantesStore } from "@/features/comprovantes/comprovantes-store";
import { ComprovanteDetalhe } from "@/features/comprovantes";

export const Route = createFileRoute("/admin/comprovantes/$comprovanteId")({
  loader: ({ params }) => {
    if (!comprovantesStore.obter(params.comprovanteId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `${comprovantesStore.obter(params.comprovanteId)?.numero ?? "Comprovante"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ComprovanteDetalheRoute,
});

function ComprovanteDetalheRoute() {
  const { comprovanteId } = Route.useParams();
  return <ComprovanteDetalhe comprovanteId={comprovanteId} />;
}
