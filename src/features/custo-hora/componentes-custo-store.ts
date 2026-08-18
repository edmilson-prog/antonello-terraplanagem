import { createSupabaseStore } from "@/shared/lib/create-supabase-store";
import type { ComponenteCusto } from "@/shared/types";

// Saiu do mock na Onda 20. A tabela já tinha as mesmas 9 linhas desde o
// PRD-017 — então cadastrar um componente de custo na tela mudava o custo/hora
// da sessão e sumia no F5, enquanto o banco seguia com a lista antiga.
export const componentesCustoStore = createSupabaseStore<ComponenteCusto>({
  tabela: "componentes_custo",
  ordenarPor: "created_at",
});
