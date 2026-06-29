import { createMockStore } from "@/shared/lib/create-mock-store";
import { precosFundacao } from "@/mocks/precos-fundacao";
import type { PrecoFundacao } from "@/shared/types";

export const precoFundacaoStore = createMockStore<PrecoFundacao>(precosFundacao);
