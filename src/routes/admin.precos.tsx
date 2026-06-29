// src/routes/admin.precos.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PrecosPage } from "@/features/precos";

export const Route = createFileRoute("/admin/precos")({
  head: () => ({
    meta: [
      { title: "Preços · Antonello" },
      {
        name: "description",
        content: "Tabela de preços (hora-máquina e por metro) da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PrecosPage,
});
