import { describe, it, expect } from "vitest";
import {
  contagemOSPorStatus,
  horasApontadasNoPeriodo,
  valorExecutadoNoPeriodo,
  pipelineFinanceiroPeriodo,
  resumoContasPendentes,
  contagemAlertasManutencao,
  intervaloAnterior,
  bucketsDoIntervalo,
  serieEmBuckets,
  referenciaApontamentos,
  serieSemanalHoras,
  resumoSemanal,
  osAtivas,
  apontamentosDoDiaMaisRecente,
  vencimentosProximos,
  saldoAReceber,
} from "./derivacoes";
import type { IntervaloPeriodo } from "./periodo";
import type {
  Apontamento,
  ContaPagar,
  ContaReceber,
  Equipamento,
  Faturamento,
  OrdemServico,
  PlanoManutencao,
  PrecoHoraMaquina,
  RegistroManutencao,
} from "@/shared/types";

const INTERVALO: IntervaloPeriodo = {
  inicio: new Date("2026-07-01T00:00:00.000Z"),
  fim: new Date("2026-07-03T00:00:00.000Z"),
};

function os(over: Partial<OrdemServico> & { id: string }): OrdemServico {
  return {
    id: over.id,
    numero: over.numero ?? "OS-2026-0001",
    cliente_id: over.cliente_id ?? "cl-001",
    obra_nome: over.obra_nome ?? "Obra",
    endereco: over.endereco ?? null,
    modelo_cobranca: over.modelo_cobranca ?? "hora_maquina",
    status: over.status ?? "aberta",
    responsavel_id: over.responsavel_id ?? null,
    observacao: over.observacao ?? null,
    diametro_broca_mm: over.diametro_broca_mm ?? null,
    tipo_servico: over.tipo_servico ?? null,
    equipamento_previsto_id: over.equipamento_previsto_id ?? null,
    inicio_previsto: over.inicio_previsto ?? null,
    aberta_em: over.aberta_em ?? "2026-07-02T10:00:00.000Z",
    fechada_em: over.fechada_em ?? null,
    pendente_sync: over.pendente_sync ?? false,
    created_at: over.created_at ?? "2026-07-02T10:00:00.000Z",
    updated_at: over.updated_at ?? "2026-07-02T10:00:00.000Z",
    local_lat: null,
    local_lng: null,
  };
}

function ap(over: Partial<Apontamento> & { id: string }): Apontamento {
  return {
    id: over.id,
    equipamento_id: over.equipamento_id ?? "eq-001",
    operador_id: over.operador_id ?? "op-001",
    os_id: over.os_id ?? null,
    horimetro_inicial: over.horimetro_inicial ?? 100,
    horimetro_final: over.horimetro_final ?? null,
    horas_trabalhadas: over.horas_trabalhadas ?? null,
    foto_inicial_url: over.foto_inicial_url ?? null,
    foto_final_url: over.foto_final_url ?? null,
    observacao: over.observacao ?? null,
    modalidade: over.modalidade ?? null,
    metros_executados: over.metros_executados ?? null,
    status: over.status ?? "finalizado",
    pendente_sync: over.pendente_sync ?? false,
    iniciado_em: over.iniciado_em ?? "2026-07-02T10:00:00.000Z",
    finalizado_em: over.finalizado_em ?? "2026-07-02T14:00:00.000Z",
    created_at: over.created_at ?? "2026-07-02T10:00:00.000Z",
    updated_at: over.updated_at ?? "2026-07-02T14:00:00.000Z",
  };
}

function fat(over: Partial<Faturamento> & { id: string }): Faturamento {
  return {
    id: over.id,
    numero: over.numero ?? "FAT-2026-0001",
    os_id: over.os_id ?? "os-1",
    cliente_id: over.cliente_id ?? "cl-001",
    modelo_cobranca: over.modelo_cobranca ?? "hora_maquina",
    itens: over.itens ?? [],
    desconto: over.desconto ?? 0,
    valor_total: over.valor_total ?? 0,
    observacao: over.observacao ?? null,
    status: over.status ?? "rascunho",
    gerado_em: over.gerado_em ?? "2026-07-02T10:00:00.000Z",
    faturado_em: over.faturado_em ?? null,
    created_at: over.created_at ?? "2026-07-02T10:00:00.000Z",
    updated_at: over.updated_at ?? "2026-07-02T10:00:00.000Z",
  };
}

