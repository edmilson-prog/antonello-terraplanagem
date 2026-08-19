# PRD-008 — Gateway de Cobrança (MVP Mockado) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o MVP mockado do PRD-008 (`docs/prds/PRD-008-ret-integracao-gateway-cobranca.md`): emitir uma cobrança (boleto/PIX) simulada a partir de uma Conta a Receber (PRD-007), escolhendo entre múltiplos gateways (Mercado Pago / Asaas), e simular a confirmação de pagamento (webhook) dando baixa automática na conta — tudo em dados mockados, sem nenhuma chamada de rede real.

**Architecture:** Nova entidade `CobrancaGateway` (tabela lateral, não altera `ContaReceber`), referenciando `conta_receber_id`. Store dedicado (`cobrancas-store.ts`) que **reaproveita** `contasReceberStore.darBaixaReceber` para a transição de estado da baixa (nunca duplica essa lógica). Nova feature `src/features/integracoes/` hospeda a tela de configuração do "provedor padrão" (persistido em `localStorage`, mesmo padrão de `useTheme`). UI integrada na aba "A Receber" já existente (`financeiro-page.tsx` / `contas-receber-tab.tsx`).

**Tech Stack:** React 19 + TypeScript + TanStack Router (file-based) + Tailwind + shadcn/ui (`Select`, `Button`, `Label`, `Dialog` via `FormDialog`) + Vitest.

## Global Constraints

- **MVP mockado (Frontend First):** nenhuma chamada de rede real, nenhuma credencial, nenhum SDK de provedor. Tudo em `src/mocks/` + stores em memória (`useSyncExternalStore`), igual ao resto do projeto nesta fase.
- **Nunca alterar os 5 registros existentes de `src/mocks/contas-receber.ts`** (`cr-001..cr-005`): o teste `contas-receber.test.ts` trava `toHaveLength(5)`, valores exatos de `cr-003`/`cr-004`, e a **soma das contas `aberta` = 27720**. `CobrancaGateway` é uma entidade lateral nova — não requer nenhum campo novo em `ContaReceber` nem edição desses registros.
- **Reaproveitar `contasReceberStore.darBaixaReceber`** para a baixa automática (via webhook simulado) — nunca duplicar a lógica de transição `aberta → liquidada`. A ordem correta é: primeiro confirmar a baixa na conta, só then marcar a cobrança como `paga` (se a baixa falhar, a cobrança permanece `pendente`).
- **Idempotência:** não permitir duas cobranças `pendente` simultâneas para a mesma conta; não permitir marcar uma cobrança já `paga`/`cancelada` como paga de novo.
- **Barreira financeira:** nada disso é importado ou renderizado em `/app/*` (só retaguarda).
- **Convenções de código:** interfaces sem prefixo `I` (`CobrancaGateway`, não `ICobrancaGateway`); `camelCase` em código, `snake_case` nos types/mocks; sem `any`; ordem de imports (React → libs externas → componentes internos → hooks internos → utils → types).
- **Ícones:** `@iconify/react` (`<Icon icon="lucide:...">`) nas telas de feature — o shell da sidebar (`retaguarda-shell.tsx`) usa `lucide-react` diretamente; manter o padrão do arquivo que está sendo editado.
- **Cores:** apenas tokens/classes já existentes no projeto (`steel`, `secondary`, `destructive`, `muted-foreground`, etc.) — nunca hardcodar cor.
- **TypeScript:** sem `any`.

---

### Task 1: Tipos, mock e derivações de `CobrancaGateway`

**Files:**
- Modify: `src/shared/types/index.ts` (adicionar `ProvedorGateway`, `StatusCobranca`, `CobrancaGateway`)
- Create: `src/mocks/cobrancas-gateway.ts`
- Create: `src/mocks/cobrancas-gateway.test.ts`
- Create: `src/features/cobranca-gateway/derivacoes.ts`
- Create: `src/features/cobranca-gateway/derivacoes.test.ts`

**Interfaces:**
- Produz: `ProvedorGateway = "mercado_pago" | "asaas"`; `StatusCobranca = "pendente" | "paga" | "cancelada"`; `CobrancaGateway { id, conta_receber_id, provedor, status, linha_digitavel, pix_copia_cola, valor, emitida_em, paga_em, created_at, updated_at }`; `cobrancaDaConta(contaReceberId: string, cobrancas: CobrancaGateway[]): CobrancaGateway | null`; `gerarLinhaDigitavelMock(cobrancaId: string): string`; `gerarPixCopiaColaMock(cobrancaId: string): string`.
- Consome: nenhum (base da feature).

- [ ] **Step 1: Adicionar os tipos em `src/shared/types/index.ts`**

Adicionar ao final do arquivo (após o bloco de `ComponenteCusto`, PRD-013):

