import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/site/components/landing-page";

const URL_PAGINA = "https://antonello-terraplanagem.lovable.app/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Antonello Terraplanagem · Terraplenagem, escavação e infraestrutura de solo" },
      {
        name: "description",
        content:
          "Terraplenagem, escavação e infraestrutura de solo em Frederico Westphalen — RS, com equipamentos próprios, operadores experientes e gestão de obra em tempo real.",
      },
      {
        property: "og:title",
        content: "Antonello Terraplanagem · Terraplenagem, escavação e infraestrutura de solo",
      },
      {
        property: "og:description",
        content:
          "Equipamentos próprios, operadores experientes e gestão de obra em tempo real — do orçamento à nota fiscal.",
      },
      { property: "og:url", content: URL_PAGINA },
    ],
    links: [{ rel: "canonical", href: URL_PAGINA }],
  }),
  component: LandingPage,
});
