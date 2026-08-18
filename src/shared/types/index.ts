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

export type PropriedadeEquipamento = "propria" | "locada";

export interface Equipamento {
  id: string;
  nome: string;
  tipo: TipoEquipamento;
  capacidade: string; // texto livre ("18 toneladas", "2,5 m³")
  horimetro_atual: number;
  identificador: string | null; // patrimônio/placa (opcional)
  status: EquipamentoStatus; // operacional
  ativo: boolean; // soft-delete / cadastral
  marca: string | null; // marca/modelo (ex.: "Caterpillar 320") — só coletado na criação
  ano: string | null; // ano de fabricação — só coletado na criação
  propriedade: PropriedadeEquipamento | null; // própria/locada — só coletado na criação
  created_at: string;
  updated_at: string;
}

export type VinculoOperador = "CLT" | "PJ";

export interface Operador {
  id: string;
  nome: string;
  telefone: string | null;
  cpf: string;
  ativo: boolean;
  vinculo: VinculoOperador | null;
  data_nascimento: string | null; // "YYYY-MM-DD"
  cnh_categoria: string | null;
  cnh_validade: string | null; // "YYYY-MM-DD"
  base: string | null;
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

export type TipoHistoricoPreco = "hora_maquina" | "fundacao" | "mobilizacao";

// Snapshot do estado ANTERIOR de um preço, capturado no momento de uma
// edição/inativação/reativação — alimenta "Tabelas anteriores" (Onda
// Comercial). Ainda mock: Preços não está conectado ao Supabase.
export interface HistoricoPreco {
  id: string;
  tipo: TipoHistoricoPreco;
  preco_id: string;
  snapshot: PrecoHoraMaquina | PrecoFundacao | PrecoMobilizacao;
  alterado_em: string; // ISO 8601
}

// OS colaborativa (PRD-003). A OS é contêiner: horas e status efetivo são DERIVADOS
// dos apontamentos vinculados (via Apontamento.os_id). Sem campos R$, equipamento,
// operador ou horímetro na OS. (Substitui o legado OrdemServicoOperador na T10.)
export type ModeloCobranca = "hora_maquina" | "por_metro";
export type StatusOS = "aberta" | "em_andamento" | "fechada";
export type TipoServico =
  | "terraplenagem"
  | "drenagem"
  | "nivelamento"
  | "fundacao_estacas"
  | "cascalhamento"
  | "limpeza_terreno";

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
  tipo_servico: TipoServico | null;
  equipamento_previsto_id: string | null; // FK → Equipamento; informativo, ver ADR-001
  inicio_previsto: string | null; // "YYYY-MM-DD"
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
export type FormaPagamento = "dinheiro" | "pix" | "transferencia" | "boleto" | "cheque" | "outro";

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
  documento: string | null; // ex.: "BOL 8821", "NF 5540"
  forma_pagamento: FormaPagamento | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

// Manutenção (PRD-010) — status do PLANO é DERIVADO do horímetro atual do
// equipamento vs. o próximo registro "prevista"; nunca armazenado. Vínculo do
// plano espelha PrecoHoraMaquina: exatamente um de equipamento_id/tipo_equipamento
// é não-nulo (sem campo `vinculo` no contrato).
export type StatusManutencao = "em_dia" | "proxima" | "vencida";
export type StatusRegistroManutencao = "prevista" | "em_andamento" | "realizada";

// Preventiva nasce de um PlanoManutencao e tem marca de horímetro; corretiva é
// aberta sob demanda (quebra, vazamento) e traz descrição própria. O check
// registros_manutencao_forma_check garante no banco que os dois formatos não se
// misturem — ver a migration 20260817190000_manutencao_corretiva.sql.
export type TipoManutencao = "preventiva" | "corretiva";
export type PrioridadeManutencao = "alta" | "media" | "baixa";

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

// Recorte que o App de Campo enxerga: sem `custo` (regra dura — /app/* nunca
// exibe valor), sem `fornecedor` e sem `observacao` (minimização; nenhuma tela
// de campo usa). É este o tipo que as derivações de manutenção recebem, para o
// compilador garantir que a cadeia statusEquipamento → statusPlano não alcança
// dado financeiro. A RPC listar_registros_manutencao_operador devolve exatamente
// estas colunas.
export interface RegistroManutencaoOperador {
  id: string;
  equipamento_id: string;
  plano_id: string | null; // null em corretiva
  tipo: TipoManutencao;
  descricao: string | null; // livre na corretiva; na preventiva vem do plano
  prioridade: PrioridadeManutencao;
  horimetro_previsto: number | null; // a marca-alvo do plano; null em corretiva
  horimetro_realizado: number | null; // leitura no fechamento
  horimetro_abertura: number | null; // leitura na abertura
  status: StatusRegistroManutencao;
  aberta_em: string;
  realizada_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistroManutencao extends RegistroManutencaoOperador {
  custo: number | null; // R$ — RETAGUARDA-ONLY (opcional), nunca em /app/*
  fornecedor: string | null; // oficina que executou
  observacao: string | null;
}

// Gestão de Diesel e Utilização (PRD-012) — litros e horímetro são
// operacionais (podem aparecer nos dois ambientes); preço/custo são
// RETAGUARDA-ONLY. Consumo médio (l/h) e utilização (horas trabalhadas no
// período) são DERIVADOS cruzando Abastecimento[] com Apontamento[] — nunca
// armazenados.
// De onde saiu o diesel de um abastecimento. "tanque" dá baixa no estoque
// interno e custa o preço médio do tanque; "externo" é posto/fornecedor, com
// o preço pago na hora.
export type OrigemDiesel = "tanque" | "externo";

// Recorte que o App de Campo enxerga: sem `preco_litro` e sem `custo_total`.
// É este o tipo que a RPC listar_abastecimentos_operador devolve e que as
// derivações de consumo recebem, para o compilador provar que a conta de L/h
// não alcança dado financeiro.
export interface AbastecimentoOperador {
  id: string;
  equipamento_id: string;
  operador_id: string | null; // quem registrou, se em campo
  litros: number;
  horimetro: number;
  local: string | null; // posto/obra/comboio próprio
  origem: OrigemDiesel; // de onde saiu o combustível
  abastecido_em: string; // ISO
  created_at: string;
  updated_at: string;
}

export interface Abastecimento extends AbastecimentoOperador {
  preco_litro: number | null; // R$/l — RETAGUARDA-ONLY (opcional), nunca em /app/*
  custo_total: number | null; // R$ — RETAGUARDA-ONLY (opcional), nunca em /app/*
}

// Compra de diesel para o tanque interno (Onda 17). Entrada de estoque: o
// saldo e o custo médio do tanque são DERIVADOS de compras × abastecimentos
// com origem "tanque", processados em ordem cronológica — nunca persistidos,
// pelo mesmo princípio do custo/hora (PRD-013).
export interface CompraDiesel {
  id: string;
  litros: number;
  preco_litro: number; // R$/L pago nesta compra
  valor_total: number; // R$
  fornecedor: string | null;
  documento: string | null; // nº da nota/cupom
  observacao: string | null;
  comprado_em: string; // ISO
  conta_pagar_id: string | null; // FK → ContaPagar gerada por esta compra
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
export type CategoriaComponenteCusto =
  | "depreciacao"
  | "seguro"
  | "pneus"
  | "operador"
  | "indireto"
  | "outros";

export interface ComponenteCusto {
  id: string;
  equipamento_id: string; // FK → Equipamento
  descricao: string; // ex.: "Parcela FINAME", "Seguro", "Material rodante", "Operador"
  tipo: TipoComponenteCusto; // configurável pelo usuário: só fixo_mensal | variavel_hora
  valor: number; // R$ (mensal se fixo; por hora se variável)
  categoria: CategoriaComponenteCusto | null; // organização/relatório — não entra no cálculo
  competencia: string | null; // "YYYY-MM"
  observacao: string | null;
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

// Notificações do app de campo (PRD-020).
// Entidade lateral: nunca altera OS nem apontamento, só referencia. O operador
// não tem sessão nativa do Supabase, então a leitura/escrita passa pelas RPCs
// SECURITY DEFINER (listar_notificacoes, marcar_notificacoes_lidas) em vez de
// query direta na tabela — ver features/notificacoes/notificacoes-store.ts.
export type TipoNotificacao =
  // Operação
  | "os_atribuida"
  | "apontamento_aprovado"
  | "apontamento_aguardando"
  | "lembrete_apontamento"
  | "os_sem_apontamento"
  | "os_concluida"
  | "correcao_solicitada"
  // Frota
  | "manutencao_agendada"
  | "manutencao_vencida"
  | "consumo_anomalo"
  | "abastecimento_registrado"
  // Financeiro
  | "titulo_vencido"
  | "titulo_a_vencer"
  | "comprovante_recebido"
  // Comercial
  | "orcamento_aprovado"
  | "orcamento_perdido"
  | "orcamento_a_vencer"
  // Sistema — escrito à mão por alguém do escritório
  | "aviso_manual";

export type CategoriaNotificacao = "operacao" | "frota" | "financeiro" | "comercial" | "sistema";

export type PrioridadeNotificacao = "normal" | "alta" | "critico";

export interface Notificacao {
  id: string;
  // Exatamente um dos dois é não-nulo (check notificacoes_destinatario_check):
  // operador cai na caixa do app de campo, usuário na central da retaguarda.
  operador_id: string | null; // FK → Operador
  usuario_id: string | null; // FK → UsuarioRetaguarda
  tipo: TipoNotificacao;
  categoria: CategoriaNotificacao;
  prioridade: PrioridadeNotificacao;
  titulo: string;
  mensagem: string;
  acao: string | null; // rótulo do botão no app ("Abrir OS", "Confirmar leitura")
  // Canais desta mensagem específica. Null = usar a preferência do evento —
  // é o caso de tudo que nasce de trigger. Preenchido só pelo aviso manual,
  // onde a tela deixa escolher in-app, push ou ambos.
  canais: CanalNotificacao[] | null;
  os_id: string | null; // FK → OrdemServico; quando presente, a linha é tocável
  origem_id: string | null; // registro que originou (apontamento, abastecimento…), polimórfico
  lida_em: string | null; // ISO 8601; null = não lida
  agendada_para: string | null; // no futuro = ainda não entregue
  enviada_em: string | null; // quando o pipeline de entrega processou
  created_at: string;
  updated_at: string;
}

export type CanalNotificacao = "app" | "push" | "email" | "whatsapp";
// `suprimido` é entrega que o sistema decidiu não fazer (silêncio, limite,
// canal desligado). Separado de `falhou` de propósito: sem isso o KPI de
// falhas contaria decisão de projeto como erro.
export type StatusEntrega = "pendente" | "entregue" | "falhou" | "suprimido";

export interface NotificacaoEntrega {
  id: string;
  notificacao_id: string;
  canal: CanalNotificacao;
  status: StatusEntrega;
  motivo: string | null;
  destino: string | null; // endpoint do push ou e-mail
  entregue_em: string | null;
  aberta_em: string | null;
  created_at: string;
  updated_at: string;
}

// Configuração única da empresa, como `parametros` (decisão do usuário na
// Onda 19: o app de campo não tem tela de preferências).
export interface NotificacoesPreferencias {
  id: string;
  silencio_inicio: string; // "HH:MM:SS"
  silencio_fim: string;
  fim_de_semana_so_criticos: boolean;
  resumo_email_ativo: boolean;
  resumo_email_hora: string;
  max_push_por_hora: number;
  retencao_dias: number;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreferenciaEventoNotificacao {
  tipo: TipoNotificacao;
  canal_app: boolean;
  canal_push: boolean;
  canal_email: boolean;
  canal_whatsapp: boolean;
  critico: boolean;
  created_at: string;
  updated_at: string;
}

// Inscrição de Web Push de um aparelho. Um operador pode ter várias (celular,
// tablet). O endpoint é a chave natural — reinstalar o app no mesmo aparelho
// atualiza a linha em vez de duplicar.
export interface PushSubscriptionRegistrada {
  id: string;
  operador_id: string; // FK → Operador
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

// Parâmetros da plataforma — linha única (singleton). Reúne o que antes vivia
// como constante espalhada pelo código (antecedência do alerta de manutenção,
// margem mínima, horas/mês de referência, jornada) e o cadastro institucional
// desenhado no UI kit. RETAGUARDA-ONLY: o app do operador nunca lê esta tabela.
//
// Nem todo campo tem efeito no sistema hoje — `CAMPOS_SEM_EFEITO` em
// features/parametros/campos.ts é o que a UI usa para rotular honestamente o
// que ainda é só cadastro.
export type AprovacaoApontamento = "supervisor" | "encarregado" | "automatica";
export type DiasUteis = "seg_sex" | "seg_sab" | "personalizado";
export type ArredondamentoPreco = "nenhum" | "1" | "5" | "10";
export type RegimeTributario = "simples_nacional" | "lucro_presumido" | "lucro_real";
export type SincronizacaoApp = "tempo_real" | "5min" | "15min";
export type PoliticaSenha = "padrao" | "forte";
export type PerfilPadraoNovoUsuario = "operador" | "recepcao" | "proprietario";

export interface Parametros {
  id: string;

