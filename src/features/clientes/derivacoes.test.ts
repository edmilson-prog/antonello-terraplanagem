import { describe, it, expect } from "vitest";
import { montarPainelCliente, type EntradaPainelCliente } from "@/features/clientes/derivacoes";
import type {
  Apontamento,
  Cliente,
  ContaReceber,
  Faturamento,
  Orcamento,
  OrdemServico,
} from "@/shared/types";

const AGORA = new Date("2026-08-19T12:00:00.000Z");
const DIA = 24 * 60 * 60 * 1000;
const diasAtras = (n: number) => new Date(AGORA.getTime() - n * DIA).toISOString();

// Intl separa "R$" do número com espaço inquebrável (U+00A0).
const brl = (texto: string) => texto.replace(/\u00A0/g, " ");

const CLIENTE: Cliente = {
  id: "cl-uuid-1",
  nome: "CONSTRUTORA HORIZONTE LTDA",
  documento: "12345678000199",
  telefone: "44999990000",
  ativo: true,
  nome_fantasia: "Horizonte",
  segmento: "Construção civil",
  email: "obras@horizonte.com.br",
  endereco: "Rua das Palmeiras, 120",
  cidade: "Santo Ângelo — RS",
  contato_nome: "Carlos Eduardo",
  contato_papel: "Engenheiro responsável",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function ordem(over: Partial<OrdemServico> = {}): OrdemServico {
  return {
    id: "os-1",
    numero: "OS-2026-0001",
    cliente_id: CLIENTE.id,
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
    aberta_em: diasAtras(15),
    fechada_em: null,
    pendente_sync: false,
    created_at: diasAtras(15),
    updated_at: diasAtras(15),
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
    horimetro_final: 112,
    horas_trabalhadas: 12,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: diasAtras(10),
    finalizado_em: diasAtras(10),
    created_at: diasAtras(10),
    updated_at: diasAtras(10),
    ...over,
  };
}

function faturamento(over: Partial<Faturamento> = {}): Faturamento {
  return {
    id: "fat-1",
    numero: "FAT-2026-0001",
    os_id: "os-1",
    cliente_id: CLIENTE.id,
    modelo_cobranca: "hora_maquina",
    itens: [],
    desconto: 0,
    valor_total: 5000,
    observacao: null,
    status: "faturado",
    gerado_em: diasAtras(8),
    faturado_em: diasAtras(8),
    created_at: diasAtras(8),
    updated_at: diasAtras(8),
    ...over,
  };
}

function orcamento(over: Partial<Orcamento> = {}): Orcamento {
  return {
    id: "orc-1",
    numero: "ORC-2026-0001",
    cliente_id: CLIENTE.id,
    descricao_obra: "Nivelamento de pátio",
    itens: [],
    desconto: 0,
    valor_total: 12000,
    validade: null,
    observacao: null,
    status: "enviado",
    os_id: null,
    enviado_em: diasAtras(4),
    decidido_em: null,
    created_at: diasAtras(4),
    updated_at: diasAtras(4),
    ...over,
  };
}

function conta(over: Partial<ContaReceber> = {}): ContaReceber {
  return {
    id: "cr-1",
    faturamento_id: "fat-1",
    cliente_id: CLIENTE.id,
    valor: 5000,
    vencimento: "2026-09-10",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: diasAtras(8),
    updated_at: diasAtras(8),
    ...over,
  };
}

function entrada(over: Partial<EntradaPainelCliente> = {}): EntradaPainelCliente {
  return {
    cliente: CLIENTE,
    ordens: [],
    apontamentos: [],
    faturamentos: [],
    orcamentos: [],
    contasReceber: [],
    agora: AGORA,
    ...over,
  };
}

describe("montarPainelCliente", () => {
  it("cliente novo não recebe faturamento, proposta nem recebimento inventados", () => {
    const painel = montarPainelCliente(entrada());

    expect(brl(painel.kpis.faturado.valor)).toBe("R$ 0,00");
    expect(painel.kpis.faturado.spark).toBeNull();
    expect(painel.kpis.orcamentos.rodape).toBe("nenhuma proposta em aberto");
    expect(painel.ordens).toEqual([]);
    expect(painel.recebimentos).toEqual([]);
    expect(painel.recorrente).toBe(false);
    expect(painel.ultimaOS).toBeNull();
    expect(painel.origemMigracao).toBeNull();
  });

  it("só entra na conta o que é deste cliente", () => {
    const painel = montarPainelCliente(
      entrada({
        ordens: [ordem(), ordem({ id: "os-9", cliente_id: "outro-cliente" })],
        faturamentos: [
          faturamento(),
          faturamento({ id: "fat-9", cliente_id: "outro-cliente", valor_total: 99999 }),
        ],
      }),
    );

    expect(painel.ordens).toHaveLength(1);
    expect(brl(painel.kpis.faturado.valor)).toBe("R$ 5.000,00");
  });

  it("OS ainda não faturada mostra travessão, não R$ 0,00", () => {
    const painel = montarPainelCliente(
      entrada({ ordens: [ordem()], apontamentos: [apontamento()] }),
    );

    expect(painel.ordens[0].valor).toBe("—");
    expect(painel.ordens[0].horas).toBe("12 h");
  });

  it("horas por OS somam os apontamentos daquela OS", () => {
    const painel = montarPainelCliente(
      entrada({
        ordens: [ordem()],
        apontamentos: [
          apontamento({ id: "a", horas_trabalhadas: 12 }),
          apontamento({ id: "b", horas_trabalhadas: 6 }),
          apontamento({ id: "c", os_id: "os-de-outro", horas_trabalhadas: 40 }),
        ],
      }),
    );

    expect(painel.ordens[0].horas).toBe("18 h");
  });

  it("saldo a receber conta só os títulos em aberto e sinaliza vencidos", () => {
    const painel = montarPainelCliente(
      entrada({
        contasReceber: [
          conta({ id: "a", valor: 5000, vencimento: "2026-08-01" }),
          conta({ id: "b", valor: 3000, vencimento: "2026-12-01" }),
          conta({ id: "c", valor: 9000, status: "liquidada", recebido_em: "2026-08-10" }),
        ],
      }),
    );

    expect(brl(painel.kpis.saldoReceber.valor)).toBe("R$ 8.000,00");
    expect(painel.kpis.saldoReceber.rodape).toBe("2 título(s) · 1 vencido(s)");
    expect(painel.kpis.saldoReceber.alerta).toBe(true);
  });

  it("recebimento liquidado vira linha com a forma de pagamento real", () => {
    const painel = montarPainelCliente(
      entrada({
        faturamentos: [faturamento()],
        contasReceber: [
          conta({ status: "liquidada", recebido_em: "2026-08-10", forma_recebimento: "pix" }),
        ],
      }),
    );

    expect(painel.recebimentos).toHaveLength(1);
    expect(painel.recebimentos[0].titulo).toBe("PIX recebido — FAT-2026-0001");
    expect(painel.recebimentos[0].quando).toBe("10/08/2026");
    expect(painel.recebimentos[0].icone).toBe("lucide:smartphone-nfc");
  });

  it("rascunho não conta como faturado", () => {
    const painel = montarPainelCliente(
      entrada({ faturamentos: [faturamento({ status: "rascunho", faturado_em: null })] }),
    );

    expect(brl(painel.kpis.faturado.valor)).toBe("R$ 0,00");
  });

  it("orçamento decidido sai do total em aberto", () => {
    const painel = montarPainelCliente(
      entrada({
        orcamentos: [
          orcamento({ id: "a", valor_total: 12000 }),
          orcamento({ id: "b", status: "aprovado", valor_total: 50000 }),
          orcamento({ id: "c", status: "recusado", valor_total: 70000 }),
        ],
      }),
    );

    expect(painel.kpis.orcamentos.valor).toBe("1");
    expect(brl(painel.kpis.orcamentos.rodape)).toBe("R$ 12.000,00 em propostas");
  });

  it("recorrente exige mais de uma OS — uma só não faz recorrência", () => {
    expect(montarPainelCliente(entrada({ ordens: [ordem()] })).recorrente).toBe(false);
    expect(
      montarPainelCliente(entrada({ ordens: [ordem(), ordem({ id: "os-2" })] })).recorrente,
    ).toBe(true);
  });

  it("origem da migração sai da data importada, não de um mês fixo", () => {
    const painel = montarPainelCliente(
      entrada({
        cliente: { ...CLIENTE, cli_codigo_legado: 4412, legado_importado_em: "2024-06-15" },
      }),
    );

    expect(painel.origemMigracao).toBe("Migração jun de 2024");
  });
});