```typescript
// Gateway de Cobrança (PRD-008) — MVP mockado, multi-provedor via adapter.
// CobrancaGateway é uma entidade lateral (não altera ContaReceber): referencia
// conta_receber_id e espelha o valor da conta no momento da emissão. Nunca há
// chamada de rede real nesta fase — linha_digitavel/pix_copia_cola são
// strings simuladas geradas localmente (ver features/cobranca-gateway/derivacoes.ts).
export type ProvedorGateway = "mercado_pago" | "asaas";
export type StatusCobranca = "pendente" | "paga" | "cancelada";

export interface CobrancaGateway {
  id: string;
  conta_receber_id: string; // FK → ContaReceber
  provedor: ProvedorGateway;
  status: StatusCobranca;
  linha_digitavel: string | null; // null quando só PIX
  pix_copia_cola: string;
  valor: number; // espelha ContaReceber.valor no momento da emissão
  emitida_em: string; // ISO 8601
  paga_em: string | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Escrever o teste do mock (`src/mocks/cobrancas-gateway.test.ts`)**

```typescript
import { describe, it, expect } from "vitest";
import { cobrancasGateway } from "./cobrancas-gateway";
import { contasReceber } from "./contas-receber";

describe("mock cobrancasGateway", () => {
  it("tem 2 registros", () => {
    expect(cobrancasGateway).toHaveLength(2);
  });

  it("cob-001 referencia cr-001 (Mercado Pago, pendente, boleto+PIX)", () => {
    const c = cobrancasGateway.find((x) => x.id === "cob-001");
    expect(c?.conta_receber_id).toBe("cr-001");
    expect(c?.provedor).toBe("mercado_pago");
    expect(c?.status).toBe("pendente");
    expect(c?.linha_digitavel).not.toBeNull();
  });

  it("cob-002 referencia cr-005 (Asaas, pendente, só PIX)", () => {
    const c = cobrancasGateway.find((x) => x.id === "cob-002");
    expect(c?.conta_receber_id).toBe("cr-005");
    expect(c?.provedor).toBe("asaas");
    expect(c?.linha_digitavel).toBeNull();
  });

  it("toda cobrança referencia uma conta a receber existente", () => {
    const idsContas = new Set(contasReceber.map((c) => c.id));
    cobrancasGateway.forEach((c) => {
      expect(idsContas.has(c.conta_receber_id)).toBe(true);
    });
  });

  it("valor da cobrança espelha o valor da conta a receber correspondente", () => {
    cobrancasGateway.forEach((c) => {
      const conta = contasReceber.find((cr) => cr.id === c.conta_receber_id);
      expect(c.valor).toBe(conta?.valor);
    });
  });
});
```

- [ ] **Step 3: Rodar o teste do mock para confirmar que falha**

Run: `npx vitest run src/mocks/cobrancas-gateway.test.ts`
Expected: FAIL — `Cannot find module './cobrancas-gateway'`.

- [ ] **Step 4: Criar o mock (`src/mocks/cobrancas-gateway.ts`)**

```typescript
import type { CobrancaGateway } from "@/shared/types";

// Cobranças emitidas via gateway para contas ainda em aberto (cr-001, cr-005 —
// ver src/mocks/contas-receber.ts). Nenhuma cobrança aqui está "paga": o
// fluxo de confirmação é sempre simulado em runtime via
// cobrancasStore.simularWebhookPago, nunca hardcoded no seed (evita
// contradizer o status "aberta" das contas correspondentes).
export const cobrancasGateway: CobrancaGateway[] = [
  {
    id: "cob-001",
    conta_receber_id: "cr-001",
    provedor: "mercado_pago",
    status: "pendente",
    linha_digitavel: "34191.79001 01043.510047 91020.150008 1 96380000522000",
    pix_copia_cola:
      "00020126580014br.gov.bcb.pix0136cob-00152040000530398654045220.005802BR5913ANTONELLO TERR6009SAO PAULO62070503***6304A1B2",
    valor: 5220,
    emitida_em: "2026-06-28T10:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-28T10:00:00.000Z",
    updated_at: "2026-06-28T10:00:00.000Z",
  },
  {
    id: "cob-002",
    conta_receber_id: "cr-005",
    provedor: "asaas",
    status: "pendente",
    linha_digitavel: null, // gerado só via PIX neste provedor/emissão
    pix_copia_cola:
      "00020126580014br.gov.bcb.pix0136cob-00252040000530398654047800.005802BR5913ANTONELLO TERR6009SAO PAULO62070503***6304C3D4",
    valor: 7800,
    emitida_em: "2026-06-30T09:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-30T09:00:00.000Z",
    updated_at: "2026-06-30T09:00:00.000Z",
  },
];
```

- [ ] **Step 5: Rodar o teste do mock para confirmar que passa**

Run: `npx vitest run src/mocks/cobrancas-gateway.test.ts`
Expected: PASS (5/5).

- [ ] **Step 6: Escrever o teste das derivações (`src/features/cobranca-gateway/derivacoes.test.ts`)**

```typescript
import { describe, it, expect } from "vitest";
import { cobrancaDaConta, gerarLinhaDigitavelMock, gerarPixCopiaColaMock } from "./derivacoes";
import type { CobrancaGateway } from "@/shared/types";

