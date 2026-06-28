import { createMockStore } from "@/shared/lib/create-mock-store";
import { equipamentos } from "@/mocks/equipamentos";
import type { Equipamento } from "@/shared/types";

export const equipamentosStore = createMockStore<Equipamento>(equipamentos);
