import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "./pagina-cadastro-dedicada";

function renderComRouter() {
  const rootRoute = createRootRoute({
    component: () => (
      <PaginaCadastroDedicada
        backLabel="Clientes"
        backTo="/admin/clientes"
        title="Novo cliente"
        tag="cadastro"
      >
        <div>conteúdo do formulário</div>
      </PaginaCadastroDedicada>
    ),
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
}

describe("PaginaCadastroDedicada", () => {
  it("renderiza o link de voltar, título, tag e o conteúdo", async () => {
    renderComRouter();

    expect(await screen.findByRole("link", { name: /Clientes/ })).toHaveAttribute(
      "href",
      "/admin/clientes",
    );
    expect(screen.getByRole("heading", { name: "Novo cliente" })).toBeInTheDocument();
    expect(screen.getByText("cadastro")).toBeInTheDocument();
    expect(screen.getByText("conteúdo do formulário")).toBeInTheDocument();
  });
});
