import { createFileRoute } from "@tanstack/react-router";
import { EquipamentosPage } from "@/features/equipamentos";

export const Route = createFileRoute("/admin/equipamentos")({
  head: () => ({
    meta: [
      { title: "Equipamentos · Antonello" },
      {
        name: "description",
        content: "Cadastro da frota de equipamentos da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EquipamentosPage,
});
