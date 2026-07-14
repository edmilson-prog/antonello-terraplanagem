import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CampoComIcone } from "./campo-com-icone";

describe("CampoComIcone", () => {
  it("renderiza o rótulo e repassa o valor digitado via onChange", () => {
    const onChange = vi.fn();
    render(
      <CampoComIcone
        icone="lucide:mail"
        label="E-mail"
        id="email"
        valor=""
        onChange={onChange}
        placeholder="seu@email.com"
      />,
    );

    expect(screen.getByText("E-mail")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "joao@antonello.com" },
    });
    expect(onChange).toHaveBeenCalledWith("joao@antonello.com");
  });

  it("associa o rótulo ao input via htmlFor/id", () => {
    render(
      <CampoComIcone icone="lucide:mail" label="E-mail" id="email" valor="" onChange={() => {}} />,
    );
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("renderiza a ação opcional dentro da caixa", () => {
    render(
      <CampoComIcone
        icone="lucide:lock"
        label="Senha"
        id="senha"
        valor=""
        onChange={() => {}}
        acao={<button type="button">Mostrar senha</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
  });
});
