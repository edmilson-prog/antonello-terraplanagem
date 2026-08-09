import { describe, it, expect } from "vitest";
import {
  cienciasConfirmadas,
  registroDeHoje,
  registrosDoTipo,
  resumoRegistro,
  viagensDeHoje,
} from "./derivacoes";
import type { RegistroCampo } from "./tipos";

function base(over: Partial<RegistroCampo> = {}) {
  return {
    id: crypto.randomUUID(),
    op_id: crypto.randomUUID(),
    operador_id: "op-1",
    os_id: "os-1",
    equipamento_id: "eq-1",
    registrado_em: new Date(2026, 6, 10, 9).toISOString(),
    pendente_sync: true,
    ...over,
  };
}

const checklist: RegistroCampo = {
  ...base(),
  tipo: "checklist",
  dados: {
    itens: [
      { chave: "oleo_agua", conforme: true },
      { chave: "cinto", conforme: false },
    ],
    nao_conformes: 1,
    horimetro: 4200,
  },
} as RegistroCampo;

const viagens = (qtd: number, quando: Date): RegistroCampo =>
  ({
    ...base({ registrado_em: quando.toISOString() }),
    tipo: "viagens",
    dados: { material: "bota_fora", viagens: qtd, capacidade_m3: 12, observacao: null },
  }) as RegistroCampo;

describe("resumoRegistro", () => {
  it("destaca itens não conformes do checklist", () => {
    expect(resumoRegistro(checklist)).toBe("1 item não conforme");
  });

  it("resume paralisação com motivo e duração", () => {
    const paralisacao = {
      ...base(),
      tipo: "paralisacao",
      dados: { motivo: "chuva", duracao_horas: 1.5, observacao: null },
    } as RegistroCampo;
    expect(resumoRegistro(paralisacao)).toBe("Chuva · 1,5 h");
  });

  it("resume viagens com quantidade e material", () => {
    expect(resumoRegistro(viagens(4, new Date(2026, 6, 10)))).toBe("4 viagens · Bota-fora");
  });

  it("usa singular quando é uma viagem só", () => {
    expect(resumoRegistro(viagens(1, new Date(2026, 6, 10)))).toBe("1 viagem · Bota-fora");
  });
});

describe("registrosDoTipo", () => {
  it("filtra por tipo e, opcionalmente, por OS", () => {
    const lista = [checklist, viagens(2, new Date(2026, 6, 10))];
    expect(registrosDoTipo(lista, "checklist")).toHaveLength(1);
    expect(registrosDoTipo(lista, "checklist", "os-2")).toHaveLength(0);
  });
});

describe("registroDeHoje", () => {
  it("acha o registro do dia e ignora o de ontem", () => {
    const hoje = new Date(2026, 6, 10, 15);
    const ontem = { ...checklist, registrado_em: new Date(2026, 6, 9, 9).toISOString() };
    expect(registroDeHoje([checklist], "checklist", "os-1", hoje)).toBeDefined();
    expect(registroDeHoje([ontem as RegistroCampo], "checklist", "os-1", hoje)).toBeUndefined();
  });
});

describe("cienciasConfirmadas", () => {
  it("devolve os ids de alerta já confirmados", () => {
    const ciencia = {
      ...base({ os_id: null, equipamento_id: null }),
      tipo: "ciencia_seguranca",
      dados: { alerta_id: "plano-1", titulo: "Manutenção vencida" },
    } as RegistroCampo;
    const ids = cienciasConfirmadas([checklist, ciencia]);
    expect(ids.has("plano-1")).toBe(true);
    expect(ids.size).toBe(1);
  });
});

describe("viagensDeHoje", () => {
  it("soma só as viagens do dia e da OS", () => {
    const hoje = new Date(2026, 6, 10, 18);
    const lista = [
      viagens(4, new Date(2026, 6, 10, 9)),
      viagens(2, new Date(2026, 6, 10, 14)),
      viagens(9, new Date(2026, 6, 9, 9)),
    ];
    expect(viagensDeHoje(lista, "os-1", hoje)).toBe(6);
    expect(viagensDeHoje(lista, "os-2", hoje)).toBe(0);
  });
});
