# PRD-007 Contas a Pagar e Receber — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar o pipeline financeiro (executado → faturado → **recebido**) adicionando as telas de contas a pagar e a receber com dar baixa, nova conta a pagar e resumo de caixa, atualizando o pipeline de faturamento com dados reais de recebimento — tudo mockado, só na retaguarda.

**Architecture:** Feature folder `src/features/financeiro/` com dois stores independentes (padrão `useSyncExternalStore` idêntico ao de faturamentos e orçamentos). A rota `/admin/financeiro` é uma tela com 3 abas (A Receber / A Pagar / Caixa). O pipeline do faturamento (`FaturamentoPipeline`) ganha a coluna "Recebido" com dados reais derivados de `contasReceberStore`.

**Tech Stack:** React 19 + TanStack Router (file-based) + TypeScript strict + Tailwind v4 + shadcn/ui + Iconify (`@iconify/react`, `lucide:*`) + react-hook-form + zod + Vitest

## Global Constraints

- Frontend First (mockado): ZERO Supabase, ZERO fetch real — todos os dados de `src/mocks/`
- **Barreira financeira RF-011:** `src/features/financeiro/` e `src/mocks/contas-*.ts` NUNCA importados em `src/routes/app.*.tsx`, `src/features/operador/**`, `src/features/apontamento/**`
- Sem `any` — usar tipos explícitos ou `unknown`
- Sem `!` non-null — usar optional chaining (`?.`) e `?? null`
- Sem prefixo `I` nos tipos (`ContaReceber`, não `IContaReceber`) — consistência com tipos existentes
- Ícones de aplicação: `@iconify/react` com `lucide:*`; componentes shadcn podem usar lucide-react internamente
- Cores via tokens CSS somente — nunca hexadecimal hardcoded
- Valores monetários: `round2` de `@/features/faturamento/calculo`; exibição via `formatBRL` de `@/features/retaguarda/format`
- `npm run lint` = ruído CRLF no Windows, **NÃO é gate**
- **GATE:** `npx tsc --noEmit` (EXIT 0) + `npx vitest run` (todos os testes passando)
- Commits: Conventional Commits em inglês + `Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>`
- Versão alvo: 0.7.0 "Cashflow"
- Codinome: **Cashflow** (MINOR — novo domínio financeiro completo)

---

## File Map

### Criados neste PRD

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/shared/types/index.ts` *(modificado)* | Append: `StatusConta`, `FormaRecebimento`, `CategoriaDespesa`, `ContaReceber`, `ContaPagar` |
| `src/mocks/contas-receber.ts` | 5 contas a receber mockadas (edge cases: vencida, liquidada, a vencer) |
| `src/mocks/contas-receber.test.ts` | Testes não-tautológicos dos mocks (soma, edge cases) |
| `src/mocks/contas-pagar.ts` | 5 contas a pagar mockadas (edge cases: vencida, liquidada, sem fornecedor) |
| `src/mocks/contas-pagar.test.ts` | Testes não-tautológicos dos mocks |
| `src/features/financeiro/contas-receber-store.ts` | Store singleton: `darBaixaReceber`, `listar`, `obter`, `useTodas`, `useContaReceber` |
| `src/features/financeiro/contas-receber-store.test.ts` | Testa: baixa ok, baixa em liquidada retorna erro, id inexistente retorna erro |
| `src/features/financeiro/contas-pagar-store.ts` | Store singleton: `criar`, `darBaixaPagar`, `listar`, `obter`, `useTodas` |
| `src/features/financeiro/contas-pagar-store.test.ts` | Testa: criar, baixa ok, baixa em liquidada retorna erro |
| `src/features/financeiro/derivacoes.ts` | `contaVencida(conta, agoraISO)`, `resumoCaixa(receber, pagar)` |
| `src/features/financeiro/derivacoes.test.ts` | 7 casos: vencida/não-vencida/liquidada, caixa soma só abertas |
| `src/features/financeiro/labels.tsx` | `StatusContaBadge`, `CATEGORIA_LABEL`, `FORMA_RECEBIMENTO_LABEL` |
| `src/features/financeiro/components/financeiro-page.tsx` | Tabs: A Receber \| A Pagar \| Caixa; carrega stores; `useMockResource` |
| `src/features/financeiro/components/contas-receber-tab.tsx` | Tabela de contas a receber + vencidas destacadas + botão "Dar Baixa" |
| `src/features/financeiro/components/contas-pagar-tab.tsx` | Tabela de contas a pagar + vencidas + botão "Dar Baixa" + "Nova Conta" |
| `src/features/financeiro/components/caixa-tab.tsx` | 3 cards: Total a Receber \| Total a Pagar \| Saldo Previsto |
| `src/features/financeiro/components/dar-baixa-receber-dialog.tsx` | Dialog com data + forma; chama `contasReceberStore.darBaixaReceber` |
| `src/features/financeiro/components/dar-baixa-pagar-dialog.tsx` | Dialog com data; chama `contasPagarStore.darBaixaPagar` |
| `src/features/financeiro/components/nova-conta-pagar-dialog.tsx` | Dialog com form completo; chama `contasPagarStore.criar` |
| `src/features/financeiro/index.ts` | Barrel: `FinanceiroPage` |
| `src/routes/admin.financeiro.index.tsx` | Rota `/admin/financeiro/` (noindex) |

### Modificados neste PRD

| Arquivo | Mudança |
|---------|---------|
| `src/features/retaguarda/retaguarda-shell.tsx` | Append nav item `{ to: "/admin/financeiro", label: "Financeiro", icone: Wallet }` após `{ to: "/admin/faturamento" ... }` |
| `src/features/faturamento/derivacoes.ts` | `resumoPipeline` recebe `contasReceber?: ContaReceber[]`; retorna `recebido: { qtd: number; total: number }` real |
| `src/features/faturamento/components/faturamento-pipeline.tsx` | Props adicionam `recebido: { qtd: number; total: number }`; remove placeholder "Em breve (PRD-007)" |
| `src/features/faturamento/components/faturas-tab.tsx` | Passa `contasReceberStore.useTodas()` para `resumoPipeline`; repassa `pipeline.recebido` para `FaturamentoPipeline` |
| `package.json` | `"version": "0.6.0"` → `"0.7.0"` |
| `CHANGELOG.md` | Entrada `[0.7.0] - 2026-06-30 - Cashflow` |
| `docs/prds/PRD-007-ret-contas-pagar-receber.md` | `git mv` → `PRD-007-ret-contas-pagar-receber_DONE.md`; status → IMPLEMENTADO 0.7.0 |
| `docs/prds/INDEX-PRDs-antonello.md` | Refletir progresso (8/15 = 53% implementado) |

---

## Task 1: Types + Stub Mocks

**Files:**
- Modify: `src/shared/types/index.ts` (append ao final)
- Create stub: `src/mocks/contas-receber.ts`
- Create stub: `src/mocks/contas-pagar.ts`

**Interfaces:**
- Produces: `StatusConta`, `FormaRecebimento`, `CategoriaDespesa`, `ContaReceber`, `ContaPagar` (todos os tipos que T2, T3, T4, T5, T6 usam)

- [ ] **Step 1: Append tipos financeiros em `src/shared/types/index.ts`**

Adicionar ao FINAL do arquivo (após a interface `Orcamento`):

```typescript
// Financeiro (PRD-007) — contas a pagar e a receber. Só retaguarda;
// NUNCA importado/renderizado em /app/*.
export type StatusConta = "aberta" | "liquidada";
export type FormaRecebimento =
  | "dinheiro"
  | "pix"
  | "transferencia"
  | "boleto"
  | "cheque"
  | "outro";
export type CategoriaDespesa = "diesel" | "manutencao" | "folha" | "fornecedor" | "outro";

