import { z } from "zod";

export const contaPagarSchema = z.object({
  descricao: z.string().trim().min(3, "Mínimo 3 caracteres"),
  fornecedor: z.string().trim().optional(),
  categoria: z.enum(["diesel", "manutencao", "folha", "fornecedor", "outro"]),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  vencimento: z.string().min(10, "Informe a data de vencimento"),
  documento: z.string().trim().optional(),
  forma_pagamento: z
    .enum(["dinheiro", "pix", "transferencia", "boleto", "cheque", "outro"])
    .optional(),
  observacao: z.string().trim().optional(),
});

export type ContaPagarFormValues = z.infer<typeof contaPagarSchema>;
