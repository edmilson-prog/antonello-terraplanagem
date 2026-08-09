// Cabeçalho da aba "Hoje" do App de Campo: "Bom dia, Adelar".

export function saudacaoPorHora(hora: number): string {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function primeiroNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes[0] ?? "";
}