export interface ContaReceber {
  id: string;
  faturamento_id: string; // FK → Faturamento (PRD-004)
  cliente_id: string; // FK → Cliente (PRD-001)
  valor: number; // espelha Faturamento.valor_total
  vencimento: string; // "YYYY-MM-DD" = faturado_em + 30 dias
  status: StatusConta;
  recebido_em: string | null; // "YYYY-MM-DD"
  forma_recebimento: FormaRecebimento | null;
  created_at: string;
  updated_at: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  status: StatusConta;
  pago_em: string | null; // "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Criar stub `src/mocks/contas-receber.ts`**

```typescript
import type { ContaReceber } from "@/shared/types";

export const contasReceber: ContaReceber[] = [];
```

- [ ] **Step 3: Criar stub `src/mocks/contas-pagar.ts`**

```typescript
import type { ContaPagar } from "@/shared/types";

export const contasPagar: ContaPagar[] = [];
```

- [ ] **Step 4: Verificar tsc**

```bash
npx tsc --noEmit
```

Esperado: EXIT 0, sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types/index.ts src/mocks/contas-receber.ts src/mocks/contas-pagar.ts
git commit -m "feat: add ContaReceber and ContaPagar types; stub mocks

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Real Mocks + Tests

**Files:**
- Modify: `src/mocks/contas-receber.ts` (substituir stub pelo real)
- Create: `src/mocks/contas-receber.test.ts`
- Modify: `src/mocks/contas-pagar.ts` (substituir stub pelo real)
- Create: `src/mocks/contas-pagar.test.ts`

**Interfaces:**
- Consumes: `ContaReceber`, `ContaPagar`, `round2` de `@/features/faturamento/calculo`
- Produces: `contasReceber: ContaReceber[]`, `contasPagar: ContaPagar[]` (usados por T3 stores)

**Context — faturamentos existentes:**
- `fat-001`: cl-003, R$ 5220, faturado em 2026-06-24 → vencimento +30d = 2026-07-24
- `fat-004`: cl-004, R$ 2700, faturado em 2026-06-17 → vencimento +30d = 2026-07-17
- `fat-002` e `fat-003` são rascunho → não geram conta a receber
- `fat-005`, `fat-006`, `fat-007`: referencias futuras (aceitáveis no mock Frontend First)

- [ ] **Step 1: Escrever testes que falham (contas-receber)**

Criar `src/mocks/contas-receber.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { contasReceber } from "./contas-receber";
import { round2 } from "@/features/faturamento/calculo";

describe("mocks/contas-receber", () => {
  it("tem 5 registros", () => {
    expect(contasReceber).toHaveLength(5);
  });

  it("cr-004 está liquidada com forma e data de recebimento", () => {
    const c = contasReceber.find((x) => x.id === "cr-004");
    expect(c?.status).toBe("liquidada");
    expect(c?.recebido_em).toBe("2026-06-25");
    expect(c?.forma_recebimento).toBe("pix");
  });

  it("cr-003 está vencida e aberta (vencimento 2026-06-10)", () => {
    const c = contasReceber.find((x) => x.id === "cr-003");
    expect(c?.status).toBe("aberta");
    expect(c?.vencimento).toBe("2026-06-10");
  });

  it("total abertas bate com soma manual (27720)", () => {
    const abertas = contasReceber.filter((c) => c.status === "aberta");
    const total = round2(abertas.reduce((s, c) => s + c.valor, 0));
    expect(total).toBe(27720); // 5220 + 2700 + 12000 + 7800
  });
});
```

- [ ] **Step 2: Verificar que os testes falham**

```bash
npx vitest run src/mocks/contas-receber.test.ts
```

Esperado: FAIL (array vazio, `toHaveLength(5)` falha).

- [ ] **Step 3: Popular `src/mocks/contas-receber.ts`**

```typescript
import type { ContaReceber } from "@/shared/types";

// Derivadas dos faturamentos confirmados (PRD-004).
// fat-001 (cl-003, 5220, faturado 2026-06-24) e fat-004 (cl-004, 2700, faturado 2026-06-17)
// são os únicos com status "faturado". fat-005/006/007 = referências futuras.
export const contasReceber: ContaReceber[] = [
  {
    id: "cr-001",
    faturamento_id: "fat-001",
    cliente_id: "cl-003",
    valor: 5220,
    vencimento: "2026-07-24", // faturado_em 2026-06-24 + 30 dias
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-24T09:00:00.000Z",
    updated_at: "2026-06-24T09:00:00.000Z",
  },
  {
    id: "cr-002",
    faturamento_id: "fat-004",
    cliente_id: "cl-004",
    valor: 2700,
    vencimento: "2026-07-17", // faturado_em 2026-06-17 + 30 dias
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-17T08:30:00.000Z",
    updated_at: "2026-06-17T08:30:00.000Z",
  },
  {
    id: "cr-003",
    faturamento_id: "fat-005",
    cliente_id: "cl-001",
    valor: 12000,
    vencimento: "2026-06-10", // edge case: vencida em aberto
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-05-11T10:00:00.000Z",
    updated_at: "2026-05-11T10:00:00.000Z",
  },
  {
    id: "cr-004",
    faturamento_id: "fat-006",
    cliente_id: "cl-002",
    valor: 3500,
    vencimento: "2026-06-20",
    status: "liquidada", // edge case: recebida via PIX
    recebido_em: "2026-06-25",
    forma_recebimento: "pix",
    created_at: "2026-05-21T10:00:00.000Z",
    updated_at: "2026-06-25T14:00:00.000Z",
  },
  {
    id: "cr-005",
    faturamento_id: "fat-007",
    cliente_id: "cl-003",
    valor: 7800,
    vencimento: "2026-08-05", // a vencer (prazo maior)
    status: "aberta",
    recebido_em: null,
    forma_recebimento: null,
    created_at: "2026-06-06T10:00:00.000Z",
    updated_at: "2026-06-06T10:00:00.000Z",
  },
];
```

- [ ] **Step 4: Escrever testes que falham (contas-pagar)**

Criar `src/mocks/contas-pagar.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { contasPagar } from "./contas-pagar";
import { round2 } from "@/features/faturamento/calculo";

describe("mocks/contas-pagar", () => {
  it("tem 5 registros", () => {
    expect(contasPagar).toHaveLength(5);
  });

  it("cp-004 está liquidada com data de pagamento", () => {
    const c = contasPagar.find((x) => x.id === "cp-004");
    expect(c?.status).toBe("liquidada");
    expect(c?.pago_em).toBe("2026-06-27");
  });

  it("cp-002 está vencida e aberta (vencimento 2026-06-15)", () => {
    const c = contasPagar.find((x) => x.id === "cp-002");
    expect(c?.status).toBe("aberta");
    expect(c?.vencimento).toBe("2026-06-15");
  });

  it("cp-003 e cp-005 não têm fornecedor", () => {
    const semFornecedor = contasPagar.filter((c) => c.fornecedor === null);
    expect(semFornecedor).toHaveLength(2);
  });

  it("total abertas bate com soma manual (13780)", () => {
    const abertas = contasPagar.filter((c) => c.status === "aberta");
    const total = round2(abertas.reduce((s, c) => s + c.valor, 0));
    expect(total).toBe(13780); // 1800 + 3200 + 8500 + 280
  });
});
```

- [ ] **Step 5: Verificar que falham**

```bash
npx vitest run src/mocks/contas-pagar.test.ts
```

Esperado: FAIL (array vazio).

- [ ] **Step 6: Popular `src/mocks/contas-pagar.ts`**

```typescript
import type { ContaPagar } from "@/shared/types";

export const contasPagar: ContaPagar[] = [
  {
    id: "cp-001",
    descricao: "Abastecimento Junho",
    fornecedor: "Posto Ipiranga",
    categoria: "diesel",
    valor: 1800,
    vencimento: "2026-07-05",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-25T10:00:00.000Z",
    updated_at: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "cp-002",
    descricao: "Revisão escavadeira 10t",
    fornecedor: "Mecânica Silva",
    categoria: "manutencao",
    valor: 3200,
    vencimento: "2026-06-15", // edge case: vencida em aberto
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "cp-003",
    descricao: "Folha de pagamento Junho",
    fornecedor: null, // edge case: sem fornecedor
    categoria: "folha",
    valor: 8500,
    vencimento: "2026-07-05",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-25T10:00:00.000Z",
    updated_at: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "cp-004",
    descricao: "Borrachas e câmaras",
    fornecedor: "Borracharia Rápida",
    categoria: "fornecedor",
    valor: 450,
    vencimento: "2026-06-28",
    status: "liquidada", // edge case: já paga
    pago_em: "2026-06-27",
    created_at: "2026-06-20T09:00:00.000Z",
    updated_at: "2026-06-27T15:00:00.000Z",
  },
  {
    id: "cp-005",
    descricao: "Material de escritório",
    fornecedor: null, // edge case: sem fornecedor
    categoria: "outro",
    valor: 280,
    vencimento: "2026-07-15",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-28T10:00:00.000Z",
    updated_at: "2026-06-28T10:00:00.000Z",
  },
];
```

- [ ] **Step 7: Rodar todos os testes novos**

```bash
npx vitest run src/mocks/contas-receber.test.ts src/mocks/contas-pagar.test.ts
```

Esperado: 9/9 passing (4 + 5 casos).

- [ ] **Step 8: Gate completo**

```bash
npx tsc --noEmit && npx vitest run
```

Esperado: tsc EXIT 0; todos os testes passando.

- [ ] **Step 9: Commit**

```bash
git add src/mocks/contas-receber.ts src/mocks/contas-receber.test.ts src/mocks/contas-pagar.ts src/mocks/contas-pagar.test.ts
git commit -m "feat: add real mock data for contas-receber and contas-pagar with edge cases

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Stores + Derivações + Labels

**Files:**
- Create: `src/features/financeiro/contas-receber-store.ts`
- Create: `src/features/financeiro/contas-receber-store.test.ts`
- Create: `src/features/financeiro/contas-pagar-store.ts`
- Create: `src/features/financeiro/contas-pagar-store.test.ts`
- Create: `src/features/financeiro/derivacoes.ts`
- Create: `src/features/financeiro/derivacoes.test.ts`
- Create: `src/features/financeiro/labels.tsx`

**Interfaces:**
- Consumes: `ContaReceber`, `ContaPagar`, `StatusConta`, `FormaRecebimento`, `CategoriaDespesa` (T1), `round2` de `@/features/faturamento/calculo`, mocks de T2
- Produces:
  - `contasReceberStore.darBaixaReceber(id, { recebido_em, forma_recebimento })` → `ResultadoBaixaReceber`
  - `contasReceberStore.useTodas()` → `ContaReceber[]`
  - `contasPagarStore.criar(nova: NovaContaPagar)` → `ContaPagar`
  - `contasPagarStore.darBaixaPagar(id, pago_em)` → `ResultadoBaixaPagar`
  - `contasPagarStore.useTodas()` → `ContaPagar[]`
  - `contaVencida(conta, agoraISO)` → `boolean`
  - `resumoCaixa(receber, pagar)` → `{ totalReceber, totalPagar, saldoPrevisto }`
  - `StatusContaBadge`, `CATEGORIA_LABEL`, `FORMA_RECEBIMENTO_LABEL`

### Sub-task A: Derivações

- [ ] **Step 1: Escrever testes de derivacoes**

Criar `src/features/financeiro/derivacoes.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { contaVencida, resumoCaixa } from "./derivacoes";
import type { ContaReceber, ContaPagar } from "@/shared/types";

describe("contaVencida", () => {
  it("aberta com vencimento passado → vencida", () => {
    expect(contaVencida({ status: "aberta", vencimento: "2026-06-01" }, "2026-06-30")).toBe(true);
  });

  it("aberta com vencimento futuro → não vencida", () => {
    expect(contaVencida({ status: "aberta", vencimento: "2026-07-10" }, "2026-06-30")).toBe(false);
  });

  it("liquidada com vencimento passado → não vencida (já recebida)", () => {
    expect(contaVencida({ status: "liquidada", vencimento: "2026-06-01" }, "2026-06-30")).toBe(false);
  });

  it("vencimento exatamente hoje → não vencida (estritamente <)", () => {
    expect(contaVencida({ status: "aberta", vencimento: "2026-06-30" }, "2026-06-30")).toBe(false);
  });
});

describe("resumoCaixa", () => {
  const receber: ContaReceber[] = [
    {
      id: "r1",
      faturamento_id: "f1",
      cliente_id: "c1",
      valor: 5000,
      vencimento: "2026-07-01",
      status: "aberta",
      recebido_em: null,
      forma_recebimento: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "r2",
      faturamento_id: "f2",
      cliente_id: "c2",
      valor: 3000,
      vencimento: "2026-07-01",
      status: "liquidada",
      recebido_em: "2026-06-25",
      forma_recebimento: "pix",
      created_at: "",
      updated_at: "",
    },
  ];
  const pagar: ContaPagar[] = [
    {
      id: "p1",
      descricao: "Diesel",
      fornecedor: null,
      categoria: "diesel",
      valor: 2000,
      vencimento: "2026-07-01",
      status: "aberta",
      pago_em: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "p2",
      descricao: "Pago",
      fornecedor: null,
      categoria: "outro",
      valor: 1000,
      vencimento: "2026-06-15",
      status: "liquidada",
      pago_em: "2026-06-14",
      created_at: "",
      updated_at: "",
    },
  ];

  it("totalReceber conta só abertas (5000)", () => {
    expect(resumoCaixa(receber, pagar).totalReceber).toBe(5000);
  });

  it("totalPagar conta só abertas (2000)", () => {
    expect(resumoCaixa(receber, pagar).totalPagar).toBe(2000);
  });

  it("saldoPrevisto = totalReceber - totalPagar (3000)", () => {
    expect(resumoCaixa(receber, pagar).saldoPrevisto).toBe(3000);
  });
});
```

- [ ] **Step 2: Verificar falha**

```bash
npx vitest run src/features/financeiro/derivacoes.test.ts
```

Esperado: FAIL (arquivo não existe).

- [ ] **Step 3: Criar `src/features/financeiro/derivacoes.ts`**

```typescript
import { round2 } from "@/features/faturamento/calculo";
import type { ContaReceber, ContaPagar } from "@/shared/types";

// Vencida = status aberta E vencimento estritamente anterior a agoraISO (YYYY-MM-DD comparação lexical)
export function contaVencida(
  conta: Pick<ContaReceber | ContaPagar, "status" | "vencimento">,
  agoraISO: string,
): boolean {
  return conta.status === "aberta" && conta.vencimento < agoraISO;
}

export function resumoCaixa(
  receber: ContaReceber[],
  pagar: ContaPagar[],
): { totalReceber: number; totalPagar: number; saldoPrevisto: number } {
  const totalReceber = round2(
    receber.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0),
  );
  const totalPagar = round2(
    pagar.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0),
  );
  return { totalReceber, totalPagar, saldoPrevisto: round2(totalReceber - totalPagar) };
}
```

- [ ] **Step 4: Verificar passagem**

```bash
npx vitest run src/features/financeiro/derivacoes.test.ts
```

Esperado: 7/7 passing.

### Sub-task B: Store ContaReceber

- [ ] **Step 5: Escrever testes do store**

Criar `src/features/financeiro/contas-receber-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { criarContasReceberStore } from "./contas-receber-store";
import type { ContaReceber } from "@/shared/types";

