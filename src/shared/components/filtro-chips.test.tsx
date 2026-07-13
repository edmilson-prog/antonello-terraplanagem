import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FiltroChips } from "./filtro-chips";

describe("FiltroChips", () => {
  const itens = [
    { id: "todos", label: "Todos" },
    { id: "disponivel", label: "Disponível", tone: "neutral" as const },
    { id: "em_uso", label: "Em uso", tone: "success" as const },
  ];

  it("renderiza cada item com seu contador e aria-pressed no ativo", () => {
    render(
      <FiltroChips
        itens={itens}
        ativo="em_uso"
        onChange={() => {}}
        counts={{ todos: 5, disponivel: 2, em_uso: 3 }}
      />,
    );
    expect(screen.getByText("· 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Em uso/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Disponível/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("chama onChange com o id do item clicado", () => {
    const onChange = vi.fn();
    render(
      <FiltroChips
        itens={itens}
        ativo="todos"
        onChange={onChange}
        counts={{ todos: 5, disponivel: 2, em_uso: 3 }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Em uso/ }));
    expect(onChange).toHaveBeenCalledWith("em_uso");
  });

  it("item sem tone não renderiza o dot de led", () => {
    render(
      <FiltroChips
        itens={[{ id: "todos", label: "Todos" }]}
        ativo="todos"
        onChange={() => {}}
        counts={{ todos: 5 }}
      />,
    );
    const btn = screen.getByRole("button", { name: /Todos/ });
    expect(btn.querySelector("span.rounded-full.bg-current")).toBeNull();
  });
});
