// Contratos compartilhados — espelham o schema futuro do banco (snake_case).
// Tipos definidos ANTES dos mocks; são o contrato que o backend vai implementar.

export type Perfil = "operador" | "recepcao" | "proprietario";

export type EquipamentoStatus = "disponivel" | "em_uso" | "manutencao";

export interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  capacidade: string;
  horimetro_atual: number;
  status: EquipamentoStatus;
}

export interface Operador {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface Cliente {
  id: string;
  nome: string;
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
