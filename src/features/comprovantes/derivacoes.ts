import { apontamentosDaOS, totalHorasOS, totalMetragemOS } from "@/features/ordem-servico/derivacoes";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

function formatDataCurta(iso: string): string {
  return iso.slice(0, 10).split("-").reverse().join("/");
}

// Snapshot textual do serviço executado numa OS — usado como resumo_servico
// do Comprovante. Congelado no momento da geração (o chamador persiste o
// retorno; esta função não é reexecutada depois). Nunca inclui preço/valor
// (RF-008): só obra, período, equipamentos e horas ou metragem/diâmetro.
export function montarResumoServico(
  os: OrdemServico,
  apontamentos: Apontamento[],
  equipamentos: Equipamento[],
): string {
  const daOS = apontamentosDaOS(os.id, apontamentos);
  const idsEquipamentos = [...new Set(daOS.map((a) => a.equipamento_id))];
  const nomesEquipamentos = idsEquipamentos
    .map((id) => equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento")
    .join(", ");

  const linhas = [
    `Obra: ${os.obra_nome}`,
    `Período: ${formatDataCurta(os.aberta_em)} a ${os.fechada_em ? formatDataCurta(os.fechada_em) : "—"}`,
    `Equipamentos: ${nomesEquipamentos || "—"}`,
  ];

  if (os.modelo_cobranca === "hora_maquina") {
    linhas.push(`Total de horas: ${totalHorasOS(os.id, apontamentos)}h`);
  } else {
    linhas.push(
      `Metragem executada: ${totalMetragemOS(os.id, apontamentos)} m (broca ${os.diametro_broca_mm ?? "—"} mm)`,
    );
  }

  return linhas.join("\n");
}
