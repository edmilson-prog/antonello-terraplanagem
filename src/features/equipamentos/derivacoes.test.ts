import { describe, it, expect } from "vitest";
import {
  montarPainelEquipamento,
  diasIndisponivel,
  rotuloAquisicao,
  somaFaturadaDoEquipamento,
  type EntradaPainelEquipamento,
} from "@/features/equipamentos/derivacoes";
import type {
  Abastecimento,
  Apontamento,
  Equipamento,
  Faturamento,
  Operador,
  OrdemServico,
  RegistroManutencao,
} from "@/shared/types";

const AGORA = new Date("2026-08-19T12:00:00.000Z");

// Intl.NumberFormat pt-BR separa "R$" do número com espaço INQUEBRÁVEL (U+00A0).
// Comparar com um espaço comum falha com as duas strings idênticas na tela.
const brl = (texto: string) => texto.replace(/\u00A0/g, " ");
const DIA = 24 * 60 * 60 * 1000;
const diasAtras = (n: number) => new Date(AGORA.getTime() - n * DIA).toISOString();

const EQUIPAMENTO: Equipamento = {
  id: "eq-1",
  nome: "ESCAVADEIRA CAT 320",
  tipo: "escavadeira",
  capacidade: "18 t",
  horimetro_atual: 1208,
  identificador: "PAT-014",
  status: "disponivel",
  ativo: true,
  marca: "Caterpillar 320D",
  ano: "2019",
  propriedade: "propria",
  aquisicao_forma: "finame",
  aquisicao_parcelas: 48,
  descricao: "Uso geral em terraplenagem",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const OPERADOR: Operador = {
  id: "op-1",
  nome: "ADELAR MACHADO",
  telefone: null,
  cpf: "52998224725",
  ativo: true,
  vinculo: "CLT",
  data_nascimento: null,
  cnh_categoria: null,
  cnh_validade: null,
  base: null,
  admissao: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const OS: OrdemServico = {
  id: "os-1",
  numero: "OS-2026-0001",
  cliente_id: "cl-1",
  obra_nome: "Terraplenagem — lote 4",
  endereco: null,
  modelo_cobranca: "hora_maquina",
  status: "em_andamento",
  responsavel_id: "op-1",
  observacao: null,
  diametro_broca_mm: null,
  tipo_servico: null,
  equipamento_previsto_id: null,
  inicio_previsto: null,
  aberta_em: diasAtras(20),
  fechada_em: null,
  pendente_sync: false,
  created_at: diasAtras(20),
  updated_at: diasAtras(20),
};

function apontamento(over: Partial<Apontamento> = {}): Apontamento {
  return {
    id: "ap-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: "os-1",
    horimetro_inicial: 1200,
    horimetro_final: 1208,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: diasAtras(3),
    finalizado_em: diasAtras(3),
    created_at: diasAtras(3),
    updated_at: diasAtras(3),
    ...over,
  };
}

function manutencao(over: Partial<RegistroManutencao> = {}): RegistroManutencao {
  return {
    id: "mn-1",
    equipamento_id: "eq-1",
    plano_id: null,
    tipo: "corretiva",
    descricao: "Troca de mangueira",
    prioridade: "media",
    horimetro_previsto: null,
    horimetro_realizado: null,
    horimetro_abertura: 1200,
    status: "prevista",
    aberta_em: diasAtras(10),
    realizada_em: diasAtras(8),
    created_at: diasAtras(10),
    updated_at: diasAtras(8),
    custo: null,
    fornecedor: null,
    observacao: null,
    origem_registro_campo_id: null,
    ...over,
  };
}

function faturamento(over: Partial<Faturamento> = {}): Faturamento {
  return {
    id: "fat-1",
    numero: "FAT-2026-0001",
    os_id: "os-1",
    cliente_id: "cl-1",
    modelo_cobranca: "hora_maquina",
    itens: [
      {
        id: "it-1",
        tipo: "hora_maquina",
        descricao: "Escavadeira — 8 h operada",
        origem_id: "eq-1",
        hora_tipo: "operada",
        quantidade: 8,
        valor_unitario: 400,
        valor_total: 3200,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 3200,
    observacao: null,
    status: "faturado",
    gerado_em: diasAtras(5),
    faturado_em: diasAtras(5),
    created_at: diasAtras(5),
    updated_at: diasAtras(5),
    ...over,
  };
}

function entrada(over: Partial<EntradaPainelEquipamento> = {}): EntradaPainelEquipamento {
  return {
    equipamento: EQUIPAMENTO,
    apontamentos: [],
    ordens: [OS],
    operadores: [OPERADOR],
    abastecimentos: [],
    registrosManutencao: [],
    faturamentos: [],
    agora: AGORA,
    ...over,
  };
}

describe("montarPainelEquipamento", () => {
  it("máquina sem histórico não ganha horas, receita nem consumo inventados", () => {
    const painel = montarPainelEquipamento(entrada());

    expect(painel.kpis.horasMes.valor).toBe("0 h");
    expect(brl(painel.kpis.receitaMes.valor)).toBe("R$ 0,00");
    expect(painel.kpis.horasMes.trendPct).toBeNull();
    expect(painel.kpis.horasMes.spark).toBeNull();
    expect(painel.leiturasHorimetro).toEqual([]);
    expect(painel.utilizacaoSemana.temDados).toBe(false);
    expect(painel.dieselMedioLh).toBeNull();
  });

  it("horímetro atual vem do cadastro, não de um sorteio", () => {
    expect(montarPainelEquipamento(entrada()).kpis.horimetro.valor).toBe("1.208 h");
  });

  it("disponibilidade desconta os dias em manutenção dentro da janela", () => {
    // Aberta há 10 dias, fechada há 8: 2 dias parada em 30.
    const painel = montarPainelEquipamento(entrada({ registrosManutencao: [manutencao()] }));

    expect(painel.kpis.disponibilidade.valor).toBe("93%");
    expect(painel.kpis.disponibilidade.rodape).toContain("2 dia(s)");
  });

  it("manutenção de outra máquina não derruba a disponibilidade desta", () => {
    const painel = montarPainelEquipamento(
      entrada({ registrosManutencao: [manutencao({ equipamento_id: "eq-9" })] }),
    );

    expect(painel.kpis.disponibilidade.valor).toBe("100%");
  });

  it("só conta como receita o que foi faturado — rascunho não entra", () => {
    const comFaturado = montarPainelEquipamento(entrada({ faturamentos: [faturamento()] }));
    expect(brl(comFaturado.kpis.receitaMes.valor)).toBe("R$ 3.200,00");

    const soRascunho = montarPainelEquipamento(
      entrada({ faturamentos: [faturamento({ status: "rascunho", faturado_em: null })] }),
    );
    expect(brl(soRascunho.kpis.receitaMes.valor)).toBe("R$ 0,00");
  });

  it("mobilização não conta como receita da máquina em operação", () => {
    const painel = montarPainelEquipamento(
      entrada({
        faturamentos: [
          faturamento({
            itens: [
              {
                id: "it-mob",
                tipo: "mobilizacao",
                descricao: "Mobilização até a obra",
                origem_id: "eq-1",
                hora_tipo: null,
                quantidade: 1,
                valor_unitario: 900,
                valor_total: 900,
                sem_preco: false,
              },
            ],
          }),
        ],
      }),
    );

    expect(brl(painel.kpis.receitaMes.valor)).toBe("R$ 0,00");
  });

  it("consumo médio sai de litros ÷ horas do período", () => {
    const abastecimento: Abastecimento = {
      id: "ab-1",
      equipamento_id: "eq-1",
      operador_id: "op-1",
      litros: 80,
      horimetro: 1208,
      local: null,
      origem: "tanque",
      abastecido_em: diasAtras(3),
      created_at: diasAtras(3),
      updated_at: diasAtras(3),
      preco_litro: null,
      custo_total: null,
    };

    const painel = montarPainelEquipamento(
      entrada({ apontamentos: [apontamento()], abastecimentos: [abastecimento] }),
    );

    expect(painel.dieselMedioLh).toBe("10,0 L/h");
  });

  it("operador removido do cadastro não vira nome inventado", () => {
    const painel = montarPainelEquipamento(
      entrada({ apontamentos: [apontamento({ operador_id: "op-sumiu" })] }),
    );

    expect(painel.leiturasHorimetro[0].operadorNome).toBe("Operador removido");
  });
});

describe("diasIndisponivel", () => {
  const fim = AGORA.getTime();
  const inicio = fim - 30 * DIA;

  it("ordens sobrepostas não contam duas vezes", () => {
    const dias = diasIndisponivel(
      [
        manutencao({ id: "a", aberta_em: diasAtras(10), realizada_em: diasAtras(6) }),
        manutencao({ id: "b", aberta_em: diasAtras(8), realizada_em: diasAtras(5) }),
      ],
      inicio,
      fim,
    );

    expect(Math.round(dias)).toBe(5);
  });

  it("ordem ainda aberta conta até agora", () => {
    const dias = diasIndisponivel(
      [manutencao({ aberta_em: diasAtras(4), realizada_em: null })],
      inicio,
      fim,
    );

    expect(Math.round(dias)).toBe(4);
  });

  it("ordem anterior à janela é recortada, não contada inteira", () => {
    const dias = diasIndisponivel(
      [manutencao({ aberta_em: diasAtras(90), realizada_em: diasAtras(25) })],
      inicio,
      fim,
    );

    expect(Math.round(dias)).toBe(5);
  });
});

describe("rotuloAquisicao", () => {
  it("junta forma e parcelas quando há financiamento", () => {
    expect(rotuloAquisicao(EQUIPAMENTO)).toBe("FINAME/BNDES · 48x");
  });

  it("sem forma informada devolve null — a tela mostra o traço", () => {
    expect(rotuloAquisicao({ ...EQUIPAMENTO, aquisicao_forma: null })).toBeNull();
  });

  it("recursos próprios não exibe parcelas", () => {
    expect(
      rotuloAquisicao({
        ...EQUIPAMENTO,
        aquisicao_forma: "recursos_proprios",
        aquisicao_parcelas: null,
      }),
    ).toBe("Recursos próprios");
  });
});

describe("somaFaturadaDoEquipamento", () => {
  it("ignora o que está fora da janela", () => {
    const fim = AGORA.getTime();
    const janela = somaFaturadaDoEquipamento(
      [faturamento({ faturado_em: diasAtras(45) })],
      "eq-1",
      fim - 30 * DIA,
      fim,
    );

    expect(janela).toBe(0);
  });
});
