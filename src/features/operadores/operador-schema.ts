import { z } from "zod";
import { isCpf } from "@/shared/lib/validators";

export const operadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do operador"),
  cpf: z
    .string()
    .trim()
    .refine((v) => isCpf(v), "CPF inválido"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
  vinculo: z.enum(["CLT", "PJ"]).optional(),
  data_nascimento: z.string().trim().optional(),
  cnh_categoria: z.string().trim().optional(),
  cnh_validade: z.string().trim().optional(),
  base: z.string().trim().optional(),
  admissao: z.string().trim().optional(),
  equipamentos_ids: z.array(z.string()).optional(),
});

export type OperadorFormValues = z.infer<typeof operadorSchema>;
