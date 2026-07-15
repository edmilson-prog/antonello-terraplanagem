import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { OrdemForm } from "./ordem-form";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import type { OrcamentoItem, OrdemServico } from "@/shared/types";

// sonner é mockado (padrão do projeto, ver esqueci-senha-dialog.test.tsx) para
// podermos verificar qual toast foi disparado sem depender do container real.
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

// jsdom não implementa a Pointer Events API nem scrollIntoView — o <Select>
// do shadcn/ui (Radix) usa hasPointerCapture/setPointerCapture ao abrir e
// scrollIntoView ao destacar o item selecionado. Sem este polyfill, disparar
// pointerdown no trigger quebra com "target.hasPointerCapture is not a
// function" antes mesmo de abrir a lista. Só este arquivo precisa, por ora
// (primeiro teste de componente a interagir com um <Select> de verdade).
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

function ordemExistente(over: Partial<OrdemServico> = {}): OrdemServico {
  return {
    id: "os-teste-existente",
    numero: "OS-2026-0099",
    cliente_id: "cl-001",
    obra_nome: "Obra já aberta",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "aberta",
    responsavel_id: null,
    observacao: null,
    diametro_broca_mm: null,
    tipo_servico: null,
    equipamento_previsto_id: null,
    inicio_previsto: null,
    aberta_em: "2026-06-01T00:00:00.000Z",
    fechada_em: null,
    pendente_sync: false,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...over,
  };
}

function itemOrcamento(over: Partial<OrcamentoItem> = {}): OrcamentoItem {
  return {
    id: crypto.randomUUID(),
    tipo: "hora_maquina",
    descricao: "Escavadeira — 10 h operada (estimado)",
    origem_id: "eq-001",
    hora_tipo: "operada",
    quantidade_estimada: 10,
    valor_unitario: 360,
    valor_total: 3600,
    sem_preco: false,
    ...over,
  };
}

// Cria e aprova um orçamento (sem os_id) para aparecer no select "Orçamento
// vinculado" do formulário de criação — nenhum orçamento aprovado e ainda
// livre existe nos fixtures de src/mocks/orcamentos.ts (o único "aprovado"
// já tem os_id preenchido).
async function criarOrcamentoAprovadoVinculavel(descricaoObra: string) {
  const orc = await orcamentosStore.criar({
    cliente_id: "cl-001",
    descricao_obra: descricaoObra,
    validade: "2026-12-31",
  });
  await orcamentosStore.atualizar(orc.id, { itens: [itemOrcamento()] });
  await orcamentosStore.enviar(orc.id);
  const decidido = await orcamentosStore.aprovar(orc.id);
  if (!decidido.ok) throw new Error("Falha ao preparar fixture de orçamento aprovado");
  return decidido.orcamento;
}

// Abre um <Select> do shadcn/ui (Radix) associado ao rótulo informado e
// escolhe a opção pelo texto visível. O trigger é um <button> associado ao
// <Label htmlFor>, então getByLabelText o localiza normalmente.
async function selecionarOpcao(labelText: string | RegExp, opcaoTexto: string | RegExp) {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: "mouse", button: 0 });
  fireEvent.click(trigger);
  const listbox = await screen.findByRole("listbox");
  const opcao = within(listbox).getByText(opcaoTexto);
  fireEvent.pointerUp(opcao);
  fireEvent.click(opcao);
}

describe("OrdemForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.warning).mockClear();
  });

  it("na criação mostra o select de orçamento vinculado", async () => {
    render(<OrdemForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Orçamento vinculado")).toBeInTheDocument();
    });
  });

  it("na edição não mostra o select de orçamento vinculado", () => {
    render(<OrdemForm inicial={ordemExistente()} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.queryByText("Orçamento vinculado")).not.toBeInTheDocument();
  });

  it("quando vincularOS falha após a OS já ter sido criada, avisa e ainda chama onSuccess (sem duplicar a OS)", async () => {
    const descricaoObra = "Obra teste vínculo de orçamento";
    const orcamento = await criarOrcamentoAprovadoVinculavel(descricaoObra);
    vi.spyOn(orcamentosStore, "vincularOS").mockRejectedValueOnce(new Error("falha de rede"));

    const onSuccess = vi.fn();
    render(<OrdemForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    await selecionarOpcao("Cliente *", "CONSTRUTORA HORIZONTE LTDA.");
    fireEvent.change(screen.getByLabelText("Obra *"), {
      target: { value: "Terraplenagem — vínculo de orçamento" },
    });
    await selecionarOpcao("Tipo de serviço *", "Terraplenagem");
    await selecionarOpcao("Orçamento vinculado", `${orcamento.numero} · ${descricaoObra}`);

    fireEvent.click(screen.getByRole("button", { name: "Criar OS" }));

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        "OS criada, mas não foi possível vincular o orçamento.",
      );
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
