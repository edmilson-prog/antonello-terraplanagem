import { z } from "zod";
import { isCpf } from "@/shared/lib/validators";

export const operadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do operador"),
  cpf: z.string().trim().refine((v) => isCpf(v), "CPF inválido"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type OperadorFormValues = z.infer<typeof operadorSchema>;
