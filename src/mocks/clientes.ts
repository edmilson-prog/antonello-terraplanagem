import type { Cliente } from "@/shared/types";

// Lista pode aparecer vazia — manter export alternativo para validar empty state.
export const clientes: Cliente[] = [
  { id: "cl-001", nome: "Construtora Horizonte Ltda." },
  { id: "cl-002", nome: "Incorporadora Vale Verde" },
  { id: "cl-003", nome: "Prefeitura Municipal de São Pedro do Ivaí" },
];

export const clientesVazio: Cliente[] = [];
