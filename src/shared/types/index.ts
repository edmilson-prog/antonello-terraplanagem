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
