import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinhaEntidadeCell } from "./linha-entidade-cell";

describe("LinhaEntidadeCell", () => {
  it("renderiza variante ícone com título e subtítulo", () => {
    render(
      <LinhaEntidadeCell
        variante="icone"
        icone="lucide:building-2"
        titulo="Construtora Vale Verde"
        subtitulo="Santo Ângelo — RS"
      />,
    );
    expect(screen.getByText("Construtora Vale Verde")).toBeInTheDocument();
    expect(screen.getByText("Santo Ângelo — RS")).toBeInTheDocument();
  });

  it("renderiza variante avatar com iniciais, sem subtítulo quando omitido", () => {
    render(<LinhaEntidadeCell variante="avatar" iniciais="JV" titulo="João Vitor" />);
    expect(screen.getByText("JV")).toBeInTheDocument();
    expect(screen.getByText("João Vitor")).toBeInTheDocument();
  });
});
