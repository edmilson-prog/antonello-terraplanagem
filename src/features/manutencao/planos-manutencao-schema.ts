import { z } from "zod";

// Mantém em sincronia com TipoEquipamento (@/shared/types) e TIPOS
// (@/features/equipamentos/labels): z.enum exige uma tupla literal `as const`,
// e o tsc NÃO detecta divergência (um union-subconjunto continua atribuível).
const TIPO_VALUES = [
  "escavadeira",
  "carregadeira",
  "caminhao_cacamba",
  "trator_esteira",
  "retroescavadeira",
  "outro",
] as const;

export const planoManutencaoSchema = z
  .object({
    vinculo: z.enum(["equipamento", "tipo"]),
    equipamento_id: z.string().optional(),
    tipo_equipamento: z.enum(TIPO_VALUES).optional(),
    descricao: z.string().trim().min(3, "Informe a descrição da manutenção"),
    intervalo_horas: z
      .number({ invalid_type_error: "Informe um número válido" })
      .positive("O intervalo deve ser maior que zero"),
    ativo: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.vinculo === "equipamento" && !val.equipamento_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["equipamento_id"],
        message: "Selecione o equipamento",
      });
    }
    if (val.vinculo === "tipo" && !val.tipo_equipamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipo_equipamento"],
        message: "Selecione o tipo de equipamento",
      });
    }
  });

export type PlanoManutencaoFormValues = z.infer<typeof planoManutencaoSchema>;
