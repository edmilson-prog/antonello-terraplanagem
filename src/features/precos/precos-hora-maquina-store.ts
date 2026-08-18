import { createSupabaseStore } from "@/shared/lib/create-supabase-store";
import type { PrecoHoraMaquina } from "@/shared/types";

// Saiu do mock na Onda 20: a tabela já estava semeada com estas mesmas 6
// linhas desde o PRD-017, mas o front continuava lendo src/mocks/ — então
// editar um preço na tela não mudava nada no banco, e o valor que o
// Faturamento aplicava vinha de um lugar que ninguém conseguia alterar.
export const precoHoraMaquinaStore = createSupabaseStore<PrecoHoraMaquina>({
  tabela: "precos_hora_maquina",
  ordenarPor: "created_at",
});
