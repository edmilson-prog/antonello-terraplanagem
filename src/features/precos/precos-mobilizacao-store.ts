import { createSupabaseStore } from "@/shared/lib/create-supabase-store";
import type { PrecoMobilizacao } from "@/shared/types";

// Ver a nota em precos-hora-maquina-store.ts (Onda 20).
export const precoMobilizacaoStore = createSupabaseStore<PrecoMobilizacao>({
  tabela: "precos_mobilizacao",
  ordenarPor: "descricao",
});
