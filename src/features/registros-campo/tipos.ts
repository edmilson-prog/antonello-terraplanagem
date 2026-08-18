/*
 * Registros feitos em campo pelo operador (UI kit `ui_kits/app-campo`).
 *
 * São oito fatos que hoje só existem no papel: checklist de pré-uso, diário de
 * obra, paralisação, viagens de basculante, mobilização de prancha,
 * solicitação de manutenção, medição assinada pelo cliente e ciência de
 * segurança.
 *
 * Desde a Onda 22 eles têm tabela (`registros_campo`) e chegam ao escritório.
 * O aparelho continua sendo o primeiro destino — é o que o ADR-001 define:
 * fila offline local, flush idempotente ao reconectar, dedup por `op_id`. O
 * que mudou é que a fila agora tem para onde esvaziar.
 */

export type TipoRegistroCampo =
  | "checklist"
  | "diario_obra"
  | "paralisacao"
  | "viagens"
  | "mobilizacao"
  | "solicitacao_manutencao"
  | "medicao_assinada"
  | "ciencia_seguranca";

export type ClimaTurno = "sol" | "nublado" | "chuva";
export type MotivoParalisacao = "chuva" | "caminhao" | "quebra" | "liberacao" | "outro";
export type TipoProblemaManutencao = "hidraulico" | "motor" | "rodante" | "eletrica" | "outro";
export type UrgenciaManutencao = "pode_aguardar" | "maquina_parada";
export type MaterialViagem = "bota_fora" | "cascalho" | "argila";
export type TipoTransporte = "mobilizacao" | "desmobilizacao" | "transferencia";

export interface ItemChecklist {
  chave: string;
  conforme: boolean;
}

export interface DadosChecklist {
  itens: ItemChecklist[];
  nao_conformes: number;
  horimetro: number | null;
}

export interface DadosDiarioObra {
  clima_manha: ClimaTurno;
  clima_tarde: ClimaTurno;
  equipe: number;
  atividades: string;
  ocorrencias: string | null;
  com_foto: boolean;
}

export interface DadosParalisacao {
  motivo: MotivoParalisacao;
  duracao_horas: number;
  observacao: string | null;
}

export interface DadosViagens {
  material: MaterialViagem;
  viagens: number;
  capacidade_m3: number;
  observacao: string | null;
}

export interface DadosMobilizacao {
  tipo: TipoTransporte;
  km: number;
  trajeto: string;
  observacao: string | null;
  com_foto: boolean;
}

export interface DadosSolicitacaoManutencao {
  problema: TipoProblemaManutencao;
  urgencia: UrgenciaManutencao;
  observacao: string | null;
  horimetro: number | null;
  com_foto: boolean;
}

export interface DadosMedicaoAssinada {
  responsavel: string;
  horas_periodo: number;
  /*
   * Data URL do canvas. Obrigatória ao coletar (o botão só libera com o traço
   * feito, e o CHECK do banco recusa medição sem assinatura), mas NULA depois
   * de sincronizada: é dado pessoal, então some do aparelho assim que a
   * central confirma o recebimento, e a RPC de listagem não a traz de volta.
   * Quem precisa dela é a retaguarda, que lê pela tabela.
   */
  assinatura: string | null;
}

export interface DadosCienciaSeguranca {
  alerta_id: string;
  titulo: string;
}

export type DadosRegistroCampo =
  | { tipo: "checklist"; dados: DadosChecklist }
  | { tipo: "diario_obra"; dados: DadosDiarioObra }
  | { tipo: "paralisacao"; dados: DadosParalisacao }
  | { tipo: "viagens"; dados: DadosViagens }
  | { tipo: "mobilizacao"; dados: DadosMobilizacao }
  | { tipo: "solicitacao_manutencao"; dados: DadosSolicitacaoManutencao }
  | { tipo: "medicao_assinada"; dados: DadosMedicaoAssinada }
  | { tipo: "ciencia_seguranca"; dados: DadosCienciaSeguranca };

export type RegistroCampo = DadosRegistroCampo & {
  id: string;
  /** Idempotência do flush (ADR-001): o servidor deduplica por este id. */
  op_id: string;
  operador_id: string;
  os_id: string | null;
  equipamento_id: string | null;
  registrado_em: string; // ISO 8601
  pendente_sync: boolean;
};

export type NovoRegistroCampo = DadosRegistroCampo & {
  os_id?: string | null;
  equipamento_id?: string | null;
};

