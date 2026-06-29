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

const valorPositivo = (msg = "Informe um valor maior que zero") =>
  z.number({ invalid_type_error: "Informe um valor válido" }).positive(msg);

export const precoHoraMaquinaSchema = z
  .object({
    vinculo: z.enum(["equipamento", "tipo"]),
    equipamento_id: z.string().optional(),
    tipo_equipamento: z.enum(TIPO_VALUES).optional(),
    valor_hora_seca: valorPositivo(),
    valor_hora_operada: valorPositivo(),
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

export const precoFundacaoSchema = z.object({
  diametro_broca_mm: z
    .number({ invalid_type_error: "Informe o diâmetro" })
    .positive("Informe o diâmetro em mm"),
  valor_metro: valorPositivo(),
  descricao: z.string().trim().optional(),
  ativo: z.boolean(),
});

export const precoMobilizacaoSchema = z.object({
  descricao: z.string().trim().min(2, "Informe a descrição"),
  valor: valorPositivo(),
  ativo: z.boolean(),
});

export type PrecoHoraMaquinaFormValues = z.infer<typeof precoHoraMaquinaSchema>;
export type PrecoFundacaoFormValues = z.infer<typeof precoFundacaoSchema>;
export type PrecoMobilizacaoFormValues = z.infer<typeof precoMobilizacaoSchema>;
