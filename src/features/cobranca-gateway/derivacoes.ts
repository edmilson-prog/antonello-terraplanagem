import type { CobrancaGateway } from "@/shared/types";

export function cobrancaDaConta(
  contaReceberId: string,
  cobrancas: CobrancaGateway[],
): CobrancaGateway | null {
  return cobrancas.find((c) => c.conta_receber_id === contaReceberId) ?? null;
}

// Geradores mock — nunca chamam rede real; simulam o formato de retorno do
// gateway (linha digitável / PIX copia-e-cola) de forma determinística por id,
// só para exibição/QA nesta fase.
export function gerarLinhaDigitavelMock(cobrancaId: string): string {
  const digitos = cobrancaId.replace(/\D/g, "").padEnd(11, "0").slice(0, 11);
  return `34191.79001 01043.510047 91020.150008 1 ${digitos}00000`;
}

export function gerarPixCopiaColaMock(cobrancaId: string): string {
  return `00020126580014br.gov.bcb.pix0136${cobrancaId}5204000053039865802BR5913ANTONELLO TERR6009SAO PAULO62070503***6304MOCK`;
}
