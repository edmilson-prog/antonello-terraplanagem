import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";

// Rota-mãe das telas de uma OS no app de campo (detalhe, ficha do equipamento,
// mapa e os registros de campo). Sem loader/notFound: ordensStore é assíncrono
// (Supabase) e em navegação direta o carregar() inicial pode não ter resolvido
// — um loader que checa .obter() aqui daria falso "não encontrada". Cada tela
// trata loading/erro/não-encontrada reativamente.
export const Route = createFileRoute("/app/ordens/$ordemId")({
  head: ({ params }) => ({
    meta: [
      { title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Outlet,
});
