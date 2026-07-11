import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  it("renderiza uma polyline com o número certo de pontos", () => {
    const { container } = render(<Sparkline pontos={[10, 40, 20, 80]} />);
    const poly = container.querySelector("polyline");
    expect(poly).not.toBeNull();
    const pts = poly?.getAttribute("points") ?? "";
    // 4 pares "x,y" separados por espaço.
    expect(pts.trim().split(/\s+/)).toHaveLength(4);
  });

  it("não quebra com lista vazia", () => {
    const { container } = render(<Sparkline pontos={[]} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("polyline")).toBeNull();
  });
});
