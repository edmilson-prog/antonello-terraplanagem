// Helpers puros do input monetário (BRL). O valor canônico é sempre em REAIS
// (number, 2 casas). A entrada interpreta os dígitos digitados como centavos,
// montando o valor da direita para a esquerda (padrão de campo monetário).

const valorFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function somenteDigitos(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function parseValorInput(raw: string): number {
  const digitos = somenteDigitos(raw);
  if (!digitos) return 0;
  return Number(digitos) / 100;
}

export function formatValorInput(reais: number): string {
  return valorFormatter.format(reais);
}
