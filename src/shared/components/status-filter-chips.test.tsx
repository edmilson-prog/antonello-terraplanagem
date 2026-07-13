import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusFilterChips } from "./status-filter-chips";

describe("StatusFilterChips", () => {
  it("renderiza label+contador, marca o ativo e dispara onChange ao clicar", () => {
    const onChange = vi.fn();
    render(
      <StatusFilterChips
        itens={[
          { id: "todos", label: "Todos" },
          { id: "aberta", label: "Abertas", tone: "info" },
        ]}
        ativo="todos"
        counts={{ todos: 5, aberta: 2 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Todos/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Abertas/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Abertas/ }));
    expect(onChange).toHaveBeenCalledWith("aberta");
  });
});
