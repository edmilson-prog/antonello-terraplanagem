import { createFileRoute } from "@tanstack/react-router";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorDetalhe } from "@/features/operadores";

// Sem `loader`/`notFound()` aqui de propósito: operadoresStore é respaldado
// pelo Supabase e carrega assíncrono — checar no loader criaria falso
// "não encontrado" numa navegação direta antes do fetch inicial terminar.
// O estado de loading/erro/não-encontrado é tratado no componente
// (mesmo padrão de admin.clientes.$clienteId.tsx).
export const Route = createFileRoute("/admin/operadores/$operadorId")({
  head: ({ params }) => ({
    meta: [
      { title: `${operadoresStore.getById(params.operadorId)?.nome ?? "Operador"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OperadorDetalheRoute,
});

function OperadorDetalheRoute() {
  const { operadorId } = Route.useParams();
  return <OperadorDetalhe operadorId={operadorId} />;
}
