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
  propriedade: z.enum(["propria", "locada"]).optional(),
  marca: z.string().trim().optional(),
  ano: z.string().trim().optional(),
  aquisicao_forma: z.enum(["recursos_proprios", "finame", "leasing", "consorcio"]).optional(),
  // Texto livre pelo mesmo motivo de plano_intervalo_horas: z.coerce/preprocess
  // fazem input e output do resolver divergirem do FieldValues único de
  // useForm<T>. O parse acontece em `onSubmit`.
  aquisicao_parcelas: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  // Texto livre em vez de número: mistura mal com z.coerce/preprocess nos
  // tipos do react-hook-form (input/output do resolver divergem do
  // FieldValues único que useForm<T> espera). O parse e a validação
  // numérica acontecem em `onSubmit` do EquipamentoForm.
  plano_intervalo_horas: z.string().trim().optional(),
});

// `marca` é obrigatória só na criação (mockup NovoEquipamento.jsx marca com
// "*"), mas o campo nem aparece no formulário de edição — e equipamentos
// legados não têm marca. Fica opcional no schema (senão editar um
// equipamento antigo falharia a validação com um erro num campo que a
// pessoa nunca vê); a obrigatoriedade na criação é checada manualmente em
// `onSubmit` do EquipamentoForm.
export type EquipamentoFormValues = z.infer<typeof equipamentoSchema>;
