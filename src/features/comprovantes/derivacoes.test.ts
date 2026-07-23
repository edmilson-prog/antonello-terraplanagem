import { describe, expect, it } from "vitest";
import { montarResumoServico } from "@/features/comprovantes/derivacoes";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

const os = (over: Partial<OrdemServico> = {}): OrdemServico => ({
  id: "os-x",
  numero: "OS-2026-0001",
  cliente_id: "cl-001",
  obra_nome: "Obra teste",
  endereco: null,
  modelo_cobranca: "hora_maquina",
  status: "fechada",
  responsavel_id: null,
  observacao: null,
  diametro_broca_mm: null,
  tipo_servico: null,
  equipamento_previsto_id: null,
  inicio_previsto: null,
  aberta_em: "2026-06-10T07:00:00.000Z",
  fechada_em: "2026-06-11T17:00:00.000Z",
  pendente_sync: false,
  created_at: "2026-06-10T07:00:00.000Z",
  updated_at: "2026-06-11T17:00:00.000Z",
  ...over,
});

const apontamento = (over: Partial<Apontamento> = {}): Apontamento => ({
  id: "ap-x",
  equipamento_id: "eq-001",
  operador_id: "op-001",
  os_id: "os-x",
  horimetro_inicial: 100,
  horimetro_final: 110,
  horas_trabalhadas: 10,
  foto_inicial_url: null,
  foto_final_url: null,
  observacao: null,
  modalidade: over.modalidade ?? null,
  metros_executados: over.metros_executados ?? null,
  status: "finalizado",
  pendente_sync: false,
  iniciado_em: "2026-06-10T07:00:00.000Z",
  finalizado_em: "2026-06-10T17:00:00.000Z",
  created_at: "2026-06-10T07:00:00.000Z",
  updated_at: "2026-06-10T17:00:00.000Z",
  ...over,
});

const equipamento = (over: Partial<Equipamento> = {}): Equipamento => ({
  id: "eq-001",
  nome: "Escavadeira Teste",
  tipo: "escavadeira",
  capacidade: "10 toneladas",
  horimetro_atual: 110,
  identificador: null,
  status: "disponivel",
  ativo: true,
  marca: null,
  ano: null,
  propriedade: null,
  created_at: "2024-01-01T12:00:00.000Z",
  updated_at: "2024-01-01T12:00:00.000Z",
  ...over,
});

describe("montarResumoServico", () => {
  it("monta o resumo de uma OS hora-máquina com um equipamento", () => {
    const resumo = montarResumoServico(os(), [apontamento()], [equipamento()]);
    expect(resumo).toBe(
      "Obra: Obra teste\nPeríodo: 10/06/2026 a 11/06/2026\nEquipamentos: Escavadeira Teste\nTotal de horas: 10h",
    );
  });

  it("lista múltiplos equipamentos sem repetir", () => {
    const resumo = montarResumoServico(
      os(),
      [
        apontamento({ id: "ap-1", equipamento_id: "eq-001", horas_trabalhadas: 4 }),
        apontamento({ id: "ap-2", equipamento_id: "eq-002", horas_trabalhadas: 6 }),
      ],
      [equipamento(), equipamento({ id: "eq-002", nome: "Trator Teste" })],
    );
    expect(resumo).toContain("Equipamentos: Escavadeira Teste, Trator Teste");
    expect(resumo).toContain("Total de horas: 10h");
  });

  it("mostra metragem e diâmetro para OS por metro", () => {
    const resumo = montarResumoServico(
      os({ id: "os-x", modelo_cobranca: "por_metro", diametro_broca_mm: 300 }),
      [apontamento({ id: "ap-m", os_id: "os-x", metros_executados: 30, equipamento_id: "eq-001" })],
      [equipamento()],
    );
    expect(resumo).toContain("Equipamentos: Escavadeira Teste");
    expect(resumo).toContain("Metragem executada: 30 m (broca 300 mm)");
  });

  it("usa — no período final quando a OS ainda não tem fechada_em", () => {
    const resumo = montarResumoServico(os({ fechada_em: null }), [], []);
    expect(resumo).toContain("Período: 10/06/2026 a —");
  });

  it("nunca inclui cifrão", () => {
    const resumo = montarResumoServico(os(), [apontamento()], [equipamento()]);
    expect(resumo).not.toContain("R$");
  });
});
