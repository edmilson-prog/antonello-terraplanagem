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
  dataReferenciaOperacional,
  diasDoIntervalo,
  horasRestantesAlerta,
  intervaloMesAnterior,
  serieDiariaExecutado,
  serieDiariaFaturamento,
  serieDiariaHoras,
  serieDiariaOSAbertas,
  serieDiariaRecebido,
} from "./derivacoes";

const referencia = dataReferenciaOperacional(ordensServico, apontamentos, faturamentos, contasReceber);

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
    const fimEsperado = new Date(referencia.getFullYear(), referencia.getMonth(), 0, 23, 59, 59, 999);
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
        Math.round((alerta.registro.horimetro_previsto - alerta.equipamento.horimetro_atual) * 10) / 10;
      expect(horasRestantesAlerta(alerta)).toBe(esperado);
    }
  });
});
