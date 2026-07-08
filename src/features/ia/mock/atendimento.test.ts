import { describe, expect, it } from "vitest";
import { responderChatbotCliente, sugerirAlocacao } from "@/features/ia/mock/atendimento";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";

describe("responderChatbotCliente", () => {
  it("answers a status_obra question about an ongoing obra", async () => {
    const cliente = clientesStore.getAll()[0];
    const ordem = ordensStore.criar({
      cliente_id: cliente.id,
      obra_nome: "Obra teste D11",
      endereco: null,
      modelo_cobranca: "hora_maquina",
      responsavel_id: null,
      observacao: null,
      diametro_broca_mm: null,
      numero: "OS-TESTE-D11",
    });
    const resposta = await responderChatbotCliente("qual o status da minha obra?", cliente.id, { delayMs: 0 });
    expect(resposta).toContain(ordem.obra_nome);
  });

  it("falls back to human handoff for a question outside the 3 intents", async () => {
    const cliente = clientesStore.getAll()[0];
    const resposta = await responderChatbotCliente("vocês fazem terraplanagem em outra cidade?", cliente.id, {
      delayMs: 0,
    });
    expect(resposta).toContain("encaminhar sua mensagem para um atendente");
  });
});

describe("sugerirAlocacao", () => {
  it("returns nothing for por_metro billing (no per-equipment allocation concept)", async () => {
    const sugestoes = await sugerirAlocacao({ modeloCobranca: "por_metro" }, { delayMs: 0 });
    expect(sugestoes).toEqual([]);
  });

  it("suggests up to 3 equipamentos not currently em_andamento, for hora_maquina", async () => {
    const sugestoes = await sugerirAlocacao({ modeloCobranca: "hora_maquina" }, { delayMs: 0 });
    expect(sugestoes.length).toBeLessThanOrEqual(3);
    for (const s of sugestoes) {
      expect(s.justificativa).toBeTruthy();
    }
  });
});
