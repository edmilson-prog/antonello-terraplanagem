import { createFileRoute } from "@tanstack/react-router";
import { OperadoresPage } from "@/features/operadores";

export const Route = createFileRoute("/admin/operadores")({
  head: () => ({
    meta: [
      { title: "Operadores · Antonello" },
      {
        name: "description",
        content: "Cadastro de operadores da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OperadoresPage,
});
