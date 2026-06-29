// Utilidades de formatação para a Retaguarda (valores em BRL).

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const numero = new Intl.NumberFormat("pt-BR");

// BRL com 2 casas decimais (RNF-002 do PRD-005). Distinto de `brl` (0 casas, usado
// nos totais do faturamento mockado). Arquivo da retaguarda — nunca importar no operador.
export const brlExato = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(reais: number): string {
  return brlExato.format(reais);
}
