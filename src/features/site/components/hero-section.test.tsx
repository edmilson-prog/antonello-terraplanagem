import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  it("renderiza o título, os CTAs de WhatsApp e os chips", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "O terreno pronto para o seu projeto",
    );

    const orcamento = screen.getByRole("link", { name: /pedir orçamento/i });
    expect(orcamento).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));

    const whatsapp = screen.getByRole("link", { name: /falar no whatsapp/i });
    expect(whatsapp).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));
    expect(orcamento).not.toBe(whatsapp);

    expect(screen.getByText("Apontamento por horímetro")).toBeInTheDocument();
    expect(screen.getByText("Medição e NF por etapa")).toBeInTheDocument();
    expect(screen.getByText("Orçamento em até 48 h")).toBeInTheDocument();
    expect(screen.getByText(/Frederico Westphalen — RS/)).toBeInTheDocument();
  });
});
