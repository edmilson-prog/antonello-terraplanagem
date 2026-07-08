import { round2, gerarItens, calcularValorTotal } from "@/features/faturamento/calculo";
import { osFechadasSemFaturamento } from "@/features/faturamento/derivacoes";
import { contaVencida } from "@/features/financeiro/derivacoes";
import type { AlertaManutencao } from "@/features/manutencao/derivacoes";
import { estaNoIntervalo, type IntervaloPeriodo } from "@/features/dashboard/periodo";
import type {
  Apontamento,
  Cliente,
  ContaReceber,
  Equipamento,
  Faturamento,
  OrdemServico,
  PrecoFundacao,
  PrecoHoraMaquina,
} from "@/shared/types";

const DIA_MS = 24 * 60 * 60 * 1000;

// Ponto de referência "agora" do Painel Operacional: a data mais recente entre
// os eventos mockados (abertura de OS, apontamento finalizado, faturamento,
// recebimento). Evita janelas de "últimos 7 dias" vazias quando o relógio real
// já passou do horizonte de dados dos mocks (RF-004, fase Frontend First).
export function dataReferenciaOperacional(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  faturamentos: Faturamento[],
  contasReceber: ContaReceber[],
): Date {
  const datas = [
    ...ordens.map((o) => o.aberta_em),
    ...apontamentos.map((a) => a.finalizado_em).filter((d): d is string => d !== null),
    ...faturamentos.map((f) => f.faturado_em).filter((d): d is string => d !== null),
    ...contasReceber.map((c) => c.recebido_em).filter((d): d is string => d !== null),
  ];
  if (datas.length === 0) return new Date();
  return new Date(datas.sort().at(-1)!);
}

// Últimos `dias` intervalos diários [00:00, 23:59:59.999], terminando no dia de `referencia`.
export function diasDoIntervalo(referencia: Date, dias: number): IntervaloPeriodo[] {
  const intervalos: IntervaloPeriodo[] = [];
  for (let i = dias - 1; i >= 0; i -= 1) {
    const diaAlvo = new Date(referencia.getTime() - i * DIA_MS);
    const inicio = new Date(diaAlvo.getFullYear(), diaAlvo.getMonth(), diaAlvo.getDate(), 0, 0, 0, 0);
    const fim = new Date(diaAlvo.getFullYear(), diaAlvo.getMonth(), diaAlvo.getDate(), 23, 59, 59, 999);
    intervalos.push({ inicio, fim });
  }
  return intervalos;
}

export interface PontoSerieDiaria {
  data: string; // "YYYY-MM-DD"
  valor: number;
}

export function serieDiariaOSAbertas(
  ordens: OrdemServico[],
  referencia: Date,
  dias = 7,
): PontoSerieDiaria[] {
  return diasDoIntervalo(referencia, dias).map((intervalo) => ({
    data: intervalo.inicio.toISOString().slice(0, 10),
    valor: ordens.filter((o) => estaNoIntervalo(o.aberta_em, intervalo)).length,
  }));
}

export function serieDiariaHoras(
  apontamentos: Apontamento[],
  referencia: Date,
  dias = 7,
): PontoSerieDiaria[] {
  return diasDoIntervalo(referencia, dias).map((intervalo) => ({
    data: intervalo.inicio.toISOString().slice(0, 10),
    valor: apontamentos
      .filter((a) => a.status === "finalizado" && estaNoIntervalo(a.finalizado_em, intervalo))
      .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0),
  }));
}

export function serieDiariaFaturamento(
  faturamentos: Faturamento[],
  referencia: Date,
  dias = 7,
): PontoSerieDiaria[] {
  return diasDoIntervalo(referencia, dias).map((intervalo) => ({
    data: intervalo.inicio.toISOString().slice(0, 10),
    valor: faturamentos
      .filter((f) => estaNoIntervalo(f.faturado_em, intervalo))
      .reduce((soma, f) => soma + f.valor_total, 0),
  }));
}

export function serieDiariaRecebido(
  contasReceber: ContaReceber[],
  referencia: Date,
  dias = 7,
): PontoSerieDiaria[] {
  return diasDoIntervalo(referencia, dias).map((intervalo) => ({
    data: intervalo.inicio.toISOString().slice(0, 10),
    valor: contasReceber
      .filter((c) => estaNoIntervalo(c.recebido_em, intervalo))
      .reduce((soma, c) => soma + c.valor, 0),
  }));
}

// Mesma regra de "executado" do dashboard (PRD-015: OS fechada, sem fatura,
// valor via gerarItens/calcularValorTotal), apenas bucketizada por dia de
// fechamento — não recalcula nada novo (RF-002).
export function serieDiariaExecutado(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  faturamentos: Faturamento[],
  equipamentos: Equipamento[],
  precosHM: PrecoHoraMaquina[],
  precosFund: PrecoFundacao[],
  referencia: Date,
  dias = 7,
): PontoSerieDiaria[] {
  const semFatura = osFechadasSemFaturamento(ordens, faturamentos);
  return diasDoIntervalo(referencia, dias).map((intervalo) => {
    const doDia = semFatura.filter((o) => estaNoIntervalo(o.fechada_em, intervalo));
    const total = doDia.reduce((soma, o) => {
      const itens = gerarItens(o, apontamentos, equipamentos, precosHM, precosFund);
      return soma + calcularValorTotal(itens, 0);
    }, 0);
    return { data: intervalo.inicio.toISOString().slice(0, 10), valor: round2(total) };
  });
}

// Intervalo do mês civil imediatamente anterior ao mês de `referencia` —
// usado para calcular a variação % dos cards financeiros (mesma base de
// `pipelineFinanceiroPeriodo`, sem regra nova).
export function intervaloMesAnterior(referencia: Date): IntervaloPeriodo {
  const inicio = new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1, 0, 0, 0, 0);
  const fim = new Date(referencia.getFullYear(), referencia.getMonth(), 0, 23, 59, 59, 999);
  return { inicio, fim };
}

export interface ContasReceberCliente {
  cliente_id: string;
  cliente_nome: string;
  vencida: number;
  aVencer: number;
}

// Agrega contas em aberto por cliente, separando vencida × a vencer.
// Reaproveita `contaVencida` (PRD-007) — nenhuma regra nova.
export function contasReceberPorCliente(
  contasReceber: ContaReceber[],
  clientes: Cliente[],
  agoraISO: string,
): ContasReceberCliente[] {
  const porCliente = new Map<string, ContasReceberCliente>();
  for (const conta of contasReceber.filter((c) => c.status === "aberta")) {
    const nome = clientes.find((cl) => cl.id === conta.cliente_id)?.nome ?? "Cliente desconhecido";
    const atual = porCliente.get(conta.cliente_id) ?? {
      cliente_id: conta.cliente_id,
      cliente_nome: nome,
      vencida: 0,
      aVencer: 0,
    };
    if (contaVencida(conta, agoraISO)) atual.vencida = round2(atual.vencida + conta.valor);
    else atual.aVencer = round2(atual.aVencer + conta.valor);
    porCliente.set(conta.cliente_id, atual);
  }
  return Array.from(porCliente.values()).sort(
    (a, b) => b.vencida + b.aVencer - (a.vencida + a.aVencer),
  );
}

// Horas restantes até a manutenção prevista (negativo = já vencida em horas).
export function horasRestantesAlerta(alerta: AlertaManutencao): number {
  return Math.round((alerta.registro.horimetro_previsto - alerta.equipamento.horimetro_atual) * 10) / 10;
}
