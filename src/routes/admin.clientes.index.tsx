import { createFileRoute } from "@tanstack/react-router";
import { ClientesPage } from "@/features/clientes";

export const Route = createFileRoute("/admin/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes · Antonello" },
      {
        name: "description",
        content: "Cadastro de clientes da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClientesPage,
});
