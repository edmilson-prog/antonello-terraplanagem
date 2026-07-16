import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";

describe("PrecoHoraMaquinaList — Custo ref./Margem", () => {
  // PrecoHoraMaquinaList usa useMockResource (delay simulado de loading) e
  // equipamentosStore (carregamento assíncrono via Supabase mockado) — por
  // isso as consultas usam findBy/findAllBy (retry com timeout) em vez de
  // getBy/getAllBy síncronos.

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
    render(<PrecoHoraMaquinaList />);
    const percentuais = await screen.findAllByText(/%$/);
    const margemBaixa = percentuais.find((el) => {
      const valor = Number(el.textContent?.replace("%", ""));
      return valor < 30;
    });
    if (margemBaixa) {
      expect(margemBaixa.className).toContain("text-destructive");
    }
  });
});
