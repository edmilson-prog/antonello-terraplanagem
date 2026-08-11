// Formatadores de exibição compartilhados. Nada de valor financeiro aqui
// (cadastros não exibem preço/valor).

const horimetroFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatHorimetro(horas: number): string {
  return `${horimetroFormatter.format(horas)} h`;
}

export function formatDocumento(doc: string | null): string {
  if (!doc) return "—";
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

export function formatTelefone(tel: string | null): string {
  if (!tel) return "—";
  const d = tel.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel;
}

// Iniciais para avatar: primeira letra do primeiro nome + primeira do último.
// Nome com uma só palavra devolve uma letra; vazio devolve "?".
export function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "?";
}

export function formatDataHora(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Para colunas `date` (sem hora, ex.: legado_primeira_os) — evita o bug de
// fuso horário de `new Date("YYYY-MM-DD")` (interpretada como UTC meia-noite,
// pode "voltar um dia" em fusos negativos como o do Brasil).
export function formatData(data: string | null): string {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}
