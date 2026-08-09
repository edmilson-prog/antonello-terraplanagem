import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DataList, type Column } from "./data-list";

interface Item {
  id: string;
  nome: string;
}

const dados: Item[] = [
  { id: "OS-1", nome: "Obra A" },
  { id: "OS-2", nome: "Obra B" },
];

const columns: Column<Item>[] = [
  { header: "OS", cell: (i) => i.id },
  { header: "Cliente", cell: (i) => i.nome },
];

function renderLista(resizableKey?: string) {
  return render(
    <DataList
      data={dados}
      columns={columns}
      getRowKey={(i) => i.id}
      renderCard={(i) => <div>{i.nome}</div>}
      isLoading={false}
      error={null}
      onRetry={() => {}}
      empty={{ titulo: "Vazio", descricao: "Nada aqui" }}
      resizableKey={resizableKey}
    />,
  );
}

describe("DataList — colunas redimensionáveis", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // jsdom não calcula layout: finge uma largura medível para o cabeçalho.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 160,
      height: 40,
      top: 0,
      left: 0,
      right: 160,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sem resizableKey não oferece alças de ajuste", () => {
    renderLista();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("oferece uma alça por coluna quando redimensionável", () => {
    renderLista("lista-teste");
    expect(screen.getAllByRole("separator")).toHaveLength(2);
    expect(
      screen.getByRole("separator", { name: /Ajustar largura da coluna Cliente/ }),
    ).toBeInTheDocument();
  });

  it("ajusta pelo teclado e persiste a largura", () => {
    renderLista("lista-teste");
    const alca = screen.getByRole("separator", { name: /Ajustar largura da coluna Cliente/ });

    fireEvent.keyDown(alca, { key: "ArrowRight" });
    expect(window.localStorage.getItem("antonello.colunas.lista-teste")).toBe(
      JSON.stringify({ Cliente: 176 }),
    );

    fireEvent.keyDown(alca, { key: "ArrowLeft", shiftKey: true });
    expect(window.localStorage.getItem("antonello.colunas.lista-teste")).toBe(
      JSON.stringify({ Cliente: 128 }),
    );
  });

  it("duplo clique restaura a coluna e some com o botão de restaurar", () => {
    renderLista("lista-teste");
    const alca = screen.getByRole("separator", { name: /Ajustar largura da coluna Cliente/ });

    fireEvent.keyDown(alca, { key: "ArrowRight" });
    expect(
      screen.getByRole("button", { name: /Restaurar largura das colunas/ }),
    ).toBeInTheDocument();

    fireEvent.doubleClick(alca);
    expect(window.localStorage.getItem("antonello.colunas.lista-teste")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Restaurar largura das colunas/ }),
    ).not.toBeInTheDocument();
  });
});
