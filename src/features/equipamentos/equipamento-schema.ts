import { z } from "zod";

export const equipamentoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do equipamento")
    .transform((v) => v.toUpperCase()),
  tipo: z.enum([
    "escavadeira",
    "carregadeira",
    "caminhao_cacamba",
    "trator_esteira",
    "retroescavadeira",
    "outro",
  ]),
  capacidade: z.string().trim().min(1, "Informe a capacidade"),
  horimetro_atual: z
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0, "O horímetro não pode ser negativo"),
  identificador: z.string().trim().optional(),
  status: z.enum(["disponivel", "em_uso", "manutencao"]),
  ativo: z.boolean(),
});

export type EquipamentoFormValues = z.infer<typeof equipamentoSchema>;
