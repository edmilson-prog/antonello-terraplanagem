// Geração e download de CSV em convenção pt-BR — ponto e vírgula como
// separador e vírgula decimal — porque o Excel em português lê assim; com
// vírgula separadora ele joga a linha inteira numa célula só.
//
// Nasceu no Custo da Hora (Onda 14) e virou compartilhado quando a
// Rentabilidade (Onda 15) precisou do mesmo export.

/** Byte order mark, sem o qual "Escavadeira" chega no Excel como "EscavaÃ§...". */
const BOM = String.fromCharCode(0xfeff);

/** Número no formato que o Excel pt-BR entende como número, sem separador de milhar. */
export function numeroCsv(valor: number | null, casas = 2): string {
  if (valor === null) return "";
  return valor.toFixed(casas).replace(".", ",");
}

/** Escapa aspas e envolve o campo quando ele contém separador, aspas ou quebra. */
export function campoCsv(texto: string): string {
  if (!/[;"\n\r]/.test(texto)) return texto;
  return `"${texto.replace(/"/g, '""')}"`;
}

export function montarCsv(cabecalho: readonly string[], linhas: string[][]): string {
  return [cabecalho.join(";"), ...linhas.map((l) => l.join(";"))].join("\r\n");
}

export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob([BOM + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
