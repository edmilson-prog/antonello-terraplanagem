import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { brl, numero } from "@/features/retaguarda/format";
import type {
  FaturamentoMes,
  FaturamentoPorCliente,
  FaturamentoPorEquipamento,
} from "@/shared/types";

/*
 * O relatório recebe os dados já recortados pela tela, em vez de importar as
 * constantes de `src/mocks/faturamento.ts` como antes. Além de o conteúdo ser
 * inventado, o PDF ignorava o período escolhido na tela: o cabeçalho dizia
 * "últimos 6 meses" enquanto o usuário olhava para "últimos 3".
 */
export interface DadosRelatorioFaturamento {
  meses: FaturamentoMes[];
  equipamentos: FaturamentoPorEquipamento[];
  clientes: FaturamentoPorCliente[];
  periodo: { de: string; ate: string };
}

const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/** "2026-03" -> "Mar/26". */
function mesPorExtenso(chave: string): string {
  const [ano, mes] = chave.split("-");
  return `${MESES_CURTOS[Number(mes) - 1] ?? mes}/${ano.slice(2)}`;
}

const AMARELO: [number, number, number] = [255, 179, 0];
const ASFALTO: [number, number, number] = [22, 20, 15];
const CONCRETO: [number, number, number] = [244, 239, 230];
const TINTA: [number, number, number] = [27, 25, 18];
const TINTA_SUAVE: [number, number, number] = [90, 85, 74];

function faixaCanteiro(doc: jsPDF, y: number, altura = 6) {
  const largura = doc.internal.pageSize.getWidth();
  doc.setFillColor(...AMARELO);
  doc.rect(0, y, largura, altura, "F");
  doc.setFillColor(...ASFALTO);
  const passo = 14;
  for (let x = 0; x < largura; x += passo) {
    doc.rect(x, y, passo / 2, altura, "F");
  }
}

export function exportarFaturamentoPdf({
  meses,
  equipamentos,
  clientes,
  periodo,
}: DadosRelatorioFaturamento) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margemX = 40;
  const largura = doc.internal.pageSize.getWidth();

  // Cabeçalho com faixa de canteiro
  faixaCanteiro(doc, 0);

  doc.setFillColor(...ASFALTO);
  doc.rect(0, 6, largura, 70, "F");

  doc.setTextColor(...CONCRETO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Antonello Terraplanagem", margemX, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Relatório de Faturamento", margemX, 56);

  const agora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(9);
  doc.text(`Gerado em ${agora}`, largura - margemX, 56, { align: "right" });

  faixaCanteiro(doc, 76);

  let y = 110;
  doc.setTextColor(...TINTA);

  // Totais
  const totalValor = meses.reduce((s, m) => s + m.valor, 0);
  const totalHoras = meses.reduce((s, m) => s + m.horas_faturadas, 0);
  // Sem hora faturada não há ticket por hora: 0/0 imprimiria "R$ NaN".
  const ticketMedio = totalHoras > 0 ? totalValor / totalHoras : 0;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  // O recorte vem da tela, não dos meses presentes: se o usuário pediu Jan–Jun
  // e só Mar teve nota, o cabeçalho tem que dizer Jan–Jun. Rotular pelo
  // primeiro e último mês COM faturamento esconderia justamente os meses vazios.
  const rotuloPeriodo = periodo.de
    ? `Resumo do período (${mesPorExtenso(periodo.de)} a ${mesPorExtenso(periodo.ate)})`
    : "Resumo do período (sem faturamento)";
  doc.text(rotuloPeriodo, margemX, y);
  y += 16;

  const cards = [
    { rotulo: "Faturamento total", valor: brl.format(totalValor) },
    { rotulo: "Horas faturadas", valor: `${numero.format(totalHoras)} h` },
    { rotulo: "Ticket médio / hora", valor: brl.format(ticketMedio) },
  ];
  const cardLarg = (largura - margemX * 2 - 20) / 3;
  cards.forEach((c, i) => {
    const x = margemX + i * (cardLarg + 10);
    doc.setDrawColor(214, 205, 188);
    doc.setFillColor(...CONCRETO);
    doc.roundedRect(x, y, cardLarg, 56, 6, 6, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TINTA_SUAVE);
    doc.text(c.rotulo.toUpperCase(), x + 12, y + 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...TINTA);
    doc.text(c.valor, x + 12, y + 40);
  });
  y += 76;

  // Tabela: faturamento mensal
  autoTable(doc, {
    startY: y,
    head: [["Mês", "Horas faturadas", "Valor (R$)"]],
    body: meses.map((m) => [m.rotulo, numero.format(m.horas_faturadas), brl.format(m.valor)]),
    foot: [["Total", numero.format(totalHoras), brl.format(totalValor)]],
    theme: "grid",
    headStyles: { fillColor: ASFALTO, textColor: CONCRETO, fontStyle: "bold" },
    footStyles: { fillColor: AMARELO, textColor: ASFALTO, fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
    margin: { left: margemX, right: margemX },
  });

  // Tabela: por equipamento
  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24,
    head: [["Equipamento", "Horas", "Valor (R$)"]],
    body: equipamentos.map((e) => [
      e.equipamento_nome,
      numero.format(e.horas),
      brl.format(e.valor),
    ]),
    theme: "grid",
    headStyles: { fillColor: ASFALTO, textColor: CONCRETO, fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
    margin: { left: margemX, right: margemX },
    didDrawPage: (data) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...TINTA);
      doc.text("Faturamento por equipamento", margemX, data.settings.startY - 8);
    },
  });

  // Tabela: por cliente
  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24,
    head: [["Cliente", "Valor (R$)"]],
    body: clientes.map((c) => [c.cliente_nome, brl.format(c.valor)]),
    theme: "grid",
    headStyles: { fillColor: ASFALTO, textColor: CONCRETO, fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
    margin: { left: margemX, right: margemX },
    didDrawPage: (data) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...TINTA);
      doc.text("Faturamento por cliente", margemX, data.settings.startY - 8);
    },
  });

  // Rodapé em todas as páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);
    const alt = doc.internal.pageSize.getHeight();
    faixaCanteiro(doc, alt - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TINTA_SUAVE);
    doc.text(
      `Antonello Terraplanagem · Relatório interno · Página ${p} de ${totalPaginas}`,
      largura / 2,
      alt - 18,
      { align: "center" },
    );
  }

  doc.save(`faturamento-antonello-${new Date().toISOString().slice(0, 10)}.pdf`);
}
