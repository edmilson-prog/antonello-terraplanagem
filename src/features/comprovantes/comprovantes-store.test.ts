import { describe, expect, it } from "vitest";
import { criarComprovantesStore } from "@/features/comprovantes/comprovantes-store";
import type { Comprovante } from "@/shared/types";

const base = (over: Partial<Comprovante> = {}): Comprovante => ({
  id: "cmp-x",
  numero: "CMP-2026-0001",
  os_id: "os-x",
  cliente_id: "cl-001",
  resumo_servico:
    "Obra: Teste\nPeríodo: 10/06/2026 a 11/06/2026\nEquipamentos: —\nTotal de horas: 0h",
  assinante_nome: null,
  assinatura_url: null,
  status: "pendente",
  motivo_recusa: null,
  gerado_em: "2026-06-11T18:00:00.000Z",
  assinado_em: null,
  created_at: "2026-06-11T18:00:00.000Z",
  updated_at: "2026-06-11T18:00:00.000Z",
  ...over,
});

describe("gerar", () => {
  it("cria pendente com número sequencial", () => {
    const store = criarComprovantesStore([]);
    const r = store.gerar({ os_id: "os-1", cliente_id: "cl-001", resumo_servico: "Obra: X" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.comprovante.status).toBe("pendente");
    expect(r.comprovante.numero).toBe("CMP-2026-0001");
    expect(store.listar()).toHaveLength(1);
  });

  it("bloqueia gerar um segundo comprovante para a mesma OS", () => {
    const store = criarComprovantesStore([base({ os_id: "os-1" })]);
    const r = store.gerar({ os_id: "os-1", cliente_id: "cl-001", resumo_servico: "Obra: X" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toMatch(/já tem um comprovante/i);
  });
});

describe("assinar", () => {
  it("assina um comprovante pendente com nome e assinatura", () => {
    const store = criarComprovantesStore([base()]);
    const r = store.assinar("cmp-x", {
      assinante_nome: "Maria Souza",
      assinatura_url: "data:image/png;base64,abc",
    });
    expect(r.ok).toBe(true);
    expect(store.obter("cmp-x")?.status).toBe("assinado");
    expect(store.obter("cmp-x")?.assinado_em).not.toBeNull();
  });

  it("bloqueia assinar sem nome", () => {
    const store = criarComprovantesStore([base()]);
    const r = store.assinar("cmp-x", {
      assinante_nome: "   ",
      assinatura_url: "data:image/png;base64,abc",
    });
    expect(r.ok).toBe(false);
  });

  it("bloqueia assinar sem assinatura", () => {
    const store = criarComprovantesStore([base()]);
    const r = store.assinar("cmp-x", { assinante_nome: "Maria", assinatura_url: "" });
    expect(r.ok).toBe(false);
  });

  it("bloqueia assinar um comprovante já decidido", () => {
    const store = criarComprovantesStore([base({ status: "assinado" })]);
    const r = store.assinar("cmp-x", {
      assinante_nome: "Maria",
      assinatura_url: "data:image/png;base64,abc",
    });
    expect(r.ok).toBe(false);
  });
});

describe("recusar", () => {
  it("recusa um comprovante pendente com motivo", () => {
    const store = criarComprovantesStore([base()]);
    const r = store.recusar("cmp-x", "Cliente contesta as horas.");
    expect(r.ok).toBe(true);
    expect(store.obter("cmp-x")?.status).toBe("recusado");
    expect(store.obter("cmp-x")?.motivo_recusa).toBe("Cliente contesta as horas.");
  });

  it("aceita recusar sem motivo", () => {
    const store = criarComprovantesStore([base()]);
    const r = store.recusar("cmp-x", null);
    expect(r.ok).toBe(true);
    expect(store.obter("cmp-x")?.motivo_recusa).toBeNull();
  });

  it("bloqueia recusar um comprovante já decidido", () => {
    const store = criarComprovantesStore([base({ status: "recusado" })]);
    const r = store.recusar("cmp-x", "motivo");
    expect(r.ok).toBe(false);
  });
});

describe("obterPorOS", () => {
  it("encontra o comprovante pela OS de origem", () => {
    const store = criarComprovantesStore([base({ os_id: "os-77" })]);
    expect(store.obterPorOS("os-77")?.id).toBe("cmp-x");
    expect(store.obterPorOS("os-nada")).toBeUndefined();
  });
});
