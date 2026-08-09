import { render, screen, fireEvent, within } from "@testing-library/react";
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

function renderLista({
  gridKey,
  resizable,
  colunas = columns,
}: { gridKey?: string; resizable?: boolean; colunas?: Column<Item>[] } = {}) {
  return render(
    <DataList
      data={dados}
      columns={colunas}
      getRowKey={(i) => i.id}
      renderCard={(i) => <div>{i.nome}</div>}
      isLoading={false}
      error={null}
      onRetry={() => {}}
      empty={{ titulo: "Vazio", descricao: "Nada aqui" }}
      gridKey={gridKey}
      resizable={resizable}
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

  it("sem resizable não oferece alças de ajuste", () => {
    renderLista({ gridKey: "lista-teste" });
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("oferece uma alça por coluna quando redimensionável", () => {
    renderLista({ gridKey: "lista-teste", resizable: true });
    expect(screen.getAllByRole("separator")).toHaveLength(2);
    expect(
      screen.getByRole("separator", { name: /Ajustar largura da coluna Cliente/ }),
    ).toBeInTheDocument();
  });

  it("ajusta pelo teclado e persiste a largura", () => {
    renderLista({ gridKey: "lista-teste", resizable: true });
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
    renderLista({ gridKey: "lista-teste", resizable: true });
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

describe("DataList — exibir/ocultar colunas", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("respeita as colunas escondidas guardadas na preferência", () => {
    window.localStorage.setItem(
      "antonello.colunas-ocultas.lista-teste",
      JSON.stringify(["Cliente"]),
    );
    renderLista({ gridKey: "lista-teste" });

    expect(screen.getByRole("columnheader", { name: "OS" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Cliente" })).not.toBeInTheDocument();
    // Os cards do mobile seguem completos — esconder coluna vale para a tabela.
    expect(within(screen.getByRole("table")).queryByText("Obra A")).not.toBeInTheDocument();
    expect(screen.getByText("1 coluna oculta")).toBeInTheDocument();
  });

  it("mostrar todas devolve as colunas e limpa a preferência", () => {
    window.localStorage.setItem(
      "antonello.colunas-ocultas.lista-teste",
      JSON.stringify(["Cliente"]),
    );
    renderLista({ gridKey: "lista-teste" });

    fireEvent.click(screen.getByRole("button", { name: /Mostrar todas/ }));

    expect(screen.getByRole("columnheader", { name: "Cliente" })).toBeInTheDocument();
    expect(window.localStorage.getItem("antonello.colunas-ocultas.lista-teste")).toBeNull();
  });

  it("nunca esconde a última coluna, mesmo com preferência inválida", () => {
    window.localStorage.setItem(
      "antonello.colunas-ocultas.lista-teste",
      JSON.stringify(["OS", "Cliente"]),
    );
    renderLista({ gridKey: "lista-teste" });

    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  });

  it("menu do botão direito lista as colunas e esconde a escolhida", async () => {
    renderLista({ gridKey: "lista-teste" });

    fireEvent.contextMenu(screen.getByRole("table"));
    const item = await screen.findByRole("menuitemcheckbox", { name: "Cliente" });
    expect(item).toHaveAttribute("aria-checked", "true");

    fireEvent.click(item);

    expect(screen.queryByRole("columnheader", { name: "Cliente" })).not.toBeInTheDocument();
    expect(window.localStorage.getItem("antonello.colunas-ocultas.lista-teste")).toBe(
      JSON.stringify(["Cliente"]),
    );
  });

  it("coluna marcada como fixa não entra no menu nem pode ser escondida", async () => {
    window.localStorage.setItem("antonello.colunas-ocultas.lista-teste", JSON.stringify(["OS"]));
    renderLista({
      gridKey: "lista-teste",
      colunas: [
        { header: "OS", cell: (i) => i.id, fixa: true },
        { header: "Cliente", cell: (i) => i.nome },
      ],
    });

    expect(screen.getByRole("columnheader", { name: "OS" })).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByRole("table"));
    const itens = await screen.findAllByRole("menuitemcheckbox");
    expect(itens.map((i) => i.textContent)).toEqual(["Cliente"]);
  });
});
