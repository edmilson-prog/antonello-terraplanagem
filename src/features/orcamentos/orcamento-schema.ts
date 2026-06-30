import { z } from "zod";

export const orcamentoSchema = z.object({
  cliente_id: z.string().min(1, "Selecione o cliente"),
  descricao_obra: z.string().trim().min(3, "Descreva a obra"),
  validade: z.string().optional(),
});

export type OrcamentoFormValues = z.infer<typeof orcamentoSchema>;
