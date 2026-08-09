// Formatação curta usada pelos cards do dashboard ("desde 01/07", "vence 20/07").
// Aceita tanto ISO 8601 completo quanto data pura "YYYY-MM-DD" — esta última é
// fatiada como texto para não cair no bug de fuso de `new Date("YYYY-MM-DD")`.
export function formatDiaMes(valor: string | null | undefined): string {
  if (!valor) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [, mes, dia] = valor.split("-");
    return `${dia}/${mes}`;
  }
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// "hoje" quando o dia é o de `agora`; senão a data curta.
export function rotuloDia(dia: string | null, agora: Date): string {
  if (!dia) return "—";
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  return dia === hoje ? "hoje" : formatDiaMes(dia);
}
