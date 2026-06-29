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

export type OrdemStatus = "aberta" | "em_andamento" | "concluida";

export interface OrdemServicoOperador {
  id: string;
  numero: string;
  cliente_nome: string;
  obra: string;
  endereco: string;
  equipamento_id: string;
  equipamento_nome: string;
  operador_id: string;
  status: OrdemStatus;
  data_abertura: string; // ISO
  data_fechamento: string | null;
  horimetro_inicio: number | null;
  horimetro_fim: number | null;
  observacoes: string | null;
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
