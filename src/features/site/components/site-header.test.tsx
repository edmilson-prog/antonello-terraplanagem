import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renderiza os links de navegação e o CTA de orçamento", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "#servicos");
    expect(screen.getByRole("link", { name: "Frota" })).toHaveAttribute("href", "#frota");
    expect(screen.getByRole("link", { name: "Como trabalhamos" })).toHaveAttribute(
      "href",
      "#processo",
    );
    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute("href", "#contato");

    const cta = screen.getByRole("link", { name: /pedir orçamento/i });
    expect(cta).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));
    expect(cta).toHaveAttribute("target", "_blank");
  });
});
