import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarqueeServicos } from "./marquee-servicos";

describe("MarqueeServicos", () => {
  it("renderiza a lista de serviços duplicada para o loop contínuo", () => {
    render(<MarqueeServicos />);
    expect(screen.getAllByText("Terraplenagem")).toHaveLength(2);
    expect(screen.getAllByText("Limpeza de terreno")).toHaveLength(2);
  });
});
