const TELEFONE_DIGITOS = "5555999242409"; // 55 (Brasil) + 55 (DDD) + 999242409
const CNPJ = "36.508.280/0001-90";
const CIDADE_UF = "Frederico Westphalen — RS";
const TELEFONE_EXIBICAO = "(55) 99924-2409";

function whatsappHref(mensagem: string): string {
  return `https://wa.me/${TELEFONE_DIGITOS}?text=${encodeURIComponent(mensagem)}`;
}

export const contato = {
  cidadeUf: CIDADE_UF,
  telefoneExibicao: TELEFONE_EXIBICAO,
  cnpj: CNPJ,
  whatsappOrcamento: whatsappHref(
    "Olá! Gostaria de pedir um orçamento de terraplanagem com a Antonello Terraplanagem.",
  ),
  whatsappContato: whatsappHref("Olá! Gostaria de falar com a Antonello Terraplanagem."),
};
