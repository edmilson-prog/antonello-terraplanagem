import { describe, expect, it } from "vitest";
import { responderPergunta, PERGUNTAS_EXEMPLO } from "@/features/ia/mock/perguntas-respostas";

describe("responderPergunta", () => {
  it("answers how many OS are open", async () => {
    const r = await responderPergunta("Quantas OS estão abertas?");
    expect(r.resposta).toMatch(/ordem\(ns\) de serviço em aberto/);
    expect(r.fonte_rota).toBe("/admin/ordens");
  });

  it("answers hours worked by a named equipamento", async () => {
    const r = await responderPergunta("Quantas horas a Caterpillar 320D já trabalhou?");
    expect(r.resposta).toContain("Caterpillar 320D");
    expect(r.fonte_rota).toBe("/admin/equipamentos");
  });

  it("answers the projected cash balance", async () => {
    const r = await responderPergunta("Qual o saldo previsto de caixa?");
    expect(r.resposta).toMatch(/saldo de caixa previsto/);
    expect(r.fonte_rota).toBe("/admin/financeiro");
  });

  it("falls back to a not-yet-answerable message with suggestions for an unmapped question", async () => {
    const r = await responderPergunta("Vai chover amanhã na obra?");
    expect(r.resposta).toContain("Ainda não sei responder isso");
    expect(r.fonte_rota).toBeUndefined();
  });

  it("exports at least 8 example questions", () => {
    expect(PERGUNTAS_EXEMPLO.length).toBeGreaterThanOrEqual(8);
  });
});
