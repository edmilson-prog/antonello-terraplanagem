import { createMockStore } from "@/shared/lib/create-mock-store";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import type { PrecoHoraMaquina } from "@/shared/types";

export const precoHoraMaquinaStore = createMockStore<PrecoHoraMaquina>(precosHoraMaquina);
