import { createMockStore } from "@/shared/lib/create-mock-store";
import { componentesCusto } from "@/mocks/componentes-custo";
import type { ComponenteCusto } from "@/shared/types";

export const componentesCustoStore = createMockStore<ComponenteCusto>(componentesCusto);
