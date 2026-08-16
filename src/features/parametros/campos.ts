import type { Parametros } from "@/shared/types";

// Descrição declarativa das 6 seções do UI kit (Configuracoes.jsx). É a fonte
// única das duas telas: a de leitura monta os cards a partir daqui, a de edição
// monta os formulários e o diff. Adicionar um parâmetro é adicionar uma linha
// aqui, mais a coluna no banco e no type.

export type ChaveParametro = keyof Parametros;

export type TipoCampo = "text" | "mono" | "numero" | "select" | "hora";

export interface CampoParametro {
  chave: ChaveParametro;
  rotulo: string;
  tipo: TipoCampo;
  unidade?: string;
  opcoes?: { valor: string; rotulo: string }[];
  /** Ocupa as duas colunas do grid (textos longos, como razão social e sede). */
  larguraDupla?: boolean;
  dica?: string;
}

export interface ToggleParametro {
  chave: ChaveParametro;
  rotulo: string;
  descricao: string;
  /** Desabilitado até uma dependência externa existir (ex.: número homologado). */
  indisponivel?: boolean;
}

export interface SecaoParametros {
  id: string;
  rotulo: string;
  icone: string;
  descricao: string;
  campos: CampoParametro[];
  toggles: ToggleParametro[];
}

/**
 * Parâmetros que o sistema ainda não consulta em lugar nenhum — ficam salvos,
 * mas não mudam comportamento. A UI marca cada um, para não prometer um
 * controle que não existe (mesma postura do selo "Posições ilustrativas" do
 * Painel Operacional). Sair desta lista é o passo final de ligar o parâmetro.
 */
export const CAMPOS_SEM_EFEITO = new Set<ChaveParametro>([
  // Operação — não há validação de tolerância, fechamento do dia, fluxo de
  // aprovação, nem captura de GPS ou obrigatoriedade de foto no apontamento.
  // `jornada_horas` é usada só no app do operador (pré-preenche o horímetro
  // final), e o app não enxerga esta tabela: a RLS é de retaguarda. Ligá-la
  // exigiria expor o valor por RPC de operador — fora do escopo desta onda.
  "jornada_horas",
  "tolerancia_horimetro",
  "fechamento_dia",
  "aprovacao_apontamento",
  "dias_uteis",
  "apontamento_via_app",
  "foto_obrigatoria",
  "registrar_gps",
  // Custos — depreciação é só rótulo de categoria; o custo do operador e o
  // diesel são modelados por equipamento/abastecimento, não globalmente.
  "depreciacao_anual_pct",
  "custo_operador_hora",
  "diesel_preco_litro",
  "arredondamento_preco",
  "reajuste_automatico_precos",
  // Faturamento — não há emissão de NF nem cálculo de encargo de atraso, e a
  // conta a receber ainda não nasce automaticamente do faturamento.
  "vencimento_dias",
  "juros_mes_pct",
  "multa_atraso_pct",
  "nf_serie",
  "nf_proxima_numeracao",
  "regime_tributario",
  "chave_pix",
  "nf_numeracao_automatica",
  "nf_envio_email",
  // Integrações — o canal real de WhatsApp é o painel WAHA logo abaixo; não há
  // envio de e-mail próprio, webhook de eventos nem rotina de backup.
  "email_remetente",
  "sincronizacao_app",
  "webhook_url",
  "backup_diario",
  // Acesso — a sessão da retaguarda usa o TTL do Supabase Auth, a senha exige
  // só 6 caracteres, não há 2FA, log de auditoria nem checagem de perfil
  // (is_retaguarda() trata recepção e proprietário como iguais).
  "sessao_expira_min",
  "retencao_logs_dias",
  "politica_senha",
  "perfil_padrao_novo_usuario",
  "dupla_verificacao",
  "particionamento_financeiro",
]);

