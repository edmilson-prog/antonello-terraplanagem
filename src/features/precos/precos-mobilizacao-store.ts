import { createMockStore } from "@/shared/lib/create-mock-store";
import { precosMobilizacao } from "@/mocks/precos-mobilizacao";
import type { PrecoMobilizacao } from "@/shared/types";

export const precoMobilizacaoStore = createMockStore<PrecoMobilizacao>(precosMobilizacao);
