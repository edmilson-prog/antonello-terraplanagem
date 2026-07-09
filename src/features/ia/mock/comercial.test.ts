import { describe, expect, it, beforeEach } from "vitest";
import { gerarTexto, sugerirOrcamento } from "@/features/ia/mock/comercial";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { gravarSessaoOperador } from "@/features/auth/operador-session";
import type { OrdemServico } from "@/shared/types";

describe("sugerirOrcamento", () => {
  beforeEach(() => {
    gravarSessaoOperador({
      token: "t",
      operadorId: "op-001",
      operadorNome: "Teste",
      expiraEm: new Date(Date.now() + 1000).toISOString(),
    });
  });


  it("returns no items and a clear justificativa when there is no similar obra", () => {
    return sugerirOrcamento(
      { clienteId: "cliente-inexistente-xyz", modeloCobranca: "hora_maquina" },
      { delayMs: 0 },
    ).then((sugestao) => {
      expect(sugestao.itens).toEqual([]);
      expect(sugestao.justificativa).toContain("Sem obras semelhantes");
    });
  });

  it("suggests hora_maquina items based on real past apontamentos of the same modelo_cobranca", async () => {
    const equipamento = equipamentosStore.getAll()[0];
    const ordem = ordensStore.criar({
      cliente_id: "cliente-teste-c9",
      obra_nome: "Obra teste C9",
      endereco: null,
      modelo_cobranca: "hora_maquina",
      responsavel_id: null,
      observacao: null,
      diametro_broca_mm: null,
      numero: "OS-TESTE-C9",
    });
    apontamentosStore.iniciar({ equipamento_id: equipamento.id, horimetro_inicial: 100, os_id: ordem.id });
    const emAndamento = apontamentosStore.listar()[0];
    apontamentosStore.finalizar(emAndamento.id, { horimetro_final: 110 });

    const sugestao = await sugerirOrcamento(
      { clienteId: "cliente-teste-c9", modeloCobranca: "hora_maquina" },
      { delayMs: 0 },
    );
    expect(sugestao.itens.length).toBeGreaterThan(0);
    expect(sugestao.itens[0]).toMatchObject({ tipo: "hora_maquina", origem_id: equipamento.id, quantidade_estimada: 10 });
    expect(sugestao.justificativa).toContain("cliente");
  });
});

describe("gerarTexto", () => {
  it("wraps montarResumoServico's real derivation with an IA framing, never inventing numbers", async () => {
    const os: OrdemServico = {
      id: "os-1",
      numero: "OS-2026-0001",
      cliente_id: "cli-1",
      obra_nome: "Loteamento Vista Alegre",
      endereco: null,
      modelo_cobranca: "hora_maquina",
      status: "em_andamento",
      responsavel_id: null,
      observacao: null,
      diametro_broca_mm: null,
      aberta_em: "2026-06-01T00:00:00.000Z",
      fechada_em: null,
      pendente_sync: false,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-01T00:00:00.000Z",
    };
    const texto = await gerarTexto(os, [], [], { delayMs: 0 });
    expect(texto).toContain("Loteamento Vista Alegre");
    expect(texto).not.toMatch(/R\$/);
  });
});
