import { z } from "zod";

// Schema mínimo do lado OPERADOR — nunca inclui dados financeiros (barreira
// financeira, RF-003/RF-008). Mesmo padrão leve de
// features/apontamento/apontamento-schema.ts (usado via .safeParse, sem
// react-hook-form completo).
export const abastecimentoOperadorSchema = z.object({
  litros: z.number().positive("Informe os litros abastecidos."),
  horimetro: z.number().min(0, "Informe o horímetro."),
});
