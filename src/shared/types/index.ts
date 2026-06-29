// Contratos compartilhados — espelham o schema futuro do banco (snake_case).
// Tipos definidos ANTES dos mocks; são o contrato que o backend vai implementar.

export type Perfil = "operador" | "recepcao" | "proprietario";

export type TipoEquipamento =
  | "escavadeira"
  | "carregadeira"
  | "caminhao_cacamba"
  | "trator_esteira"
  | "retroescavadeira"
  | "outro";

// status OPERACIONAL (onde a máquina está) — distinto de `ativo` (ciclo de vida)
export type EquipamentoStatus = "disponivel" | "em_uso" | "manutencao";

export interface Equipamento {
  id: string;
  nome: string;
  tipo: TipoEquipamento;
  capacidade: string; // texto livre ("18 toneladas", "2,5 m³")
  horimetro_atual: number;
  identificador: string | null; // patrimônio/placa (opcional)
  status: EquipamentoStatus; // operacional
  ativo: boolean; // soft-delete / cadastral
  created_at: string;
  updated_at: string;
}

export interface Operador {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string | null; // CPF/CNPJ (opcional nesta fase)
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessaoMock {
  perfil: Perfil;
  nome: string;
}

export interface FaturamentoMes {
  mes: string; // "2025-01"
  rotulo: string; // "Jan"
  horas_faturadas: number;
  valor: number;
}

export interface FaturamentoPorEquipamento {
  equipamento_id: string;
  equipamento_nome: string;
  horas: number;
  valor: number;
}

export interface FaturamentoPorCliente {
  cliente_id: string;
  cliente_nome: string;
  valor: number;
}

export type StatusApontamento = "em_andamento" | "finalizado";

export interface Apontamento {
  id: string;
  equipamento_id: string; // FK → Equipamento
  operador_id: string; // FK → Operador (quem apontou)
  os_id: string | null; // FK → OS (opcional nesta fase)
  horimetro_inicial: number; // horas, 1 casa decimal
  horimetro_final: number | null; // null enquanto em andamento
  horas_trabalhadas: number | null; // calculado: round1(final - inicial)
  foto_inicial_url: string | null; // evidência (mock nesta fase)
  foto_final_url: string | null;
  observacao: string | null;
  status: StatusApontamento;
  pendente_sync: boolean; // afford. de offline (só visual)
  iniciado_em: string; // ISO 8601
  finalizado_em: string | null;
  created_at: string;
  updated_at: string;
}

// Preços (PRD-005) — geridos só na retaguarda; jamais expostos ao operador.
// Vínculo do preço hora-máquina é DERIVADO: exatamente uma de equipamento_id /
// tipo_equipamento é não-nula (sem campo `vinculo` no contrato).
export interface PrecoHoraMaquina {
  id: string;
  equipamento_id: string | null; // preenchido p/ vínculo por equipamento específico
  tipo_equipamento: TipoEquipamento | null; // preenchido p/ vínculo por tipo/porte
  valor_hora_seca: number; // R$/h sem operador (reais, 2 casas)
  valor_hora_operada: number; // R$/h com operador
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrecoFundacao {
  id: string;
  diametro_broca_mm: number; // ex.: 300, 400, 500
  valor_metro: number; // R$/m
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrecoMobilizacao {
  id: string;
  descricao: string; // ex.: "Mobilização escavadeira até 50km"
  valor: number; // R$
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// OS colaborativa (PRD-003). A OS é contêiner: horas e status efetivo são DERIVADOS
// dos apontamentos vinculados (via Apontamento.os_id). Sem campos R$, equipamento,
// operador ou horímetro na OS. (Substitui o legado OrdemServicoOperador na T10.)
export type ModeloCobranca = "hora_maquina" | "por_metro";
export type StatusOS = "aberta" | "em_andamento" | "fechada";

export interface OrdemServico {
  id: string;
  numero: string; // "OS-2026-0042"
  cliente_id: string; // FK → Cliente
  obra_nome: string;
  endereco: string | null;
  modelo_cobranca: ModeloCobranca;
  status: StatusOS;
  responsavel_id: string | null; // FK → Operador
  observacao: string | null;
  metragem_executada: number | null; // por_metro
  diametro_broca_mm: number | null; // por_metro
  aberta_em: string; // ISO 8601
  fechada_em: string | null;
  pendente_sync: boolean;
  created_at: string;
  updated_at: string;
}

// Faturamento (PRD-004) — deriva da OS fechada + apontamentos + preços. Só retaguarda;
// NUNCA importado/renderizado em /app/*. "recebido" é estágio do pipeline gerido no PRD-007.
export type StatusFaturamento = "rascunho" | "faturado";
export type TipoItemFaturamento = "hora_maquina" | "por_metro" | "mobilizacao";

export interface FaturamentoItem {
  id: string;
  tipo: TipoItemFaturamento;
  descricao: string; // "Escavadeira 10t — 18 h operada"
  origem_id: string | null; // equipamento_id (hora) / preco_mobilizacao_id (mob.) / null
  hora_tipo: "seca" | "operada" | null; // só hora_maquina
  quantidade: number; // horas, metros ou 1
  valor_unitario: number | null; // null = SEM PREÇO ativo (pendência)
  valor_total: number; // round2(quantidade × valor_unitario); 0 se sem preço
  sem_preco: boolean;
}

export interface Faturamento {
  id: string;
  numero: string; // "FAT-2026-0042"
  os_id: string; // FK → OrdemServico
  cliente_id: string; // FK → Cliente
  modelo_cobranca: ModeloCobranca; // herdado da OS
  itens: FaturamentoItem[];
  desconto: number; // R$ subtraído do subtotal (≥ 0)
  valor_total: number; // soma(itens) − desconto
  observacao: string | null;
  status: StatusFaturamento;
  gerado_em: string; // ISO — rascunho criado
  faturado_em: string | null; // ISO — confirmado
  created_at: string;
  updated_at: string;
}

// Orçamentos (PRD-006) — pré-venda; montados a partir das tabelas de preço. Só retaguarda;
// NUNCA importado/renderizado em /app/*. Item espelha FaturamentoItem (quantidade_estimada).
export type StatusOrcamento = "rascunho" | "enviado" | "aprovado" | "recusado";
export type TipoItemOrcamento = "hora_maquina" | "por_metro" | "mobilizacao";

export interface OrcamentoItem {
  id: string;
  tipo: TipoItemOrcamento;
  descricao: string; // "Escavadeira 10t — 40 h operada (estimado)"
  origem_id: string | null; // equipamento_id (hora) / preco_fundacao_id (metro) / preco_mobilizacao_id (mob.)
  hora_tipo: "seca" | "operada" | null; // só hora_maquina
  quantidade_estimada: number; // horas, metros ou 1
  valor_unitario: number | null; // null = SEM PREÇO ativo (pendência)
  valor_total: number; // round2(quantidade_estimada × valor_unitario); 0 se sem preço
  sem_preco: boolean;
}

export interface Orcamento {
  id: string;
  numero: string; // "ORC-2026-0001"
  cliente_id: string; // FK → Cliente (PRD-001)
  descricao_obra: string;
  itens: OrcamentoItem[];
  desconto: number; // R$ subtraído do subtotal (≥ 0)
  valor_total: number; // soma(itens) − desconto
  validade: string | null; // "YYYY-MM-DD" (limite); default hoje+30d na criação
  observacao: string | null;
  status: StatusOrcamento;
  os_id: string | null; // preenchido quando vira OS (PRD-003)
  enviado_em: string | null; // ISO — quando marcado enviado
  decidido_em: string | null; // ISO — quando aprovado/recusado
  created_at: string;
  updated_at: string;
}