export const SECOES: SecaoParametros[] = [
  {
    id: "empresa",
    rotulo: "Empresa",
    icone: "lucide:building-2",
    descricao: "Identificação usada em notas fiscais, orçamentos e comprovantes.",
    campos: [
      { chave: "razao_social", rotulo: "Razão social", tipo: "text", larguraDupla: true },
      { chave: "nome_fantasia", rotulo: "Nome fantasia", tipo: "text" },
      { chave: "cnpj", rotulo: "CNPJ", tipo: "mono" },
      { chave: "inscricao_estadual", rotulo: "Inscrição estadual", tipo: "mono" },
      { chave: "telefone", rotulo: "Telefone", tipo: "mono" },
      { chave: "email", rotulo: "E-mail", tipo: "text" },
      { chave: "sede", rotulo: "Sede", tipo: "text", larguraDupla: true },
    ],
    toggles: [],
  },
  {
    id: "operacao",
    rotulo: "Operação",
    icone: "lucide:clipboard-list",
    descricao: "Jornada, apontamento de horas e fechamento do dia.",
    campos: [
      { chave: "jornada_horas", rotulo: "Jornada padrão", tipo: "numero", unidade: "h/dia" },
      {
        chave: "tolerancia_horimetro",
        rotulo: "Tolerância de horímetro",
        tipo: "numero",
        unidade: "± h",
      },
      {
        chave: "alerta_manutencao_horas",
        rotulo: "Alerta de manutenção",
        tipo: "numero",
        unidade: "h antes",
      },
      { chave: "fechamento_dia", rotulo: "Fechamento do dia", tipo: "hora" },
      {
        chave: "aprovacao_apontamento",
        rotulo: "Aprovação de apontamento",
        tipo: "select",
        opcoes: [
          { valor: "supervisor", rotulo: "Supervisor" },
          { valor: "encarregado", rotulo: "Encarregado de obra" },
          { valor: "automatica", rotulo: "Automática" },
        ],
      },
      {
        chave: "dias_uteis",
        rotulo: "Dias úteis",
        tipo: "select",
        opcoes: [
          { valor: "seg_sex", rotulo: "Segunda a sexta" },
          { valor: "seg_sab", rotulo: "Segunda a sábado" },
          { valor: "personalizado", rotulo: "Personalizado" },
        ],
      },
    ],
    toggles: [
      {
        chave: "apontamento_via_app",
        rotulo: "Apontamento via app de campo",
        descricao: "Operadores lançam horas pelo celular.",
      },
      {
        chave: "foto_obrigatoria",
        rotulo: "Foto obrigatória no apontamento",
        descricao: "Horímetro fotografado no início e no fim.",
      },
      {
        chave: "registrar_gps",
        rotulo: "Registrar GPS no apontamento",
        descricao: "Grava a coordenada do lançamento.",
      },
    ],
  },
  {
    id: "custos",
    rotulo: "Custos & preços",
    icone: "lucide:calculator",
    descricao: "Base de cálculo do custo da hora e da margem.",
    campos: [
      {
        chave: "depreciacao_anual_pct",
        rotulo: "Depreciação padrão",
        tipo: "numero",
        unidade: "% a.a.",
      },
      {
        chave: "custo_operador_hora",
        rotulo: "Custo do operador",
        tipo: "numero",
        unidade: "R$/h",
      },
      { chave: "margem_minima_pct", rotulo: "Margem mínima", tipo: "numero", unidade: "%" },
      {
        chave: "horas_mes_referencia",
        rotulo: "Horas/mês de referência",
        tipo: "numero",
        unidade: "h",
      },
      {
        chave: "diesel_preco_litro",
        rotulo: "Diesel — tanque interno",
        tipo: "numero",
        unidade: "R$/L",
      },
      {
        chave: "arredondamento_preco",
        rotulo: "Arredondamento de preço",
        tipo: "select",
        opcoes: [
          { valor: "nenhum", rotulo: "Sem arredondamento" },
          { valor: "1", rotulo: "R$ 1" },
          { valor: "5", rotulo: "R$ 5" },
          { valor: "10", rotulo: "R$ 10" },
        ],
      },
    ],
    toggles: [
      {
        chave: "reajuste_automatico_precos",
        rotulo: "Reajustar tabela de preços com o custo da hora",
        descricao: "Recalcula a tabela quando o custo varia acima de 5%.",
      },
      {
        chave: "alertar_margem_baixa",
        rotulo: "Alertar orçamento abaixo da margem",
        descricao: "Destaca em vermelho os preços cuja margem fica abaixo do mínimo.",
      },
    ],
  },
  {
    id: "faturamento",
    rotulo: "Faturamento",
    icone: "lucide:file-check",
    descricao: "Emissão de nota fiscal, prazos e recebimento.",
    campos: [
      { chave: "vencimento_dias", rotulo: "Vencimento padrão", tipo: "numero", unidade: "dias" },
      { chave: "juros_mes_pct", rotulo: "Juros ao mês", tipo: "numero", unidade: "%" },
      { chave: "multa_atraso_pct", rotulo: "Multa por atraso", tipo: "numero", unidade: "%" },
      { chave: "nf_serie", rotulo: "Série da NF", tipo: "mono" },
      { chave: "nf_proxima_numeracao", rotulo: "Próxima numeração", tipo: "mono" },
      {
        chave: "regime_tributario",
        rotulo: "Regime tributário",
        tipo: "select",
        opcoes: [
          { valor: "simples_nacional", rotulo: "Simples Nacional" },
          { valor: "lucro_presumido", rotulo: "Lucro Presumido" },
          { valor: "lucro_real", rotulo: "Lucro Real" },
        ],
      },
      {
        chave: "recebimento_padrao",
        rotulo: "Recebimento padrão",
        tipo: "select",
        opcoes: [
          { valor: "pix", rotulo: "PIX" },
          { valor: "boleto", rotulo: "Boleto" },
          { valor: "transferencia", rotulo: "Transferência" },
          { valor: "dinheiro", rotulo: "Dinheiro" },
          { valor: "cheque", rotulo: "Cheque" },
          { valor: "outro", rotulo: "Outro" },
        ],
      },
      { chave: "chave_pix", rotulo: "Chave PIX", tipo: "mono" },
    ],
    toggles: [
      {
        chave: "nf_numeracao_automatica",
        rotulo: "Numeração automática de NF",
        descricao: "Sequência contínua por série.",
      },
      {
        chave: "nf_envio_email",
        rotulo: "Enviar NF ao cliente por e-mail",
        descricao: "XML e DANFE no e-mail cadastrado.",
      },
    ],
  },
  {
    id: "integracoes",
    rotulo: "Integrações",
    icone: "lucide:link",
    descricao: "Canais de envio, sincronização do app e conexão com o WhatsApp.",
    campos: [
      {
        chave: "whatsapp_numero",
        rotulo: "Número WhatsApp homologado",
        tipo: "mono",
        dica: "Informativo — quem conecta de fato é o painel WAHA abaixo.",
      },
      { chave: "email_remetente", rotulo: "Remetente de e-mail", tipo: "text" },
      {
        chave: "sincronizacao_app",
        rotulo: "Sincronização do app",
        tipo: "select",
        opcoes: [
          { valor: "tempo_real", rotulo: "Tempo real" },
          { valor: "5min", rotulo: "A cada 5 min" },
          { valor: "15min", rotulo: "A cada 15 min" },
        ],
      },
      {
        chave: "webhook_url",
        rotulo: "Webhook de eventos",
        tipo: "text",
        larguraDupla: true,
      },
    ],
    toggles: [
      {
        chave: "canal_whatsapp_ativo",
        rotulo: "Canal WhatsApp",
        descricao: "Liberado após conectar uma sessão no painel abaixo.",
      },
      {
        chave: "backup_diario",
        rotulo: "Backup diário na nuvem",
        descricao: "Todo dia às 03:00, retenção de 30 cópias.",
      },
    ],
  },
  {
    id: "acesso",
    rotulo: "Acesso & segurança",
    icone: "lucide:lock",
    descricao: "Sessão, perfis e visibilidade dos dados financeiros.",
    campos: [
      { chave: "sessao_expira_min", rotulo: "Sessão expira em", tipo: "numero", unidade: "min" },
      { chave: "retencao_logs_dias", rotulo: "Retenção de logs", tipo: "numero", unidade: "dias" },
      {
        chave: "politica_senha",
        rotulo: "Política de senha",
        tipo: "select",
        opcoes: [
          { valor: "padrao", rotulo: "Padrão — 8 caracteres" },
          { valor: "forte", rotulo: "Forte — 12 caracteres" },
        ],
      },
      {
        chave: "perfil_padrao_novo_usuario",
        rotulo: "Perfil padrão de novo usuário",
        tipo: "select",
        opcoes: [
          { valor: "operador", rotulo: "Operador" },
          { valor: "recepcao", rotulo: "Recepção" },
          { valor: "proprietario", rotulo: "Proprietário" },
        ],
      },
    ],
    toggles: [
      {
        chave: "dupla_verificacao",
        rotulo: "Dupla verificação (2FA)",
        descricao: "Código por e-mail no primeiro acesso do dia.",
      },
      {
        chave: "particionamento_financeiro",
        rotulo: "Particionamento financeiro",
        descricao: "Valores restritos a Financeiro, Custo da Hora e Rentabilidade.",
      },
    ],
  },
];

/** Todos os campos e toggles, achatados — usado pelo diff e pelo histórico. */
export const CAMPOS_POR_CHAVE = new Map<
  ChaveParametro,
  { rotulo: string; secao: string; unidade?: string; booleano: boolean; campo?: CampoParametro }
>();

for (const secao of SECOES) {
  for (const campo of secao.campos) {
    CAMPOS_POR_CHAVE.set(campo.chave, {
      rotulo: campo.rotulo,
      secao: secao.rotulo,
      unidade: campo.unidade,
      booleano: false,
      campo,
    });
  }
  for (const toggle of secao.toggles) {
    CAMPOS_POR_CHAVE.set(toggle.chave, {
      rotulo: toggle.rotulo,
      secao: secao.rotulo,
      booleano: true,
    });
  }
}

export const semEfeito = (chave: ChaveParametro) => CAMPOS_SEM_EFEITO.has(chave);
