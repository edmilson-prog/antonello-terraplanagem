import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FotoPlaceholder } from "./foto-placeholder";

describe("FotoPlaceholder", () => {
  it("renderiza a legenda e aceita className adicional", () => {
    const { container } = render(
      <FotoPlaceholder icone="lucide:truck" legenda="Foto da obra" className="h-40" />,
    );
    expect(screen.getByText("Foto da obra")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("h-40");
  });
});
