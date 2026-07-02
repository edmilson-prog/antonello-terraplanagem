import { createFileRoute } from "@tanstack/react-router";
import { InicioOperadorPage } from "@/features/operador/components/inicio-page";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Início · Painel do Operador · Antonello" },
      {
        name: "description",
        content: "Resumo do turno, equipamento atribuído e OS do dia para o operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: InicioOperadorPage,
});
