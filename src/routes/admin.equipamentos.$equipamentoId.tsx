import { createFileRoute } from "@tanstack/react-router";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { EquipamentoDetalhe } from "@/features/equipamentos";

// Sem `loader`/`notFound()` aqui de propósito: equipamentosStore é respaldado
// pelo Supabase e carrega assíncrono — checar no loader criaria falso "não
// encontrado" numa navegação direta antes do fetch inicial terminar. O estado
// de loading/erro/não-encontrado é tratado no componente (mesmo padrão de
// admin.clientes.$clienteId.tsx e admin.operadores.$operadorId.tsx).
export const Route = createFileRoute("/admin/equipamentos/$equipamentoId")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${equipamentosStore.getById(params.equipamentoId)?.nome ?? "Equipamento"} · Antonello`,
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EquipamentoDetalheRoute,
});

function EquipamentoDetalheRoute() {
  const { equipamentoId } = Route.useParams();
  return <EquipamentoDetalhe equipamentoId={equipamentoId} />;
}
