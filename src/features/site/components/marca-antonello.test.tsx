import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarcaAntonello } from "./marca-antonello";

describe("MarcaAntonello", () => {
  it("renderiza o nome da marca com link para o topo", () => {
    render(<MarcaAntonello />);
    expect(screen.getByText("ANTONELLO")).toBeInTheDocument();
    expect(screen.getByText("TERRAPLANAGEM")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "#top");
  });
});
