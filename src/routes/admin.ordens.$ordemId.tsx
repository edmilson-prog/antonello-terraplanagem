import { createFileRoute } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { OrdemDetalheRetaguarda } from "@/features/ordem-servico";

// Sem loader/notFound: ordensStore é assíncrono (Supabase). Em navegação
// direta, o carregar() inicial pode não ter resolvido ainda — um loader que
// checa .obter() aqui daria falso "não encontrada". O componente trata
// loading/erro/não-encontrada reativamente (ver OrdemDetalheRetaguarda).
export const Route = createFileRoute("/admin/ordens/$ordemId")({
  head: ({ params }) => ({
    meta: [
      { title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdemDetalheAdminRoute,
});

function OrdemDetalheAdminRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheRetaguarda ordemId={ordemId} />;
}
