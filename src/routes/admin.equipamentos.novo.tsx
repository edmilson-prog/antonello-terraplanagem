import { createFileRoute } from "@tanstack/react-router";
import { NovoEquipamentoPage } from "@/features/equipamentos/components/novo-equipamento-page";

export const Route = createFileRoute("/admin/equipamentos/novo")({
  head: () => ({
    meta: [
      { title: "Novo equipamento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoEquipamentoPage,
});
