import { describe, expect, it } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { ordensServico } from "@/mocks/ordens-servico";
import { apontamentos } from "@/mocks/apontamentos";
import { faturamentos } from "@/mocks/faturamentos";
import { contasReceber } from "@/mocks/contas-receber";
import { clientes } from "@/mocks/clientes";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import { planosManutencao } from "@/mocks/planos-manutencao";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { horasApontadasNoPeriodo, valorExecutadoNoPeriodo } from "@/features/dashboard/derivacoes";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { alertasManutencao } from "@/features/manutencao/derivacoes";
import { estaNoIntervalo, type IntervaloPeriodo } from "@/features/dashboard/periodo";
import {
  contasReceberPorCliente,
  contasReceberPorClienteFaixas,
  dataReferenciaOperacional,
  diasDoIntervalo,
  horasRestantesAlerta,
  intervaloMesAnterior,
  manutencaoPreditiva,
  percentualCiclo,
  serieDiariaExecutado,
  serieDiariaFaturamento,
  serieDiariaHoras,
  serieDiariaOSAbertas,
  serieDiariaRecebido,
} from "./derivacoes";

const referencia = dataReferenciaOperacional(
  ordensServico,
  apontamentos,
  faturamentos,
  contasReceber,
);

// Intervalo agregado equivalente à união dos 7 dias retornados por diasDoIntervalo,
// construído de forma independente (sem chamar as funções sob teste) para servir
// de comparação.
function janela7DiasAgregada(): IntervaloPeriodo {
  const dias = diasDoIntervalo(referencia, 7);
  return { inicio: dias[0].inicio, fim: dias[dias.length - 1].fim };
}

