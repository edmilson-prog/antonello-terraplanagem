import { describe, it, expect } from "vitest";
import { criarFaturamentosStore } from "@/features/faturamento/faturamentos-store";
import { equipamentos } from "@/mocks/equipamentos";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import type { Apontamento, OrdemServico } from "@/shared/types";

const os: OrdemServico = {
  id: "os-test", numero: "OS-2026-9001", cliente_id: "cl-001", obra_nome: "x", endereco: null,
  modelo_cobranca: "hora_maquina", status: "fechada", responsavel_id: "op-001", observacao: null,
  diametro_broca_mm: null, aberta_em: "2026-06-20T07:00:00.000Z",
  fechada_em: "2026-06-20T17:00:00.000Z", pendente_sync: false,
  created_at: "2026-06-20T07:00:00.000Z", updated_at: "2026-06-20T17:00:00.000Z",
};
const aps: Apontamento[] = [
  {
    id: "a1", equipamento_id: "eq-002", operador_id: "op-001", os_id: "os-test",
    horimetro_inicial: 100, horimetro_final: 118, horas_trabalhadas: 18, foto_inicial_url: null,
    foto_final_url: null, observacao: null, modalidade: "operada", metros_executados: null,
    status: "finalizado", pendente_sync: false,
    iniciado_em: "2026-06-20T07:00:00.000Z", finalizado_em: "2026-06-20T17:00:00.000Z",
    created_at: "2026-06-20T07:00:00.000Z", updated_at: "2026-06-20T17:00:00.000Z",
  },
];

describe("faturamentosStore", () => {
  it("gerarDeOS cria rascunho numerado com itens e total", () => {
    const store = criarFaturamentosStore([]);
    const fat = store.gerarDeOS(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(fat.status).toBe("rascunho");
    expect(fat.numero).toMatch(/^FAT-\d{4}-0001$/);
    expect(fat.itens).toHaveLength(1);
    expect(fat.valor_total).toBe(5220);
    expect(store.obter(fat.id)?.os_id).toBe("os-test");
  });

  it("atualizar recalcula valor_total com desconto", () => {
    const store = criarFaturamentosStore([]);
    const fat = store.gerarDeOS(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    store.atualizar(fat.id, { desconto: 220 });
    expect(store.obter(fat.id)?.valor_total).toBe(5000);
  });

  it("confirmar muda para faturado; segunda vez falha", () => {
    const store = criarFaturamentosStore([]);
    const fat = store.gerarDeOS(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    const r1 = store.confirmar(fat.id);
    expect(r1.ok).toBe(true);
    expect(store.obter(fat.id)?.status).toBe("faturado");
    expect(store.obter(fat.id)?.faturado_em).not.toBeNull();
    const r2 = store.confirmar(fat.id);
    expect(r2.ok).toBe(false);
  });
});
