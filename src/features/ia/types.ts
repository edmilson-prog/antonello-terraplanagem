// Contratos da camada de IA plugável (PRD-019). Toda saída de IA é uma
// SUGESTÃO editável — nenhum destes tipos representa um dado gravado sem
// confirmação humana (RNF-001).

export type EstadoIA = "ocioso" | "processando" | "resultado" | "erro";

export interface AnomaliaApontamento {
  apontamento_id: string;
  motivo: string;
  severidade: "atencao" | "alerta";
}

export interface InsightGerencial {
  texto: string;
  gerado_em: string; // ISO — não persistido, só exibido
}

// Fechado de propósito (não `string`): TanStack Router tipa `to` de
// `<Link>`/`navigate()` contra as rotas conhecidas do route tree — um
// `string` genérico aqui quebraria `tsc`. Task 8 só usa estas 7 rotas.
export type RotaAssistenteIA =
  | "/admin/ordens"
  | "/admin/equipamentos"
  | "/admin/rentabilidade"
  | "/admin/financeiro"
  | "/admin/gerencial"
  | "/admin/manutencao"
  | "/admin/diesel";

export interface RespostaAssistente {
  resposta: string;
  fonte_rota?: RotaAssistenteIA;
  fonte_rotulo?: string;
}

export interface SugestaoOrcamentoItem {
  tipo: "hora_maquina" | "por_metro";
  origem_id: string; // equipamento_id (hora_maquina) ou preco_fundacao_id (por_metro)
  quantidade_estimada: number;
  justificativa: string;
}

export interface SugestaoOrcamento {
  itens: SugestaoOrcamentoItem[];
  justificativa: string;
}

export interface PrevisaoCaixaPeriodo {
  dias: 30 | 60 | 90;
  valor_previsto: number;
}

export interface RiscoCliente {
  cliente_id: string;
  nivel: "baixo" | "medio" | "alto";
  motivo: string;
}

export interface SugestaoAlocacao {
  equipamento_id: string;
  justificativa: string;
}

export interface AlertaConsumoAnomalo {
  equipamento_id: string;
  consumo_medio_l_h: number;
  media_frota_l_h: number;
  percentual_acima: number;
}
