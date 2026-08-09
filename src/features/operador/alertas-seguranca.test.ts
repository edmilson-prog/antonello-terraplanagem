import { describe, it, expect } from "vitest";
import { derivarAlertasSeguranca, type EntradaAlertas } from "./alertas-seguranca";
import type { RegistroCampo } from "@/features/registros-campo/tipos";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

const AGORA = new Date(2026, 6, 11, 9).toISOString();

function equipamento(over: Partial<Equipamento> = {}): Equipamento {
  return {
    id: "eq-1",
    nome: "ESCAVADEIRA CAT 320",
    tipo: "escavadeira",
    capacidade: "18 t",
    horimetro_atual: 4295,
    identificador: null,
    status: "em_uso",
    ativo: true,
    marca: null,
    ano: null,
    propriedade: null,
    created_at: AGORA,
    updated_at: AGORA,
    ...over,
  };
}

function ordem(over: Partial<OrdemServico> = {}): OrdemServico {
  return {
    id: "os-1",
    numero: "OS-021",
    cliente_id: "cli-1",
    obra_nome: "Terraplenagem — lote industrial",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "aberta",
    responsavel_id: "op-1",
    observacao: null,
    diametro_broca_mm: null,
    tipo_servico: null,
    equipamento_previsto_id: "eq-1",
    inicio_previsto: null,
    aberta_em: AGORA,
    fechada_em: null,
    pendente_sync: false,
    created_at: AGORA,
    updated_at: AGORA,
    ...over,
  };
}

function apontamento(over: Partial<Apontamento> = {}): Apontamento {
  return {
    id: "apt-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: "os-1",
    horimetro_inicial: 4280,
    horimetro_final: 4288,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: AGORA,
    finalizado_em: AGORA,
    created_at: AGORA,
    updated_at: AGORA,
    ...over,
  };
}

function entrada(over: Partial<EntradaAlertas> = {}): EntradaAlertas {
  return {
    operadorId: "op-1",
    ordens: [ordem()],
    apontamentos: [apontamento()],
    equipamentos: [equipamento()],
    planos: [],
    registrosManutencao: [],
    registrosCampo: [],
    ...over,
  };
}

describe("derivarAlertasSeguranca", () => {
  it("não inventa alerta quando está tudo em ordem", () => {
    expect(derivarAlertasSeguranca(entrada())).toEqual([]);
  });

  it("alerta máquina em manutenção alocada a uma OS ativa do operador", () => {
    const alertas = derivarAlertasSeguranca(
      entrada({ equipamentos: [equipamento({ status: "manutencao" })] }),
    );
    expect(alertas).toHaveLength(1);
    expect(alertas[0]?.severidade).toBe("critico");
    expect(alertas[0]?.titulo).toContain("manutenção");
  });

  it("não alerta sobre OS fechada", () => {
    const alertas = derivarAlertasSeguranca(
      entrada({
        ordens: [ordem({ status: "fechada" })],
        apontamentos: [],
        equipamentos: [equipamento({ status: "manutencao" })],
      }),
    );
    expect(alertas).toEqual([]);
  });

  it("levanta checklist com item não conforme", () => {
    const registro = {
      id: "rc-1",
      op_id: "op-1",
      operador_id: "op-1",
      os_id: "os-1",
      equipamento_id: "eq-1",
      registrado_em: AGORA,
      pendente_sync: true,
      tipo: "checklist",
      dados: { itens: [], nao_conformes: 2, horimetro: 4295 },
    } as RegistroCampo;
    const alertas = derivarAlertasSeguranca(entrada({ registrosCampo: [registro] }));
    expect(alertas).toHaveLength(1);
    expect(alertas[0]?.mensagem).toContain("2 itens reprovados");
  });

  it("ignora checklist de outro operador", () => {
    const registro = {
      id: "rc-2",
      op_id: "op-2",
      operador_id: "op-9",
      os_id: "os-1",
      equipamento_id: "eq-1",
      registrado_em: AGORA,
      pendente_sync: true,
      tipo: "checklist",
      dados: { itens: [], nao_conformes: 1, horimetro: null },
    } as RegistroCampo;
    expect(derivarAlertasSeguranca(entrada({ registrosCampo: [registro] }))).toEqual([]);
  });

  it("coloca os críticos antes dos de atenção", () => {
    const registro = {
      id: "rc-3",
      op_id: "op-3",
      operador_id: "op-1",
      os_id: "os-1",
      equipamento_id: "eq-1",
      registrado_em: AGORA,
      pendente_sync: true,
      tipo: "checklist",
      dados: { itens: [], nao_conformes: 1, horimetro: null },
    } as RegistroCampo;
    const alertas = derivarAlertasSeguranca(
      entrada({
        equipamentos: [equipamento({ status: "manutencao" })],
        registrosCampo: [registro],
      }),
    );
    expect(alertas.every((a) => a.severidade === "critico")).toBe(true);
    expect(alertas).toHaveLength(2);
  });
});
