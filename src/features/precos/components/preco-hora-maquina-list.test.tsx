import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { componentesCusto as componentesCustoFixture } from "@/mocks/componentes-custo";
import type { ComponenteCusto } from "@/shared/types";

// Nenhuma linha dos fixtures reais de precos-hora-maquina/componentes-custo
// produz margem < 30% (phm-001≈80%, phm-002≈86%, phm-005≈77%; phm-003/004 são
// por tipo e phm-006/eq-007 não tem componente — ambos "—"). Mockar o store
// aqui (só neste arquivo de teste) permite injetar um cenário de margem baixa
// sem alterar os fixtures compartilhados, dos quais outros testes do repo
// dependem (custo-hora/derivacoes.test.ts, componente-custo-form.test.tsx).
vi.mock("@/features/custo-hora/componentes-custo-store", () => ({
  componentesCustoStore: { useAll: vi.fn() },
}));

describe("PrecoHoraMaquinaList — Custo ref./Margem", () => {
  // PrecoHoraMaquinaList usa useMockResource (delay simulado de loading) e
  // equipamentosStore (carregamento assíncrono via Supabase mockado) — por
  // isso as consultas usam findBy/findAllBy (retry com timeout) em vez de
  // getBy/getAllBy síncronos.

  beforeEach(() => {
    // Default: mesmos dados do fixture real, para os 3 primeiros testes
    // continuarem exercitando o cenário real sem mudanças.
    vi.mocked(componentesCustoStore.useAll).mockReturnValue(componentesCustoFixture);
  });

  it("mostra custo de referência e margem para um preço vinculado a equipamento com componentes de custo", async () => {
    render(<PrecoHoraMaquinaList />);
    // phm-001 (eq-001): custo ref. = 71.25, preço operada = 360 → margem ≈ 80%
    expect((await screen.findAllByText("R$ 71,25")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("80%")).length).toBeGreaterThan(0);
  });

  it('mostra "—" para preço vinculado a tipo de equipamento (sem componente de custo próprio)', async () => {
    render(<PrecoHoraMaquinaList />);
    // phm-003 é vinculado a tipo_equipamento "carregadeira", sem equipamento_id
    // O texto aparece 2x (tabela desktop + card mobile, ambos no DOM em jsdom),
    // por isso usamos findAllByText e pegamos a ocorrência dentro de uma <tr>.
    const elementos = await screen.findAllByText("Tipo: Carregadeira");
    const linhaTipo = elementos.map((el) => el.closest("tr")).find((tr) => tr !== null);
    expect(linhaTipo).not.toBeNull();
    expect(linhaTipo!.textContent).toContain("—");
  });

  it('mostra "—" para preço de equipamento sem nenhum componente de custo cadastrado (phm-006/eq-007)', async () => {
    render(<PrecoHoraMaquinaList />);
    const elementos = await screen.findAllByText(
      "RETROESCAVADEIRA JCB 3CX PARA SERVIÇOS DE FUNDAÇÃO, VALA E NIVELAMENTO FINO EM TERRENO URBANO",
    );
    const linhaSemComponente = elementos.map((el) => el.closest("tr")).find((tr) => tr !== null);
    expect(linhaSemComponente).not.toBeNull();
    expect(linhaSemComponente!.textContent).toContain("—");
  });

  it("aplica destaque de alerta quando a margem fica abaixo de 30%", async () => {
    // eq-001 (phm-001, valor_hora_operada: 360) recebe um componente fixo
    // sintético bem acima do necessário pra cravar a margem abaixo de 30%
    // (limiar: custo ref. > 252 = 70% de 360). custo ref. = 100000/160 = 625
    // → margem = (360-625)/360 ≈ -74%.
    const componenteAlto: ComponenteCusto = {
      id: "cc-teste-margem-baixa",
      equipamento_id: "eq-001",
      descricao: "Componente sintético — margem baixa (teste)",
      tipo: "fixo_mensal",
      valor: 100000,
      categoria: null,
      competencia: null,
      observacao: null,
      ativo: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };
    vi.mocked(componentesCustoStore.useAll).mockReturnValue([componenteAlto]);

    render(<PrecoHoraMaquinaList />);
    const percentuais = await screen.findAllByText(/%$/);
    const margemBaixa = percentuais.find((el) => {
      const valor = Number(el.textContent?.replace("%", ""));
      return valor < 30;
    });
    expect(margemBaixa).toBeDefined();
    expect(margemBaixa!.className).toContain("text-destructive");
  });
});
