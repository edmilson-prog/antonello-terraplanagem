// Utilidades de formatação para a Retaguarda (valores em BRL).

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const numero = new Intl.NumberFormat("pt-BR");
