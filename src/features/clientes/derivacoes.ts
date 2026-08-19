import { formatBRL } from "@/features/retaguarda/format";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { formatData, formatHorimetro } from "@/shared/lib/format";
import type {
  Apontamento,
  Cliente,
  ContaReceber,
  Faturamento,
  FormaRecebimento,
  Orcamento,
  OrdemServico,
  StatusOS,
} from "@/shared/types";

/*
 * Painel do cliente (retaguarda) — derivado de dados reais.
 *
 * Substitui `cliente-showcase-data.ts`, que sorteava faturamento do ano,
 * horas e valor por OS, recebimentos com número de nota, nome fantasia,
 * segmento, endereço e contato responsável. O e-mail exibido era
 * "contato@exemplo.com.br" para toda a base.
 *
 * Junto com ele sai o `idMockDoCliente`: as OS, orçamentos e contas eram
 * filtradas pelo id MOCK do cliente ("cl-001"), tradução que deixou de casar
 * quando essas stores foram para o Supabase (Onda 21) e passaram a devolver
 * UUID. Na prática, a tela mostrava zero OS para todo cliente.
 */

const MESES_DA_SERIE = 8;

export interface KpiCliente {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[] | null;
  alerta?: boolean;
}

export interface KpisCliente {
  faturado: KpiCliente;
  saldoReceber: KpiCliente;
  osAtivas: KpiCliente;
  orcamentos: KpiCliente;
}

export interface LinhaOrdemCliente {
  id: string;
  numero: string;
  obraNome: string;
  status: StatusOS;
  horas: string;
  valor: string;
}

export interface RecebimentoCliente {
  id: string;
  titulo: string;
  quando: string;
  valor: string;
  icone: string;
}

export interface PainelCliente {
  kpis: KpisCliente;
  ordens: LinhaOrdemCliente[];
  recebimentos: RecebimentoCliente[];
  /** Mais de uma OS ao longo do tempo — não é rótulo comercial arbitrário. */
  recorrente: boolean;
  ultimaOS: string | null;
  origemMigracao: string | null;
}

const ICONE_POR_FORMA: Record<FormaRecebimento, string> = {
  pix: "lucide:smartphone-nfc",
  transferencia: "lucide:arrow-left-right",
  boleto: "lucide:barcode",
  dinheiro: "lucide:banknote",
  cheque: "lucide:scroll-text",
  outro: "lucide:circle-dollar-sign",
};

const TITULO_POR_FORMA: Record<FormaRecebimento, string> = {
  pix: "PIX recebido",
  transferencia: "Transferência recebida",
  boleto: "Boleto compensado",
  dinheiro: "Recebido em dinheiro",
  cheque: "Cheque compensado",
  outro: "Recebimento",
};

function variacao(
  atual: number,
  anterior: number,
): { pct: number | null; dir: "up" | "down" | null } {
  if (anterior <= 0) return { pct: null, dir: null };
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  if (pct === 0) return { pct: null, dir: null };
  return { pct: Math.abs(pct), dir: pct > 0 ? "up" : "down" };
}

function spark(valores: number[]): number[] | null {
  const maximo = Math.max(...valores, 0);
  if (maximo <= 0) return null;
  return valores.map((v) => Math.round((v / maximo) * 100));
}

/** Índice 0..MESES_DA_SERIE-1 do mês, ou -1 fora da janela. */
function indiceDoMes(quando: Date, agora: Date): number {
  const meses =
    (agora.getFullYear() - quando.getFullYear()) * 12 + (agora.getMonth() - quando.getMonth());
  return meses >= 0 && meses < MESES_DA_SERIE ? MESES_DA_SERIE - 1 - meses : -1;
}

export interface EntradaPainelCliente {
  cliente: Cliente;
  ordens: OrdemServico[];
  apontamentos: Apontamento[];
  faturamentos: Faturamento[];
  orcamentos: Orcamento[];
  contasReceber: ContaReceber[];
  agora?: Date;
}

