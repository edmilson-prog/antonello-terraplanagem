import type { Operador } from "@/shared/types";

// ~5 operadores. Edge cases: 1 inativo, 1 nome longo, 1 sem telefone.
export const operadores: Operador[] = [
  {
    id: "op-001",
    nome: "José Carlos da Silva",
    telefone: "44999990001",
    ativo: true,
    created_at: "2024-01-10T12:00:00.000Z",
    updated_at: "2024-01-10T12:00:00.000Z",
  },
  {
    id: "op-002",
    nome: "Antônio Pereira",
    telefone: "44999990002",
    ativo: true,
    created_at: "2024-02-01T12:00:00.000Z",
    updated_at: "2024-02-01T12:00:00.000Z",
  },
  {
    id: "op-003",
    nome: "Marcos Vinícius Rodrigues de Oliveira",
    telefone: null,
    ativo: true,
    created_at: "2024-03-12T12:00:00.000Z",
    updated_at: "2024-03-12T12:00:00.000Z",
  },
  {
    id: "op-004",
    nome: "Reinaldo Souza",
    telefone: "44988887777",
    ativo: false,
    created_at: "2023-09-20T12:00:00.000Z",
    updated_at: "2025-06-15T12:00:00.000Z",
  },
  {
    id: "op-005",
    nome: "Paulo Henrique Gomes",
    telefone: "44991234567",
    ativo: true,
    created_at: "2024-06-05T12:00:00.000Z",
    updated_at: "2024-06-05T12:00:00.000Z",
  },
];
