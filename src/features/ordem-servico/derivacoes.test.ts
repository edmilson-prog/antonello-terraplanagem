import { describe, it, expect } from "vitest";
import {
  totalHorasOS,
  totalMetragemOS,
  statusEfetivoOS,
  podeFecharOS,
  ordensDoOperador,
  apontamentosDaOS,
} from "@/features/ordem-servico/derivacoes";
import type { Apontamento, OrdemServico } from "@/shared/types";

function os(over: Partial<OrdemServico> & { id: string }): OrdemServico {
  return {
    id: over.id,
    numero: over.numero ?? "OS-2026-0001",
    cliente_id: over.cliente_id ?? "cl-001",
    obra_nome: over.obra_nome ?? "Obra",
    endereco: over.endereco ?? null,
    modelo_cobranca: over.modelo_cobranca ?? "hora_maquina",
    status: over.status ?? "aberta",
    responsavel_id: over.responsavel_id ?? null,
    observacao: over.observacao ?? null,
    diametro_broca_mm: over.diametro_broca_mm ?? null,
    tipo_servico: over.tipo_servico ?? null,
    equipamento_previsto_id: over.equipamento_previsto_id ?? null,
    inicio_previsto: over.inicio_previsto ?? null,
    aberta_em: "2026-06-01T00:00:00.000Z",
    fechada_em: over.fechada_em ?? null,
    pendente_sync: over.pendente_sync ?? false,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

function ap(over: Partial<Apontamento> & { id: string }): Apontamento {
  return {
    id: over.id,
    equipamento_id: over.equipamento_id ?? "eq-001",
    operador_id: over.operador_id ?? "op-001",
    os_id: over.os_id ?? null,
    horimetro_inicial: 100,
    horimetro_final: over.horimetro_final ?? null,
    horas_trabalhadas: over.horas_trabalhadas ?? null,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: over.modalidade ?? null,
    metros_executados: over.metros_executados ?? null,
    status: over.status ?? "em_andamento",
    pendente_sync: false,
    iniciado_em: "2026-06-01T00:00:00.000Z",
    finalizado_em: over.finalizado_em ?? null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

describe("totalHorasOS", () => {
  it("soma só apontamentos finalizados da OS", () => {
    const aps = [
      ap({ id: "a1", os_id: "x", status: "finalizado", horas_trabalhadas: 8 }),
      ap({ id: "a2", os_id: "x", status: "finalizado", horas_trabalhadas: 5 }),
      ap({ id: "a3", os_id: "x", status: "em_andamento" }), // ignorado
      ap({ id: "a4", os_id: "y", status: "finalizado", horas_trabalhadas: 9 }), // outra OS
    ];
    expect(totalHorasOS("x", aps)).toBe(13);
  });
  it("retorna 0 sem apontamentos", () => {
    expect(totalHorasOS("x", [])).toBe(0);
  });
});

describe("statusEfetivoOS", () => {
  it("fechada quando status é fechada", () => {
    expect(statusEfetivoOS(os({ id: "x", status: "fechada" }), [])).toBe("fechada");
  });
  it("em_andamento quando há apontamento (deriva de aberta)", () => {
    const aps = [ap({ id: "a1", os_id: "x", status: "finalizado", horas_trabalhadas: 1 })];
    expect(statusEfetivoOS(os({ id: "x", status: "aberta" }), aps)).toBe("em_andamento");
  });
  it("mantém status armazenado quando não há apontamento", () => {
    expect(statusEfetivoOS(os({ id: "x", status: "aberta" }), [])).toBe("aberta");
    expect(statusEfetivoOS(os({ id: "x", status: "em_andamento" }), [])).toBe("em_andamento");
  });
});

describe("podeFecharOS", () => {
  it("bloqueia OS já fechada", () => {
    const r = podeFecharOS(os({ id: "x", status: "fechada" }), []);
    expect(r.pode).toBe(false);
  });
  it("bloqueia se há apontamento em andamento", () => {
    const aps = [ap({ id: "a1", os_id: "x", status: "em_andamento" })];
    const r = podeFecharOS(os({ id: "x", status: "aberta" }), aps);
    expect(r.pode).toBe(false);
    if (!r.pode) expect(r.motivo).toMatch(/andamento/i);
  });
  it("permite fechar quando só há finalizados", () => {
    const aps = [ap({ id: "a1", os_id: "x", status: "finalizado", horas_trabalhadas: 8 })];
    expect(podeFecharOS(os({ id: "x", status: "aberta" }), aps).pode).toBe(true);
  });
});

describe("ordensDoOperador", () => {
  it("inclui OS onde é responsável OU tem apontamento", () => {
    const ordens = [
      os({ id: "o1", responsavel_id: "op-001" }),
      os({ id: "o2", responsavel_id: "op-002" }),
      os({ id: "o3", responsavel_id: "op-002" }),
    ];
    const aps = [
      ap({
        id: "a1",
        os_id: "o3",
        operador_id: "op-001",
        status: "finalizado",
        horas_trabalhadas: 1,
      }),
    ];
    const r = ordensDoOperador(ordens, aps, "op-001").map((o) => o.id);
    expect(r).toContain("o1"); // responsável
    expect(r).toContain("o3"); // tem apontamento
    expect(r).not.toContain("o2");
  });
});

describe("apontamentosDaOS", () => {
  it("filtra por os_id", () => {
    const aps = [ap({ id: "a1", os_id: "x" }), ap({ id: "a2", os_id: "y" })];
    expect(apontamentosDaOS("x", aps).map((a) => a.id)).toEqual(["a1"]);
  });
});

describe("totalMetragemOS", () => {
  it("soma só metros_executados de apontamentos finalizados da OS", () => {
    const aps = [
      ap({ id: "a1", os_id: "x", status: "finalizado", metros_executados: 30 }),
      ap({ id: "a2", os_id: "x", status: "finalizado", metros_executados: 12 }),
      ap({ id: "a3", os_id: "x", status: "em_andamento", metros_executados: 5 }), // ignorado
      ap({ id: "a4", os_id: "y", status: "finalizado", metros_executados: 20 }), // outra OS
    ];
    expect(totalMetragemOS("x", aps)).toBe(42);
  });
  it("retorna 0 sem apontamentos", () => {
    expect(totalMetragemOS("x", [])).toBe(0);
  });
});
