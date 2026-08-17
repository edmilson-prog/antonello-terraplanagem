import { describe, it, expect } from "vitest";
import {
  dataReferencia,
  ordensDoMes,
  resumoManutencaoMes,
  equipamentosEmManutencao,
  serieOrdensPorMes,
} from "./resumo-mes";
import type { Equipamento, RegistroManutencao } from "@/shared/types";

function registro(overrides: Partial<RegistroManutencao> = {}): RegistroManutencao {
  return {
    id: "rm-x",
    equipamento_id: "eq-1",
    plano_id: "pm-1",
    tipo: "preventiva",
    descricao: null,
    prioridade: "media",
    horimetro_previsto: 1000,
    horimetro_realizado: null,
    horimetro_abertura: null,
    status: "prevista",
    custo: null,
    fornecedor: null,
    observacao: null,
    realizada_em: null,
    aberta_em: "2026-07-05T10:00:00.000Z",
    created_at: "2026-07-05T10:00:00.000Z",
    updated_at: "2026-07-05T10:00:00.000Z",
    ...overrides,
  };
}

function equipamento(overrides: Partial<Equipamento> = {}): Equipamento {
  return {
    id: "eq-1",
    nome: "Escavadeira CAT 320",
    tipo: "escavadeira",
    modelo: null,
    ano: null,
    placa: null,
    horimetro_atual: 1000,
    ativo: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Equipamento;
}

describe("dataReferencia", () => {
  it("usa a conclusão quando existe", () => {
    const r = registro({ status: "realizada", realizada_em: "2026-07-20T09:00:00.000Z" });
    expect(dataReferencia(r)).toBe("2026-07-20T09:00:00.000Z");
  });

  it("cai para a abertura enquanto não concluiu", () => {
    expect(dataReferencia(registro())).toBe("2026-07-05T10:00:00.000Z");
  });

  it("uma ordem aberta em junho e concluída em julho conta em julho", () => {
    const r = registro({
      aberta_em: "2026-06-28T10:00:00.000Z",
      status: "realizada",
      realizada_em: "2026-07-02T10:00:00.000Z",
    });
    expect(resumoManutencaoMes([r], "2026-07").total).toBe(1);
    expect(resumoManutencaoMes([r], "2026-06").total).toBe(0);
  });
});

describe("ordensDoMes", () => {
  it("ordena da mais recente para a mais antiga e resolve o equipamento", () => {
    const antiga = registro({ id: "a", aberta_em: "2026-07-02T08:00:00.000Z" });
    const nova = registro({ id: "b", aberta_em: "2026-07-18T08:00:00.000Z" });
    const ordens = ordensDoMes([antiga, nova], [equipamento()], "2026-07");

    expect(ordens.map((o) => o.registro.id)).toEqual(["b", "a"]);
    expect(ordens[0].equipamento?.nome).toBe("Escavadeira CAT 320");
  });

  it("tolera equipamento removido do cadastro", () => {
    const ordens = ordensDoMes([registro({ equipamento_id: "sumiu" })], [equipamento()], "2026-07");
    expect(ordens[0].equipamento).toBeUndefined();
  });

  it("descarta o que é de outro mês", () => {
    expect(ordensDoMes([registro()], [equipamento()], "2026-08")).toHaveLength(0);
  });
});

describe("resumoManutencaoMes", () => {
  it("separa preventivas de corretivas", () => {
    const r = resumoManutencaoMes(
      [
        registro({ id: "1", tipo: "preventiva" }),
        registro({ id: "2", tipo: "corretiva", plano_id: null, descricao: "Quebrou" }),
        registro({ id: "3", tipo: "corretiva", plano_id: null, descricao: "Quebrou de novo" }),
      ],
      "2026-07",
    );
    expect(r.total).toBe(3);
    expect(r.preventivas).toBe(1);
    expect(r.corretivas).toBe(2);
  });

  it("soma só o custo das concluídas — estimativa de ordem em andamento fica de fora", () => {
    const r = resumoManutencaoMes(
      [
        registro({
          id: "feita",
          status: "realizada",
          realizada_em: "2026-07-10T00:00:00.000Z",
          custo: 1850,
        }),
        registro({ id: "andando", status: "em_andamento", custo: 3400 }),
      ],
      "2026-07",
    );
    expect(r.custo).toBe(1850);
  });

  it("compara com o mês anterior", () => {
    const registros = [
      registro({
        id: "jun",
        status: "realizada",
        realizada_em: "2026-06-10T00:00:00.000Z",
        custo: 1000,
      }),
      registro({
        id: "jul",
        status: "realizada",
        realizada_em: "2026-07-10T00:00:00.000Z",
        custo: 1140,
      }),
    ];
    const r = resumoManutencaoMes(registros, "2026-07");
    expect(r.custoMesAnterior).toBe(1000);
    expect(r.variacaoCusto).toBeCloseTo(14);
  });

  it("não inventa variação quando o mês anterior foi zero", () => {
    const r = resumoManutencaoMes(
      [
        registro({
          status: "realizada",
          realizada_em: "2026-07-10T00:00:00.000Z",
          custo: 500,
        }),
      ],
      "2026-07",
    );
    expect(r.variacaoCusto).toBeNull();
  });

  it("trata custo nulo como zero", () => {
    const r = resumoManutencaoMes(
      [registro({ status: "realizada", realizada_em: "2026-07-10T00:00:00.000Z", custo: null })],
      "2026-07",
    );
    expect(r.custo).toBe(0);
  });
});

describe("equipamentosEmManutencao", () => {
  it("lista sem repetir o equipamento com duas ordens abertas", () => {
    const parados = equipamentosEmManutencao(
      [
        registro({ id: "1", status: "em_andamento" }),
        registro({ id: "2", status: "em_andamento" }),
        registro({ id: "3", equipamento_id: "eq-2", status: "realizada" }),
      ],
      [equipamento(), equipamento({ id: "eq-2", nome: "Pá Carregadeira" })],
    );
    expect(parados.map((e) => e.id)).toEqual(["eq-1"]);
  });

  it("ignora o recorte de mês: ordem antiga ainda aberta mantém a máquina parada", () => {
    const parados = equipamentosEmManutencao(
      [registro({ status: "em_andamento", aberta_em: "2025-01-04T00:00:00.000Z" })],
      [equipamento()],
    );
    expect(parados).toHaveLength(1);
  });
});

describe("serieOrdensPorMes", () => {
  it("devolve a contagem do mais antigo ao mais recente", () => {
    const registros = [
      registro({ id: "a", aberta_em: "2026-05-10T00:00:00.000Z" }),
      registro({ id: "b", aberta_em: "2026-07-01T00:00:00.000Z" }),
      registro({ id: "c", aberta_em: "2026-07-20T00:00:00.000Z" }),
    ];
    expect(serieOrdensPorMes(registros, "2026-07", 4)).toEqual([0, 1, 0, 2]);
  });

  it("atravessa a virada de ano sem furo", () => {
    const registros = [registro({ aberta_em: "2025-12-15T00:00:00.000Z" })];
    expect(serieOrdensPorMes(registros, "2026-01", 3)).toEqual([0, 1, 0]);
  });
});
