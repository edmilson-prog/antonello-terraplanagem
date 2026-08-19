import type { RegistroManutencao } from "@/shared/types";
import type { DadosSolicitacaoManutencao, RegistroCampoRecebido } from "./tipos";

/*
 * O que a retaguarda precisa saber sobre o que chegou do campo (Onda 22).
 *
 * Funções puras: recebem as listas já carregadas e devolvem o recorte. Nada
 * aqui é persistido — a "pendência" de uma solicitação é derivada da ausência
 * de ordem apontando para ela, não de um status que alguém precise lembrar de
 * atualizar.
 */

export type SolicitacaoCampo = RegistroCampoRecebido & {
  tipo: "solicitacao_manutencao";
  dados: DadosSolicitacaoManutencao;
};

export function ehSolicitacaoManutencao(
  registro: RegistroCampoRecebido,
): registro is SolicitacaoCampo {
  return registro.tipo === "solicitacao_manutencao";
}

/*
 * Chamados do campo que ainda não viraram ordem de manutenção.
 *
 * "Ainda não virou" = nenhuma ordem tem `origem_registro_campo_id` apontando
 * para ele. É o estado que interessa ao escritório: alguém pediu socorro e
 * ninguém abriu ordem.
 */
export function solicitacoesPendentes(
  registrosCampo: RegistroCampoRecebido[],
  registrosManutencao: RegistroManutencao[],
): SolicitacaoCampo[] {
  const atendidas = new Set(
    registrosManutencao
      .map((r) => r.origem_registro_campo_id)
      .filter((id): id is string => Boolean(id)),
  );

  return registrosCampo
    .filter(ehSolicitacaoManutencao)
    .filter((s) => !atendidas.has(s.id))
    .sort(porUrgenciaEData);
}

/*
 * Máquina parada primeiro — é o chamado que está custando hora ociosa agora.
 * Dentro da mesma urgência, o mais antigo no topo: quem espera há mais tempo
 * tem precedência sobre quem acabou de pedir.
 */
function porUrgenciaEData(a: SolicitacaoCampo, b: SolicitacaoCampo): number {
  const peso = (s: SolicitacaoCampo) => (s.dados.urgencia === "maquina_parada" ? 0 : 1);
  const diff = peso(a) - peso(b);
  if (diff !== 0) return diff;
  return a.registrado_em.localeCompare(b.registrado_em);
}

/** Registros de campo de uma ordem de serviço, do mais recente ao mais antigo. */
export function registrosDaOS(
  registrosCampo: RegistroCampoRecebido[],
  osId: string,
): RegistroCampoRecebido[] {
  return registrosCampo
    .filter((r) => r.os_id === osId)
    .sort((a, b) => b.registrado_em.localeCompare(a.registrado_em));
}

/*
 * Quantos chamados de máquina parada estão sem ordem. Vira selo de alerta na
 * tela de Manutenção: é o número que não pode ficar parado.
 */
export function paradasSemOrdem(solicitacoes: SolicitacaoCampo[]): number {
  return solicitacoes.filter((s) => s.dados.urgencia === "maquina_parada").length;
}
