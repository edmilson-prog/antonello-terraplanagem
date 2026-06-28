import { createMockStore } from "@/shared/lib/create-mock-store";
import { operadores } from "@/mocks/operadores";
import type { Operador } from "@/shared/types";

export const operadoresStore = createMockStore<Operador>(operadores);
