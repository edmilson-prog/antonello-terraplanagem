import { describe, it, expect } from "vitest";
import { posicoesDaFrota } from "@/features/dashboard-operacional/posicoes";
import { LOCAL_PADRAO } from "@/features/dashboard-operacional/clima";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

function equipamento(id: string): Equipamento {
  return {
    id,
    nome: `MÁQUINA ${id}`,
    tipo: "escavadeira",
    capacidade: "18 t",
    horimetro_atual: 100,
    identificador: null,
    status: "em_uso",
    ativo: true,
    marca: null,
    ano: null,
    propriedade: null,
    aquisicao_forma: null,
    aquisicao_parcelas: null,
    descricao: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

function ordem(over: Partial<OrdemServico> = {}): OrdemServico {
  return {
    id: "os-1",
    numero: "OS-2026-0001",
    cliente_id: "cl-1",
    obra_nome: "Terraplenagem — lote 4",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "em_andamento",
    responsavel_id: null,
    observacao: null,
    diametro_broca_mm: null,
    tipo_servico: null,
    equipamento_previsto_id: null,
    inicio_previsto: null,
    local_lat: -28.3,
    local_lng: -54.26,
    aberta_em: "2026-08-01T12:00:00.000Z",
    fechada_em: null,
    pendente_sync: false,
    created_at: "2026-08-01T12:00:00.000Z",
    updated_at: "2026-08-01T12:00:00.000Z",
    ...over,
  };
}

function apontamento(over: Partial<Apontamento> = {}): Apontamento {
  return {
    id: "ap-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: "os-1",
    horimetro_inicial: 100,
    horimetro_final: null,
    horas_trabalhadas: null,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "em_andamento",
    pendente_sync: false,
    iniciado_em: "2026-08-19T08:00:00.000Z",
    finalizado_em: null,
    created_at: "2026-08-19T08:00:00.000Z",
    updated_at: "2026-08-19T08:00:00.000Z",
    ...over,
  };
}

describe("posicoesDaFrota", () => {
  it("planta a máquina na obra em que ela está apontando", () => {
    const r = posicoesDaFrota([equipamento("eq-1")], [apontamento()], [ordem()]);

    expect(r.pins).toHaveLength(1);
    expect(r.pins[0].lat).toBe(-28.3);
    expect(r.pins[0].osNumero).toBe("OS-2026-0001");
    expect(r.semLocalizacao).toBe(0);
  });

  it("apontamento finalizado não deixa a máquina no mapa", () => {
    const r = posicoesDaFrota(
      [equipamento("eq-1")],
      [apontamento({ status: "finalizado", horimetro_final: 108, horas_trabalhadas: 8 })],
      [ordem()],
    );

    expect(r.pins).toEqual([]);
  });

  it("obra sem coordenada é contada, não plotada em lugar nenhum", () => {
    const r = posicoesDaFrota(
      [equipamento("eq-1")],
      [apontamento()],
      [ordem({ local_lat: null, local_lng: null })],
    );

    expect(r.pins).toEqual([]);
    expect(r.semLocalizacao).toBe(1);
  });

  it("OS colaborativa não duplica o pin da mesma máquina", () => {
    const r = posicoesDaFrota(
      [equipamento("eq-1")],
      [apontamento({ id: "a" }), apontamento({ id: "b", operador_id: "op-2" })],
      [ordem()],
    );

    expect(r.pins).toHaveLength(1);
  });

  it("sem pin nenhum, o mapa centra na base da empresa — não numa coordenada solta", () => {
    // O mapa antigo abria centrado num ponto do Paraná, a 400 km da operação.
    const r = posicoesDaFrota([], [], []);

    expect(r.centro).toEqual({ lat: LOCAL_PADRAO.lat, lng: LOCAL_PADRAO.lng });
  });

  it("com várias obras, centra na média dos pins", () => {
    const r = posicoesDaFrota(
      [equipamento("eq-1"), equipamento("eq-2")],
      [apontamento({ id: "a" }), apontamento({ id: "b", equipamento_id: "eq-2", os_id: "os-2" })],
      [ordem(), ordem({ id: "os-2", numero: "OS-2026-0002", local_lat: -28.1, local_lng: -54.0 })],
    );

    expect(r.pins).toHaveLength(2);
    expect(r.centro.lat).toBeCloseTo(-28.2, 5);
    expect(r.centro.lng).toBeCloseTo(-54.13, 5);
  });

  it("equipamento fora da lista de ativos não vira pin", () => {
    const r = posicoesDaFrota([], [apontamento()], [ordem()]);

    expect(r.pins).toEqual([]);
  });
});
