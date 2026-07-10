import { createFileRoute } from "@tanstack/react-router";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { OrcamentoDetalhe } from "@/features/orcamentos";

// Sem loader/notFound: orcamentosStore é assíncrono (Supabase). Em navegação
// direta, o carregar() inicial pode não ter resolvido ainda — um loader que
// checa .obter() aqui daria falso "não encontrado". O componente trata
// loading/erro/não-encontrado reativamente (ver OrcamentoDetalhe).
export const Route = createFileRoute("/admin/orcamentos/$orcamentoId")({
  head: ({ params }) => ({
    meta: [
      { title: `${orcamentosStore.obter(params.orcamentoId)?.numero ?? "Orçamento"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrcamentoDetalheRoute,
});

function OrcamentoDetalheRoute() {
  const { orcamentoId } = Route.useParams();
  return <OrcamentoDetalhe orcamentoId={orcamentoId} />;
}
