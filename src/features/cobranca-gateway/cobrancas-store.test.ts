import { describe, it, expect, beforeEach } from "vitest";
import { criarCobrancasStore } from "./cobrancas-store";
import { criarContasReceberStore } from "@/features/financeiro/contas-receber-store";
import type { ContaReceber, CobrancaGateway } from "@/shared/types";

const seedContas: ContaReceber[] = [
  {
    id: "cr-t01",
    faturamento_id: "fat-001",
    cliente_id: "cl-001",
    valor: 1000,
    vencimento: "2026-07-01",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "cr-t02",
    faturamento_id: "fat-002",
    cliente_id: "cl-002",
    valor: 500,
    vencimento: "2026-07-05",
    status: "liquidada",
    recebido_em: "2026-06-30",
    forma_recebimento: "pix",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "cr-t03",
    faturamento_id: "fat-003",
    cliente_id: "cl-003",
    valor: 2000,
    vencimento: "2026-07-10",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

const seedCobrancas: CobrancaGateway[] = [
  {
    id: "cob-t01",
    conta_receber_id: "cr-t01",
    provedor: "mercado_pago",
    status: "pendente",
    linha_digitavel: "34191.00000 00000.000000 00000.000000 1 00000000100000",
    pix_copia_cola: "pix-mock-t01",
    valor: 1000,
    emitida_em: "2026-06-15T00:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-15T00:00:00.000Z",
    updated_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "cob-t02",
    conta_receber_id: "cr-t02", // conta já liquidada por fora — edge case de falha na baixa
    provedor: "asaas",
    status: "pendente",
    linha_digitavel: null,
    pix_copia_cola: "pix-mock-t02",
    valor: 500,
    emitida_em: "2026-06-20T00:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-20T00:00:00.000Z",
    updated_at: "2026-06-20T00:00:00.000Z",
  },
];

describe("criarCobrancasStore", () => {
  let contasStore: ReturnType<typeof criarContasReceberStore>;
  let store: ReturnType<typeof criarCobrancasStore>;

  beforeEach(() => {
    contasStore = criarContasReceberStore(seedContas);
    store = criarCobrancasStore(seedCobrancas, contasStore);
  });

  it("listar retorna os 2 itens do seed", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("emitirCobranca cria pendente com valor espelhado da conta e strings simuladas", () => {
    const r = store.emitirCobranca("cr-t03", "asaas");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cobranca.status).toBe("pendente");
      expect(r.cobranca.provedor).toBe("asaas");
      expect(r.cobranca.valor).toBe(2000);
      expect(r.cobranca.pix_copia_cola.length).toBeGreaterThan(0);
    }
  });

  it("emitirCobranca em conta já liquidada retorna ok:false", () => {
    const r = store.emitirCobranca("cr-t02", "mercado_pago");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("liquidada");
  });

  it("emitirCobranca em conta que já tem cobrança pendente retorna ok:false", () => {
    const r = store.emitirCobranca("cr-t01", "asaas");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("pendente");
  });

  it("emitirCobranca em conta inexistente retorna ok:false", () => {
    const r = store.emitirCobranca("inexistente", "mercado_pago");
    expect(r.ok).toBe(false);
  });

  it("simularWebhookPago marca a cobrança como paga E dá baixa automática na conta", () => {
    const r = store.simularWebhookPago("cob-t01");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cobranca.status).toBe("paga");
      expect(r.cobranca.paga_em).not.toBeNull();
    }
    expect(contasStore.obter("cr-t01")?.status).toBe("liquidada");
    expect(contasStore.obter("cr-t01")?.forma_recebimento).toBe("boleto"); // linha_digitavel não-nula em cob-t01
  });

  it("simularWebhookPago em cobrança já paga retorna ok:false (idempotente)", () => {
    store.simularWebhookPago("cob-t01");
    const r = store.simularWebhookPago("cob-t01");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já foi paga");
  });

  it("simularWebhookPago propaga falha da baixa e mantém a cobrança pendente", () => {
    const r = store.simularWebhookPago("cob-t02"); // cr-t02 já está liquidada
    expect(r.ok).toBe(false);
    expect(store.obter("cob-t02")?.status).toBe("pendente");
  });

  it("simularWebhookPago em cobrança inexistente retorna ok:false", () => {
    const r = store.simularWebhookPago("inexistente");
    expect(r.ok).toBe(false);
  });
});
