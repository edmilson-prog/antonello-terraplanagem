import { createSupabaseStore } from "@/shared/lib/create-supabase-store";
import type { PrecoFundacao } from "@/shared/types";

// Ver a nota em precos-hora-maquina-store.ts (Onda 20).
export const precoFundacaoStore = createSupabaseStore<PrecoFundacao>({
  tabela: "precos_fundacao",
  ordenarPor: "diametro_broca_mm",
});