export const ROTULO_REGISTRO: Record<TipoRegistroCampo, string> = {
  checklist: "Checklist de pré-uso",
  diario_obra: "Diário de obra",
  paralisacao: "Paralisação",
  viagens: "Viagens de basculante",
  mobilizacao: "Transporte de prancha",
  solicitacao_manutencao: "Solicitação de manutenção",
  medicao_assinada: "Medição assinada",
  ciencia_seguranca: "Ciência de segurança",
};

export const ICONE_REGISTRO: Record<TipoRegistroCampo, string> = {
  checklist: "lucide:circle-check-big",
  diario_obra: "lucide:file-text",
  paralisacao: "lucide:ban",
  viagens: "lucide:truck",
  mobilizacao: "lucide:forklift",
  solicitacao_manutencao: "lucide:wrench",
  medicao_assinada: "lucide:pencil",
  ciencia_seguranca: "lucide:hard-hat",
};

export const CLIMA_LABEL: Record<ClimaTurno, string> = {
  sol: "Sol",
  nublado: "Nublado",
  chuva: "Chuva",
};

export const CLIMA_ICONE: Record<ClimaTurno, string> = {
  sol: "lucide:sun",
  nublado: "lucide:cloud",
  chuva: "lucide:cloud-rain",
};

export const MOTIVO_PARALISACAO: Record<
  MotivoParalisacao,
  { label: string; descricao: string; icone: string }
> = {
  chuva: { label: "Chuva", descricao: "Frente paralisada por clima", icone: "lucide:cloud-rain" },
  caminhao: {
    label: "Aguardando caminhão",
    descricao: "Sem basculante para carregar",
    icone: "lucide:truck",
  },
  quebra: {
    label: "Quebra de máquina",
    descricao: "Parada por defeito ou manutenção",
    icone: "lucide:wrench",
  },
  liberacao: {
    label: "Aguardando liberação",
    descricao: "Frente, topografia ou cliente",
    icone: "lucide:clock",
  },
  outro: { label: "Outro", descricao: "Descreva na observação", icone: "lucide:file-text" },
};

export const PROBLEMA_MANUTENCAO: Record<
  TipoProblemaManutencao,
  { label: string; descricao: string; icone: string; perigo?: boolean }
> = {
  hidraulico: {
    label: "Hidráulico",
    descricao: "Vazamento, comando lento, mangueira",
    icone: "lucide:wrench",
  },
  motor: { label: "Motor", descricao: "Falha, fumaça, superaquecimento", icone: "lucide:gauge" },
  rodante: {
    label: "Material rodante",
    descricao: "Esteira, sapata, pneu, rolete",
    icone: "lucide:truck",
  },
  eletrica: {
    label: "Elétrica",
    descricao: "Luzes, alarme de ré, painel",
    icone: "lucide:circle-alert",
    perigo: true,
  },
  outro: { label: "Outro", descricao: "Descreva na observação", icone: "lucide:file-text" },
};

export const MATERIAL_VIAGEM: Record<MaterialViagem, string> = {
  bota_fora: "Bota-fora",
  cascalho: "Cascalho",
  argila: "Argila",
};

export const TIPO_TRANSPORTE: Record<TipoTransporte, string> = {
  mobilizacao: "Mobilização",
  desmobilizacao: "Desmobilização",
  transferencia: "Transferência",
};

/* Itens do checklist de pré-uso — mesma lista do kit (AC_CHK). */
export const ITENS_CHECKLIST: { chave: string; titulo: string; detalhe: string }[] = [
  {
    chave: "oleo_agua",
    titulo: "Nível de óleo e água",
    detalhe: "Motor e hidráulico dentro da faixa",
  },
  {
    chave: "vazamentos",
    titulo: "Vazamentos visíveis",
    detalhe: "Mangueiras, cilindros e comandos",
  },
  {
    chave: "rodante",
    titulo: "Material rodante / pneus",
    detalhe: "Esteiras, sapatas ou calibragem",
  },
  { chave: "luzes", titulo: "Luzes e alarme de ré", detalhe: "Faróis, giroflex e sinal sonoro" },
  { chave: "cinto", titulo: "Cinto de segurança", detalhe: "Trava e retenção funcionando" },
  { chave: "extintor", titulo: "Extintor de incêndio", detalhe: "Carga válida e lacre intacto" },
  { chave: "cabine", titulo: "Espelhos e cabine", detalhe: "Visão limpa, vidros e retrovisores" },
  { chave: "horimetro", titulo: "Horímetro funcionando", detalhe: "Registrando horas normalmente" },
];
