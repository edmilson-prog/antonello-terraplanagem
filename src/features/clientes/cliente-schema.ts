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
  nome_fantasia: z.string().trim().optional(),
  segmento: z.string().trim().optional(),
  // Só valida o formato quando há algo digitado: e-mail é opcional por
  // minimização (LGPD), e string vazia não pode virar erro de validação.
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido"),
  endereco: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  contato_nome: z.string().trim().optional(),
  contato_papel: z.string().trim().optional(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
