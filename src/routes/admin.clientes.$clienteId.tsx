import { createFileRoute } from "@tanstack/react-router";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteDetalhe } from "@/features/clientes";

// Sem `loader`/`notFound()` aqui de propósito: ao contrário de ordens/
// comprovantes (mock, dados sempre disponíveis de cara), clientesStore é
// respaldado pelo Supabase e carrega assíncrono — checar no loader criaria
// falso "não encontrado" numa navegação direta antes do fetch inicial
// terminar. O estado de loading/erro/não-encontrado é tratado no componente.
export const Route = createFileRoute("/admin/clientes/$clienteId")({
  head: ({ params }) => ({
    meta: [
      { title: `${clientesStore.getById(params.clienteId)?.nome ?? "Cliente"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClienteDetalheRoute,
});

function ClienteDetalheRoute() {
  const { clienteId } = Route.useParams();
  return <ClienteDetalhe clienteId={clienteId} />;
}
