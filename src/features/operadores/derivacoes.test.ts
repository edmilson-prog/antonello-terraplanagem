import { describe, it, expect } from "vitest";
import {
  montarPainelOperador,
  ordensDoOperador,
  cadastraisDoOperador,
  type EntradaPainel,
} from "@/features/operadores/derivacoes";
import type { Apontamento, Cliente, Equipamento, Operador, OrdemServico } from "@/shared/types";

const AGORA = new Date("2026-08-19T12:00:00.000Z");
const DIA = 24 * 60 * 60 * 1000;

const diasAtras = (n: number) => new Date(AGORA.getTime() - n * DIA).toISOString();

const OPERADOR: Operador = {
  id: "op-1",
  nome: "ADELAR MACHADO",
  telefone: "44999990000",
  cpf: "52998224725",
  ativo: true,
  vinculo: "CLT",
  data_nascimento: "1988-04-12",
  cnh_categoria: "D",
  cnh_validade: "2029-06-30",
  base: "Santo Ângelo — RS",
  admissao: "2021-03-01",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const EQUIPAMENTO: Equipamento = {
  id: "eq-1",
  nome: "ESCAVADEIRA CAT 320",
  tipo: "escavadeira",
  capacidade: "18 t",
  horimetro_atual: 1200,
  identificador: null,
  status: "disponivel",
  ativo: true,
  marca: null,
  ano: null,
  propriedade: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  aquisicao_forma: null,
  aquisicao_parcelas: null,
  descricao: null,
};

const CLIENTE: Cliente = {
  id: "cl-1",
  nome: "CONSTRUTORA HORIZONTE",
  documento: null,
  telefone: null,
  ativo: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  nome_fantasia: null,
  segmento: null,
  email: null,
  endereco: null,
  cidade: null,
  contato_nome: null,
  contato_papel: null,
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
  aberta_em: diasAtras(10),
  fechada_em: null,
  pendente_sync: false,
  created_at: diasAtras(10),
  updated_at: diasAtras(10),
  local_lat: null,
  local_lng: null,
};

function apontamento(over: Partial<Apontamento> = {}): Apontamento {
  return {
    id: "ap-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: "os-1",
    horimetro_inicial: 1000,
    horimetro_final: 1008,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: diasAtras(2),
    finalizado_em: diasAtras(2),
    created_at: diasAtras(2),
    updated_at: diasAtras(2),
    ...over,
  };
}

function entrada(over: Partial<EntradaPainel> = {}): EntradaPainel {
  return {
    operador: OPERADOR,
    apontamentos: [],
    ordens: [],
    equipamentos: [EQUIPAMENTO],
    clientes: [CLIENTE],
    equipamentosHabilitadosIds: [],
    agora: AGORA,
    ...over,
  };
}

describe("montarPainelOperador", () => {
  it("operador sem nenhum dado não inventa número nem série", () => {
    const painel = montarPainelOperador(entrada());

    expect(painel.kpis.horasApontadas.valor).toBe("0");
    expect(painel.kpis.osAtivas.valor).toBe("0");
    expect(painel.kpis.equipamentos.valor).toBe("0");
    // Sem tendência a mostrar e sem sparkline: uma linha reta seria dado falso.
    expect(painel.kpis.horasApontadas.trendPct).toBeNull();
    expect(painel.kpis.horasApontadas.spark).toBeNull();
    expect(painel.apontamentos).toEqual([]);
    expect(painel.ordens).toEqual([]);
    expect(painel.equipamentos).toEqual([]);
    expect(painel.horasSemana.temDados).toBe(false);
    expect(painel.totalApontamentos).toBe(0);
  });

  it("soma as horas dos últimos 30 dias e ignora o que é mais velho", () => {
    const painel = montarPainelOperador(
      entrada({
        apontamentos: [
          apontamento({ id: "a", iniciado_em: diasAtras(2), horas_trabalhadas: 8 }),
          apontamento({ id: "b", iniciado_em: diasAtras(20), horas_trabalhadas: 6 }),
          apontamento({ id: "c", iniciado_em: diasAtras(45), horas_trabalhadas: 100 }),
        ],
      }),
    );

    expect(painel.kpis.horasApontadas.valor).toBe("14");
    expect(painel.totalApontamentos).toBe(3);
  });

  it("apontamento de outro operador não entra na conta", () => {
    const painel = montarPainelOperador(
      entrada({
        apontamentos: [
          apontamento({ id: "a", horas_trabalhadas: 8 }),
          apontamento({ id: "b", operador_id: "op-2", horas_trabalhadas: 40 }),
        ],
      }),
    );

    expect(painel.kpis.horasApontadas.valor).toBe("8");
    expect(painel.apontamentos).toHaveLength(1);
  });

  it("compara com os 30 dias anteriores só quando há base de comparação", () => {
    const semBase = montarPainelOperador(
      entrada({
        apontamentos: [apontamento({ iniciado_em: diasAtras(2), horas_trabalhadas: 10 })],
      }),
    );
    expect(semBase.kpis.horasApontadas.trendPct).toBeNull();

    const comBase = montarPainelOperador(
      entrada({
        apontamentos: [
          apontamento({ id: "a", iniciado_em: diasAtras(2), horas_trabalhadas: 12 }),
          apontamento({ id: "b", iniciado_em: diasAtras(40), horas_trabalhadas: 10 }),
        ],
      }),
    );
    expect(comBase.kpis.horasApontadas.trendPct).toBe(20);
    expect(comBase.kpis.horasApontadas.trendDir).toBe("up");
  });

  it("apontamento em andamento aparece como 'em curso', não como zero hora", () => {
    const painel = montarPainelOperador(
      entrada({
        apontamentos: [
          apontamento({ status: "em_andamento", horimetro_final: null, horas_trabalhadas: null }),
        ],
      }),
    );

    expect(painel.apontamentos[0].horas).toBe("em curso");
    expect(painel.apontamentos[0].horimetroFinal).toBe("—");
  });

  it("equipamento apagado do cadastro não vira nome inventado", () => {
    const painel = montarPainelOperador(
      entrada({ apontamentos: [apontamento({ equipamento_id: "eq-sumiu" })], equipamentos: [] }),
    );

    expect(painel.apontamentos[0].equipamentoNome).toBe("Equipamento removido");
  });

  it("lista só os equipamentos realmente habilitados", () => {
    const painel = montarPainelOperador(entrada({ equipamentosHabilitadosIds: ["eq-1", "eq-9"] }));

    expect(painel.equipamentos).toEqual([
      { id: "eq-1", nome: "ESCAVADEIRA CAT 320", icone: "lucide:truck" },
    ]);
  });

  it("semana sem hora fica com barra zerada — não com um mínimo visual", () => {
    const painel = montarPainelOperador(
      entrada({ apontamentos: [apontamento({ iniciado_em: diasAtras(1), horas_trabalhadas: 9 })] }),
    );

    expect(painel.horasSemana.temDados).toBe(true);
    const vazias = painel.horasSemana.barras.filter((b) => b.horas === 0);
    expect(vazias.length).toBeGreaterThan(0);
    expect(vazias.every((b) => b.pct === 0)).toBe(true);
  });
});

describe("ordensDoOperador", () => {
  it("pega a OS onde é responsável e a OS onde só apontou", () => {
    const outra: OrdemServico = { ...OS, id: "os-2", numero: "OS-2026-0002", responsavel_id: null };
    const alheia: OrdemServico = {
      ...OS,
      id: "os-3",
      numero: "OS-2026-0003",
      responsavel_id: "op-9",
    };

    const encontradas = ordensDoOperador(
      [OS, outra, alheia],
      [apontamento({ os_id: "os-2" })],
      "op-1",
    );

    expect(encontradas.map((o) => o.id)).toEqual(["os-1", "os-2"]);
  });
});

describe("cadastraisDoOperador", () => {
  it("campo em branco fica nulo — a tela mostra o traço, não um valor", () => {
    const cad = cadastraisDoOperador(
      { ...OPERADOR, cnh_categoria: null, cnh_validade: null, base: null, admissao: null },
      AGORA,
    );

    expect(cad.cnhCategoria).toBeNull();
    expect(cad.base).toBeNull();
    expect(cad.admissao).toBeNull();
  });

  it("marca a CNH vencida", () => {
    expect(
      cadastraisDoOperador({ ...OPERADOR, cnh_validade: "2020-01-01" }, AGORA).cnhVencida,
    ).toBe(true);
    expect(cadastraisDoOperador(OPERADOR, AGORA).cnhVencida).toBe(false);
  });

  it("calcula a idade sem contar o aniversário que ainda não chegou", () => {
    expect(cadastraisDoOperador({ ...OPERADOR, data_nascimento: "1988-04-12" }, AGORA).idade).toBe(
      "38 anos",
    );
    expect(cadastraisDoOperador({ ...OPERADOR, data_nascimento: "1988-12-31" }, AGORA).idade).toBe(
      "37 anos",
    );
  });
});
