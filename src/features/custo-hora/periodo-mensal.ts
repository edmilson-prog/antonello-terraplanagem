// Mês de referência do painel de custo/hora — formato "YYYY-MM". Distinto do
// PeriodoDashboard (hoje/semana/mês relativo, PRD-015): custos fixos são
// mensais por natureza, então aqui o período é sempre um mês de competência.

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function mesReferencia(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function mesAnterior(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  return mesReferencia(new Date(ano, mes - 2, 1));
}

export function proximoMes(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  return mesReferencia(new Date(ano, mes, 1));
}

export function rotuloMes(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  return `${MESES[mes - 1]} ${ano}`;
}