const seed: ContaReceber[] = [
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
];

describe("criarContasReceberStore", () => {
  let store: ReturnType<typeof criarContasReceberStore>;

  beforeEach(() => {
    store = criarContasReceberStore(seed);
  });

  it("listar retorna os 2 itens do seed", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("obter retorna item pelo id", () => {
    expect(store.obter("cr-t01")?.valor).toBe(1000);
  });

  it("obter retorna null para id inexistente", () => {
    expect(store.obter("inexistente")).toBeNull();
  });

  it("darBaixaReceber transita aberta → liquidada com data e forma", () => {
    const r = store.darBaixaReceber("cr-t01", {
      recebido_em: "2026-06-30",
      forma_recebimento: "dinheiro",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.conta.status).toBe("liquidada");
      expect(r.conta.recebido_em).toBe("2026-06-30");
      expect(r.conta.forma_recebimento).toBe("dinheiro");
    }
  });

  it("darBaixaReceber em conta já liquidada retorna ok:false", () => {
    const r = store.darBaixaReceber("cr-t02", {
      recebido_em: "2026-06-30",
      forma_recebimento: "pix",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já");
  });

  it("darBaixaReceber em id inexistente retorna ok:false", () => {
    const r = store.darBaixaReceber("xxx", {
      recebido_em: "2026-06-30",
      forma_recebimento: "boleto",
    });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 6: Verificar falha**

```bash
npx vitest run src/features/financeiro/contas-receber-store.test.ts
```

Esperado: FAIL.

- [ ] **Step 7: Criar `src/features/financeiro/contas-receber-store.ts`**

```typescript
import { useSyncExternalStore } from "react";
import { contasReceber as seed } from "@/mocks/contas-receber";
import type { ContaReceber, FormaRecebimento } from "@/shared/types";

export type ResultadoBaixaReceber =
  | { ok: true; conta: ContaReceber }
  | { ok: false; motivo: string };

export type DadosBaixaReceber = {
  recebido_em: string; // "YYYY-MM-DD"
  forma_recebimento: FormaRecebimento;
};

export function criarContasReceberStore(inicial: ContaReceber[]) {
  let itens: ContaReceber[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): ContaReceber | null =>
    itens.find((c) => c.id === id) ?? null;

  function darBaixaReceber(id: string, dados: DadosBaixaReceber): ResultadoBaixaReceber {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Conta a receber não encontrada." };
    if (atual.status === "liquidada")
      return { ok: false, motivo: "Esta conta já foi recebida." };
    const agora = new Date().toISOString();
    const liquidada: ContaReceber = {
      ...atual,
      status: "liquidada",
      recebido_em: dados.recebido_em,
      forma_recebimento: dados.forma_recebimento,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === id ? liquidada : c));
    notificar();
    return { ok: true, conta: liquidada };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
  const useContaReceber = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((c) => c.id === id) ?? null,
      () => itens.find((c) => c.id === id) ?? null,
    );

  return { listar, obter, darBaixaReceber, useTodas, useContaReceber };
}

export const contasReceberStore = criarContasReceberStore(seed);
```

- [ ] **Step 8: Verificar passagem**

```bash
npx vitest run src/features/financeiro/contas-receber-store.test.ts
```

Esperado: 6/6 passing.

### Sub-task C: Store ContaPagar

- [ ] **Step 9: Escrever testes do store ContaPagar**

Criar `src/features/financeiro/contas-pagar-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { criarContasPagarStore } from "./contas-pagar-store";
import type { ContaPagar } from "@/shared/types";

const seed: ContaPagar[] = [
  {
    id: "cp-t01",
    descricao: "Diesel",
    fornecedor: "Posto A",
    categoria: "diesel",
    valor: 500,
    vencimento: "2026-07-01",
    status: "aberta",
    pago_em: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "cp-t02",
    descricao: "Manutenção",
    fornecedor: "Mecânica X",
    categoria: "manutencao",
    valor: 1200,
    vencimento: "2026-06-15",
    status: "liquidada",
    pago_em: "2026-06-14",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-14T00:00:00.000Z",
  },
];

describe("criarContasPagarStore", () => {
  let store: ReturnType<typeof criarContasPagarStore>;

  beforeEach(() => {
    store = criarContasPagarStore(seed);
  });

  it("listar retorna 2 itens", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("criar adiciona nova conta aberta ao início da lista", () => {
    store.criar({
      descricao: "Borracha",
      fornecedor: null,
      categoria: "outro",
      valor: 100,
      vencimento: "2026-07-10",
    });
    const itens = store.listar();
    expect(itens).toHaveLength(3);
    expect(itens[0].descricao).toBe("Borracha");
    expect(itens[0].status).toBe("aberta");
    expect(itens[0].pago_em).toBeNull();
  });

  it("darBaixaPagar transita aberta → liquidada com data", () => {
    const r = store.darBaixaPagar("cp-t01", "2026-06-30");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.conta.status).toBe("liquidada");
      expect(r.conta.pago_em).toBe("2026-06-30");
    }
  });

  it("darBaixaPagar em conta já paga retorna ok:false", () => {
    const r = store.darBaixaPagar("cp-t02", "2026-06-30");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já");
  });

  it("darBaixaPagar em id inexistente retorna ok:false", () => {
    const r = store.darBaixaPagar("xxx", "2026-06-30");
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 10: Verificar falha**

```bash
npx vitest run src/features/financeiro/contas-pagar-store.test.ts
```

Esperado: FAIL.

- [ ] **Step 11: Criar `src/features/financeiro/contas-pagar-store.ts`**

```typescript
import { useSyncExternalStore } from "react";
import { contasPagar as seed } from "@/mocks/contas-pagar";
import type { ContaPagar, CategoriaDespesa } from "@/shared/types";

export type ResultadoBaixaPagar =
  | { ok: true; conta: ContaPagar }
  | { ok: false; motivo: string };

export type NovaContaPagar = {
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
};

export function criarContasPagarStore(inicial: ContaPagar[]) {
  let itens: ContaPagar[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): ContaPagar | null =>
    itens.find((c) => c.id === id) ?? null;

  function criar(nova: NovaContaPagar): ContaPagar {
    const agora = new Date().toISOString();
    const conta: ContaPagar = {
      id: crypto.randomUUID(),
      ...nova,
      status: "aberta",
      pago_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [conta, ...itens];
    notificar();
    return conta;
  }

  function darBaixaPagar(id: string, pago_em: string): ResultadoBaixaPagar {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Conta a pagar não encontrada." };
    if (atual.status === "liquidada")
      return { ok: false, motivo: "Esta conta já foi paga." };
    const agora = new Date().toISOString();
    const liquidada: ContaPagar = {
      ...atual,
      status: "liquidada",
      pago_em,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === id ? liquidada : c));
    notificar();
    return { ok: true, conta: liquidada };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, criar, darBaixaPagar, useTodas };
}

export const contasPagarStore = criarContasPagarStore(seed);
```

- [ ] **Step 12: Verificar passagem**

```bash
npx vitest run src/features/financeiro/contas-pagar-store.test.ts
```

Esperado: 5/5 passing.

### Sub-task D: Labels

- [ ] **Step 13: Criar `src/features/financeiro/labels.tsx`**

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { StatusConta, CategoriaDespesa, FormaRecebimento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_CONTA_LABEL: Record<StatusConta, string> = {
  aberta: "Em Aberto",
  liquidada: "Liquidada",
};

const STATUS_CONTA_CLASS: Record<StatusConta, string> = {
  aberta: "bg-steel/20 text-foreground border-steel/40",
  liquidada: "bg-secondary/25 text-foreground border-secondary/50",
};

export function StatusContaBadge({
  status,
  className,
}: {
  status: StatusConta;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CONTA_CLASS[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_CONTA_LABEL[status]}
    </span>
  );
}

export const CATEGORIA_LABEL: Record<CategoriaDespesa, string> = {
  diesel: "Diesel",
  manutencao: "Manutenção",
  folha: "Folha",
  fornecedor: "Fornecedor",
  outro: "Outro",
};

export const FORMA_RECEBIMENTO_LABEL: Record<FormaRecebimento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  transferencia: "Transferência",
  boleto: "Boleto",
  cheque: "Cheque",
  outro: "Outro",
};
```

- [ ] **Step 14: Gate completo**

```bash
npx tsc --noEmit && npx vitest run
```

Esperado: tsc EXIT 0; todos os testes passando (incluindo os 18 novos de T2+T3).

- [ ] **Step 15: Commit**

```bash
git add src/features/financeiro/
git commit -m "feat: add financeiro stores, derivacoes and labels

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: UI Page + Tabs + Route + Nav

**Files:**
- Create: `src/features/financeiro/components/financeiro-page.tsx`
- Create: `src/features/financeiro/components/contas-receber-tab.tsx`
- Create: `src/features/financeiro/components/contas-pagar-tab.tsx`
- Create: `src/features/financeiro/components/caixa-tab.tsx`
- Create: `src/features/financeiro/index.ts`
- Create: `src/routes/admin.financeiro.index.tsx`
- Modify: `src/features/retaguarda/retaguarda-shell.tsx`

**Interfaces:**
- Consumes: `contasReceberStore.useTodas()`, `contasPagarStore.useTodas()`, `contaVencida`, `resumoCaixa`, `StatusContaBadge`, `CATEGORIA_LABEL`, `formatBRL`, `useMockResource`, `clientesStore.getById`, `faturamentosStore.obter`
- Produces: rota `/admin/financeiro/` registrada no TanStack Router (`routeTree.gen.ts` é regenerado pelo dev server); `FinanceiroPage` exportada pelo barrel

**NOTA:** Os botões "Dar Baixa" e "Nova Conta" são renderizados nas abas T4, mas os dialogs são adicionados na T5. Em T4, os botões ficam presentes mas sem `onClick` ou com `onClick={() => {}}` placeholder — isso é aceitável pois T5 adiciona os dialogs sem alterar a estrutura de tabela.

- [ ] **Step 1: Criar `src/features/financeiro/components/caixa-tab.tsx`** (mais simples, começa aqui)

```tsx
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { resumoCaixa } from "@/features/financeiro/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { ContaReceber, ContaPagar } from "@/shared/types";

interface CaixaTabProps {
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
}

export function CaixaTab({ contasReceber, contasPagar }: CaixaTabProps) {
  const caixa = useMemo(
    () => resumoCaixa(contasReceber, contasPagar),
    [contasReceber, contasPagar],
  );

  const temMovimentacao = contasReceber.length > 0 || contasPagar.length > 0;

  if (!temMovimentacao) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon icon="lucide:wallet" className="mb-3 h-10 w-10 text-foreground-faint" />
        <p className="text-sm font-medium text-foreground">Sem movimentações</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contas a receber e a pagar aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <CaixaCard
        icone="lucide:trending-up"
        rotulo="Total a Receber"
        valor={formatBRL(caixa.totalReceber)}
        descricao="em aberto"
        variante="receber"
      />
      <CaixaCard
        icone="lucide:trending-down"
        rotulo="Total a Pagar"
        valor={formatBRL(caixa.totalPagar)}
        descricao="em aberto"
        variante="pagar"
      />
      <CaixaCard
        icone="lucide:scale"
        rotulo="Saldo Previsto"
        valor={formatBRL(caixa.saldoPrevisto)}
        descricao="a receber − a pagar"
        variante={caixa.saldoPrevisto >= 0 ? "positivo" : "negativo"}
      />
    </div>
  );
}

function CaixaCard({
  icone,
  rotulo,
  valor,
  descricao,
  variante,
}: {
  icone: string;
  rotulo: string;
  valor: string;
  descricao: string;
  variante: "receber" | "pagar" | "positivo" | "negativo";
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
          {rotulo}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon icon={icone} className="h-4 w-4" />
        </span>
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-2xl font-bold",
          variante === "negativo" ? "text-destructive" : "text-card-foreground",
        )}
      >
        {valor}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{descricao}</div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `src/features/financeiro/components/contas-receber-tab.tsx`**

```tsx
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { StatusContaBadge } from "@/features/financeiro/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { formatBRL } from "@/features/retaguarda/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContaReceber } from "@/shared/types";

interface ContasReceberTabProps {
  contasReceber: ContaReceber[];
  onDarBaixa?: (conta: ContaReceber) => void;
}

export function ContasReceberTab({ contasReceber, onDarBaixa }: ContasReceberTabProps) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (contasReceber.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon icon="lucide:inbox" className="mb-3 h-10 w-10 text-foreground-faint" />
        <p className="text-sm font-medium text-foreground">Nenhuma conta a receber</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contas a receber são geradas automaticamente a partir dos faturamentos confirmados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Faturamento
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Valor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vencimento
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {contasReceber.map((conta) => {
            const cliente = clientesStore.getById(conta.cliente_id);
            const fat = faturamentosStore.obter(conta.faturamento_id);
            const vencida = contaVencida(conta, agoraISO);
            const [ano, mes, dia] = conta.vencimento.split("-");
            return (
              <tr key={conta.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{cliente?.nome ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {fat?.numero ?? conta.faturamento_id}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatBRL(conta.valor)}</td>
                <td className="px-4 py-3">
                  <span className={cn(vencida && "font-medium text-destructive")}>
                    {`${dia}/${mes}/${ano}`}
                  </span>
                  {vencida && (
                    <span className="ml-2 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      Vencida
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusContaBadge status={conta.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {conta.status === "aberta" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDarBaixa?.(conta)}
                    >
                      Dar Baixa
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Criar `src/features/financeiro/components/contas-pagar-tab.tsx`**

```tsx
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { StatusContaBadge, CATEGORIA_LABEL } from "@/features/financeiro/labels";
import { formatBRL } from "@/features/retaguarda/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContaPagar } from "@/shared/types";

interface ContasPagarTabProps {
  contasPagar: ContaPagar[];
  onDarBaixa?: (conta: ContaPagar) => void;
  onNovaConta?: () => void;
}

export function ContasPagarTab({ contasPagar, onDarBaixa, onNovaConta }: ContasPagarTabProps) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNovaConta}>
          <Icon icon="lucide:plus" className="mr-1.5 h-4 w-4" />
          Nova Conta a Pagar
        </Button>
      </div>

      {contasPagar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Icon icon="lucide:credit-card" className="mb-3 h-10 w-10 text-foreground-faint" />
          <p className="text-sm font-medium text-foreground">Nenhuma conta a pagar</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Registre despesas como diesel, manutenção, folha, fornecedores
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fornecedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Categoria
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vencimento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {contasPagar.map((conta) => {
                const vencida = contaVencida(conta, agoraISO);
                const [ano, mes, dia] = conta.vencimento.split("-");
                return (
                  <tr key={conta.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{conta.descricao}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {conta.fornecedor ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CATEGORIA_LABEL[conta.categoria]}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatBRL(conta.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(vencida && "font-medium text-destructive")}>
                        {`${dia}/${mes}/${ano}`}
                      </span>
                      {vencida && (
                        <span className="ml-2 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                          Vencida
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusContaBadge status={conta.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {conta.status === "aberta" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDarBaixa?.(conta)}
                        >
                          Dar Baixa
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Criar `src/features/financeiro/components/financeiro-page.tsx`**

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Financeiro"
        descricao="Contas a receber, a pagar e visão de caixa"
      />

      <Tabs defaultValue="receber">
        <TabsList>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
        </TabsList>
        <TabsContent value="receber" className="mt-4">
          <ContasReceberTab contasReceber={contasReceber} />
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab contasPagar={contasPagar} />
        </TabsContent>
        <TabsContent value="caixa" className="mt-4">
          <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 5: Criar barrel `src/features/financeiro/index.ts`**

```typescript
export { FinanceiroPage } from "@/features/financeiro/components/financeiro-page";
```

- [ ] **Step 6: Criar `src/routes/admin.financeiro.index.tsx`**

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { FinanceiroPage } from "@/features/financeiro";

export const Route = createFileRoute("/admin/financeiro/")({
  component: FinanceiroPage,
  head: () => ({
    meta: [
      { title: "Financeiro — Antonello Terraplanagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});
```

- [ ] **Step 7: Adicionar nav item em `src/features/retaguarda/retaguarda-shell.tsx`**

No arquivo `retaguarda-shell.tsx`:

1. Adicionar `Wallet` ao import de `lucide-react` na linha dos imports:
   ```typescript
   import {
     LayoutDashboard,
     FileText,
     Truck,
     Building2,
     HardHat,
     Receipt,
     Tags,
     FileSpreadsheet,
     Wallet,   // ← adicionar
     Menu,
     ChevronRight,
   } from "lucide-react";
   ```

2. Adicionar item ao array `itens` APÓS a entrada de Faturamento:
   ```typescript
   { to: "/admin/faturamento", label: "Faturamento", icone: Receipt },
   { to: "/admin/financeiro", label: "Financeiro", icone: Wallet },  // ← adicionar
   ```

- [ ] **Step 8: Verificar tsc (o dev server regenera routeTree.gen.ts)**

```bash
npx tsc --noEmit
```

**IMPORTANTE:** Se `routeTree.gen.ts` foi modificado só por CRLF (autocrlf Windows), restore-o:
```bash
git diff --numstat -- src/routeTree.gen.ts
# Se 0 0 ou só CRLF: git checkout -- src/routeTree.gen.ts
```

Esperado: EXIT 0.

- [ ] **Step 9: SSR smoke test**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/admin/financeiro/
```

Esperado: `200`. (O dev server já está rodando na porta 8080.)

Se o dev server não estiver rodando, iniciar em background e aguardar antes do curl.

- [ ] **Step 10: Gate**

```bash
npx tsc --noEmit && npx vitest run
```

Esperado: tsc EXIT 0; todos os testes passando.

- [ ] **Step 11: Commit**

```bash
git add src/features/financeiro/ src/routes/admin.financeiro.index.tsx src/features/retaguarda/retaguarda-shell.tsx src/routeTree.gen.ts
git commit -m "feat: add financeiro page with tabs (A Receber, A Pagar, Caixa) and nav item

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Dialogs de Baixa + Nova Conta a Pagar

**Files:**
- Create: `src/features/financeiro/components/dar-baixa-receber-dialog.tsx`
- Create: `src/features/financeiro/components/dar-baixa-pagar-dialog.tsx`
- Create: `src/features/financeiro/components/nova-conta-pagar-dialog.tsx`
- Modify: `src/features/financeiro/components/financeiro-page.tsx` (adicionar state + wiring dos dialogs)

**Interfaces:**
- Consumes:
  - `contasReceberStore.darBaixaReceber(id, { recebido_em, forma_recebimento })`
  - `contasPagarStore.darBaixaPagar(id, pago_em)`
  - `contasPagarStore.criar(nova: NovaContaPagar)`
  - `FormDialog` de `@/shared/components/form-dialog`
  - `toast` de `sonner`
  - `FormaRecebimento`, `CategoriaDespesa`, `ContaReceber`, `ContaPagar`
  - `FORMA_RECEBIMENTO_LABEL`, `CATEGORIA_LABEL`
- Produces: dialogs funcionais com toast de sucesso/erro; `FinanceiroPage` wired com state

**Context:** `FormDialog` de `@/shared/components/form-dialog` é um wrapper simples de shadcn `Dialog` com `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`. Recebe `open`, `onOpenChange`, `titulo`, `descricao`, `children`. Os dialogs de baixa usam `useState` simples (sem `react-hook-form`) pois têm 1-2 campos. `nova-conta-pagar-dialog` usa `react-hook-form` + `zod` por ter 5 campos com validação.

- [ ] **Step 1: Criar `src/features/financeiro/components/dar-baixa-receber-dialog.tsx`**

```tsx
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { FORMA_RECEBIMENTO_LABEL } from "@/features/financeiro/labels";
import type { ContaReceber, FormaRecebimento } from "@/shared/types";

const FORMAS: FormaRecebimento[] = [
  "dinheiro",
  "pix",
  "transferencia",
  "boleto",
  "cheque",
  "outro",
];

interface DarBaixaReceberDialogProps {
  conta: ContaReceber | null;
  onOpenChange: (open: boolean) => void;
}

export function DarBaixaReceberDialog({ conta, onOpenChange }: DarBaixaReceberDialogProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [recebidoEm, setRecebidoEm] = useState(hoje);
  const [forma, setForma] = useState<FormaRecebimento>("pix");
  const [salvando, setSalvando] = useState(false);

  function handleConfirmar() {
    if (!conta) return;
    setSalvando(true);
    const r = contasReceberStore.darBaixaReceber(conta.id, {
      recebido_em: recebidoEm,
      forma_recebimento: forma,
    });
    setSalvando(false);
    if (r.ok) {
      toast.success("Recebimento registrado com sucesso.");
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={conta !== null}
      onOpenChange={onOpenChange}
      titulo="Dar Baixa — Conta a Receber"
      descricao="Informe a data e a forma de recebimento."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="data-recebimento">Data de Recebimento</Label>
          <Input
            id="data-recebimento"
            type="date"
            value={recebidoEm}
            onChange={(e) => setRecebidoEm(e.target.value)}
            max={hoje}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="forma-recebimento">Forma de Recebimento</Label>
          <Select value={forma} onValueChange={(v) => setForma(v as FormaRecebimento)}>
            <SelectTrigger id="forma-recebimento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAS.map((f) => (
                <SelectItem key={f} value={f}>
                  {FORMA_RECEBIMENTO_LABEL[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando || !recebidoEm}>
            {salvando ? "Salvando…" : "Confirmar Recebimento"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
```

- [ ] **Step 2: Criar `src/features/financeiro/components/dar-baixa-pagar-dialog.tsx`**

```tsx
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import type { ContaPagar } from "@/shared/types";

interface DarBaixaPagarDialogProps {
  conta: ContaPagar | null;
  onOpenChange: (open: boolean) => void;
}

export function DarBaixaPagarDialog({ conta, onOpenChange }: DarBaixaPagarDialogProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [pagoEm, setPagoEm] = useState(hoje);
  const [salvando, setSalvando] = useState(false);

  function handleConfirmar() {
    if (!conta) return;
    setSalvando(true);
    const r = contasPagarStore.darBaixaPagar(conta.id, pagoEm);
    setSalvando(false);
    if (r.ok) {
      toast.success("Pagamento registrado com sucesso.");
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={conta !== null}
      onOpenChange={onOpenChange}
      titulo="Dar Baixa — Conta a Pagar"
      descricao={conta ? `Confirmar pagamento: ${conta.descricao}` : undefined}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="data-pagamento">Data de Pagamento</Label>
          <Input
            id="data-pagamento"
            type="date"
            value={pagoEm}
            onChange={(e) => setPagoEm(e.target.value)}
            max={hoje}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando || !pagoEm}>
            {salvando ? "Salvando…" : "Confirmar Pagamento"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
```

- [ ] **Step 3: Criar `src/features/financeiro/components/nova-conta-pagar-dialog.tsx`**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { CATEGORIA_LABEL } from "@/features/financeiro/labels";
import type { CategoriaDespesa } from "@/shared/types";

const CATEGORIAS: CategoriaDespesa[] = [
  "diesel",
  "manutencao",
  "folha",
  "fornecedor",
  "outro",
];

const schema = z.object({
  descricao: z.string().min(3, "Mínimo 3 caracteres"),
  fornecedor: z.string().optional(),
  categoria: z.enum(["diesel", "manutencao", "folha", "fornecedor", "outro"] as const),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  vencimento: z.string().min(10, "Informe a data de vencimento"),
});

type FormData = z.infer<typeof schema>;

interface NovaContaPagarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaContaPagarDialog({ open, onOpenChange }: NovaContaPagarDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { categoria: "diesel" },
  });

  const categoria = watch("categoria");

  function onSubmit(data: FormData) {
    contasPagarStore.criar({
      descricao: data.descricao,
      fornecedor: data.fornecedor?.trim() || null,
      categoria: data.categoria,
      valor: data.valor,
      vencimento: data.vencimento,
    });
    toast.success("Conta a pagar registrada.");
    reset();
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      titulo="Nova Conta a Pagar"
      descricao="Registre uma despesa: diesel, manutenção, folha, fornecedor, etc."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input id="descricao" placeholder="Ex: Abastecimento Julho" {...register("descricao")} />
          {errors.descricao && (
            <p className="text-xs text-destructive">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input id="fornecedor" placeholder="Opcional" {...register("fornecedor")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={categoria}
            onValueChange={(v) => setValue("categoria", v as CategoriaDespesa)}
          >
            <SelectTrigger id="categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria && (
            <p className="text-xs text-destructive">{errors.categoria.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            {...register("valor")}
          />
          {errors.valor && (
            <p className="text-xs text-destructive">{errors.valor.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vencimento">Vencimento *</Label>
          <Input id="vencimento" type="date" {...register("vencimento")} />
          {errors.vencimento && (
            <p className="text-xs text-destructive">{errors.vencimento.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Registrar"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
```

- [ ] **Step 4: Atualizar `src/features/financeiro/components/financeiro-page.tsx`** para wiring dos dialogs

Substituir o conteúdo completo:

```tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { DarBaixaReceberDialog } from "@/features/financeiro/components/dar-baixa-receber-dialog";
import { DarBaixaPagarDialog } from "@/features/financeiro/components/dar-baixa-pagar-dialog";
import { NovaContaPagarDialog } from "@/features/financeiro/components/nova-conta-pagar-dialog";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import type { ContaReceber, ContaPagar } from "@/shared/types";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();

  const [contaReceberSelecionada, setContaReceberSelecionada] = useState<ContaReceber | null>(null);
  const [contaPagarSelecionada, setContaPagarSelecionada] = useState<ContaPagar | null>(null);
  const [novaContaAberta, setNovaContaAberta] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Financeiro"
        descricao="Contas a receber, a pagar e visão de caixa"
      />

      <Tabs defaultValue="receber">
        <TabsList>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
        </TabsList>
        <TabsContent value="receber" className="mt-4">
          <ContasReceberTab
            contasReceber={contasReceber}
            onDarBaixa={setContaReceberSelecionada}
          />
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab
            contasPagar={contasPagar}
            onDarBaixa={setContaPagarSelecionada}
            onNovaConta={() => setNovaContaAberta(true)}
          />
        </TabsContent>
        <TabsContent value="caixa" className="mt-4">
          <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
        </TabsContent>
      </Tabs>

      <DarBaixaReceberDialog
        conta={contaReceberSelecionada}
        onOpenChange={(open) => { if (!open) setContaReceberSelecionada(null); }}
      />
      <DarBaixaPagarDialog
        conta={contaPagarSelecionada}
        onOpenChange={(open) => { if (!open) setContaPagarSelecionada(null); }}
      />
      <NovaContaPagarDialog
        open={novaContaAberta}
        onOpenChange={setNovaContaAberta}
      />
    </div>
  );
}
```

- [ ] **Step 5: Gate**

```bash
npx tsc --noEmit && npx vitest run
```

Esperado: tsc EXIT 0; todos os testes passando.

- [ ] **Step 6: Smoke test de ação**

Com o dev server em `http://localhost:8080`:
1. Navegar para `/admin/financeiro/`
2. Aba "A Receber" → clicar "Dar Baixa" em cr-001 → preencher form → confirmar → toast "Recebimento registrado"
3. Aba "A Pagar" → clicar "Nova Conta a Pagar" → preencher → toast "Conta a pagar registrada"
4. Aba "Caixa" → confirmar que os totais refletem o estado atual

- [ ] **Step 7: Commit**

```bash
git add src/features/financeiro/components/
git commit -m "feat: add dar-baixa and nova-conta-pagar dialogs, wire financeiro page

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Pipeline Update + Barreira + Release 0.7.0 Cashflow

**Files:**
- Modify: `src/features/faturamento/derivacoes.ts`
- Modify: `src/features/faturamento/components/faturamento-pipeline.tsx`
- Modify: `src/features/faturamento/components/faturas-tab.tsx`
- Modify: `package.json`
- Modify: `CHANGELOG.md`
- Rename + Modify: `docs/prds/PRD-007-ret-contas-pagar-receber.md` → `..._DONE.md`
- Modify: `docs/prds/INDEX-PRDs-antonello.md`

**Interfaces:**
- Consumes: `ContaReceber` (shared types, T1), `contasReceberStore.useTodas()` (T3), `resumoPipeline` (existente), `FaturamentoPipeline` (existente)
- Produces: `resumoPipeline` com `recebido: { qtd: number; total: number }` real; coluna "Recebido" com dados ao vivo; release 0.7.0

**Context — código atual que DEVE ser preservado:**

`src/features/faturamento/derivacoes.ts` linha 18-30 (atual):
```typescript
export function resumoPipeline(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
): { executado: number; faturado: { qtd: number; total: number }; recebido: 0 } {
  const fechadas = ordens.filter((o) => o.status === "fechada");
  const faturadas = faturamentos.filter((f) => f.status === "faturado");
  const osFaturadas = new Set(faturadas.map((f) => f.os_id));
  return {
    executado: fechadas.filter((o) => !osFaturadas.has(o.id)).length,
    faturado: { qtd: faturadas.length, total: round2(faturadas.reduce((s, f) => s + f.valor_total, 0)) },
    recebido: 0,
  };
}
```

`src/features/faturamento/components/faturamento-pipeline.tsx` linha 5-8 (atual):
```typescript
interface FaturamentoPipelineProps {
  executado: number;
  faturado: { qtd: number; total: number };
}
```

`src/features/faturamento/components/faturas-tab.tsx` linha 15 (atual):
```typescript
const pipeline = useMemo(() => resumoPipeline(ordens, faturamentos), [ordens, faturamentos]);
```

- [ ] **Step 1: Verificar barreira RF-011**

```bash
grep -r "financeiro" src/routes/app.*.tsx src/features/operador src/features/apontamento 2>/dev/null
```

Esperado: EXIT 1 com zero linhas de match (nenhum arquivo do ambiente operador importa financeiro).

Se houver qualquer match: **PARAR** e corrigir antes de prosseguir.

- [ ] **Step 2: Atualizar `src/features/faturamento/derivacoes.ts`**

Modificar a função `resumoPipeline` e seu import. O novo arquivo completo:

```typescript
import { round2 } from "@/features/faturamento/calculo";
import type { ContaReceber, Faturamento, OrdemServico } from "@/shared/types";

export function faturamentoDaOS(osId: string, faturamentos: Faturamento[]): Faturamento | null {
  return faturamentos.find((f) => f.os_id === osId) ?? null;
}

// OS fechadas sem fatura nenhuma — popula "Aguardando faturamento".
export function osFechadasSemFaturamento(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
): OrdemServico[] {
  return ordens.filter((o) => o.status === "fechada" && faturamentoDaOS(o.id, faturamentos) === null);
}

// Pipeline: executado = fechadas ainda não confirmadas (sem fatura OU rascunho);
// faturado = faturas confirmadas; recebido = contas a receber liquidadas (PRD-007).
export function resumoPipeline(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
  contasReceber: ContaReceber[] = [],
): {
  executado: number;
  faturado: { qtd: number; total: number };
  recebido: { qtd: number; total: number };
} {
  const fechadas = ordens.filter((o) => o.status === "fechada");
  const faturadas = faturamentos.filter((f) => f.status === "faturado");
  const osFaturadas = new Set(faturadas.map((f) => f.os_id));
  const liquidadas = contasReceber.filter((c) => c.status === "liquidada");
  return {
    executado: fechadas.filter((o) => !osFaturadas.has(o.id)).length,
    faturado: {
      qtd: faturadas.length,
      total: round2(faturadas.reduce((s, f) => s + f.valor_total, 0)),
    },
    recebido: {
      qtd: liquidadas.length,
      total: round2(liquidadas.reduce((s, c) => s + c.valor, 0)),
    },
  };
}
```

**ATENÇÃO:** O tipo de retorno mudou de `recebido: 0` para `recebido: { qtd: number; total: number }`. O tsc vai apontar erros nas chamadas existentes de `resumoPipeline` — eles são corrigidos nas etapas seguintes.

- [ ] **Step 3: Atualizar `src/features/faturamento/components/faturamento-pipeline.tsx`**

Substituir o conteúdo completo:

```tsx
import { Icon } from "@iconify/react";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

interface FaturamentoPipelineProps {
  executado: number;
  faturado: { qtd: number; total: number };
  recebido: { qtd: number; total: number };
}

export function FaturamentoPipeline({ executado, faturado, recebido }: FaturamentoPipelineProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Coluna
        icone="lucide:clipboard-check"
        rotulo="Executado"
        principal={`${executado}`}
        secundario="OS a faturar"
      />
      <Coluna
        icone="lucide:receipt"
        rotulo="Faturado"
        principal={formatBRL(faturado.total)}
        secundario={`${faturado.qtd} ${faturado.qtd === 1 ? "fatura" : "faturas"}`}
        destaque
      />
      <Coluna
        icone="lucide:hand-coins"
        rotulo="Recebido"
        principal={recebido.qtd > 0 ? formatBRL(recebido.total) : "—"}
        secundario={
          recebido.qtd > 0
            ? `${recebido.qtd} ${recebido.qtd === 1 ? "recebimento" : "recebimentos"}`
            : "Nenhum recebimento ainda"
        }
      />
    </div>
  );
}

function Coluna({
  icone,
  rotulo,
  principal,
  secundario,
  destaque = false,
}: {
  icone: string;
  rotulo: string;
  principal: string;
  secundario: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        destaque && "border-primary/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
          {rotulo}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon icon={icone} className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 font-mono text-xl font-bold text-card-foreground">{principal}</div>
      <div className="text-xs text-muted-foreground">{secundario}</div>
    </div>
  );
}
```

**Nota:** Removido o parâmetro `esmaecido` (só existia para o placeholder) e a importação da classe `opacity-60`.

- [ ] **Step 4: Atualizar `src/features/faturamento/components/faturas-tab.tsx`**

Substituir o conteúdo completo:

```tsx
import { useMemo } from "react";
import { FaturamentoPipeline } from "@/features/faturamento/components/faturamento-pipeline";
import { AguardandoFaturamento } from "@/features/faturamento/components/aguardando-faturamento";
import { FaturasList } from "@/features/faturamento/components/faturas-list";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { osFechadasSemFaturamento, resumoPipeline } from "@/features/faturamento/derivacoes";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";

export function FaturasTab() {
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();

  const pipeline = useMemo(
    () => resumoPipeline(ordens, faturamentos, contasReceber),
    [ordens, faturamentos, contasReceber],
  );
  const aguardando = useMemo(
    () => osFechadasSemFaturamento(ordens, faturamentos),
    [ordens, faturamentos],
  );

  return (
    <div className="space-y-6">
      <FaturamentoPipeline
        executado={pipeline.executado}
        faturado={pipeline.faturado}
        recebido={pipeline.recebido}
      />
      <AguardandoFaturamento ordens={aguardando} apontamentos={apontamentos} />
      <FaturasList faturamentos={faturamentos} />
    </div>
  );
}
```

- [ ] **Step 5: Verificar tsc**

```bash
npx tsc --noEmit
```

Esperado: EXIT 0. Se houver erro em `faturamento-pipeline.tsx` referenciando `esmaecido`, é porque ele ainda existe em outra chamada — verificar e remover.

- [ ] **Step 6: Rodar todos os testes**

```bash
npx vitest run
```

Esperado: todos passando. Se `derivacoes.test.ts` do faturamento falhar (pois o tipo retornado mudou de `0` para `{ qtd, total }`):

Verificar `src/features/faturamento/derivacoes.test.ts` e atualizar os testes que verificavam `recebido: 0`:
```typescript
// ANTES:
expect(r.recebido).toBe(0)
// DEPOIS:
expect(r.recebido).toStrictEqual({ qtd: 0, total: 0 })
```

- [ ] **Step 7: Bump de versão em `package.json`**

Linha `"version": "0.6.0"` → `"version": "0.7.0"`.

- [ ] **Step 8: Atualizar `CHANGELOG.md`**

Inserir ANTES da entrada `[0.6.0]` existente (ou no topo da seção de versões):

```markdown
## [0.7.0] - 2026-06-30 - Cashflow

### Added
- Contas a Receber: geradas a partir dos faturamentos confirmados; dar baixa com data e forma de recebimento
- Contas a Pagar: registro manual com descrição, fornecedor, categoria, valor e vencimento; dar baixa com data
- Visão de Caixa: resumo de total a receber × total a pagar × saldo previsto
- Destaque de contas vencidas (em aberto com vencimento passado) nas listas
- Nova rota `/admin/financeiro` com abas A Receber, A Pagar e Caixa
- Coluna "Recebido" do pipeline de faturamento exibe dados reais de recebimentos liquidados

### Changed
- Pipeline executado → faturado → **recebido** completo com dados ao vivo
- Sidebar da retaguarda: novo item "Financeiro" após "Faturamento"
```

- [ ] **Step 9: Renomear PRD e atualizar status**

```bash
git mv docs/prds/PRD-007-ret-contas-pagar-receber.md docs/prds/PRD-007-ret-contas-pagar-receber_DONE.md
```

No arquivo renomeado, atualizar a seção "Status de Implementação":

```markdown
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-30 |
| **Versão do App** | 0.7.0 Cashflow |
| **Implementado por** | Claude Code (Sonnet 4.6) via SDD |
| **Observações** | Frontend First (mockado). Pipeline recebido ativo. |
```

- [ ] **Step 10: Atualizar `docs/prds/INDEX-PRDs-antonello.md`**

Localizar a linha do PRD-007 e atualizar status para ✅ e versão 0.7.0.

Localizar os contadores globais e atualizar:
- "PRDs Implementados": +1 (de 7 para **8**)
- "PRDs Pendentes": -1 (de 8 para **7**)
- "% Implementado": 8/15 = **53%**
- "PRDs Documentados": se existir linha separada, atualizar conforme contagem real

- [ ] **Step 11: Gate final**

```bash
npx tsc --noEmit && npx vitest run
```

Esperado: tsc EXIT 0; todos os testes passando.

- [ ] **Step 12: Verificar barreira uma última vez**

```bash
grep -r "financeiro" src/routes/app.*.tsx src/features/operador src/features/apontamento 2>/dev/null
echo "Exit code: $?"
```

Esperado: EXIT 1 (nenhum match).

- [ ] **Step 13: Commit final**

```bash
git add -A
git commit -m "feat: complete PRD-007 financeiro — pipeline recebido, release 0.7.0 Cashflow

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

### Spec Coverage

| Requisito | Tarefa | Status |
|-----------|--------|--------|
| RF-001 Gerar conta a receber a partir de faturamento | T2 mocks, T3 store | ✅ |
| RF-002 Listar contas a receber | T4 aba A Receber | ✅ |
| RF-003 Dar baixa conta a receber | T5 DarBaixaReceberDialog | ✅ |
| RF-004 Visões a vencer/vencidas | T4 destaque na tabela | ✅ |
| RF-005 Registrar conta a pagar | T5 NovaContaPagarDialog | ✅ |
| RF-006 Listar contas a pagar | T4 aba A Pagar | ✅ |
| RF-007 Dar baixa conta a pagar | T5 DarBaixaPagarDialog | ✅ |
| RF-008 Categorizar despesa | T2 mocks + T5 form | ✅ |
| RF-009 Resumo de caixa | T3 `resumoCaixa`, T4 CaixaTab | ✅ |
| RF-010 Pipeline recebido | T6 atualiza `resumoPipeline` + `FaturamentoPipeline` | ✅ |
| RF-011 Barreira financeira no operador | T6 grep + 0 matches | ✅ |
| Vencidas destacadas | T4 destaque na tabela | ✅ |
| Empty states | T4 todos os 3 componentes de aba | ✅ |
| Versão 0.7.0 Cashflow | T6 package.json + CHANGELOG | ✅ |
| PRD renomeado _DONE | T6 git mv | ✅ |
| INDEX atualizado | T6 | ✅ |

### Placeholder Scan

- Todos os steps têm código completo ✅
- Nenhum "TBD" ou "TODO" ✅
- Comandos com saída esperada ✅

### Type Consistency

- `ContaReceber` / `ContaPagar` definidos em T1, usados em T2, T3, T4, T5, T6 ✅
- `ResultadoBaixaReceber` / `ResultadoBaixaPagar`: `{ ok: true; conta: X } | { ok: false; motivo: string }` ✅
- `DadosBaixaReceber`: `{ recebido_em: string; forma_recebimento: FormaRecebimento }` ✅
- `NovaContaPagar`: `{ descricao, fornecedor, categoria, valor, vencimento }` ✅
- `resumoPipeline` retorna `recebido: { qtd: number; total: number }` em T6 ✅
- `contasReceberStore.useTodas()` → `ContaReceber[]`; `contasPagarStore.useTodas()` → `ContaPagar[]` ✅
