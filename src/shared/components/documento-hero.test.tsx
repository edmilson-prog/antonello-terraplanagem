import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DocumentoHero } from "./documento-hero";

describe("DocumentoHero", () => {
  it("renderiza número, título, quickfacts e slots", () => {
    render(
      <DocumentoHero
        icone="lucide:file-text"
        numero="ORC-2026-0001"
        titulo="Terraplenagem lote 12"
        badges={<span>enviado</span>}
        quickfacts={[{ rotulo: "Cliente", valor: "Construtora XY" }]}
        acoes={<button>Editar</button>}
      />,
    );
    expect(screen.getByText("ORC-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Terraplenagem lote 12")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Construtora XY")).toBeInTheDocument();
    expect(screen.getByText("enviado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });
});
