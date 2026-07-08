// B7 — consulta em linguagem natural. Cada pergunta é resolvida por uma
// regra de palavras-chave que chama uma derivação/store REAL já existente —
// nunca inventa um número (RF-002, RNF-004). Sem correspondência, cai no
// fallback "ainda não sei responder" com sugestões (edge case do PRD).
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { alertasManutencao } from "@/features/manutencao/derivacoes";
import { indicadoresPorEquipamento } from "@/features/diesel/derivacoes";
import { contaVencida, resumoCaixa } from "@/features/financeiro/derivacoes";
import { rankingEquipamentosPorMargem, serieMensalFaturamento } from "@/features/gerencial/derivacoes";
import { periodoTerminandoEm } from "@/features/gerencial/periodo-gerencial";
import { dataReferenciaOperacional } from "@/features/dashboard-operacional/derivacoes";
import { mesReferencia, rotuloMes } from "@/shared/lib/periodo-mensal";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { comDelay } from "@/features/ia/delay";
import type { RespostaAssistente, RotaAssistenteIA } from "@/features/ia/types";

interface PerguntaExemplo {
  pergunta: string;
  fonte_rota: RotaAssistenteIA;
  fonte_rotulo: string;
}

export const PERGUNTAS_EXEMPLO: PerguntaExemplo[] = [
  { pergunta: "Quantas OS estão abertas?", fonte_rota: "/admin/ordens", fonte_rotulo: "Ordens de Serviço" },
  { pergunta: "Quantas horas a Caterpillar 320D já trabalhou?", fonte_rota: "/admin/equipamentos", fonte_rotulo: "Equipamentos" },
  { pergunta: "Qual equipamento é mais rentável?", fonte_rota: "/admin/rentabilidade", fonte_rotulo: "Rentabilidade" },
  { pergunta: "Qual cliente está com maior atraso?", fonte_rota: "/admin/financeiro", fonte_rotulo: "Financeiro" },
  { pergunta: "Quanto foi faturado esse mês?", fonte_rota: "/admin/gerencial", fonte_rotulo: "Painel Gerencial" },
  { pergunta: "Quantas manutenções estão vencidas?", fonte_rota: "/admin/manutencao", fonte_rotulo: "Manutenção" },
  { pergunta: "Qual equipamento consome mais diesel?", fonte_rota: "/admin/diesel", fonte_rotulo: "Diesel" },
  { pergunta: "Quantas horas a frota trabalhou esse mês?", fonte_rota: "/admin/gerencial", fonte_rotulo: "Painel Gerencial" },
  { pergunta: "Qual o saldo previsto de caixa?", fonte_rota: "/admin/financeiro", fonte_rotulo: "Financeiro" },
];

function normalizar(texto: string): string {
  return texto.trim().toLowerCase();
}

function referenciaAtual() {
  return dataReferenciaOperacional(
    ordensStore.listar(),
    apontamentosStore.listar(),
    faturamentosStore.listar(),
    contasReceberStore.listar(),
  );
}

// Nomes de equipamento costumam ter prefixo de categoria que a pergunta
// não repete ("Escavadeira Hidráulica Caterpillar 320D" vs. pergunta citando
// só "Caterpillar 320D") — por isso testamos sufixos do nome, do mais
// específico (nome inteiro) ao mais curto, em vez de exigir match exato.
function encontraEquipamentoNaPergunta(pergunta: string) {
  return equipamentosStore.getAll().find((e) => {
    const partes = e.nome.toLowerCase().split(" ");
    return partes.some((_, i) => {
      const sufixo = partes.slice(i).join(" ");
      return sufixo.length >= 4 && pergunta.includes(sufixo);
    });
  });
}

function respostaEquipamentoHoras(pergunta: string): RespostaAssistente | null {
  const encontrado = encontraEquipamentoNaPergunta(pergunta);
  if (!encontrado) return null;
  const total = apontamentosStore
    .listar()
    .filter((a) => a.equipamento_id === encontrado.id && a.status === "finalizado" && a.horas_trabalhadas != null)
    .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
  return {
    resposta: `${encontrado.nome} já trabalhou ${formatHorimetro(Math.round(total * 10) / 10)} no total (apontamentos finalizados).`,
    fonte_rota: "/admin/equipamentos",
    fonte_rotulo: "Equipamentos",
  };
}

function respostaOsAbertas(pergunta: string): RespostaAssistente | null {
  const mencionaOS = /\bos\b/.test(pergunta) || pergunta.includes("ordens");
  if (!mencionaOS || !pergunta.includes("abert")) return null;
  const ordens = ordensStore.listar();
  const apontamentos = apontamentosStore.listar();
  const abertas = ordens.filter((o) => statusEfetivoOS(o, apontamentos) !== "fechada").length;
  return {
    resposta: `Existem ${abertas} ordem(ns) de serviço em aberto no momento.`,
    fonte_rota: "/admin/ordens",
    fonte_rotulo: "Ordens de Serviço",
  };
}

