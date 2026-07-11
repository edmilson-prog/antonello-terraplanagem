import { v5 as uuidv5 } from "uuid";
import { clientes as clientesFixture } from "@/mocks/clientes";

// Mesmo NAMESPACE de scripts/mocks-to-seed.ts — não alterar (é o que gera os ids
// reais no Supabase a partir dos ids mock "cl-001" etc. no seed).
const NAMESPACE = "6f0f6b1a-9c8e-4b0a-8a1e-4a5a2b6f0c10";

const MOCK_ID_POR_UUID: Record<string, string> = Object.fromEntries(
  clientesFixture.map((c) => [uuidv5(c.id, NAMESPACE), c.id]),
);

/**
 * Ordens de serviço, orçamentos, faturamento e comprovantes ainda são mock
 * (não migraram para o Supabase) e referenciam clientes pelo id mock original
 * ("cl-001"...). Só os 4 clientes fixture têm atividade nessas stores — os
 * clientes reais importados do FarolTI não têm correspondente mock, então
 * retorna undefined para eles.
 */
export function idMockDoCliente(clienteId: string): string | undefined {
  return MOCK_ID_POR_UUID[clienteId];
}