const cobrancas: CobrancaGateway[] = [
  {
    id: "cob-x",
    conta_receber_id: "cr-x",
    provedor: "mercado_pago",
    status: "pendente",
    linha_digitavel: "123",
    pix_copia_cola: "pix",
    valor: 100,
    emitida_em: "2026-06-01T00:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

describe("cobrancaDaConta", () => {
  it("retorna a cobrança da conta quando existe", () => {
    expect(cobrancaDaConta("cr-x", cobrancas)?.id).toBe("cob-x");
  });

  it("retorna null quando a conta não tem cobrança", () => {
    expect(cobrancaDaConta("cr-inexistente", cobrancas)).toBeNull();
  });
});

describe("gerarLinhaDigitavelMock", () => {
  it("gera uma string não vazia, longa o bastante para parecer uma linha digitável", () => {
    const linha = gerarLinhaDigitavelMock("cob-001");
    expect(linha.length).toBeGreaterThan(20);
  });

  it("é determinística para o mesmo id", () => {
    expect(gerarLinhaDigitavelMock("cob-001")).toBe(gerarLinhaDigitavelMock("cob-001"));
  });
});

describe("gerarPixCopiaColaMock", () => {
  it("gera uma string contendo o id da cobrança", () => {
    const pix = gerarPixCopiaColaMock("cob-001");
    expect(pix).toContain("cob-001");
    expect(pix.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 7: Rodar o teste das derivações para confirmar que falha**

Run: `npx vitest run src/features/cobranca-gateway/derivacoes.test.ts`
Expected: FAIL — `Cannot find module './derivacoes'`.

- [ ] **Step 8: Implementar as derivações (`src/features/cobranca-gateway/derivacoes.ts`)**

```typescript
import type { CobrancaGateway } from "@/shared/types";

export function cobrancaDaConta(
  contaReceberId: string,
  cobrancas: CobrancaGateway[],
): CobrancaGateway | null {
  return cobrancas.find((c) => c.conta_receber_id === contaReceberId) ?? null;
}

// Geradores mock — nunca chamam rede real; simulam o formato de retorno do
// gateway (linha digitável / PIX copia-e-cola) de forma determinística por id,
// só para exibição/QA nesta fase.
export function gerarLinhaDigitavelMock(cobrancaId: string): string {
  const digitos = cobrancaId.replace(/\D/g, "").padEnd(11, "0").slice(0, 11);
  return `34191.79001 01043.510047 91020.150008 1 ${digitos}00000`;
}

export function gerarPixCopiaColaMock(cobrancaId: string): string {
  return `00020126580014br.gov.bcb.pix0136${cobrancaId}5204000053039865802BR5913ANTONELLO TERR6009SAO PAULO62070503***6304MOCK`;
}
```

- [ ] **Step 9: Rodar o teste das derivações para confirmar que passa**

Run: `npx vitest run src/features/cobranca-gateway/derivacoes.test.ts`
Expected: PASS (5/5).

- [ ] **Step 10: Rodar a suíte completa e o typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: todos os testes existentes continuam passando (nenhum arquivo pré-existente foi tocado neste task) + 0 erros de tipo.

- [ ] **Step 11: Commit**

```bash
git add src/shared/types/index.ts src/mocks/cobrancas-gateway.ts src/mocks/cobrancas-gateway.test.ts src/features/cobranca-gateway/derivacoes.ts src/features/cobranca-gateway/derivacoes.test.ts
git commit -m "feat: add CobrancaGateway type, mock and derivacoes (PRD-008)"
```

---

### Task 2: Store `cobrancas-store.ts` e labels

**Files:**
- Create: `src/features/cobranca-gateway/cobrancas-store.ts`
- Create: `src/features/cobranca-gateway/cobrancas-store.test.ts`
- Create: `src/features/cobranca-gateway/labels.tsx`

**Interfaces:**
- Consome: `CobrancaGateway`, `ProvedorGateway` (Task 1); `contasReceberStore`, `criarContasReceberStore`, `ContaReceber` de `@/features/financeiro/contas-receber-store` (já existente); `gerarLinhaDigitavelMock`, `gerarPixCopiaColaMock` (Task 1).
- Produz: `criarCobrancasStore(inicial: CobrancaGateway[], contasStore: ReturnType<typeof criarContasReceberStore>)` retornando `{ listar, obter, emitirCobranca, simularWebhookPago, useTodas }`; singleton `cobrancasStore`; `ResultadoEmitirCobranca`, `ResultadoSimularPagamento`; `PROVEDOR_GATEWAY_LABEL: Record<ProvedorGateway, string>`; `STATUS_COBRANCA_LABEL: Record<StatusCobranca, string>`; componente `StatusCobrancaBadge`.

- [ ] **Step 1: Escrever o teste do store (`src/features/cobranca-gateway/cobrancas-store.test.ts`)**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { criarCobrancasStore } from "./cobrancas-store";
import { criarContasReceberStore } from "@/features/financeiro/contas-receber-store";
import type { ContaReceber, CobrancaGateway } from "@/shared/types";

const seedContas: ContaReceber[] = [
  {
    id: "cr-t01",
    faturamento_id: "fat-001",
    cliente_id: "cl-001",
    valor: 1000,
    vencimento: "2026-07-01",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "cr-t02",
    faturamento_id: "fat-002",
    cliente_id: "cl-002",
    valor: 500,
    vencimento: "2026-07-05",
    status: "liquidada",
    recebido_em: "2026-06-30",
    forma_recebimento: "pix",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "cr-t03",
    faturamento_id: "fat-003",
    cliente_id: "cl-003",
    valor: 2000,
    vencimento: "2026-07-10",
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

const seedCobrancas: CobrancaGateway[] = [
  {
    id: "cob-t01",
    conta_receber_id: "cr-t01",
    provedor: "mercado_pago",
    status: "pendente",
    linha_digitavel: "34191.00000 00000.000000 00000.000000 1 00000000100000",
    pix_copia_cola: "pix-mock-t01",
    valor: 1000,
    emitida_em: "2026-06-15T00:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-15T00:00:00.000Z",
    updated_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "cob-t02",
    conta_receber_id: "cr-t02", // conta já liquidada por fora — edge case de falha na baixa
    provedor: "asaas",
    status: "pendente",
    linha_digitavel: null,
    pix_copia_cola: "pix-mock-t02",
    valor: 500,
    emitida_em: "2026-06-20T00:00:00.000Z",
    paga_em: null,
    created_at: "2026-06-20T00:00:00.000Z",
    updated_at: "2026-06-20T00:00:00.000Z",
  },
];

describe("criarCobrancasStore", () => {
  let contasStore: ReturnType<typeof criarContasReceberStore>;
  let store: ReturnType<typeof criarCobrancasStore>;

  beforeEach(() => {
    contasStore = criarContasReceberStore(seedContas);
    store = criarCobrancasStore(seedCobrancas, contasStore);
  });

  it("listar retorna os 2 itens do seed", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("emitirCobranca cria pendente com valor espelhado da conta e strings simuladas", () => {
    const r = store.emitirCobranca("cr-t03", "asaas");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cobranca.status).toBe("pendente");
      expect(r.cobranca.provedor).toBe("asaas");
      expect(r.cobranca.valor).toBe(2000);
      expect(r.cobranca.pix_copia_cola.length).toBeGreaterThan(0);
    }
  });

  it("emitirCobranca em conta já liquidada retorna ok:false", () => {
    const r = store.emitirCobranca("cr-t02", "mercado_pago");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("liquidada");
  });

  it("emitirCobranca em conta que já tem cobrança pendente retorna ok:false", () => {
    const r = store.emitirCobranca("cr-t01", "asaas");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("pendente");
  });

  it("emitirCobranca em conta inexistente retorna ok:false", () => {
    const r = store.emitirCobranca("inexistente", "mercado_pago");
    expect(r.ok).toBe(false);
  });

  it("simularWebhookPago marca a cobrança como paga E dá baixa automática na conta", () => {
    const r = store.simularWebhookPago("cob-t01");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cobranca.status).toBe("paga");
      expect(r.cobranca.paga_em).not.toBeNull();
    }
    expect(contasStore.obter("cr-t01")?.status).toBe("liquidada");
    expect(contasStore.obter("cr-t01")?.forma_recebimento).toBe("boleto"); // linha_digitavel não-nula em cob-t01
  });

  it("simularWebhookPago em cobrança já paga retorna ok:false (idempotente)", () => {
    store.simularWebhookPago("cob-t01");
    const r = store.simularWebhookPago("cob-t01");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já foi paga");
  });

  it("simularWebhookPago propaga falha da baixa e mantém a cobrança pendente", () => {
    const r = store.simularWebhookPago("cob-t02"); // cr-t02 já está liquidada
    expect(r.ok).toBe(false);
    expect(store.obter("cob-t02")?.status).toBe("pendente");
  });

  it("simularWebhookPago em cobrança inexistente retorna ok:false", () => {
    const r = store.simularWebhookPago("inexistente");
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste do store para confirmar que falha**

Run: `npx vitest run src/features/cobranca-gateway/cobrancas-store.test.ts`
Expected: FAIL — `Cannot find module './cobrancas-store'`.

- [ ] **Step 3: Implementar o store (`src/features/cobranca-gateway/cobrancas-store.ts`)**

```typescript
import { useSyncExternalStore } from "react";
import { cobrancasGateway as seed } from "@/mocks/cobrancas-gateway";
import {
  gerarLinhaDigitavelMock,
  gerarPixCopiaColaMock,
} from "@/features/cobranca-gateway/derivacoes";
import {
  contasReceberStore,
  criarContasReceberStore,
} from "@/features/financeiro/contas-receber-store";
import type { CobrancaGateway, ProvedorGateway } from "@/shared/types";

export type ResultadoEmitirCobranca =
  | { ok: true; cobranca: CobrancaGateway }
  | { ok: false; motivo: string };

export type ResultadoSimularPagamento =
  | { ok: true; cobranca: CobrancaGateway }
  | { ok: false; motivo: string };

export function criarCobrancasStore(
  inicial: CobrancaGateway[],
  contasStore: ReturnType<typeof criarContasReceberStore>,
) {
  let itens: CobrancaGateway[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): CobrancaGateway | null =>
    itens.find((c) => c.id === id) ?? null;

  function emitirCobranca(
    contaReceberId: string,
    provedor: ProvedorGateway,
  ): ResultadoEmitirCobranca {
    const conta = contasStore.obter(contaReceberId);
    if (!conta) return { ok: false, motivo: "Conta a receber não encontrada." };
    if (conta.status === "liquidada")
      return {
        ok: false,
        motivo: "Esta conta já foi liquidada; não é possível emitir cobrança.",
      };
    const jaEmitida = itens.find(
      (c) => c.conta_receber_id === contaReceberId && c.status === "pendente",
    );
    if (jaEmitida)
      return { ok: false, motivo: "Já existe uma cobrança pendente para esta conta." };

    const agora = new Date().toISOString();
    const id = crypto.randomUUID();
    const nova: CobrancaGateway = {
      id,
      conta_receber_id: contaReceberId,
      provedor,
      status: "pendente",
      linha_digitavel: gerarLinhaDigitavelMock(id),
      pix_copia_cola: gerarPixCopiaColaMock(id),
      valor: conta.valor,
      emitida_em: agora,
      paga_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [nova, ...itens];
    notificar();
    return { ok: true, cobranca: nova };
  }

  function simularWebhookPago(cobrancaId: string): ResultadoSimularPagamento {
    const cobranca = obter(cobrancaId);
    if (!cobranca) return { ok: false, motivo: "Cobrança não encontrada." };
    if (cobranca.status === "paga") return { ok: false, motivo: "Esta cobrança já foi paga." };
    if (cobranca.status === "cancelada")
      return { ok: false, motivo: "Esta cobrança foi cancelada." };

    const formaRecebimento = cobranca.linha_digitavel ? "boleto" : "pix";
    const agora = new Date().toISOString();
    const baixa = contasStore.darBaixaReceber(cobranca.conta_receber_id, {
      recebido_em: agora.slice(0, 10),
      forma_recebimento: formaRecebimento,
    });
    if (!baixa.ok) return { ok: false, motivo: baixa.motivo };

    const paga: CobrancaGateway = {
      ...cobranca,
      status: "paga",
      paga_em: agora,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === cobrancaId ? paga : c));
    notificar();
    return { ok: true, cobranca: paga };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, emitirCobranca, simularWebhookPago, useTodas };
}

export const cobrancasStore = criarCobrancasStore(seed, contasReceberStore);
```

- [ ] **Step 4: Rodar o teste do store para confirmar que passa**

Run: `npx vitest run src/features/cobranca-gateway/cobrancas-store.test.ts`
Expected: PASS (9/9).

- [ ] **Step 5: Implementar os labels (`src/features/cobranca-gateway/labels.tsx`)**

```typescript
/* eslint-disable react-refresh/only-export-components */
import type { ProvedorGateway, StatusCobranca } from "@/shared/types";
import { cn } from "@/lib/utils";

export const PROVEDOR_GATEWAY_LABEL: Record<ProvedorGateway, string> = {
  mercado_pago: "Mercado Pago",
  asaas: "Asaas",
};

export const STATUS_COBRANCA_LABEL: Record<StatusCobranca, string> = {
  pendente: "Pendente",
  paga: "Paga",
  cancelada: "Cancelada",
};

const STATUS_COBRANCA_CLASS: Record<StatusCobranca, string> = {
  pendente: "bg-steel/20 text-foreground border-steel/40",
  paga: "bg-secondary/25 text-foreground border-secondary/50",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusCobrancaBadge({
  status,
  className,
}: {
  status: StatusCobranca;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_COBRANCA_CLASS[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_COBRANCA_LABEL[status]}
    </span>
  );
}
```

- [ ] **Step 6: Rodar a suíte completa e o typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: todos os testes passam (incluindo os 9 novos do store) + 0 erros de tipo.

- [ ] **Step 7: Commit**

```bash
git add src/features/cobranca-gateway/cobrancas-store.ts src/features/cobranca-gateway/cobrancas-store.test.ts src/features/cobranca-gateway/labels.tsx
git commit -m "feat: add cobrancas-store with mocked emission and webhook simulation (PRD-008)"
```

---

### Task 3: Configuração de provedor ativo + página "Integrações"

**Files:**
- Create: `src/features/integracoes/use-provedor-gateway.ts`
- Create: `src/features/integracoes/components/integracoes-page.tsx`
- Create: `src/features/integracoes/index.ts`
- Create: `src/routes/admin.integracoes.tsx`
- Modify: `src/features/retaguarda/retaguarda-shell.tsx` (novo item de navegação)

**Interfaces:**
- Consome: `ProvedorGateway` (Task 1), `PROVEDOR_GATEWAY_LABEL` (Task 2).
- Produz: `useProvedorGatewayAtivo(): { provedor: ProvedorGateway; setProvedor: (p: ProvedorGateway) => void }`; componente `IntegracoesPage`; rota `/admin/integracoes`.

- [ ] **Step 1: Implementar o hook de persistência (`src/features/integracoes/use-provedor-gateway.ts`)**

Sem teste unitário dedicado (hook idêntico em estrutura a `src/shared/hooks/use-theme.ts`, que também não tem teste — depende de `window.localStorage`, verificado manualmente via QA no navegador ao final do Task 4).

```typescript
import { useEffect, useState } from "react";
import type { ProvedorGateway } from "@/shared/types";

const STORAGE_KEY = "antonello.integracoes.gateway_ativo";
const PADRAO: ProvedorGateway = "mercado_pago";

function getInicial(): ProvedorGateway {
  if (typeof window === "undefined") return PADRAO;
  const salvo = window.localStorage.getItem(STORAGE_KEY) as ProvedorGateway | null;
  if (salvo === "mercado_pago" || salvo === "asaas") return salvo;
  return PADRAO;
}

export function useProvedorGatewayAtivo() {
  const [provedor, setProvedorState] = useState<ProvedorGateway>(PADRAO);

  useEffect(() => {
    setProvedorState(getInicial());
  }, []);

  const setProvedor = (novo: ProvedorGateway) => {
    setProvedorState(novo);
    window.localStorage.setItem(STORAGE_KEY, novo);
  };

  return { provedor, setProvedor };
}
```

- [ ] **Step 2: Implementar a página (`src/features/integracoes/components/integracoes-page.tsx`)**

```tsx
import { PageHeader } from "@/shared/components/page-header";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProvedorGatewayAtivo } from "@/features/integracoes/use-provedor-gateway";
import { PROVEDOR_GATEWAY_LABEL } from "@/features/cobranca-gateway/labels";
import type { ProvedorGateway } from "@/shared/types";

const PROVEDORES_GATEWAY: ProvedorGateway[] = ["mercado_pago", "asaas"];

export function IntegracoesPage() {
  const { provedor, setProvedor } = useProvedorGatewayAtivo();

  return (
    <div className="space-y-6">
      <PageHeader titulo="Integrações" descricao="Provedores externos usados pela plataforma" />

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Gateway de Cobrança
        </h3>
        <p className="text-sm text-muted-foreground">
          Provedor padrão sugerido ao emitir uma nova cobrança (boleto/PIX). Pode ser trocado a
          cada emissão.
        </p>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="provedor-gateway-ativo">Provedor padrão</Label>
          <Select value={provedor} onValueChange={(v) => setProvedor(v as ProvedorGateway)}>
            <SelectTrigger id="provedor-gateway-ativo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVEDORES_GATEWAY.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVEDOR_GATEWAY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Barrel export (`src/features/integracoes/index.ts`)**

```typescript
export { IntegracoesPage } from "@/features/integracoes/components/integracoes-page";
```

- [ ] **Step 4: Rota (`src/routes/admin.integracoes.tsx`)**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegracoesPage } from "@/features/integracoes";

export const Route = createFileRoute("/admin/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: IntegracoesPage,
});
```

- [ ] **Step 5: Regenerar `routeTree.gen.ts`**

Run: `npm run dev` (deixar subir e encerrar após alguns segundos) ou `npm run build` — o plugin `@tanstack/router-plugin` regenera `src/routeTree.gen.ts` automaticamente ao detectar a nova rota em `src/routes/`.
Expected: `src/routeTree.gen.ts` passa a incluir a rota `/admin/integracoes`.

- [ ] **Step 6: Adicionar o item de navegação em `src/features/retaguarda/retaguarda-shell.tsx`**

No bloco de imports do `lucide-react` (linha 3-20), adicionar `Plug` à lista de ícones importados:

```typescript
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  Truck,
  Building2,
  HardHat,
  Receipt,
  Tags,
  FileSpreadsheet,
  Wallet,
  Wrench,
  Fuel,
  Calculator,
  TrendingUp,
  Plug,
  Menu,
  ChevronRight,
} from "lucide-react";
```

No array `itens` (linha 34-49), adicionar como último item:

```typescript
const itens: NavItem[] = [
  { to: "/admin", label: "Dashboard", icone: LayoutDashboard },
  { to: "/admin/ordens", label: "Ordens de Serviço", icone: FileText },
  { to: "/admin/comprovantes", label: "Comprovantes", icone: FileCheck2 },
  { to: "/admin/equipamentos", label: "Equipamentos", icone: Truck },
  { to: "/admin/manutencao", label: "Manutenção", icone: Wrench },
  { to: "/admin/diesel", label: "Diesel", icone: Fuel },
  { to: "/admin/clientes", label: "Clientes", icone: Building2 },
  { to: "/admin/operadores", label: "Operadores", icone: HardHat },
  { to: "/admin/precos", label: "Preços", icone: Tags },
  { to: "/admin/orcamentos", label: "Orçamentos", icone: FileSpreadsheet },
  { to: "/admin/faturamento", label: "Faturamento", icone: Receipt },
  { to: "/admin/financeiro", label: "Financeiro", icone: Wallet },
  { to: "/admin/custo-hora", label: "Custo da Hora", icone: Calculator },
  { to: "/admin/rentabilidade", label: "Rentabilidade", icone: TrendingUp },
  { to: "/admin/integracoes", label: "Integrações", icone: Plug },
];
```

- [ ] **Step 7: Rodar a suíte completa e o typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: todos os testes passam + 0 erros de tipo (nenhum teste novo neste task — só UI/config).

- [ ] **Step 8: Commit**

```bash
git add src/features/integracoes src/routes/admin.integracoes.tsx src/features/retaguarda/retaguarda-shell.tsx src/routeTree.gen.ts
git commit -m "feat: add integracoes settings page with gateway provider selector (PRD-008)"
```

---

### Task 4: Emissão e simulação de pagamento na aba "A Receber"

**Files:**
- Create: `src/features/cobranca-gateway/components/emitir-cobranca-dialog.tsx`
- Modify: `src/features/financeiro/components/contas-receber-tab.tsx`
- Modify: `src/features/financeiro/components/financeiro-page.tsx`
- Modify: `src/features/cobranca-gateway/index.ts`

**Interfaces:**
- Consome: `cobrancasStore` (Task 2), `useProvedorGatewayAtivo` (Task 3), `PROVEDOR_GATEWAY_LABEL`/`StatusCobrancaBadge` (Task 2), `cobrancaDaConta` (Task 1).
- Produz: componente `EmitirCobrancaDialog`; novas props em `ContasReceberTab`: `onEmitirCobranca?: (conta: ContaReceber) => void`, `onSimularPagamento?: (cobranca: CobrancaGateway) => void`.

- [ ] **Step 1: Implementar o diálogo de emissão (`src/features/cobranca-gateway/components/emitir-cobranca-dialog.tsx`)**

```tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
import { PROVEDOR_GATEWAY_LABEL } from "@/features/cobranca-gateway/labels";
import { useProvedorGatewayAtivo } from "@/features/integracoes/use-provedor-gateway";
import type { ContaReceber, ProvedorGateway } from "@/shared/types";

const PROVEDORES: ProvedorGateway[] = ["mercado_pago", "asaas"];

interface EmitirCobrancaDialogProps {
  conta: ContaReceber | null;
  onOpenChange: (open: boolean) => void;
}

export function EmitirCobrancaDialog({ conta, onOpenChange }: EmitirCobrancaDialogProps) {
  const { provedor: provedorPadrao } = useProvedorGatewayAtivo();
  const [provedor, setProvedor] = useState<ProvedorGateway>(provedorPadrao);
  const [emitindo, setEmitindo] = useState(false);

  useEffect(() => {
    if (conta) setProvedor(provedorPadrao);
  }, [conta, provedorPadrao]);

  function handleEmitir() {
    if (!conta) return;
    setEmitindo(true);
    const r = cobrancasStore.emitirCobranca(conta.id, provedor);
    setEmitindo(false);
    if (r.ok) {
      toast.success(`Cobrança emitida via ${PROVEDOR_GATEWAY_LABEL[provedor]}.`);
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={conta !== null}
      onOpenChange={onOpenChange}
      titulo="Emitir Cobrança"
      descricao="Selecione o gateway para gerar o boleto/PIX desta conta."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="provedor-gateway">Gateway</Label>
          <Select value={provedor} onValueChange={(v) => setProvedor(v as ProvedorGateway)}>
            <SelectTrigger id="provedor-gateway">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVEDORES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVEDOR_GATEWAY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEmitir} disabled={emitindo}>
            {emitindo ? "Emitindo…" : "Emitir Cobrança"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
```

- [ ] **Step 2: Adicionar o export ao barrel (`src/features/cobranca-gateway/index.ts`)**

Criar o arquivo (ainda não existe):

```typescript
export { cobrancasStore, criarCobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
export { cobrancaDaConta } from "@/features/cobranca-gateway/derivacoes";
export {
  PROVEDOR_GATEWAY_LABEL,
  STATUS_COBRANCA_LABEL,
  StatusCobrancaBadge,
} from "@/features/cobranca-gateway/labels";
export { EmitirCobrancaDialog } from "@/features/cobranca-gateway/components/emitir-cobranca-dialog";
```

- [ ] **Step 3: Modificar `src/features/financeiro/components/contas-receber-tab.tsx`**

Adicionar aos imports (após `import { StatusContaBadge } from "@/features/financeiro/labels";`):

```typescript
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
import { cobrancaDaConta } from "@/features/cobranca-gateway/derivacoes";
import { PROVEDOR_GATEWAY_LABEL, StatusCobrancaBadge } from "@/features/cobranca-gateway/labels";
```

Adicionar `CobrancaGateway` ao import de types (linha `import type { ContaReceber } from "@/shared/types";`):

```typescript
import type { ContaReceber, CobrancaGateway } from "@/shared/types";
```

Atualizar a interface de props e a assinatura do componente:

```typescript
interface ContasReceberTabProps {
  contasReceber: ContaReceber[];
  onDarBaixa?: (conta: ContaReceber) => void;
  onEmitirCobranca?: (conta: ContaReceber) => void;
  onSimularPagamento?: (cobranca: CobrancaGateway) => void;
}

export function ContasReceberTab({
  contasReceber,
  onDarBaixa,
  onEmitirCobranca,
  onSimularPagamento,
}: ContasReceberTabProps) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const cobrancas = cobrancasStore.useTodas();
```

Adicionar a nova coluna no `<thead>` (entre a coluna "Status" e a última `<th />` vazia):

```tsx
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
  Status
</th>
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
  Cobrança
</th>
<th className="px-4 py-3" />
```

Dentro do `.map((conta) => { ... })`, adicionar o cálculo de `cobranca` (após a linha `const vencida = ...`):

```typescript
const vencida = contaVencida(conta, agoraISO);
const cobranca = conta.status === "aberta" ? cobrancaDaConta(conta.id, cobrancas) : null;
const [ano, mes, dia] = conta.vencimento.split("-");
```

Adicionar a nova `<td>` de Cobrança logo após a `<td>` de Status (`<StatusContaBadge status={conta.status} />`) e antes da última `<td>` (ação "Dar Baixa"):

```tsx
<td className="px-4 py-3">
  <StatusContaBadge status={conta.status} />
</td>
<td className="px-4 py-3">
  {conta.status === "liquidada" ? (
    <span className="text-xs text-foreground-faint">—</span>
  ) : cobranca ? (
    <div className="flex flex-col items-start gap-1.5">
      <StatusCobrancaBadge status={cobranca.status} />
      <span className="text-[11px] text-muted-foreground">
        {PROVEDOR_GATEWAY_LABEL[cobranca.provedor]}
      </span>
      {cobranca.status === "pendente" ? (
        <Button size="sm" variant="outline" onClick={() => onSimularPagamento?.(cobranca)}>
          Simular Pagamento
        </Button>
      ) : null}
    </div>
  ) : (
    <Button size="sm" variant="outline" onClick={() => onEmitirCobranca?.(conta)}>
      Emitir Cobrança
    </Button>
  )}
</td>
<td className="px-4 py-3 text-right">
  {conta.status === "aberta" && (
    <Button size="sm" variant="outline" onClick={() => onDarBaixa?.(conta)}>
      Dar Baixa
    </Button>
  )}
</td>
```

- [ ] **Step 4: Modificar `src/features/financeiro/components/financeiro-page.tsx`**

Adicionar aos imports:

```typescript
import { toast } from "sonner";
import { EmitirCobrancaDialog } from "@/features/cobranca-gateway/components/emitir-cobranca-dialog";
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
```

Atualizar o import de types para incluir `CobrancaGateway`:

```typescript
import type { ContaReceber, ContaPagar, CobrancaGateway } from "@/shared/types";
```

Dentro do componente, adicionar o novo estado e o handler (após `const [novaContaAberta, setNovaContaAberta] = useState(false);`):

```typescript
const [contaParaEmitirCobranca, setContaParaEmitirCobranca] = useState<ContaReceber | null>(null);

function handleSimularPagamento(cobranca: CobrancaGateway) {
  const r = cobrancasStore.simularWebhookPago(cobranca.id);
  if (r.ok) {
    toast.success("Pagamento confirmado (simulado) — conta liquidada automaticamente.");
  } else {
    toast.error(r.motivo);
  }
}
```

Atualizar o uso de `<ContasReceberTab>`:

```tsx
<ContasReceberTab
  contasReceber={contasReceber}
  onDarBaixa={setContaReceberSelecionada}
  onEmitirCobranca={setContaParaEmitirCobranca}
  onSimularPagamento={handleSimularPagamento}
/>
```

Adicionar o diálogo (após `<DarBaixaReceberDialog ... />`):

```tsx
<EmitirCobrancaDialog
  conta={contaParaEmitirCobranca}
  onOpenChange={(open) => {
    if (!open) setContaParaEmitirCobranca(null);
  }}
/>
```

- [ ] **Step 5: Rodar a suíte completa e o typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: todos os testes passam + 0 erros de tipo.

- [ ] **Step 6: QA manual no navegador**

1. `npm run dev`, abrir `/admin/financeiro` (aba "A Receber").
2. Confirmar que `cr-001` mostra badge "Pendente" + "Mercado Pago" + botão "Simular Pagamento" (cobrança `cob-001` do seed).
3. Confirmar que `cr-005` mostra badge "Pendente" + "Asaas" + botão "Simular Pagamento" (cobrança `cob-002` do seed).
4. Confirmar que `cr-002` e `cr-003` (sem cobrança emitida) mostram botão "Emitir Cobrança".
5. Clicar "Emitir Cobrança" em `cr-002`, escolher um provedor, confirmar → toast de sucesso, linha passa a mostrar badge "Pendente" + botão "Simular Pagamento".
6. Clicar "Simular Pagamento" em `cr-001` → toast de sucesso, a linha inteira passa a refletir status "Liquidada" (coluna Status) e a coluna Cobrança mostra "—".
7. Abrir `/admin/integracoes`, trocar o provedor padrão, reabrir o diálogo "Emitir Cobrança" em outra conta e confirmar que o Select já abre com o novo padrão.
8. Validar em 375px/768px/1280px e em tema claro/escuro.
9. Confirmar que nada disso aparece em `/app/*` (grep rápido: `rg -l "cobranca" src/routes/app.*.tsx src/features` não deve retornar nada em rotas `/app`).

- [ ] **Step 7: Commit**

```bash
git add src/features/cobranca-gateway src/features/financeiro/components/contas-receber-tab.tsx src/features/financeiro/components/financeiro-page.tsx
git commit -m "feat: wire cobranca emission and payment simulation into contas a receber (PRD-008)"
```

---

## Final Review & Closure

Após os 4 tasks (com revisão por task via `superpowers:subagent-driven-development`):

1. Revisão final whole-branch (modelo mais capaz disponível).
2. Fechamento do PRD-008 seguindo o fluxo do `CLAUDE.md`:
   - Bump de versão SemVer (MINOR — nova feature) + codinome em inglês (sugestão do próprio PRD: **"Gateway"**).
   - Atualizar `CHANGELOG.md`.
   - Renomear `docs/prds/PRD-008-ret-integracao-gateway-cobranca.md` → `..._DONE.md`, preencher "Status de Implementação".
   - Atualizar `docs/prds/INDEX-PRDs-antonello.md`.
3. `superpowers:finishing-a-development-branch` (merge/PR conforme escolha).
