import { z } from "zod";

export const iniciarApontamentoSchema = z.object({
  equipamento_id: z.string().min(1, "Selecione um equipamento"),
  horimetro_inicial: z
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0, "O horímetro não pode ser negativo"),
  os_id: z.string().optional(),
  observacao: z.string().trim().max(280, "Observação muito longa (máx. 280)").optional(),
});

export type IniciarApontamentoValues = z.infer<typeof iniciarApontamentoSchema>;

export const finalizarApontamentoSchema = z.object({
  horimetro_final: z
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0, "O horímetro não pode ser negativo"),
});

export type FinalizarApontamentoValues = z.infer<typeof finalizarApontamentoSchema>;
