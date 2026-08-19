// Formatadores de exibição compartilhados. Nada de valor financeiro aqui
// (cadastros não exibem preço/valor).

const horimetroFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatHorimetro(horas: number): string {
  return `${horimetroFormatter.format(horas)} h`;
}

// Mesmo número, SEM a unidade — para onde a tela já escreve o "h" por conta
// própria (o card de KPI o renderiza em corpo menor, ao lado do número).
export function formatHorasNumero(horas: number): string {
  return horimetroFormatter.format(horas);
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

// "sexta, 11 de julho" — cabeçalho do App de Campo. `weekday: "long"` em
// pt-BR devolve "sexta-feira"; o kit usa a forma curta sem o sufixo.
export function formatDataExtensa(data: Date): string {
  const texto = data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.replace("-feira", "");
}

// "sex, 11/07" — usado nos agrupamentos por dia (histórico, escala, diário).
export function formatDiaCurto(data: Date): string {
  const semana = data
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .replace("-feira", "");
  const dia = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${semana}, ${dia}`;
}

// "Hoje", "Ontem" ou "qua, 09/07" — cabeçalho dos grupos por dia.
// `dia` e `referencia` são datas locais no formato "YYYY-MM-DD".
export function rotuloDiaRelativo(dia: string, referencia: Date = new Date()): string {
  const base = new Date(`${dia}T12:00:00`);
  if (Number.isNaN(base.getTime())) return dia;
  const hoje = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate(), 12);
  const diferenca = Math.round((hoje.getTime() - base.getTime()) / (24 * 60 * 60 * 1000));
  if (diferenca === 0) return "Hoje";
  if (diferenca === 1) return "Ontem";
  return formatDiaCurto(base);
}

export function formatHoraCurta(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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

// "Hoje, 07:32" · "Ontem, 18:04" · "12/08/2026, 07:32" — carimbo de acesso.
// Reaproveita `rotuloDiaRelativo`, mas parte de um timestamptz do banco (que
// vem em UTC) e o lê no fuso de quem está olhando: o dia relativo tem que ser
// o dia do escritório, não o do servidor.
export function formatAcessoRelativo(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const rotulo = rotuloDiaRelativo(local);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // Além de ontem, o dia relativo já não ajuda: mostra a data cheia.
  if (rotulo === "Hoje" || rotulo === "Ontem") return `${rotulo}, ${hora}`;
  return `${formatDataHora(iso)}`;
}
