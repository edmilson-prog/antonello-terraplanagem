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
