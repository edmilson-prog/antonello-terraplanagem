import { createFileRoute } from "@tanstack/react-router";
import { CustoHoraPage } from "@/features/custo-hora";

export const Route = createFileRoute("/admin/custo-hora")({
  head: () => ({
    meta: [
      { title: "Custo da Hora-Máquina · Antonello" },
      {
        name: "description",
        content: "Custo real por hora de cada equipamento, comparado ao preço praticado.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CustoHoraPage,
});
