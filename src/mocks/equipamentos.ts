import type { Equipamento } from "@/shared/types";

export const equipamentos: Equipamento[] = [
  {
    id: "eq-001",
    nome: "Escavadeira Hidráulica Caterpillar 320D 18t",
    tipo: "Escavadeira",
    capacidade: "18 toneladas",
    horimetro_atual: 8432,
    status: "em_uso",
  },
  {
    id: "eq-002",
    nome: "Escavadeira 10t",
    tipo: "Escavadeira",
    capacidade: "10 toneladas",
    horimetro_atual: 5120,
    status: "disponivel",
  },
  {
    id: "eq-003",
    nome: "Mini Escavadeira 5t",
    tipo: "Escavadeira",
    capacidade: "5 toneladas",
    horimetro_atual: 2310,
    status: "disponivel",
  },
  {
    id: "eq-004",
    nome: "Carregadeira de Rodas",
    tipo: "Carregadeira",
    capacidade: "2,5 m³",
    horimetro_atual: 6740,
    status: "manutencao",
  },
  {
    id: "eq-005",
    nome: "Caminhão Caçamba Basculante",
    tipo: "Caçamba",
    capacidade: "12 m³",
    horimetro_atual: 12890,
    status: "em_uso",
  },
  {
    id: "eq-006",
    nome: "Trator de Esteira D6",
    tipo: "Trator de Esteira",
    capacidade: "20 toneladas",
    horimetro_atual: 4205,
    status: "disponivel",
  },
];
