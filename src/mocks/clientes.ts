import type { Cliente } from "@/shared/types";

// ~4 clientes. Edge cases: 1 com CNPJ, 1 sem documento, 1 nome longo, 1 inativo (com CPF).
// Documentos com dígitos verificadores válidos (passam na validação do form).
export const clientes: Cliente[] = [
  {
    id: "cl-001",
    nome: "CONSTRUTORA HORIZONTE LTDA.",
    documento: "11222333000181", // CNPJ válido
    telefone: "4432210000",
    ativo: true,
    created_at: "2024-01-15T12:00:00.000Z",
    updated_at: "2024-01-15T12:00:00.000Z",
  },
  {
    id: "cl-002",
    nome: "INCORPORADORA VALE VERDE",
    documento: null,
    telefone: "44991110000",
    ativo: true,
    created_at: "2024-02-20T12:00:00.000Z",
    updated_at: "2024-02-20T12:00:00.000Z",
  },
  {
    id: "cl-003",
    nome: "PREFEITURA MUNICIPAL DE SÃO PEDRO DO IVAÍ — SECRETARIA DE OBRAS E INFRAESTRUTURA",
    documento: null,
    telefone: null,
    ativo: true,
    created_at: "2024-03-30T12:00:00.000Z",
    updated_at: "2024-03-30T12:00:00.000Z",
  },
  {
    id: "cl-004",
    nome: "JOÃO DA SILVA CONSTRUÇÕES ME",
    documento: "52998224725", // CPF válido
    telefone: "44999998888",
    ativo: false,
    created_at: "2023-12-01T12:00:00.000Z",
    updated_at: "2025-05-10T12:00:00.000Z",
  },
];

// Lista vazia para validar o empty state.
export const clientesVazio: Cliente[] = [];
