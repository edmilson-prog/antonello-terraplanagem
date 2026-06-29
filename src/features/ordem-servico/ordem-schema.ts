import { z } from "zod";

const numeroOpcionalPositivo = z
  .number({ invalid_type_error: "Informe um número válido" })
  .positive("Informe um valor maior que zero")
  .optional();

export const ordemSchema = z
  .object({
    cliente_id: z.string().min(1, "Selecione o cliente"),
    obra_nome: z.string().trim().min(2, "Informe a obra"),
    endereco: z.string().trim().optional(),
    modelo_cobranca: z.enum(["hora_maquina", "por_metro"]),
    responsavel_id: z.string().optional(),
    observacao: z.string().trim().max(500).optional(),
    metragem_executada: numeroOpcionalPositivo,
    diametro_broca_mm: numeroOpcionalPositivo,
  })
  .superRefine((val, ctx) => {
    if (val.modelo_cobranca === "por_metro" && !val.diametro_broca_mm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diametro_broca_mm"],
        message: "Informe o diâmetro da broca",
      });
    }
  });

export type OrdemFormValues = z.infer<typeof ordemSchema>;
