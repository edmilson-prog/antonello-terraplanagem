import { z } from "zod";
import { isCpfOuCnpj } from "@/shared/lib/validators";

export const clienteSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente"),
  documento: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isCpfOuCnpj(v), "CPF ou CNPJ inválido"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
