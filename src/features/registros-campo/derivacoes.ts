import {
  CLIMA_LABEL,
  MATERIAL_VIAGEM,
  MOTIVO_PARALISACAO,
  PROBLEMA_MANUTENCAO,
  TIPO_TRANSPORTE,
  type RegistroCampo,
  type TipoRegistroCampo,
} from "./tipos";

/* Resumo de uma linha para a fila de sincronização e para as listas de
 * "registros anteriores" de cada tela. */
export function resumoRegistro(registro: RegistroCampo): string {
  switch (registro.tipo) {
    case "checklist":
      return registro.dados.nao_conformes > 0
        ? `${registro.dados.nao_conformes} ${registro.dados.nao_conformes === 1 ? "item não conforme" : "itens não conformes"}`
        : `${registro.dados.itens.length} itens conformes`;
    case "diario_obra":
      return `${CLIMA_LABEL[registro.dados.clima_manha]} · ${CLIMA_LABEL[registro.dados.clima_tarde]} · ${registro.dados.equipe} ${registro.dados.equipe === 1 ? "pessoa" : "pessoas"}`;
    case "paralisacao":
      return `${MOTIVO_PARALISACAO[registro.dados.motivo].label} · ${formatarHoras(registro.dados.duracao_horas)} h`;
    case "viagens":
      return `${registro.dados.viagens} ${registro.dados.viagens === 1 ? "viagem" : "viagens"} · ${MATERIAL_VIAGEM[registro.dados.material]}`;
    case "mobilizacao":
      return `${TIPO_TRANSPORTE[registro.dados.tipo]} · ${formatarHoras(registro.dados.km)} km`;
    case "solicitacao_manutencao":
      return `${PROBLEMA_MANUTENCAO[registro.dados.problema].label} · ${registro.dados.urgencia === "maquina_parada" ? "máquina parada" : "pode aguardar"}`;
    case "medicao_assinada":
      return `${registro.dados.responsavel} · ${formatarHoras(registro.dados.horas_periodo)} h no período`;
    case "ciencia_seguranca":
      return registro.dados.titulo;
  }
}

function formatarHoras(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function chaveDiaLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function registrosDoTipo(
  lista: RegistroCampo[],
  tipo: TipoRegistroCampo,
  osId?: string | null,
): RegistroCampo[] {
  return lista.filter((r) => r.tipo === tipo && (osId === undefined || r.os_id === osId));
}

export function registroDeHoje(
  lista: RegistroCampo[],
  tipo: TipoRegistroCampo,
  osId: string,
  hoje: Date = new Date(),
): RegistroCampo | undefined {
  const dia = chaveDiaLocal(hoje);
  return lista.find(
    (r) => r.tipo === tipo && r.os_id === osId && chaveDiaLocal(new Date(r.registrado_em)) === dia,
  );
}

/* Ids de alerta de segurança que o operador já confirmou. */
export function cienciasConfirmadas(lista: RegistroCampo[]): Set<string> {
  const ids = new Set<string>();
  for (const r of lista) {
    if (r.tipo === "ciencia_seguranca") ids.add(r.dados.alerta_id);
  }
  return ids;
}

/* Viagens já contadas hoje nesta OS — o contador do kit acumula no dia. */
export function viagensDeHoje(
  lista: RegistroCampo[],
  osId: string,
  hoje: Date = new Date(),
): number {
  const dia = chaveDiaLocal(hoje);
  return lista.reduce((total, r) => {
    if (r.tipo !== "viagens" || r.os_id !== osId) return total;
    if (chaveDiaLocal(new Date(r.registrado_em)) !== dia) return total;
    return total + r.dados.viagens;
  }, 0);
}
