import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContatoBand } from "./contato-band";

describe("ContatoBand", () => {
  it("renderiza a chamada final, o CTA de orçamento e o telefone", () => {
    render(<ContatoBand />);
    expect(screen.getByText(/Tem um terreno para/)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /pedir orçamento/i });
    expect(cta).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));
    expect(screen.getByText("(55) 99924-2409")).toBeInTheDocument();
  });
});
