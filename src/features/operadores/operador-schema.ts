import { z } from "zod";

export const operadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do operador"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type OperadorFormValues = z.infer<typeof operadorSchema>;
