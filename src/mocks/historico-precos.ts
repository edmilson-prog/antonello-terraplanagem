import type { HistoricoPreco } from "@/shared/types";

// Vazio por padrão — populado em runtime conforme preços existentes são
// editados/inativados/reativados (ver historico-precos-store.ts).
export const historicoPrecos: HistoricoPreco[] = [];
