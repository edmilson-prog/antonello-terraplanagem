import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LandingPage } from "./landing-page";

describe("LandingPage", () => {
  it("monta todas as seções sem erros", () => {
    render(<LandingPage />);

    // Header (marca também aparece no footer, então escopamos ao landmark do header)
    expect(within(screen.getByRole("banner")).getByText("ANTONELLO")).toBeInTheDocument();
    // Hero
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "O terreno pronto para o seu projeto",
    );
    // Contadores
    expect(screen.getByText("Anos de estrada")).toBeInTheDocument();
    // Serviços
    expect(screen.getByText("Infraestrutura de solo do início ao fim")).toBeInTheDocument();
    // Frota
    expect(screen.getByText("Máquina certa, hora certa")).toBeInTheDocument();
    // Processo
    expect(screen.getByText("Obra gerenciada, não improvisada")).toBeInTheDocument();
    // Contato
    expect(screen.getByText(/Tem um terreno para/)).toBeInTheDocument();
    // Footer
    expect(screen.getByText(/CNPJ 36\.508\.280\/0001-90/)).toBeInTheDocument();
  });
});
