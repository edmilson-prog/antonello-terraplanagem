import { describe, it, expect } from "vitest";
import { contarNaoLidas, derivarNotificacoes, type EntradaNotificacoes } from "./notificacoes";
import type {
  Abastecimento,
  Apontamento,
  Equipamento,
  OrdemServico,
  PlanoManutencao,
  RegistroManutencao,
} from "@/shared/types";

const AGORA = new Date("2026-07-11T12:00:00.000Z");
const iso = (horasAtras: number) =>
  new Date(AGORA.getTime() - horasAtras * 60 * 60 * 1000).toISOString();

const equipamento: Equipamento = {
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
  created_at: iso(1000),
  updated_at: iso(1000),
};

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
    equipamento_previsto_id: null,
    inicio_previsto: null,
    aberta_em: iso(5),
    fechada_em: null,
    pendente_sync: false,
    created_at: iso(5),
    updated_at: iso(5),
    ...over,
  };
}

function apontamento(over: Partial<Apontamento> = {}): Apontamento {
  return {
    id: "apt-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: "os-1",
    horimetro_inicial: 4287,
    horimetro_final: null,
    horas_trabalhadas: null,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "em_andamento",
    pendente_sync: true,
    iniciado_em: iso(3),
    finalizado_em: null,
    created_at: iso(3),
    updated_at: iso(3),
    ...over,
  };
}

function entrada(over: Partial<EntradaNotificacoes> = {}): EntradaNotificacoes {
  return {
    operadorId: "op-1",
    ordens: [],
    apontamentos: [],
    equipamentos: [equipamento],
    planos: [],
    registros: [],
    abastecimentos: [],
    agora: AGORA,
    ...over,
  };
}

describe("derivarNotificacoes", () => {
  it("avisa sobre OS recém atribuída ao operador", () => {
    const itens = derivarNotificacoes(entrada({ ordens: [ordem()] }));
    expect(itens).toHaveLength(1);
    expect(itens[0]?.titulo).toBe("Nova OS atribuída a você");
    expect(itens[0]?.osId).toBe("os-1");
  });

  it("ignora OS de outro responsável, fechada ou antiga", () => {
    const itens = derivarNotificacoes(
      entrada({
        ordens: [
          ordem({ id: "a", responsavel_id: "op-2" }),
          ordem({ id: "b", status: "fechada" }),
          ordem({ id: "c", aberta_em: iso(24 * 30) }),
        ],
      }),
    );
    expect(itens).toHaveLength(0);
  });

  it("cobra o apontamento esquecido em aberto e marca como perigo", () => {
    const itens = derivarNotificacoes(
      entrada({ apontamentos: [apontamento({ iniciado_em: iso(12) })] }),
    );
    expect(itens).toHaveLength(1);
    expect(itens[0]?.titulo).toBe("Apontamento em aberto");
    expect(itens[0]?.perigo).toBe(true);
  });

  it("não cobra apontamento aberto há pouco tempo", () => {
    const itens = derivarNotificacoes(entrada({ apontamentos: [apontamento()] }));
    expect(itens).toHaveLength(0);
  });

  it("só alerta manutenção de máquina que o operador usou", () => {
    const plano: PlanoManutencao = {
      id: "pl-1",
      equipamento_id: "eq-1",
      tipo_equipamento: null,
      descricao: "Plano 4.300 h",
      intervalo_horas: 100,
      ativo: true,
      created_at: iso(500),
      updated_at: iso(500),
    };
    const registro: RegistroManutencao = {
      id: "rg-1",
      equipamento_id: "eq-1",
      plano_id: "pl-1",
      horimetro_previsto: 4300,
      horimetro_realizado: null,
      status: "prevista",
      custo: null,
      observacao: null,
      realizada_em: null,
      created_at: iso(200),
      updated_at: iso(200),
    };

    const semUso = derivarNotificacoes(entrada({ planos: [plano], registros: [registro] }));
    expect(semUso).toHaveLength(0);

    const comUso = derivarNotificacoes(
      entrada({
        planos: [plano],
        registros: [registro],
        apontamentos: [
          apontamento({
            status: "finalizado",
            iniciado_em: iso(2),
            finalizado_em: iso(1),
            horas_trabalhadas: 1,
          }),
        ],
      }),
    );
    expect(comUso.map((n) => n.titulo)).toContain("Manutenção se aproximando");
  });

  it("lista abastecimento recente do próprio operador e ordena tudo do mais novo", () => {
    const abastecimento: Abastecimento = {
      id: "ab-1",
      equipamento_id: "eq-1",
      operador_id: "op-1",
      litros: 120,
      horimetro: 4290,
      preco_litro: null,
      custo_total: null,
      local: "comboio na obra",
      abastecido_em: iso(1),
      created_at: iso(1),
      updated_at: iso(1),
    };
    const itens = derivarNotificacoes(
      entrada({ ordens: [ordem()], abastecimentos: [abastecimento] }),
    );
    expect(itens).toHaveLength(2);
    expect(itens[0]?.titulo).toBe("Abastecimento registrado");
  });
});

describe("contarNaoLidas", () => {
  it("sem marca de leitura, tudo é não lido", () => {
    const itens = derivarNotificacoes(entrada({ ordens: [ordem()] }));
    expect(contarNaoLidas(itens, null)).toBe(1);
  });

  it("conta apenas o que veio depois da marca", () => {
    const itens = derivarNotificacoes(entrada({ ordens: [ordem()] }));
    expect(contarNaoLidas(itens, AGORA.toISOString())).toBe(0);
  });
});
