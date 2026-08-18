import { round2, gerarItens, calcularValorTotal } from "@/features/faturamento/calculo";
import { osFechadasSemFaturamento } from "@/features/faturamento/derivacoes";
import { contaVencida } from "@/features/financeiro/derivacoes";
import {
  planosParaEquipamento,
  statusPlano,
  type AlertaManutencao,
  type RegistroPrevisto,
} from "@/features/manutencao/derivacoes";
import { estaNoIntervalo, type IntervaloPeriodo } from "@/features/dashboard/periodo";
import type {
  Apontamento,
  Cliente,
  ContaReceber,
  Equipamento,
  Faturamento,
  OrdemServico,
  PlanoManutencao,
  PrecoFundacao,
  PrecoHoraMaquina,
  RegistroManutencao,
  StatusManutencao,
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
    const inicio = new Date(
      diaAlvo.getFullYear(),
      diaAlvo.getMonth(),
      diaAlvo.getDate(),
      0,
      0,
      0,
      0,
    );
    const fim = new Date(
      diaAlvo.getFullYear(),
      diaAlvo.getMonth(),
      diaAlvo.getDate(),
      23,
      59,
      59,
      999,
    );
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
  return (
    Math.round((alerta.registro.horimetro_previsto - alerta.equipamento.horimetro_atual) * 10) / 10
  );
}

export interface LinhaManutencaoPreditiva {
  equipamento: Equipamento;
  plano: PlanoManutencao;
  registro: RegistroPrevisto;
  status: StatusManutencao;
  restantes: number; // horas até a marca prevista (negativo = vencida)
  percentualCiclo: number; // 0..100 do intervalo do plano já consumido
}

// Todos os planos ativos com registro previsto, do mais urgente ao mais folgado
// — inclui os "em dia" (o UI kit mostra a barra de saúde da frota inteira, não
// só dos alertas). Reaproveita planosParaEquipamento/statusPlano (PRD-010).
export function manutencaoPreditiva(
  equipamentos: Equipamento[],
  planos: PlanoManutencao[],
  registros: RegistroManutencao[],
  limite?: number,
): LinhaManutencaoPreditiva[] {
  const linhas: LinhaManutencaoPreditiva[] = [];
  for (const equipamento of equipamentos.filter((e) => e.ativo)) {
    for (const plano of planosParaEquipamento(equipamento, planos)) {
      const resultado = statusPlano(plano, equipamento, registros);
      if (!resultado) continue;
      const restantes =
        Math.round((resultado.registro.horimetro_previsto - equipamento.horimetro_atual) * 10) / 10;
      linhas.push({
        equipamento,
        plano,
        registro: resultado.registro,
        status: resultado.status,
        restantes,
        percentualCiclo: percentualCiclo(restantes, plano.intervalo_horas),
      });
    }
  }
  linhas.sort((a, b) => a.restantes - b.restantes);
  return limite === undefined ? linhas : linhas.slice(0, limite);
}

// Quanto do intervalo do plano já foi consumido, em 0..100. Vencida satura em
// 100; intervalo inválido (<= 0) não tem barra significativa, devolve 100.
export function percentualCiclo(restantes: number, intervaloHoras: number): number {
  if (intervaloHoras <= 0) return 100;
  const consumido = ((intervaloHoras - restantes) / intervaloHoras) * 100;
  return Math.max(0, Math.min(100, Math.round(consumido)));
}

export interface FaixasContaCliente {
  cliente_id: string;
  cliente_nome: string;
  vencida: number;
  ate15: number; // a vencer em 0–15 dias
  ate30: number; // a vencer em 16–30 dias
  acima30: number; // a vencer em mais de 30 dias
  total: number;
}

// Dias corridos entre duas datas "YYYY-MM-DD" (negativo = já passou).
// Usa Date.UTC para não depender do fuso local.
function diasEntre(deISO: string, ateISO: string): number {
  const [a1, m1, d1] = deISO.split("-").map(Number);
  const [a2, m2, d2] = ateISO.split("-").map(Number);
  const de = Date.UTC(a1, m1 - 1, d1);
  const ate = Date.UTC(a2, m2 - 1, d2);
  return Math.round((ate - de) / DIA_MS);
}

// Contas em aberto agregadas por cliente e por faixa de vencimento — as faixas
// do UI kit (vencida / 0–15 / 16–30) mais "acima de 30 dias", que o mock não
// prevê mas o dado real produz. Ordenado do maior saldo para o menor.
export function contasReceberPorClienteFaixas(
  contasReceber: ContaReceber[],
  clientes: Cliente[],
  agoraISO: string, // "YYYY-MM-DD"
  limite?: number,
): FaixasContaCliente[] {
  const porCliente = new Map<string, FaixasContaCliente>();
  for (const conta of contasReceber.filter((c) => c.status === "aberta")) {
    const nome = clientes.find((cl) => cl.id === conta.cliente_id)?.nome ?? "Cliente desconhecido";
    const atual = porCliente.get(conta.cliente_id) ?? {
      cliente_id: conta.cliente_id,
      cliente_nome: nome,
      vencida: 0,
      ate15: 0,
      ate30: 0,
      acima30: 0,
      total: 0,
    };
    const dias = diasEntre(agoraISO, conta.vencimento);
    if (dias < 0) atual.vencida = round2(atual.vencida + conta.valor);
    else if (dias <= 15) atual.ate15 = round2(atual.ate15 + conta.valor);
    else if (dias <= 30) atual.ate30 = round2(atual.ate30 + conta.valor);
    else atual.acima30 = round2(atual.acima30 + conta.valor);
    atual.total = round2(atual.total + conta.valor);
    porCliente.set(conta.cliente_id, atual);
  }
  const lista = Array.from(porCliente.values()).sort((a, b) => b.total - a.total);
  return limite === undefined ? lista : lista.slice(0, limite);
}
