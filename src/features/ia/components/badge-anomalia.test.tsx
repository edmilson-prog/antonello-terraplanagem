import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BadgeAnomalia } from "@/features/ia/components/badge-anomalia";

describe("BadgeAnomalia", () => {
  it("renders the reason as a title attribute", () => {
    render(<BadgeAnomalia motivo="Salto de horímetro atípico" severidade="alerta" />);
    expect(screen.getByTitle("Salto de horímetro atípico")).toBeInTheDocument();
  });

  it("shows the anomaly label", () => {
    render(<BadgeAnomalia motivo="x" severidade="atencao" />);
    expect(screen.getByText("Anomalia")).toBeInTheDocument();
  });
});