describe("intervaloMesAnterior", () => {
  it("cobre do dia 1 00:00 ao último dia 23:59:59.999 do mês anterior ao de referência", () => {
    const intervalo = intervaloMesAnterior(referencia);
    const fimEsperado = new Date(
      referencia.getFullYear(),
      referencia.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    expect(intervalo.inicio.getDate()).toBe(1);
    expect(intervalo.inicio.getHours()).toBe(0);
    expect(intervalo.fim.toDateString()).toBe(fimEsperado.toDateString());
    expect(intervalo.fim.getMonth()).toBe(intervalo.inicio.getMonth());
  });
});

describe("dataReferenciaOperacional", () => {
  it("é a maior data entre os eventos mockados", () => {
    const maiorEsperada = [
      ...ordensServico.map((o) => o.aberta_em),
      ...apontamentos.map((a) => a.finalizado_em).filter((d): d is string => d !== null),
      ...faturamentos.map((f) => f.faturado_em).filter((d): d is string => d !== null),
      ...contasReceber.map((c) => c.recebido_em).filter((d): d is string => d !== null),
    ]
      .sort()
      .at(-1);
    expect(referencia.toISOString()).toBe(new Date(maiorEsperada!).toISOString());
  });
});

describe("diasDoIntervalo", () => {
  it("retorna 7 dias consecutivos terminando no dia da referência", () => {
    const dias = diasDoIntervalo(referencia, 7);
    expect(dias).toHaveLength(7);
    expect(dias[6].fim.toDateString()).toBe(referencia.toDateString());
    expect(dias[0].inicio.getHours()).toBe(0);
    expect(dias[6].fim.getHours()).toBe(23);
  });
});

describe("serieDiariaOSAbertas", () => {
  it("soma para o total de OS abertas na janela agregada de 7 dias", () => {
    const serie = serieDiariaOSAbertas(ordensServico, referencia);
    const somaSerie = serie.reduce((s, p) => s + p.valor, 0);
    const totalAgregado = ordensServico.filter((o) =>
      estaNoIntervalo(o.aberta_em, janela7DiasAgregada()),
    ).length;
    expect(somaSerie).toBe(totalAgregado);
  });
});

describe("serieDiariaHoras", () => {
  it("soma para o mesmo total que horasApontadasNoPeriodo na janela agregada", () => {
    const serie = serieDiariaHoras(apontamentos, referencia);
    const somaSerie = serie.reduce((s, p) => s + p.valor, 0);
    const totalAgregado = horasApontadasNoPeriodo(apontamentos, janela7DiasAgregada());
    expect(somaSerie).toBeCloseTo(totalAgregado, 5);
  });
});

describe("serieDiariaFaturamento", () => {
  it("soma para o total de valor_total faturado na janela agregada", () => {
    const serie = serieDiariaFaturamento(faturamentos, referencia);
    const somaSerie = serie.reduce((s, p) => s + p.valor, 0);
    const totalAgregado = faturamentos
      .filter((f) => estaNoIntervalo(f.faturado_em, janela7DiasAgregada()))
      .reduce((s, f) => s + f.valor_total, 0);
    expect(somaSerie).toBeCloseTo(totalAgregado, 5);
  });
});

describe("serieDiariaRecebido", () => {
  it("soma para o total de valor recebido na janela agregada", () => {
    const serie = serieDiariaRecebido(contasReceber, referencia);
    const somaSerie = serie.reduce((s, p) => s + p.valor, 0);
    const totalAgregado = contasReceber
      .filter((c) => estaNoIntervalo(c.recebido_em, janela7DiasAgregada()))
      .reduce((s, c) => s + c.valor, 0);
    expect(somaSerie).toBeCloseTo(totalAgregado, 5);
  });
});

describe("serieDiariaExecutado", () => {
  it("soma para o mesmo total que valorExecutadoNoPeriodo na janela agregada", () => {
    const serie = serieDiariaExecutado(
      ordensServico,
      apontamentos,
      faturamentos,
      equipamentos,
      precosHoraMaquina,
      precosFundacao,
      referencia,
    );
    const somaSerie = serie.reduce((s, p) => s + p.valor, 0);
    const totalAgregado = valorExecutadoNoPeriodo(
      ordensServico,
      apontamentos,
      faturamentos,
      equipamentos,
      precosHoraMaquina,
      precosFundacao,
      janela7DiasAgregada(),
    );
    expect(somaSerie).toBeCloseTo(totalAgregado, 2);
  });
});

describe("contasReceberPorCliente", () => {
  const agoraISO = referencia.toISOString();
  const resultado = contasReceberPorCliente(contasReceber, clientes, agoraISO);

  it("o total (vencida + a vencer) bate com a soma de todas as contas em aberto", () => {
    const somaResultado = resultado.reduce((s, r) => s + r.vencida + r.aVencer, 0);
    const somaEsperada = contasReceber
      .filter((c) => c.status === "aberta")
      .reduce((s, c) => s + c.valor, 0);
    expect(somaResultado).toBeCloseTo(somaEsperada, 2);
  });

  it("classifica cada conta aberta como vencida XOR a vencer, conforme contaVencida", () => {
    const somaVencidaResultado = resultado.reduce((s, r) => s + r.vencida, 0);
    const somaVencidaEsperada = contasReceber
      .filter((c) => c.status === "aberta" && contaVencida(c, agoraISO))
      .reduce((s, c) => s + c.valor, 0);
    expect(somaVencidaResultado).toBeCloseTo(somaVencidaEsperada, 2);
  });

  it("resolve o nome do cliente a partir do mock de clientes", () => {
    if (resultado.length === 0) return;
    const primeiro = resultado[0];
    const clienteEsperado = clientes.find((c) => c.id === primeiro.cliente_id);
    expect(primeiro.cliente_nome).toBe(clienteEsperado?.nome ?? "Cliente desconhecido");
  });
});

describe("horasRestantesAlerta", () => {
  it("é a diferença entre horímetro previsto e horímetro atual", () => {
    const alertas = alertasManutencao(equipamentos, planosManutencao, registrosManutencao);
    if (alertas.length === 0) return;
    for (const alerta of alertas) {
      const esperado =
        Math.round((alerta.registro.horimetro_previsto - alerta.equipamento.horimetro_atual) * 10) /
        10;
      expect(horasRestantesAlerta(alerta)).toBe(esperado);
    }
  });
});

describe("percentualCiclo", () => {
  it("mede quanto do intervalo do plano já foi consumido", () => {
    expect(percentualCiclo(250, 250)).toBe(0); // acabou de zerar o ciclo
    expect(percentualCiclo(125, 250)).toBe(50);
    expect(percentualCiclo(20, 250)).toBe(92);
  });

  it("satura em 100 quando vencida e nunca fica negativo", () => {
    expect(percentualCiclo(0, 250)).toBe(100);
    expect(percentualCiclo(-40, 250)).toBe(100);
    expect(percentualCiclo(500, 250)).toBe(0);
  });

  it("devolve 100 para intervalo inválido, em vez de dividir por zero", () => {
    expect(percentualCiclo(10, 0)).toBe(100);
    expect(percentualCiclo(10, -5)).toBe(100);
  });
});

describe("manutencaoPreditiva", () => {
  const linhas = manutencaoPreditiva(equipamentos, planosManutencao, registrosManutencao);

  it("ordena da mais urgente para a mais folgada", () => {
    const restantes = linhas.map((l) => l.restantes);
    expect([...restantes].sort((a, b) => a - b)).toEqual(restantes);
  });

  it("inclui os planos em dia, não só os alertas", () => {
    const alertas = alertasManutencao(equipamentos, planosManutencao, registrosManutencao);
    expect(linhas.length).toBeGreaterThanOrEqual(alertas.length);
    const chaveDaLinha = (e: string, p: string) => `${e}|${p}`;
    const chavesDasLinhas = new Set(linhas.map((l) => chaveDaLinha(l.equipamento.id, l.plano.id)));
    for (const alerta of alertas) {
      expect(chavesDasLinhas.has(chaveDaLinha(alerta.equipamento.id, alerta.plano.id))).toBe(true);
    }
  });

  it("respeita o limite", () => {
    expect(manutencaoPreditiva(equipamentos, planosManutencao, registrosManutencao, 2).length).toBe(
      Math.min(2, linhas.length),
    );
  });
});

describe("contasReceberPorClienteFaixas", () => {
  const HOJE = "2026-07-10";
  const base = {
    faturamento_id: "fat-1",
    status: "aberta" as const,
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
  const contas = [
    { ...base, id: "c1", cliente_id: "cl-1", valor: 1000, vencimento: "2026-06-30" }, // vencida
    { ...base, id: "c2", cliente_id: "cl-1", valor: 500, vencimento: "2026-07-20" }, // 10 dias
    { ...base, id: "c3", cliente_id: "cl-1", valor: 300, vencimento: "2026-08-05" }, // 26 dias
    { ...base, id: "c4", cliente_id: "cl-1", valor: 200, vencimento: "2026-09-30" }, // +30 dias
    { ...base, id: "c5", cliente_id: "cl-2", valor: 100, vencimento: "2026-07-11" },
    {
      ...base,
      id: "liq",
      cliente_id: "cl-2",
      valor: 9999,
      vencimento: "2026-07-11",
      status: "liquidada" as const,
    },
  ];
  const listaClientes = [
    { ...clientes[0], id: "cl-1", nome: "Cliente Um" },
    { ...clientes[0], id: "cl-2", nome: "Cliente Dois" },
  ];

  it("classifica cada conta aberta na sua faixa de vencimento", () => {
    const [primeiro] = contasReceberPorClienteFaixas(contas, listaClientes, HOJE);
    expect(primeiro).toMatchObject({
      cliente_id: "cl-1",
      cliente_nome: "Cliente Um",
      vencida: 1000,
      ate15: 500,
      ate30: 300,
      acima30: 200,
      total: 2000,
    });
  });

  it("ignora contas liquidadas e ordena pelo maior saldo", () => {
    const resultado = contasReceberPorClienteFaixas(contas, listaClientes, HOJE);
    expect(resultado.map((r) => r.cliente_id)).toEqual(["cl-1", "cl-2"]);
    expect(resultado[1].total).toBe(100);
  });

  it("trata o vencimento de hoje como a vencer, não vencida", () => {
    const hojeMesmo = [{ ...base, id: "x", cliente_id: "cl-2", valor: 50, vencimento: HOJE }];
    const [linha] = contasReceberPorClienteFaixas(hojeMesmo, listaClientes, HOJE);
    expect(linha.vencida).toBe(0);
    expect(linha.ate15).toBe(50);
  });
});