  // Empresa
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  telefone: string;
  email: string;
  sede: string;

  // Operação
  jornada_horas: number;
  tolerancia_horimetro: number;
  alerta_manutencao_horas: number;
  fechamento_dia: string; // "HH:MM:SS"
  aprovacao_apontamento: AprovacaoApontamento;
  dias_uteis: DiasUteis;
  apontamento_via_app: boolean;
  foto_obrigatoria: boolean;
  registrar_gps: boolean;

  // Custos & preços
  depreciacao_anual_pct: number;
  custo_operador_hora: number;
  margem_minima_pct: number;
  horas_mes_referencia: number;
  diesel_preco_litro: number;
  tanque_capacidade_litros: number;
  arredondamento_preco: ArredondamentoPreco;
  reajuste_automatico_precos: boolean;
  alertar_margem_baixa: boolean;

  // Faturamento
  vencimento_dias: number;
  juros_mes_pct: number;
  multa_atraso_pct: number;
  nf_serie: string;
  nf_proxima_numeracao: string;
  regime_tributario: RegimeTributario;
  recebimento_padrao: FormaRecebimento;
  chave_pix: string;
  nf_numeracao_automatica: boolean;
  nf_envio_email: boolean;

  // Integrações
  whatsapp_numero: string;
  email_remetente: string;
  sincronizacao_app: SincronizacaoApp;
  webhook_url: string;
  canal_whatsapp_ativo: boolean;
  backup_diario: boolean;

  // Acesso & segurança
  sessao_expira_min: number;
  retencao_logs_dias: number;
  politica_senha: PoliticaSenha;
  perfil_padrao_novo_usuario: PerfilPadraoNovoUsuario;
  dupla_verificacao: boolean;
  particionamento_financeiro: boolean;

  // Registro (card "Registro" da tela de Configurações)
  versao: number;
  atualizado_por: string | null; // FK → usuarios_retaguarda
  created_at: string;
  updated_at: string;
}

// Uma linha por campo alterado, gravada por trigger — nunca pelo cliente.
export interface ParametroAlteracao {
  id: string;
  campo: string; // nome da coluna em Parametros
  valor_anterior: string | null;
  valor_novo: string | null;
  versao: number;
  alterado_por: string | null; // FK → usuarios_retaguarda
  alterado_em: string;
}
