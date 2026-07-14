import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renderiza navegação, contato e CNPJ", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "#servicos");
    expect(screen.getByText("(55) 99924-2409")).toBeInTheDocument();
    expect(screen.getByText("Frederico Westphalen — RS")).toBeInTheDocument();
    expect(screen.getByText(/CNPJ 36\.508\.280\/0001-90/)).toBeInTheDocument();
  });
});
