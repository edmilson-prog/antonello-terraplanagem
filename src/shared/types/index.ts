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
  cpf: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string | null; // CPF/CNPJ (opcional nesta fase)
  telefone: string | null;
  tipo_pessoa?: "PF" | "PJ" | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Snapshot importado do ERP legado (FarolTI) — congelado no momento da
  // importação, não recalculado ao vivo pelo sistema. Opcionais/null para
  // clientes cadastrados diretamente na plataforma (sem histórico no legado).
  cli_codigo_legado?: number | null;
  legado_frequencia_os?: number | null;
  legado_ltv?: number | null;
  legado_ticket_medio?: number | null;
  legado_primeira_os?: string | null; // date (YYYY-MM-DD)
  legado_ultima_os?: string | null; // date (YYYY-MM-DD)
  legado_recencia_dias?: number | null;
  legado_curva_abc?: "A" | "B" | "C" | null;
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
  modalidade: "seca" | "operada" | null; // capturado ao iniciar; base da tarifa no PRD-004
  metros_executados: number | null; // capturado ao finalizar quando a OS é por_metro
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

// Financeiro (PRD-007) — contas a pagar e a receber. Só retaguarda;
// NUNCA importado/renderizado em /app/*.
export type StatusConta = "aberta" | "liquidada";
export type FormaRecebimento = "dinheiro" | "pix" | "transferencia" | "boleto" | "cheque" | "outro";
export type CategoriaDespesa = "diesel" | "manutencao" | "folha" | "fornecedor" | "outro";