function respostaMaisRentavel(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("rentáv") && !pergunta.includes("rentav") && !pergunta.includes("lucrativ")) {
    return null;
  }
  const periodo = periodoTerminandoEm("mes", mesReferencia(referenciaAtual()));
  const ranking = rankingEquipamentosPorMargem(
    equipamentosStore.getAll(),
    periodo,
    componentesCustoStore.getAll(),
    abastecimentosStore.listar(),
    registrosManutencaoStore.listar(),
    apontamentosStore.listar(),
    precoHoraMaquinaStore.getAll(),
    faturamentosStore.listar(),
  );
  const top = ranking[0];
  if (!top) {
    return {
      resposta: "Ainda não há dados de rentabilidade suficientes neste período.",
      fonte_rota: "/admin/rentabilidade",
      fonte_rotulo: "Rentabilidade",
    };
  }
  const nome = equipamentosStore.getById(top.equipamento_id)?.nome ?? "Um equipamento";
  return {
    resposta: `${nome} é o mais rentável no período, com margem de ${formatBRL(top.margem)}.`,
    fonte_rota: "/admin/rentabilidade",
    fonte_rotulo: "Rentabilidade",
  };
}

function respostaClienteMaiorAtraso(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("atraso") && !pergunta.includes("inadimpl")) return null;
  const hojeISO = new Date().toISOString().slice(0, 10);
  const vencidas = contasReceberStore.listar().filter((c) => contaVencida(c, hojeISO));
  if (vencidas.length === 0) {
    return { resposta: "Não há contas vencidas no momento.", fonte_rota: "/admin/financeiro", fonte_rotulo: "Financeiro" };
  }
  const maisAntiga = vencidas.reduce((a, b) => (b.vencimento < a.vencimento ? b : a));
  const cliente = clientesStore.getById(maisAntiga.cliente_id);
  return {
    resposta: `${cliente?.nome ?? "Um cliente"} está com a conta mais atrasada, vencida em ${maisAntiga.vencimento.split("-").reverse().join("/")}.`,
    fonte_rota: "/admin/financeiro",
    fonte_rotulo: "Financeiro",
  };
}

function respostaFaturadoMes(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("fatura")) return null;
  const mes = mesReferencia(referenciaAtual());
  const [ponto] = serieMensalFaturamento([mes], faturamentosStore.listar());
  return {
    resposta: `O faturamento de ${ponto.rotulo} foi ${formatBRL(ponto.faturado)}.`,
    fonte_rota: "/admin/gerencial",
    fonte_rotulo: "Painel Gerencial",
  };
}

function respostaManutencoesVencidas(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("manuten")) return null;
  const alertas = alertasManutencao(equipamentosStore.getAll(), planosManutencaoStore.getAll(), registrosManutencaoStore.listar());
  const vencidas = alertas.filter((a) => a.status === "vencida").length;
  return {
    resposta: `${vencidas} manutenção(ões) está(ão) vencida(s) no momento.`,
    fonte_rota: "/admin/manutencao",
    fonte_rotulo: "Manutenção",
  };
}

function respostaMaisConsomeDiesel(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("diesel") && !pergunta.includes("combust")) return null;
  const comDado = indicadoresPorEquipamento(equipamentosStore.getAll(), abastecimentosStore.listar(), apontamentosStore.listar()).filter(
    (i) => i.consumo_medio_l_h != null,
  );
  if (comDado.length === 0) {
    return { resposta: "Ainda não há dados de consumo suficientes para responder isso.", fonte_rota: "/admin/diesel", fonte_rotulo: "Diesel" };
  }
  const maior = comDado.reduce((a, b) => ((b.consumo_medio_l_h as number) > (a.consumo_medio_l_h as number) ? b : a));
  return {
    resposta: `${maior.equipamento.nome} é o que mais consome diesel, com ${maior.consumo_medio_l_h} l/h em média.`,
    fonte_rota: "/admin/diesel",
    fonte_rotulo: "Diesel",
  };
}

function respostaHorasFrotaMes(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("frota") || !pergunta.includes("hora")) return null;
  const mes = mesReferencia(referenciaAtual());
  const total = apontamentosStore
    .listar()
    .filter((a) => a.status === "finalizado" && a.horas_trabalhadas != null && (a.finalizado_em ?? "").slice(0, 7) === mes)
    .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
  return {
    resposta: `A frota trabalhou ${formatHorimetro(Math.round(total * 10) / 10)} em ${rotuloMes(mes)}.`,
    fonte_rota: "/admin/gerencial",
    fonte_rotulo: "Painel Gerencial",
  };
}

function respostaSaldoCaixa(pergunta: string): RespostaAssistente | null {
  if (!pergunta.includes("caixa")) return null;
  const { saldoPrevisto } = resumoCaixa(contasReceberStore.listar(), contasPagarStore.listar());
  return {
    resposta: `O saldo de caixa previsto (a receber − a pagar, contas em aberto) é ${formatBRL(saldoPrevisto)}.`,
    fonte_rota: "/admin/financeiro",
    fonte_rotulo: "Financeiro",
  };
}

const HANDLERS: ((pergunta: string) => RespostaAssistente | null)[] = [
  respostaEquipamentoHoras,
  respostaOsAbertas,
  respostaMaisRentavel,
  respostaClienteMaiorAtraso,
  respostaFaturadoMes,
  respostaManutencoesVencidas,
  respostaMaisConsomeDiesel,
  respostaHorasFrotaMes,
  respostaSaldoCaixa,
];

export async function responderPergunta(pergunta: string): Promise<RespostaAssistente> {
  const normalizada = normalizar(pergunta);
  for (const handler of HANDLERS) {
    const resultado = handler(normalizada);
    if (resultado) return comDelay(resultado, 1000);
  }
  return comDelay(
    {
      resposta:
        "Ainda não sei responder isso. Tente perguntar sobre OS abertas, horas de um equipamento, rentabilidade, atraso de clientes, faturamento, manutenção, consumo de diesel ou saldo de caixa.",
    },
    1000,
  );
}