export function montarPainelCliente({
  cliente,
  ordens,
  apontamentos,
  faturamentos,
  orcamentos,
  contasReceber,
  agora = new Date(),
}: EntradaPainelCliente): PainelCliente {
  const minhasOrdens = ordens.filter((o) => o.cliente_id === cliente.id);
  const meusFaturamentos = faturamentos.filter((f) => f.cliente_id === cliente.id);
  const meusOrcamentos = orcamentos.filter((o) => o.cliente_id === cliente.id);
  const minhasContas = contasReceber.filter((c) => c.cliente_id === cliente.id);

  const idsDasOrdens = new Set(minhasOrdens.map((o) => o.id));

  // --- Faturado no ano corrente, contra o ano anterior.
  const anoAtual = agora.getFullYear();
  const confirmados = meusFaturamentos.filter((f) => f.status === "faturado" && f.faturado_em);
  const noAno = (ano: number) =>
    confirmados
      .filter((f) => new Date(f.faturado_em!).getFullYear() === ano)
      .reduce((s, f) => s + f.valor_total, 0);

  const faturadoAno = noAno(anoAtual);
  const faturadoAnterior = noAno(anoAtual - 1);
  const tendFaturado = variacao(faturadoAno, faturadoAnterior);

  const serieFaturado = new Array<number>(MESES_DA_SERIE).fill(0);
  for (const f of confirmados) {
    const i = indiceDoMes(new Date(f.faturado_em!), agora);
    if (i >= 0) serieFaturado[i] += f.valor_total;
  }

  // --- Saldo a receber.
  const hoje = agora.toISOString().slice(0, 10);
  const abertas = minhasContas.filter((c) => c.status === "aberta");
  const saldoReceber = abertas.reduce((s, c) => s + c.valor, 0);
  const vencidas = abertas.filter((c) => contaVencida(c, hoje)).length;

  // --- Séries de OS e orçamentos por mês.
  const serieOs = new Array<number>(MESES_DA_SERIE).fill(0);
  for (const o of minhasOrdens) {
    const i = indiceDoMes(new Date(o.aberta_em), agora);
    if (i >= 0) serieOs[i] += 1;
  }

  const serieOrcamentos = new Array<number>(MESES_DA_SERIE).fill(0);
  for (const o of meusOrcamentos) {
    const i = indiceDoMes(new Date(o.created_at), agora);
    if (i >= 0) serieOrcamentos[i] += 1;
  }

  const emAberto = meusOrcamentos.filter((o) => o.status !== "aprovado" && o.status !== "recusado");
  const valorEmAberto = emAberto.reduce((s, o) => s + o.valor_total, 0);

  const kpis: KpisCliente = {
    faturado: {
      rotulo: `Faturado em ${anoAtual}`,
      valor: formatBRL(faturadoAno),
      icone: "lucide:wallet",
      rodape:
        tendFaturado.pct === null
          ? faturadoAnterior > 0
            ? `igual a ${anoAtual - 1}`
            : "primeiro ano com faturamento"
          : `vs. ${anoAtual - 1}`,
      trendPct: tendFaturado.pct,
      trendDir: tendFaturado.dir,
      spark: spark(serieFaturado),
    },
    saldoReceber: {
      rotulo: "Saldo a receber",
      valor: formatBRL(saldoReceber),
      icone: vencidas > 0 ? "lucide:alert-circle" : "lucide:receipt",
      rodape: `${abertas.length} título(s) · ${vencidas} vencido(s)`,
      trendPct: null,
      trendDir: null,
      spark: null,
      alerta: vencidas > 0,
    },
    osAtivas: {
      rotulo: "OS ativas",
      valor: String(minhasOrdens.filter((o) => o.status !== "fechada").length),
      icone: "lucide:clipboard-list",
      rodape: `${minhasOrdens.length} no total`,
      trendPct: null,
      trendDir: null,
      spark: spark(serieOs),
    },
    orcamentos: {
      rotulo: "Orçamentos abertos",
      valor: String(emAberto.length),
      icone: "lucide:file-text",
      rodape:
        emAberto.length === 0
          ? "nenhuma proposta em aberto"
          : `${formatBRL(valorEmAberto)} em propostas`,
      trendPct: null,
      trendDir: null,
      spark: spark(serieOrcamentos),
    },
  };

  // --- Horas e valor por OS: horas dos apontamentos, valor do faturamento.
  const horasPorOs = new Map<string, number>();
  for (const ap of apontamentos) {
    if (!ap.os_id || !idsDasOrdens.has(ap.os_id)) continue;
    horasPorOs.set(ap.os_id, (horasPorOs.get(ap.os_id) ?? 0) + (ap.horas_trabalhadas ?? 0));
  }

  const valorPorOs = new Map<string, number>();
  for (const f of confirmados) {
    valorPorOs.set(f.os_id, (valorPorOs.get(f.os_id) ?? 0) + f.valor_total);
  }

  const linhasOrdem: LinhaOrdemCliente[] = [...minhasOrdens]
    .sort((a, b) => b.aberta_em.localeCompare(a.aberta_em))
    .map((o) => ({
      id: o.id,
      numero: o.numero,
      obraNome: o.obra_nome,
      status: o.status,
      horas: formatHorimetro(horasPorOs.get(o.id) ?? 0),
      // OS ainda não faturada não tem valor. Travessão, não "R$ 0,00" —
      // que leria como serviço prestado de graça.
      valor: valorPorOs.has(o.id) ? formatBRL(valorPorOs.get(o.id)!) : "—",
    }));

  // --- Recebimentos efetivados.
  const recebimentos: RecebimentoCliente[] = minhasContas
    .filter((c) => c.status === "liquidada" && c.recebido_em)
    .sort((a, b) => (b.recebido_em ?? "").localeCompare(a.recebido_em ?? ""))
    .slice(0, 6)
    .map((c) => {
      const forma = c.forma_recebimento;
      const numero = meusFaturamentos.find((f) => f.id === c.faturamento_id)?.numero;
      return {
        id: c.id,
        titulo: forma
          ? `${TITULO_POR_FORMA[forma]}${numero ? ` — ${numero}` : ""}`
          : `Recebido${numero ? ` — ${numero}` : ""}`,
        quando: formatData(c.recebido_em),
        valor: formatBRL(c.valor),
        icone: forma ? ICONE_POR_FORMA[forma] : "lucide:banknote",
      };
    });

  const maisRecente = [...minhasOrdens].sort((a, b) => b.aberta_em.localeCompare(a.aberta_em))[0];

  return {
    kpis,
    ordens: linhasOrdem,
    recebimentos,
    recorrente: minhasOrdens.length > 1,
    ultimaOS: maisRecente ? formatData(maisRecente.aberta_em.slice(0, 10)) : null,
    origemMigracao: cliente.legado_importado_em
      ? `Migração ${new Date(`${cliente.legado_importado_em}T12:00:00`)
          .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
          .replace(".", "")}`
      : null,
  };
}
