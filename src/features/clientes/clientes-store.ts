import { createMockStore } from "@/shared/lib/create-mock-store";
import { clientes } from "@/mocks/clientes";
import type { Cliente } from "@/shared/types";

export const clientesStore = createMockStore<Cliente>(clientes);
