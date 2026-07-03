import { z } from "zod";

const valorPositivo = (msg = "Informe um valor maior que zero") =>
  z.number({ invalid_type_error: "Informe um valor válido" }).positive(msg);

export const componenteCustoSchema = z.object({
  equipamento_id: z.string().min(1, "Selecione o equipamento"),
  descricao: z.string().trim().min(2, "Informe a descrição"),
  tipo: z.enum(["fixo_mensal", "variavel_hora"]),
  valor: valorPositivo(),
  ativo: z.boolean(),
});

export type ComponenteCustoFormValues = z.infer<typeof componenteCustoSchema>;
