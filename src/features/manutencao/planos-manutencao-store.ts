import { createMockStore } from "@/shared/lib/create-mock-store";
import { planosManutencao } from "@/mocks/planos-manutencao";
import type { PlanoManutencao } from "@/shared/types";

export const planosManutencaoStore = createMockStore<PlanoManutencao>(planosManutencao);