function equipamento(over: Partial<Equipamento> & { id: string }): Equipamento {
  return {
    id: over.id,
    nome: over.nome ?? "Escavadeira",
    tipo: over.tipo ?? "escavadeira",
    capacidade: over.capacidade ?? "10t",
    horimetro_atual: over.horimetro_atual ?? 1000,
    identificador: over.identificador ?? null,
    status: over.status ?? "disponivel",
    ativo: over.ativo ?? true,
    marca: over.marca ?? null,
    ano: over.ano ?? null,
    propriedade: over.propriedade ?? null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    aquisicao_forma: null,
    aquisicao_parcelas: null,
    descricao: null,
  };
}

function precoHM(over: Partial<PrecoHoraMaquina> & { id: string }): PrecoHoraMaquina {
  return {
    id: over.id,
    equipamento_id: over.equipamento_id ?? null,
    tipo_equipamento: over.tipo_equipamento ?? "escavadeira",
    valor_hora_seca: over.valor_hora_seca ?? 100,
    valor_hora_operada: over.valor_hora_operada ?? 150,
    ativo: over.ativo ?? true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

function contaReceber(over: Partial<ContaReceber> & { id: string }): ContaReceber {
  return {
    id: over.id,
    faturamento_id: over.faturamento_id ?? "fat-1",
    cliente_id: over.cliente_id ?? "cl-001",
    valor: over.valor ?? 1000,
    vencimento: over.vencimento ?? "2026-07-10",
    status: over.status ?? "aberta",
    recebido_em: over.recebido_em ?? null,
    forma_recebimento: over.forma_recebimento ?? null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

function contaPagar(over: Partial<ContaPagar> & { id: string }): ContaPagar {
  return {
    id: over.id,
    descricao: over.descricao ?? "Despesa",
    fornecedor: over.fornecedor ?? null,
    categoria: over.categoria ?? "outro",
    valor: over.valor ?? 500,
    vencimento: over.vencimento ?? "2026-07-10",
    status: over.status ?? "aberta",
    pago_em: over.pago_em ?? null,
    documento: over.documento ?? null,
    forma_pagamento: over.forma_pagamento ?? null,
    observacao: over.observacao ?? null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

describe("contagemOSPorStatus", () => {
  it("conta aberta/em_andamento pelo estado atual; fechada só quando fechada_em está no período", () => {
    const ordens = [
      os({ id: "a", status: "aberta" }),
      os({ id: "b", status: "em_andamento" }),
      os({ id: "c", status: "fechada", fechada_em: "2026-07-02T12:00:00.000Z" }),
      os({ id: "d", status: "fechada", fechada_em: "2026-06-01T12:00:00.000Z" }),
    ];
    expect(contagemOSPorStatus(ordens, [], INTERVALO)).toEqual({
      abertas: 1,
      emAndamento: 1,
      fechadasNoPeriodo: 1,
    });
  });
});

describe("horasApontadasNoPeriodo", () => {
  it("soma horas de finalizados no período; ignora em_andamento e fora do período", () => {
    const aps = [
      ap({
        id: "a1",
        status: "finalizado",
        horas_trabalhadas: 8,
        finalizado_em: "2026-07-02T12:00:00.000Z",
      }),
      ap({
        id: "a2",
        status: "finalizado",
        horas_trabalhadas: 5,
        finalizado_em: "2026-06-01T12:00:00.000Z",
      }),
      ap({ id: "a3", status: "em_andamento", horas_trabalhadas: null, finalizado_em: null }),
    ];
    expect(horasApontadasNoPeriodo(aps, INTERVALO)).toBe(8);
  });
});

describe("valorExecutadoNoPeriodo", () => {
  it("soma o valor (via gerarItens) das OS fechadas no período ainda sem fatura", () => {
    const ordem = os({ id: "os-1", status: "fechada", fechada_em: "2026-07-02T12:00:00.000Z" });
    const aps = [
      ap({
        id: "a1",
        os_id: "os-1",
        equipamento_id: "eq-1",
        horas_trabalhadas: 10,
        modalidade: "operada",
      }),
    ];
    const equipamentos = [equipamento({ id: "eq-1" })];
    const precos = [precoHM({ id: "p1", equipamento_id: "eq-1", valor_hora_operada: 150 })];
    const valor = valorExecutadoNoPeriodo([ordem], aps, [], equipamentos, precos, [], INTERVALO);
    expect(valor).toBe(1500);
  });

  it("ignora OS já faturada", () => {
    const ordem = os({ id: "os-1", status: "fechada", fechada_em: "2026-07-02T12:00:00.000Z" });
    const faturamentoExistente = fat({ id: "f1", os_id: "os-1" });
    const valor = valorExecutadoNoPeriodo(
      [ordem],
      [],
      [faturamentoExistente],
      [],
      [],
      [],
      INTERVALO,
    );
    expect(valor).toBe(0);
  });

  it("ignora OS fechada fora do período", () => {
    const ordem = os({ id: "os-1", status: "fechada", fechada_em: "2026-06-01T12:00:00.000Z" });
    const valor = valorExecutadoNoPeriodo([ordem], [], [], [], [], [], INTERVALO);
    expect(valor).toBe(0);
  });
});

describe("pipelineFinanceiroPeriodo", () => {
  it("calcula executado (preview), faturado e recebido no período, todos em R$", () => {
    const ordens = [os({ id: "os-1", status: "fechada", fechada_em: "2026-07-02T09:00:00.000Z" })];
    const aps = [
      ap({
        id: "a1",
        os_id: "os-1",
        equipamento_id: "eq-1",
        horas_trabalhadas: 10,
        modalidade: "operada",
      }),
    ];
    const equipamentos = [equipamento({ id: "eq-1" })];
    const precos = [precoHM({ id: "p1", equipamento_id: "eq-1", valor_hora_operada: 150 })];
    const faturamentos = [
      fat({
        id: "f1",
        os_id: "os-2",
        status: "faturado",
        valor_total: 2000,
        faturado_em: "2026-07-02T09:00:00.000Z",
      }),
    ];
    const contasReceber = [
      contaReceber({
        id: "c1",
        valor: 900,
        status: "liquidada",
        recebido_em: "2026-07-02T09:00:00.000Z",
      }),
    ];

    const pipeline = pipelineFinanceiroPeriodo(
      ordens,
      aps,
      faturamentos,
      contasReceber,
      equipamentos,
      precos,
      [],
      INTERVALO,
    );
    expect(pipeline).toEqual({ executado: 1500, faturado: 2000, recebido: 900 });
  });

  it("exclui faturas/recebimentos fora do período", () => {
    const faturamentos = [
      fat({
        id: "f1",
        os_id: "os-2",
        status: "faturado",
        valor_total: 2000,
        faturado_em: "2026-06-01T09:00:00.000Z",
      }),
    ];
    const contasReceber = [
      contaReceber({
        id: "c1",
        valor: 900,
        status: "liquidada",
        recebido_em: "2026-06-01T09:00:00.000Z",
      }),
    ];
    const pipeline = pipelineFinanceiroPeriodo(
      [],
      [],
      faturamentos,
      contasReceber,
      [],
      [],
      [],
      INTERVALO,
    );
    expect(pipeline).toEqual({ executado: 0, faturado: 0, recebido: 0 });
  });
});

describe("resumoContasPendentes", () => {
  it("separa vencidas de a-vencer entre contas a receber e a pagar abertas", () => {
    const agora = new Date("2026-07-02T12:00:00.000Z");
    const receber = [
      contaReceber({ id: "r1", status: "aberta", vencimento: "2026-06-01" }),
      contaReceber({ id: "r2", status: "aberta", vencimento: "2026-08-01" }),
      contaReceber({ id: "r3", status: "liquidada", vencimento: "2026-06-01" }),
    ];
    const pagar = [contaPagar({ id: "p1", status: "aberta", vencimento: "2026-06-15" })];
    expect(resumoContasPendentes(receber, pagar, agora)).toEqual({ vencidas: 2, aVencer: 1 });
  });
});

describe("contagemAlertasManutencao", () => {
  it("conta equipamentos com plano próximo ou vencido", () => {
    const equipamentos = [equipamento({ id: "eq-1", horimetro_atual: 1250 })];
    const planos: PlanoManutencao[] = [
      {
        id: "pm-1",
        equipamento_id: "eq-1",
        tipo_equipamento: null,
        descricao: "Troca de óleo",
        intervalo_horas: 250,
        ativo: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    const registros: RegistroManutencao[] = [
      {
        id: "rm-1",
        equipamento_id: "eq-1",
        plano_id: "pm-1",
        tipo: "preventiva",
        descricao: null,
        prioridade: "media",
        horimetro_previsto: 1250,
        horimetro_realizado: null,
        horimetro_abertura: null,
        status: "prevista",
        custo: null,
        fornecedor: null,
        observacao: null,
        origem_registro_campo_id: null,
        realizada_em: null,
        aberta_em: "2026-01-01T00:00:00.000Z",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(contagemAlertasManutencao(equipamentos, planos, registros)).toBe(1);
  });

  it("retorna 0 quando não há planos", () => {
    expect(contagemAlertasManutencao([equipamento({ id: "eq-1" })], [], [])).toBe(0);
  });
});

describe("intervaloAnterior", () => {
  it("devolve a janela imediatamente anterior, de mesma duração", () => {
    const anterior = intervaloAnterior(INTERVALO);
    expect(anterior.fim.getTime()).toBe(INTERVALO.inicio.getTime() - 1);
    expect(INTERVALO.fim.getTime() - INTERVALO.inicio.getTime()).toBe(
      anterior.fim.getTime() + 1 - anterior.inicio.getTime(),
    );
  });
});

describe("bucketsDoIntervalo / serieEmBuckets", () => {
  it("divide o intervalo em N fatias contíguas cobrindo todo o período", () => {
    const buckets = bucketsDoIntervalo(INTERVALO, 4);
    expect(buckets).toHaveLength(4);
    expect(buckets[0].inicio.getTime()).toBe(INTERVALO.inicio.getTime());
    expect(buckets[3].fim.getTime()).toBe(INTERVALO.fim.getTime());
  });

  it("soma cada item na fatia do seu período e ignora o que está fora", () => {
    const faturamentos = [
      fat({ id: "f1", valor_total: 100, faturado_em: "2026-07-01T06:00:00.000Z" }),
      fat({ id: "f2", valor_total: 250, faturado_em: "2026-07-02T18:00:00.000Z" }),
      fat({ id: "f3", valor_total: 999, faturado_em: "2026-05-01T06:00:00.000Z" }),
    ];
    const serie = serieEmBuckets(
      faturamentos,
      (f) => f.faturado_em,
      (f) => f.valor_total,
      INTERVALO,
      2,
    );
    expect(serie).toEqual([100, 250]);
  });

  it("devolve lista vazia quando a quantidade é inválida", () => {
    expect(bucketsDoIntervalo(INTERVALO, 0)).toEqual([]);
  });
});

describe("referenciaApontamentos", () => {
  it("usa o apontamento finalizado mais recente", () => {
    const aps = [
      ap({ id: "a1", finalizado_em: "2026-06-20T10:00:00.000Z" }),
      ap({ id: "a2", finalizado_em: "2026-06-29T10:00:00.000Z" }),
    ];
    expect(referenciaApontamentos(aps, new Date("2026-08-09T00:00:00.000Z")).toISOString()).toBe(
      "2026-06-29T10:00:00.000Z",
    );
  });

  it("cai para `agora` quando não há apontamento finalizado", () => {
    const agora = new Date("2026-08-09T00:00:00.000Z");
    expect(referenciaApontamentos([], agora)).toBe(agora);
  });
});

describe("serieSemanalHoras / resumoSemanal", () => {
  const referencia = new Date("2026-07-29T12:00:00.000Z");

  it("agrupa as horas em janelas de 7 dias terminando na referência", () => {
    const aps = [
      ap({ id: "a1", horas_trabalhadas: 8, finalizado_em: "2026-07-28T10:00:00.000Z" }), // última janela
      ap({ id: "a2", horas_trabalhadas: 5, finalizado_em: "2026-07-20T10:00:00.000Z" }), // penúltima
      ap({ id: "a3", horas_trabalhadas: 3, finalizado_em: "2026-01-01T10:00:00.000Z" }), // fora
    ];
    const semanas = serieSemanalHoras(aps, referencia, 3);
    expect(semanas).toHaveLength(3);
    expect(semanas.map((s) => s.horas)).toEqual([0, 5, 8]);
    expect(semanas[0].rotulo).toMatch(/^\d{2}\/\d{2}$/);
  });

  it("ignora apontamentos em andamento", () => {
    const aps = [
      ap({ id: "a1", status: "em_andamento", horas_trabalhadas: null, finalizado_em: null }),
    ];
    expect(serieSemanalHoras(aps, referencia, 2).map((s) => s.horas)).toEqual([0, 0]);
  });

  it("resume média e pico da série", () => {
    const resumo = resumoSemanal([
      { rotulo: "01/07", horas: 10 },
      { rotulo: "08/07", horas: 30 },
    ]);
    expect(resumo).toEqual({ media: 20, pico: 30, picoRotulo: "08/07" });
  });

  it("não aponta pico quando a série é toda zero", () => {
    expect(resumoSemanal([{ rotulo: "01/07", horas: 0 }]).picoRotulo).toBeNull();
  });
});

describe("osAtivas", () => {
  it("lista em andamento antes das abertas e exclui as fechadas", () => {
    const ordens = [
      os({ id: "aberta-antiga", status: "aberta", aberta_em: "2026-07-01T10:00:00.000Z" }),
      os({ id: "aberta-nova", status: "aberta", aberta_em: "2026-07-05T10:00:00.000Z" }),
      os({ id: "andando", status: "aberta" }),
      os({ id: "fechada", status: "fechada", fechada_em: "2026-07-02T10:00:00.000Z" }),
    ];
    const aps = [ap({ id: "a1", os_id: "andando", horas_trabalhadas: 12 })];
    const ativas = osAtivas(ordens, aps);
    expect(ativas.map((a) => a.os.id)).toEqual(["andando", "aberta-nova", "aberta-antiga"]);
    expect(ativas[0]).toMatchObject({ status: "em_andamento", horas: 12 });
  });

  it("respeita o limite", () => {
    const ordens = [os({ id: "a" }), os({ id: "b" }), os({ id: "c" })];
    expect(osAtivas(ordens, [], 2)).toHaveLength(2);
  });
});

describe("apontamentosDoDiaMaisRecente", () => {
  it("devolve só os finalizados do último dia com movimento, do mais recente ao mais antigo", () => {
    const aps = [
      ap({ id: "velho", finalizado_em: "2026-06-20T10:00:00.000Z" }),
      ap({ id: "novo-1", finalizado_em: "2026-06-29T08:00:00.000Z" }),
      ap({ id: "novo-2", finalizado_em: "2026-06-29T17:00:00.000Z" }),
      ap({ id: "aberto", status: "em_andamento", finalizado_em: null }),
    ];
    const dia = apontamentosDoDiaMaisRecente(aps);
    expect(dia.data).toBe("2026-06-29");
    expect(dia.itens.map((a) => a.id)).toEqual(["novo-2", "novo-1"]);
  });

  it("devolve data nula quando não há apontamento finalizado", () => {
    expect(apontamentosDoDiaMaisRecente([])).toEqual({ data: null, itens: [] });
  });
});

describe("vencimentosProximos", () => {
  it("ordena por vencimento, marca as vencidas e resolve o número do faturamento", () => {
    const contas = [
      contaReceber({ id: "c2", faturamento_id: "f2", vencimento: "2026-07-20" }),
      contaReceber({ id: "c1", faturamento_id: "f1", vencimento: "2026-06-30" }),
      contaReceber({ id: "liquidada", status: "liquidada", vencimento: "2026-06-01" }),
    ];
    const faturamentos = [fat({ id: "f1", numero: "FAT-0001" })];
    const itens = vencimentosProximos(contas, faturamentos, "2026-07-10");
    expect(itens.map((i) => i.conta.id)).toEqual(["c1", "c2"]);
    expect(itens[0]).toMatchObject({ documento: "FAT-0001", vencida: true });
    expect(itens[1]).toMatchObject({ documento: "—", vencida: false });
  });
});

describe("saldoAReceber", () => {
  it("soma só as contas em aberto e conta quantas estão vencidas", () => {
    const contas = [
      contaReceber({ id: "c1", valor: 1000, vencimento: "2026-06-01" }),
      contaReceber({ id: "c2", valor: 500, vencimento: "2026-08-01" }),
      contaReceber({ id: "c3", valor: 9999, status: "liquidada", vencimento: "2026-06-01" }),
    ];
    expect(saldoAReceber(contas, "2026-07-10")).toEqual({ total: 1500, titulos: 2, vencidos: 1 });
  });
});
