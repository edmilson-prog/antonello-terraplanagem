import { createFileRoute } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { OrdemDetalheOperador } from "@/features/ordem-servico";

// Sem loader/notFound: ordensStore é assíncrono (Supabase). Em navegação
// direta, o carregar() inicial pode não ter resolvido ainda — um loader que
// checa .obter() aqui daria falso "não encontrada". O componente trata
// loading/erro/não-encontrada reativamente (ver OrdemDetalheOperador).
export const Route = createFileRoute("/app/ordens/$ordemId")({
  head: ({ params }) => ({
    meta: [{ title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` }],
  }),
  component: OrdemDetalheRoute,
});

function OrdemDetalheRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheOperador ordemId={ordemId} />;
}
