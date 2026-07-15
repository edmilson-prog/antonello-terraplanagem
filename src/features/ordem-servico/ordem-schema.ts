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
    diametro_broca_mm: numeroOpcionalPositivo,
    tipo_servico: z
      .enum([
        "terraplenagem",
        "drenagem",
        "nivelamento",
        "fundacao_estacas",
        "cascalhamento",
        "limpeza_terreno",
      ])
      .optional(),
    equipamento_previsto_id: z.string().optional(),
    inicio_previsto: z.string().optional(),
    orcamento_id: z.string().optional(),
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

// Só a criação exige tipo_servico — na edição o campo pode ficar em branco
// (OS antigas nunca tiveram esse dado).
export const ordemCriacaoSchema = ordemSchema.superRefine((val, ctx) => {
  if (!val.tipo_servico) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tipo_servico"],
      message: "Selecione o tipo de serviço",
    });
  }
});

export type OrdemFormValues = z.infer<typeof ordemSchema>;