export interface ContaReceber {
  id: string;
  faturamento_id: string; // FK → Faturamento (PRD-004)
  cliente_id: string; // FK → Cliente (PRD-001)
  valor: number; // espelha Faturamento.valor_total
  vencimento: string; // "YYYY-MM-DD" = faturado_em + 30 dias
  status: StatusConta;
  recebido_em: string | null; // "YYYY-MM-DD"
  forma_recebimento: FormaRecebimento | null;
  created_at: string;
  updated_at: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  status: StatusConta;
  pago_em: string | null; // "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}

// Manutenção Preventiva (PRD-010) — status é DERIVADO do horímetro atual do
// equipamento vs. o próximo registro "prevista"; nunca armazenado. Vínculo do
// plano espelha PrecoHoraMaquina: exatamente um de equipamento_id/tipo_equipamento
// é não-nulo (sem campo `vinculo` no contrato).
export type StatusManutencao = "em_dia" | "proxima" | "vencida";
export type StatusRegistroManutencao = "prevista" | "realizada";

export interface PlanoManutencao {
  id: string;
  equipamento_id: string | null;
  tipo_equipamento: TipoEquipamento | null;
  descricao: string;
  intervalo_horas: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistroManutencao {
  id: string;
  equipamento_id: string;
  plano_id: string;
  horimetro_previsto: number;
  horimetro_realizado: number | null;
  status: StatusRegistroManutencao;
  custo: number | null; // R$ — RETAGUARDA-ONLY (opcional), nunca em /app/*
  observacao: string | null;
  realizada_em: string | null;
  created_at: string;
  updated_at: string;
}

// Gestão de Diesel e Utilização (PRD-012) — litros e horímetro são
// operacionais (podem aparecer nos dois ambientes); preço/custo são
// RETAGUARDA-ONLY. Consumo médio (l/h) e utilização (horas trabalhadas no
// período) são DERIVADOS cruzando Abastecimento[] com Apontamento[] — nunca
// armazenados.
export interface Abastecimento {
  id: string;
  equipamento_id: string;
  operador_id: string | null; // quem registrou, se em campo
  litros: number;
  horimetro: number;
  preco_litro: number | null; // R$/l — RETAGUARDA-ONLY (opcional), nunca em /app/*
  custo_total: number | null; // R$ — RETAGUARDA-ONLY (opcional), nunca em /app/*
  local: string | null; // posto/obra/comboio próprio
  abastecido_em: string; // ISO
  created_at: string;
  updated_at: string;
}

// Comprovante Assinado pelo Cliente (PRD-011) — deriva de uma OrdemServico
// "fechada"; `resumo_servico` é um snapshot textual congelado no momento da
// geração (obra, período, equipamentos, horas ou metragem), nunca recalculado
// depois e nunca contendo preço/valor. Ciclo pendente → assinado | recusado
// (ambos terminais). No máximo um Comprovante por OS (garantido pela store).
export type StatusComprovante = "pendente" | "assinado" | "recusado";

export interface Comprovante {
  id: string;
  numero: string; // "CMP-2026-0001"
  os_id: string; // FK → OrdemServico
  cliente_id: string; // FK → Cliente
  resumo_servico: string; // snapshot textual — sem valores
  assinante_nome: string | null;
  assinatura_url: string | null; // data URL (mock) da assinatura capturada em tela
  status: StatusComprovante;
  motivo_recusa: string | null;
  gerado_em: string; // ISO 8601
  assinado_em: string | null;
  created_at: string;
  updated_at: string;
}

// Custo Real da Hora-Máquina (PRD-013) — RETAGUARDA-ONLY (financeiro
// estratégico). `ComponenteCusto` é o único contrato persistido: fixos
// mensais (ex.: parcela FINAME, seguro) ou variáveis por hora (ex.: material
// rodante, operador), configurados por equipamento. Diesel (PRD-012) e
// manutenção (PRD-010) entram no custo por DERIVAÇÃO (nunca como
// ComponenteCusto manual) — o custo/hora final é sempre calculado, nunca
// persistido (ver features/custo-hora/derivacoes.ts).
export type TipoComponenteCusto = "fixo_mensal" | "variavel_hora" | "diesel" | "manutencao";

export interface ComponenteCusto {
  id: string;
  equipamento_id: string; // FK → Equipamento
  descricao: string; // ex.: "Parcela FINAME", "Seguro", "Material rodante", "Operador"
  tipo: TipoComponenteCusto; // configurável pelo usuário: só fixo_mensal | variavel_hora
  valor: number; // R$ (mensal se fixo; por hora se variável)
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Gateway de Cobrança (PRD-008) — MVP mockado, multi-provedor via adapter.
// CobrancaGateway é uma entidade lateral (não altera ContaReceber): referencia
// conta_receber_id e espelha o valor da conta no momento da emissão. Nunca há
// chamada de rede real nesta fase — linha_digitavel/pix_copia_cola são
// strings simuladas geradas localmente (ver features/cobranca-gateway/derivacoes.ts).
export type ProvedorGateway = "mercado_pago" | "asaas";
export type StatusCobranca = "pendente" | "paga" | "cancelada";

export interface CobrancaGateway {
  id: string;
  conta_receber_id: string; // FK → ContaReceber
  provedor: ProvedorGateway;
  status: StatusCobranca;
  linha_digitavel: string | null; // null quando só PIX
  pix_copia_cola: string;
  valor: number; // espelha ContaReceber.valor no momento da emissão
  emitida_em: string; // ISO 8601
  paga_em: string | null;
  created_at: string;
  updated_at: string;
}

// Aviso ao Cliente por WhatsApp (PRD-009) — MVP mockado, multi-provedor via adapter.
// AvisoWhatsApp é uma entidade lateral (não altera OrdemServico nem Cliente):
// referencia os_id/cliente_id. Disparado ao fechar a OS (ver
// features/ordem-servico/components/ordem-detalhe-retaguarda.tsx). Nunca há
// chamada de rede real nesta fase — mensagem_preview é texto simulado,
// sem valores (ver features/aviso-whatsapp/derivacoes.ts).
export type ProvedorWhatsApp =
  | "evolution_api"
  | "evolution_go"
  | "meta_cloud_api"
  | "openwa"
  | "waha";
export type StatusAvisoWhatsApp =
  | "enviado"
  | "falha_telefone_invalido"
  | "falha_sessao_desconectada"
  | "falha_envio";

export interface AvisoWhatsApp {
  id: string;
  os_id: string; // FK → OrdemServico
  cliente_id: string; // FK → Cliente
  provedor: ProvedorWhatsApp;
  status: StatusAvisoWhatsApp;
  mensagem_preview: string; // "" quando status = falha_telefone_invalido
  enviado_em: string; // ISO 8601
  created_at: string;
}
