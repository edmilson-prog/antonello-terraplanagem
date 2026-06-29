# PRD-005 — Tabela de Preços · Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o CRUD mockado das tabelas de preço da retaguarda (`/admin/precos`) —
hora-máquina (seca/operada), por metro (fundação) e mobilização — sem jamais expor
valores ao app do operador.

**Architecture:** Feature isolada `src/features/precos/` com três entidades CRUD
independentes numa única rota com abas (`Tabs`). Reusa os primitivos do PRD-001
(`createMockStore`, `DataList`, `FormDialog`, `ConfirmDialog`, `PageHeader`,
`useMockResource`). Valores em reais (`number`, 2 casas); entrada via `CurrencyInput`
mascarado; exibição via `brlExato`/`formatBRL`.

**Tech Stack:** React 19 + TanStack Router (file-based) + Vite + TypeScript strict +
Tailwind v4 + shadcn/ui + react-hook-form + zod + sonner + Iconify. Testes: vitest
(node, `src/**/*.test.ts`).

## Global Constraints

- **Barreira financeira (RF-011/RNF-001):** nada de `src/features/precos/`,
  `src/mocks/precos-*` ou `brlExato`/`formatBRL` pode ser importado por
  `src/routes/app.*`, `src/features/operador/` ou `src/features/apontamento/`.
- **Sem `any`** — usar tipo específico ou `unknown`.
- **Types sem prefixo `I`** — `PrecoHoraMaquina`, `PrecoFundacao`, `PrecoMobilizacao`
  (consistência com `Equipamento`/`Apontamento` no mesmo arquivo).
- **Vínculo derivado** — `PrecoHoraMaquina` NÃO tem campo `vinculo`; deriva de qual FK
  está preenchida. Exatamente uma de `equipamento_id`/`tipo_equipamento` é não-nula.
- **Valores positivos (RF-010)** — todo valor monetário e o diâmetro usam zod
  `.positive()` (rejeita 0, negativo e `NaN`).
- **Soft delete** — inativar via `setAtivo(id, false)`, nunca apagar.
- **Tokens do design system** — sem cor/fonte hardcoded; classes utilitárias e
  componentes shadcn como no PRD-001.
- **Não modificar `brl`** (0 casas) em `retaguarda/format.ts` — apenas adicionar
  `brlExato`/`formatBRL`.
- **Gate de verificação:** `npx tsc --noEmit` (EXIT 0, autoritativo) + `npm test`
  (vitest). `npm run lint` é ruído CRLF pré-existente — não é gate.
- **Commits:** Conventional Commits; rodapé
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/shared/types/index.ts` (append) | 3 types do contrato de preço |
| `src/features/retaguarda/format.ts` (append) | `brlExato` (2 casas) + `formatBRL()` |
| `src/features/precos/money.ts` | helpers puros de parse/format do input monetário |
| `src/features/precos/precos-schema.ts` | 3 schemas zod + refine do vínculo |
| `src/features/precos/labels.ts` | `VinculoPreco`, `VINCULOS`, `VINCULO_LABEL`, `descreverVinculo` |
| `src/features/precos/precos-{hora-maquina,fundacao,mobilizacao}-store.ts` | 3 singletons `createMockStore` |
| `src/features/precos/components/currency-input.tsx` | input monetário mascarado, controlado |
| `src/features/precos/components/precos-page.tsx` | rota: header + `Tabs` |
| `src/features/precos/components/preco-*-{list,form}.tsx` | lista + formulário por entidade |
| `src/features/precos/index.ts` | barrel: `PrecosPage` + 3 stores |
| `src/mocks/precos-{hora-maquina,fundacao,mobilizacao}.ts` | seeds com edge cases |
| `src/routes/admin.precos.tsx` | `createFileRoute("/admin/precos")` |
| `src/features/retaguarda/retaguarda-shell.tsx` (modify) | +1 item de nav "Preços" |

---

## Task 1: Fundação — types, formatador BRL e helpers de dinheiro

**Files:**
- Modify: `src/shared/types/index.ts` (append)
- Modify: `src/features/retaguarda/format.ts` (append)
- Create: `src/features/precos/money.ts`
- Test: `src/features/precos/money.test.ts`

**Interfaces:**
- Produces: types `PrecoHoraMaquina`, `PrecoFundacao`, `PrecoMobilizacao`;
  `brlExato`, `formatBRL(reais: number): string`;
  `somenteDigitos(raw: string): string`, `parseValorInput(raw: string): number`,
  `formatValorInput(reais: number): string`.

- [ ] **Step 1: Escrever o teste de `money.ts` (falha)**

```typescript
// src/features/precos/money.test.ts
import { describe, expect, it } from "vitest";
import { somenteDigitos, parseValorInput, formatValorInput } from "@/features/precos/money";

describe("somenteDigitos", () => {
  it("remove tudo que não é dígito", () => {
    expect(somenteDigitos("R$ 1.234,56")).toBe("123456");
    expect(somenteDigitos("")).toBe("");
    expect(somenteDigitos("abc")).toBe("");
  });
});

describe("parseValorInput", () => {
  it("interpreta dígitos como centavos e retorna reais", () => {
    expect(parseValorInput("")).toBe(0);
    expect(parseValorInput("5")).toBe(0.05);
    expect(parseValorInput("500")).toBe(5);
    expect(parseValorInput("123456")).toBe(1234.56);
  });
  it("ignora máscara existente", () => {
    expect(parseValorInput("R$ 9,90")).toBe(9.9);
    expect(parseValorInput("1.234,56")).toBe(1234.56);
  });
});

describe("formatValorInput", () => {
  it("formata reais com 2 casas e separador de milhar (sem R$)", () => {
    expect(formatValorInput(0.05)).toBe("0,05");
    expect(formatValorInput(5)).toBe("5,00");
    expect(formatValorInput(1234.56)).toBe("1.234,56");
  });
  it("faz round-trip com parseValorInput", () => {
    expect(parseValorInput(formatValorInput(1234.56))).toBe(1234.56);
    expect(parseValorInput(formatValorInput(9.9))).toBe(9.9);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `npx vitest run src/features/precos/money.test.ts`
Expected: FAIL (módulo `money` não existe).

- [ ] **Step 3: Implementar `money.ts`**

```typescript
// src/features/precos/money.ts
// Helpers puros do input monetário (BRL). O valor canônico é sempre em REAIS
// (number, 2 casas). A entrada interpreta os dígitos digitados como centavos,
// montando o valor da direita para a esquerda (padrão de campo monetário).

const valorFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function somenteDigitos(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function parseValorInput(raw: string): number {
  const digitos = somenteDigitos(raw);
  if (!digitos) return 0;
  return Number(digitos) / 100;
}

export function formatValorInput(reais: number): string {
  return valorFormatter.format(reais);
}
```

- [ ] **Step 4: Acrescentar os types ao contrato**

Append ao final de `src/shared/types/index.ts`:

```typescript

// Preços (PRD-005) — geridos só na retaguarda; jamais expostos ao operador.
// Vínculo do preço hora-máquina é DERIVADO: exatamente uma de equipamento_id /
// tipo_equipamento é não-nula (sem campo `vinculo` no contrato).
export interface PrecoHoraMaquina {
  id: string;
  equipamento_id: string | null; // preenchido p/ vínculo por equipamento específico
  tipo_equipamento: TipoEquipamento | null; // preenchido p/ vínculo por tipo/porte
  valor_hora_seca: number; // R$/h sem operador (reais, 2 casas)
  valor_hora_operada: number; // R$/h com operador
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrecoFundacao {
  id: string;
  diametro_broca_mm: number; // ex.: 300, 400, 500
  valor_metro: number; // R$/m
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrecoMobilizacao {
  id: string;
  descricao: string; // ex.: "Mobilização escavadeira até 50km"
  valor: number; // R$
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 5: Acrescentar o formatador BRL exato**

Append ao final de `src/features/retaguarda/format.ts`:

```typescript

// BRL com 2 casas decimais (RNF-002 do PRD-005). Distinto de `brl` (0 casas, usado
// nos totais do faturamento mockado). Arquivo da retaguarda — nunca importar no operador.
export const brlExato = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(reais: number): string {
  return brlExato.format(reais);
}
```

- [ ] **Step 6: Rodar os testes e o gate**

Run: `npx vitest run src/features/precos/money.test.ts && npx tsc --noEmit`
Expected: testes PASS; tsc EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add src/shared/types/index.ts src/features/retaguarda/format.ts src/features/precos/money.ts src/features/precos/money.test.ts
git commit -m "feat: add preco types, BRL formatter and money input helpers"
```

---

## Task 2: Schemas de validação (zod) + testes

**Files:**
- Create: `src/features/precos/precos-schema.ts`
- Test: `src/features/precos/precos-schema.test.ts`

**Interfaces:**
- Consumes: `TipoEquipamento` (shared types).
- Produces: `precoHoraMaquinaSchema`, `precoFundacaoSchema`, `precoMobilizacaoSchema`
  e os tipos `PrecoHoraMaquinaFormValues`, `PrecoFundacaoFormValues`,
  `PrecoMobilizacaoFormValues`. O campo de form `vinculo: "equipamento" | "tipo"`.

- [ ] **Step 1: Escrever o teste dos schemas (falha)**

```typescript
// src/features/precos/precos-schema.test.ts
import { describe, expect, it } from "vitest";
import {
  precoHoraMaquinaSchema,
  precoFundacaoSchema,
  precoMobilizacaoSchema,
} from "@/features/precos/precos-schema";

describe("precoHoraMaquinaSchema", () => {
  const base = { valor_hora_seca: 280, valor_hora_operada: 360, ativo: true };

  it("aceita vínculo por equipamento com id", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(true);
  });

  it("aceita vínculo por tipo com tipo_equipamento", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      vinculo: "tipo",
      tipo_equipamento: "carregadeira",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita vínculo por equipamento sem id", () => {
    const r = precoHoraMaquinaSchema.safeParse({ ...base, vinculo: "equipamento" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "equipamento_id")).toBe(true);
    }
  });

  it("rejeita vínculo por tipo sem tipo_equipamento", () => {
    const r = precoHoraMaquinaSchema.safeParse({ ...base, vinculo: "tipo" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "tipo_equipamento")).toBe(true);
    }
  });

  it("rejeita valor seca zero", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      valor_hora_seca: 0,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita valor operada negativo", () => {
    const r = precoHoraMaquinaSchema.safeParse({
      ...base,
      valor_hora_operada: -10,
      vinculo: "equipamento",
      equipamento_id: "eq-001",
    });
    expect(r.success).toBe(false);
  });
});

describe("precoFundacaoSchema", () => {
  it("aceita diâmetro e valor positivos", () => {
    const r = precoFundacaoSchema.safeParse({
      diametro_broca_mm: 300,
      valor_metro: 90,
      ativo: true,
    });
    expect(r.success).toBe(true);
  });
  it("rejeita diâmetro zero", () => {
    const r = precoFundacaoSchema.safeParse({
      diametro_broca_mm: 0,
      valor_metro: 90,
      ativo: true,
    });
    expect(r.success).toBe(false);
  });
  it("rejeita valor por metro negativo", () => {
    const r = precoFundacaoSchema.safeParse({
      diametro_broca_mm: 300,
      valor_metro: -1,
      ativo: true,
    });
    expect(r.success).toBe(false);
  });
});

describe("precoMobilizacaoSchema", () => {
  it("aceita descrição e valor válidos", () => {
    const r = precoMobilizacaoSchema.safeParse({
      descricao: "Mobilização escavadeira",
      valor: 850,
      ativo: true,
    });
    expect(r.success).toBe(true);
  });
  it("rejeita valor zero", () => {
    const r = precoMobilizacaoSchema.safeParse({
      descricao: "Mobilização",
      valor: 0,
      ativo: true,
    });
    expect(r.success).toBe(false);
  });
  it("rejeita descrição curta", () => {
    const r = precoMobilizacaoSchema.safeParse({ descricao: "", valor: 850, ativo: true });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run src/features/precos/precos-schema.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `precos-schema.ts`**

```typescript
// src/features/precos/precos-schema.ts
import { z } from "zod";

// Valores do form da hora-máquina incluem `vinculo` (estado local do form que decide
// qual FK gravar); o contrato/store NÃO tem esse campo.
const TIPO_VALUES = [
  "escavadeira",
  "carregadeira",
  "caminhao_cacamba",
  "trator_esteira",
  "retroescavadeira",
  "outro",
] as const;

const valorPositivo = (msg = "Informe um valor maior que zero") =>
  z.number({ invalid_type_error: "Informe um valor válido" }).positive(msg);

export const precoHoraMaquinaSchema = z
  .object({
    vinculo: z.enum(["equipamento", "tipo"]),
    equipamento_id: z.string().optional(),
    tipo_equipamento: z.enum(TIPO_VALUES).optional(),
    valor_hora_seca: valorPositivo(),
    valor_hora_operada: valorPositivo(),
    ativo: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.vinculo === "equipamento" && !val.equipamento_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["equipamento_id"],
        message: "Selecione o equipamento",
      });
    }
    if (val.vinculo === "tipo" && !val.tipo_equipamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipo_equipamento"],
        message: "Selecione o tipo de equipamento",
      });
    }
  });

export const precoFundacaoSchema = z.object({
  diametro_broca_mm: z
    .number({ invalid_type_error: "Informe o diâmetro" })
    .positive("Informe o diâmetro em mm"),
  valor_metro: valorPositivo(),
  descricao: z.string().trim().optional(),
  ativo: z.boolean(),
});

export const precoMobilizacaoSchema = z.object({
  descricao: z.string().trim().min(2, "Informe a descrição"),
  valor: valorPositivo(),
  ativo: z.boolean(),
});

export type PrecoHoraMaquinaFormValues = z.infer<typeof precoHoraMaquinaSchema>;
export type PrecoFundacaoFormValues = z.infer<typeof precoFundacaoSchema>;
export type PrecoMobilizacaoFormValues = z.infer<typeof precoMobilizacaoSchema>;
```

- [ ] **Step 4: Rodar os testes e o gate**

Run: `npx vitest run src/features/precos/precos-schema.test.ts && npx tsc --noEmit`
Expected: testes PASS; tsc EXIT 0.

- [ ] **Step 5: Commit**

```bash
git add src/features/precos/precos-schema.ts src/features/precos/precos-schema.test.ts
git commit -m "feat: add preco zod schemas with vinculo refine"
```

---

## Task 3: Camada de dados — mocks + stores + teste de invariantes

**Files:**
- Create: `src/mocks/precos-hora-maquina.ts`
- Create: `src/mocks/precos-fundacao.ts`
- Create: `src/mocks/precos-mobilizacao.ts`
- Create: `src/features/precos/precos-hora-maquina-store.ts`
- Create: `src/features/precos/precos-fundacao-store.ts`
- Create: `src/features/precos/precos-mobilizacao-store.ts`
- Test: `src/mocks/precos.test.ts`

**Interfaces:**
- Consumes: types de preço (T1); `createMockStore`; `equipamentos` mock (validação de FK).
- Produces: `precosHoraMaquina`, `precosFundacao`, `precosMobilizacao` (arrays);
  `precoHoraMaquinaStore`, `precoFundacaoStore`, `precoMobilizacaoStore`
  (`MockStore<T>`: `getAll/getById/useAll/create/update/setAtivo`).

- [ ] **Step 1: Escrever o teste de invariantes (falha)**

```typescript
// src/mocks/precos.test.ts
import { describe, expect, it } from "vitest";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import { precosMobilizacao } from "@/mocks/precos-mobilizacao";
import { equipamentos } from "@/mocks/equipamentos";

describe("mocks de preço hora-máquina", () => {
  it("tem exatamente uma FK preenchida por registro", () => {
    for (const p of precosHoraMaquina) {
      const temEquip = p.equipamento_id !== null;
      const temTipo = p.tipo_equipamento !== null;
      expect(temEquip !== temTipo).toBe(true); // XOR
    }
  });
  it("referencia equipamentos existentes quando vinculado por equipamento", () => {
    const ids = new Set(equipamentos.map((e) => e.id));
    for (const p of precosHoraMaquina) {
      if (p.equipamento_id) expect(ids.has(p.equipamento_id)).toBe(true);
    }
  });
  it("tem valores seca e operada positivos", () => {
    for (const p of precosHoraMaquina) {
      expect(p.valor_hora_seca).toBeGreaterThan(0);
      expect(p.valor_hora_operada).toBeGreaterThan(0);
    }
  });
  it("inclui edge cases: ao menos 1 inativo, 1 por tipo, 1 com seca === operada", () => {
    expect(precosHoraMaquina.some((p) => !p.ativo)).toBe(true);
    expect(precosHoraMaquina.some((p) => p.tipo_equipamento !== null)).toBe(true);
    expect(
      precosHoraMaquina.some((p) => p.valor_hora_seca === p.valor_hora_operada),
    ).toBe(true);
  });
});

describe("mocks de preço fundação", () => {
  it("tem diâmetro e valor por metro positivos", () => {
    for (const p of precosFundacao) {
      expect(p.diametro_broca_mm).toBeGreaterThan(0);
      expect(p.valor_metro).toBeGreaterThan(0);
    }
  });
  it("inclui ao menos 1 inativo", () => {
    expect(precosFundacao.some((p) => !p.ativo)).toBe(true);
  });
});

describe("mocks de mobilização", () => {
  it("tem valor positivo e descrição não vazia", () => {
    for (const p of precosMobilizacao) {
      expect(p.valor).toBeGreaterThan(0);
      expect(p.descricao.trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run src/mocks/precos.test.ts`
Expected: FAIL (mocks não existem).

- [ ] **Step 3: Criar `src/mocks/precos-hora-maquina.ts`**

```typescript
import type { PrecoHoraMaquina } from "@/shared/types";

// ~5 preços. Edge cases: mix equipamento/tipo, 1 inativo (phm-005),
// 1 com seca === operada (phm-004), preços por tipo sem equipamento (phm-003/004).
export const precosHoraMaquina: PrecoHoraMaquina[] = [
  {
    id: "phm-001",
    equipamento_id: "eq-001",
    tipo_equipamento: null,
    valor_hora_seca: 280,
    valor_hora_operada: 360,
    ativo: true,
    created_at: "2025-01-15T12:00:00.000Z",
    updated_at: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "phm-002",
    equipamento_id: "eq-002",
    tipo_equipamento: null,
    valor_hora_seca: 220,
    valor_hora_operada: 290,
    ativo: true,
    created_at: "2025-01-15T12:00:00.000Z",
    updated_at: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "phm-003",
    equipamento_id: null,
    tipo_equipamento: "carregadeira",
    valor_hora_seca: 180,
    valor_hora_operada: 240,
    ativo: true,
    created_at: "2025-02-01T12:00:00.000Z",
    updated_at: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "phm-004",
    equipamento_id: null,
    tipo_equipamento: "trator_esteira",
    valor_hora_seca: 200,
    valor_hora_operada: 200,
    ativo: true,
    created_at: "2025-02-01T12:00:00.000Z",
    updated_at: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "phm-005",
    equipamento_id: "eq-005",
    tipo_equipamento: null,
    valor_hora_seca: 150,
    valor_hora_operada: 190,
    ativo: false,
    created_at: "2024-08-20T12:00:00.000Z",
    updated_at: "2025-12-01T12:00:00.000Z",
  },
];
```

- [ ] **Step 4: Criar `src/mocks/precos-fundacao.ts`**

```typescript
import type { PrecoFundacao } from "@/shared/types";

// 3 diâmetros com valores distintos. Edge: 1 inativo (pf-003), 1 sem descrição.
export const precosFundacao: PrecoFundacao[] = [
  {
    id: "pf-001",
    diametro_broca_mm: 300,
    valor_metro: 90,
    descricao: "Estaca escavada Ø300mm",
    ativo: true,
    created_at: "2025-03-01T12:00:00.000Z",
    updated_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "pf-002",
    diametro_broca_mm: 400,
    valor_metro: 130,
    descricao: "Estaca escavada Ø400mm",
    ativo: true,
    created_at: "2025-03-01T12:00:00.000Z",
    updated_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "pf-003",
    diametro_broca_mm: 500,
    valor_metro: 175,
    descricao: null,
    ativo: false,
    created_at: "2024-09-10T12:00:00.000Z",
    updated_at: "2025-11-05T12:00:00.000Z",
  },
];
```

- [ ] **Step 5: Criar `src/mocks/precos-mobilizacao.ts`**

```typescript
import type { PrecoMobilizacao } from "@/shared/types";

// 2 itens. Edge: pm-002 com descrição longa.
export const precosMobilizacao: PrecoMobilizacao[] = [
  {
    id: "pm-001",
    descricao: "Mobilização e desmobilização de escavadeira até 50 km do pátio",
    valor: 850,
    ativo: true,
    created_at: "2025-04-01T12:00:00.000Z",
    updated_at: "2026-02-15T12:00:00.000Z",
  },
  {
    id: "pm-002",
    descricao:
      "Transporte em prancha na região metropolitana, ida e volta no mesmo dia, equipamento de médio porte, com escolta quando exigida pela legislação municipal de trânsito",
    valor: 1200,
    ativo: true,
    created_at: "2025-04-01T12:00:00.000Z",
    updated_at: "2026-02-15T12:00:00.000Z",
  },
];
```

- [ ] **Step 6: Criar os 3 stores**

```typescript
// src/features/precos/precos-hora-maquina-store.ts
import { createMockStore } from "@/shared/lib/create-mock-store";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import type { PrecoHoraMaquina } from "@/shared/types";

export const precoHoraMaquinaStore = createMockStore<PrecoHoraMaquina>(precosHoraMaquina);
```

```typescript
// src/features/precos/precos-fundacao-store.ts
import { createMockStore } from "@/shared/lib/create-mock-store";
import { precosFundacao } from "@/mocks/precos-fundacao";
import type { PrecoFundacao } from "@/shared/types";

export const precoFundacaoStore = createMockStore<PrecoFundacao>(precosFundacao);
```

```typescript
// src/features/precos/precos-mobilizacao-store.ts
import { createMockStore } from "@/shared/lib/create-mock-store";
import { precosMobilizacao } from "@/mocks/precos-mobilizacao";
import type { PrecoMobilizacao } from "@/shared/types";

export const precoMobilizacaoStore = createMockStore<PrecoMobilizacao>(precosMobilizacao);
```

- [ ] **Step 7: Rodar os testes e o gate**

Run: `npx vitest run src/mocks/precos.test.ts && npx tsc --noEmit`
Expected: testes PASS; tsc EXIT 0.

- [ ] **Step 8: Commit**

```bash
git add src/mocks/precos-hora-maquina.ts src/mocks/precos-fundacao.ts src/mocks/precos-mobilizacao.ts src/features/precos/precos-hora-maquina-store.ts src/features/precos/precos-fundacao-store.ts src/features/precos/precos-mobilizacao-store.ts src/mocks/precos.test.ts
git commit -m "feat: add preco mocks and in-memory stores"
```

---

## Task 4: Primitivos de UI — labels e CurrencyInput

**Files:**
- Create: `src/features/precos/labels.ts`
- Create: `src/features/precos/components/currency-input.tsx`

**Interfaces:**
- Consumes: `money.ts` (T1); `TIPO_LABEL` (equipamentos/labels); types de preço.
- Produces: `VinculoPreco`, `VINCULOS`, `VINCULO_LABEL`,
  `descreverVinculo(preco, equipamentos): string`; componente `CurrencyInput`
  (`{ id?, value: number, onChange: (reais: number) => void, error?, placeholder?, className? }`).

- [ ] **Step 1: Criar `labels.ts`**

```typescript
// src/features/precos/labels.ts
import type { Equipamento, PrecoHoraMaquina } from "@/shared/types";
import { TIPO_LABEL } from "@/features/equipamentos/labels";

// `vinculo` é estado de formulário (qual FK gravar), não pertence ao contrato.
export type VinculoPreco = "equipamento" | "tipo";

export const VINCULOS: VinculoPreco[] = ["equipamento", "tipo"];

export const VINCULO_LABEL: Record<VinculoPreco, string> = {
  equipamento: "Equipamento específico",
  tipo: "Tipo de equipamento",
};

// Descrição legível do vínculo de um preço hora-máquina, resolvendo o nome do
// equipamento a partir da lista atual (reativo a mudanças no cadastro).
export function descreverVinculo(
  preco: Pick<PrecoHoraMaquina, "equipamento_id" | "tipo_equipamento">,
  equipamentos: Equipamento[],
): string {
  if (preco.equipamento_id) {
    const eq = equipamentos.find((e) => e.id === preco.equipamento_id);
    return eq ? eq.nome : "Equipamento removido";
  }
  if (preco.tipo_equipamento) {
    return `Tipo: ${TIPO_LABEL[preco.tipo_equipamento]}`;
  }
  return "—";
}
```

- [ ] **Step 2: Criar `currency-input.tsx`**

```tsx
// src/features/precos/components/currency-input.tsx
import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatValorInput, parseValorInput } from "@/features/precos/money";

interface CurrencyInputProps {
  id?: string;
  value: number; // reais
  onChange: (reais: number) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

// Campo monetário controlado: mantém o valor em reais (number) no form, exibe a
// máscara "R$ 1.234,56" montando os centavos da direita. Entrada vazia => 0.
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ id, value, onChange, error, placeholder, className }, ref) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
          R$
        </span>
        <Input
          ref={ref}
          id={id}
          inputMode="decimal"
          className={cn("pl-9 font-mono tabular-nums", className)}
          value={value > 0 ? formatValorInput(value) : ""}
          placeholder={placeholder ?? "0,00"}
          aria-invalid={error}
          onChange={(e) => onChange(parseValorInput(e.target.value))}
        />
      </div>
    );
  },
);
```

- [ ] **Step 3: Rodar o gate**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/precos/labels.ts src/features/precos/components/currency-input.tsx
git commit -m "feat: add preco labels and currency input component"
```

---

## Task 5: Hora-Máquina — formulário e lista

**Files:**
- Create: `src/features/precos/components/preco-hora-maquina-form.tsx`
- Create: `src/features/precos/components/preco-hora-maquina-list.tsx`

**Interfaces:**
- Consumes: `precoHoraMaquinaStore`, `precoHoraMaquinaSchema`/`PrecoHoraMaquinaFormValues`,
  `CurrencyInput`, `VINCULOS`/`VINCULO_LABEL`/`descreverVinculo`, `equipamentosStore`,
  `TIPOS`/`TIPO_LABEL`, `formatBRL`, `DataList`/`FormDialog`/`ConfirmDialog`/`useMockResource`,
  `StatusAtivo`.
- Produces: `PrecoHoraMaquinaForm`, `PrecoHoraMaquinaList`.

- [ ] **Step 1: Criar `preco-hora-maquina-form.tsx`**

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import {
  precoHoraMaquinaSchema,
  type PrecoHoraMaquinaFormValues,
} from "@/features/precos/precos-schema";
import { VINCULOS, VINCULO_LABEL } from "@/features/precos/labels";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPOS, TIPO_LABEL } from "@/features/equipamentos/labels";
import type { PrecoHoraMaquina } from "@/shared/types";

interface Props {
  inicial: PrecoHoraMaquina | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrecoHoraMaquinaForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrecoHoraMaquinaFormValues>({
    resolver: zodResolver(precoHoraMaquinaSchema),
    defaultValues: {
      vinculo: inicial?.tipo_equipamento ? "tipo" : "equipamento",
      equipamento_id: inicial?.equipamento_id ?? undefined,
      tipo_equipamento: inicial?.tipo_equipamento ?? undefined,
      valor_hora_seca: inicial?.valor_hora_seca ?? 0,
      valor_hora_operada: inicial?.valor_hora_operada ?? 0,
      ativo: inicial?.ativo ?? true,
    },
  });

  const vinculo = watch("vinculo");

  const onSubmit = (values: PrecoHoraMaquinaFormValues) => {
    const payload = {
      equipamento_id:
        values.vinculo === "equipamento" ? (values.equipamento_id ?? null) : null,
      tipo_equipamento:
        values.vinculo === "tipo" ? (values.tipo_equipamento ?? null) : null,
      valor_hora_seca: values.valor_hora_seca,
      valor_hora_operada: values.valor_hora_operada,
      ativo: values.ativo,
    };
    if (inicial) {
      precoHoraMaquinaStore.update(inicial.id, payload);
      toast.success("Preço atualizado.");
    } else {
      precoHoraMaquinaStore.create(payload);
      toast.success("Preço cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="vinculo">Vincular a *</Label>
        <Controller
          control={control}
          name="vinculo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="vinculo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VINCULOS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {VINCULO_LABEL[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {vinculo === "equipamento" ? (
        <div className="space-y-1.5">
          <Label htmlFor="equipamento_id">Equipamento *</Label>
          <Controller
            control={control}
            name="equipamento_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="equipamento_id" aria-invalid={!!errors.equipamento_id}>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipamentos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.equipamento_id ? (
            <p className="text-xs text-destructive">{errors.equipamento_id.message}</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="tipo_equipamento">Tipo de equipamento *</Label>
          <Controller
            control={control}
            name="tipo_equipamento"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="tipo_equipamento"
                  aria-invalid={!!errors.tipo_equipamento}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo_equipamento ? (
            <p className="text-xs text-destructive">{errors.tipo_equipamento.message}</p>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="valor_hora_seca">Valor hora seca *</Label>
          <Controller
            control={control}
            name="valor_hora_seca"
            render={({ field }) => (
              <CurrencyInput
                id="valor_hora_seca"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor_hora_seca}
              />
            )}
          />
          {errors.valor_hora_seca ? (
            <p className="text-xs text-destructive">{errors.valor_hora_seca.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valor_hora_operada">Valor hora operada *</Label>
          <Controller
            control={control}
            name="valor_hora_operada"
            render={({ field }) => (
              <CurrencyInput
                id="valor_hora_operada"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor_hora_operada}
              />
            )}
          />
          {errors.valor_hora_operada ? (
            <p className="text-xs text-destructive">{errors.valor_hora_operada.message}</p>
          ) : null}
        </div>
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Preço ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não são oferecidos a novos faturamentos, mas ficam no histórico.
              </p>
            </div>
            <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {inicial ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Criar `preco-hora-maquina-list.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatBRL } from "@/features/retaguarda/format";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { descreverVinculo } from "@/features/precos/labels";
import { PrecoHoraMaquinaForm } from "@/features/precos/components/preco-hora-maquina-form";
import type { PrecoHoraMaquina } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PrecoHoraMaquinaList() {
  const todos = precoHoraMaquinaStore.useAll();
  const equipamentos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PrecoHoraMaquina | null>(null);
  const [inativando, setInativando] = useState<PrecoHoraMaquina | null>(null);

  const lista = useMemo(
    () => todos.filter((p) => mostrarInativos || p.ativo),
    [todos, mostrarInativos],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PrecoHoraMaquina) => {
    setEditando(p);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    precoHoraMaquinaStore.setAtivo(inativando.id, false);
    toast.success("Preço inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoHoraMaquina) => {
    precoHoraMaquinaStore.setAtivo(p.id, true);
    toast.success("Preço reativado.");
  };

  const columns: Column<PrecoHoraMaquina>[] = [
    {
      header: "Vínculo",
      cell: (p) => (
        <span className={cn("font-medium text-foreground", !p.ativo && "opacity-60")}>
          {descreverVinculo(p, equipamentos)}
        </span>
      ),
    },
    {
      header: "Hora seca",
      className: "font-mono",
      cell: (p) => formatBRL(p.valor_hora_seca),
    },
    {
      header: "Hora operada",
      className: "font-mono",
      cell: (p) => formatBRL(p.valor_hora_operada),
    },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PrecoHoraMaquina) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(p)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {p.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(p)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(p)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (p: PrecoHoraMaquina) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 font-display font-bold text-card-foreground">
          {descreverVinculo(p, equipamentos)}
        </div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Hora seca</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_hora_seca)}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Hora operada</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_hora_operada)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(p)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
      <Button
        onClick={abrirNovo}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Novo preço
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataList
        data={lista}
        columns={columns}
        getRowKey={(p) => p.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:banknote",
          titulo:
            todos.length === 0 ? "Nenhum preço cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro preço de hora-máquina."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro preço
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar preço hora-máquina" : "Novo preço hora-máquina"}
        descricao="Os campos com * são obrigatórios."
      >
        <PrecoHoraMaquinaForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar preço?"
        descricao="Este preço deixa de ser oferecido a novos faturamentos, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 3: Rodar o gate**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/precos/components/preco-hora-maquina-form.tsx src/features/precos/components/preco-hora-maquina-list.tsx
git commit -m "feat: add preco hora-maquina form and list"
```

---

## Task 6: Por Metro (Fundação) — formulário e lista

**Files:**
- Create: `src/features/precos/components/preco-fundacao-form.tsx`
- Create: `src/features/precos/components/preco-fundacao-list.tsx`

**Interfaces:**
- Consumes: `precoFundacaoStore`, `precoFundacaoSchema`/`PrecoFundacaoFormValues`,
  `CurrencyInput`, `formatBRL`, primitivos de lista, `StatusAtivo`.
- Produces: `PrecoFundacaoForm`, `PrecoFundacaoList`.

- [ ] **Step 1: Criar `preco-fundacao-form.tsx`**

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import {
  precoFundacaoSchema,
  type PrecoFundacaoFormValues,
} from "@/features/precos/precos-schema";
import type { PrecoFundacao } from "@/shared/types";

interface Props {
  inicial: PrecoFundacao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrecoFundacaoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PrecoFundacaoFormValues>({
    resolver: zodResolver(precoFundacaoSchema),
    defaultValues: {
      diametro_broca_mm: inicial?.diametro_broca_mm ?? 0,
      valor_metro: inicial?.valor_metro ?? 0,
      descricao: inicial?.descricao ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: PrecoFundacaoFormValues) => {
    const payload = {
      diametro_broca_mm: values.diametro_broca_mm,
      valor_metro: values.valor_metro,
      descricao: values.descricao?.trim() ? values.descricao.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      precoFundacaoStore.update(inicial.id, payload);
      toast.success("Preço atualizado.");
    } else {
      precoFundacaoStore.create(payload);
      toast.success("Preço cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="diametro_broca_mm">Diâmetro da broca (mm) *</Label>
          <Input
            id="diametro_broca_mm"
            type="number"
            step="1"
            min="0"
            className="font-mono"
            placeholder="ex.: 300"
            {...register("diametro_broca_mm", { valueAsNumber: true })}
            aria-invalid={!!errors.diametro_broca_mm}
          />
          {errors.diametro_broca_mm ? (
            <p className="text-xs text-destructive">{errors.diametro_broca_mm.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valor_metro">Valor por metro *</Label>
          <Controller
            control={control}
            name="valor_metro"
            render={({ field }) => (
              <CurrencyInput
                id="valor_metro"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor_metro}
              />
            )}
          />
          {errors.valor_metro ? (
            <p className="text-xs text-destructive">{errors.valor_metro.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          placeholder="opcional — ex.: Estaca escavada Ø300mm"
          {...register("descricao")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Preço ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não são oferecidos a novos faturamentos, mas ficam no histórico.
              </p>
            </div>
            <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {inicial ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Criar `preco-fundacao-list.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatBRL } from "@/features/retaguarda/format";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { PrecoFundacaoForm } from "@/features/precos/components/preco-fundacao-form";
import type { PrecoFundacao } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PrecoFundacaoList() {
  const todos = precoFundacaoStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PrecoFundacao | null>(null);
  const [inativando, setInativando] = useState<PrecoFundacao | null>(null);

  const lista = useMemo(
    () => todos.filter((p) => mostrarInativos || p.ativo),
    [todos, mostrarInativos],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PrecoFundacao) => {
    setEditando(p);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    precoFundacaoStore.setAtivo(inativando.id, false);
    toast.success("Preço inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoFundacao) => {
    precoFundacaoStore.setAtivo(p.id, true);
    toast.success("Preço reativado.");
  };

  const columns: Column<PrecoFundacao>[] = [
    {
      header: "Diâmetro",
      className: "font-mono",
      cell: (p) => (
        <span className={cn(!p.ativo && "opacity-60")}>{p.diametro_broca_mm} mm</span>
      ),
    },
    {
      header: "Valor/metro",
      className: "font-mono",
      cell: (p) => formatBRL(p.valor_metro),
    },
    {
      header: "Descrição",
      cell: (p) => (
        <span className="text-muted-foreground">{p.descricao ?? "—"}</span>
      ),
    },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PrecoFundacao) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(p)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {p.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(p)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(p)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (p: PrecoFundacao) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-display font-bold text-card-foreground">
          <span className="font-mono">{p.diametro_broca_mm} mm</span>
        </div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Valor/metro</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_metro)}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Descrição</dt>
          <dd className="text-foreground">{p.descricao ?? "—"}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(p)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
      <Button
        onClick={abrirNovo}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Novo preço
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataList
        data={lista}
        columns={columns}
        getRowKey={(p) => p.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:drill",
          titulo: todos.length === 0 ? "Nenhum preço por metro" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro preço por diâmetro de broca."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro preço
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar preço por metro" : "Novo preço por metro"}
        descricao="Os campos com * são obrigatórios."
      >
        <PrecoFundacaoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar preço?"
        descricao="Este preço deixa de ser oferecido a novos faturamentos, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 3: Rodar o gate**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/precos/components/preco-fundacao-form.tsx src/features/precos/components/preco-fundacao-list.tsx
git commit -m "feat: add preco fundacao form and list"
```

---

## Task 7: Mobilização — formulário e lista

**Files:**
- Create: `src/features/precos/components/preco-mobilizacao-form.tsx`
- Create: `src/features/precos/components/preco-mobilizacao-list.tsx`

**Interfaces:**
- Consumes: `precoMobilizacaoStore`, `precoMobilizacaoSchema`/`PrecoMobilizacaoFormValues`,
  `CurrencyInput`, `formatBRL`, primitivos de lista, `StatusAtivo`.
- Produces: `PrecoMobilizacaoForm`, `PrecoMobilizacaoList`.

- [ ] **Step 1: Criar `preco-mobilizacao-form.tsx`**

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import {
  precoMobilizacaoSchema,
  type PrecoMobilizacaoFormValues,
} from "@/features/precos/precos-schema";
import type { PrecoMobilizacao } from "@/shared/types";

interface Props {
  inicial: PrecoMobilizacao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrecoMobilizacaoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PrecoMobilizacaoFormValues>({
    resolver: zodResolver(precoMobilizacaoSchema),
    defaultValues: {
      descricao: inicial?.descricao ?? "",
      valor: inicial?.valor ?? 0,
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: PrecoMobilizacaoFormValues) => {
    const payload = {
      descricao: values.descricao.trim(),
      valor: values.valor,
      ativo: values.ativo,
    };
    if (inicial) {
      precoMobilizacaoStore.update(inicial.id, payload);
      toast.success("Mobilização atualizada.");
    } else {
      precoMobilizacaoStore.create(payload);
      toast.success("Mobilização cadastrada.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="ex.: Mobilização escavadeira até 50km"
          {...register("descricao")}
          aria-invalid={!!errors.descricao}
        />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor *</Label>
        <Controller
          control={control}
          name="valor"
          render={({ field }) => (
            <CurrencyInput
              id="valor"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.valor}
            />
          )}
        />
        {errors.valor ? (
          <p className="text-xs text-destructive">{errors.valor.message}</p>
        ) : null}
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Item ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não são oferecidos a novos faturamentos, mas ficam no histórico.
              </p>
            </div>
            <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {inicial ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Criar `preco-mobilizacao-list.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatBRL } from "@/features/retaguarda/format";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import { PrecoMobilizacaoForm } from "@/features/precos/components/preco-mobilizacao-form";
import type { PrecoMobilizacao } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PrecoMobilizacaoList() {
  const todos = precoMobilizacaoStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PrecoMobilizacao | null>(null);
  const [inativando, setInativando] = useState<PrecoMobilizacao | null>(null);

  const lista = useMemo(
    () => todos.filter((p) => mostrarInativos || p.ativo),
    [todos, mostrarInativos],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PrecoMobilizacao) => {
    setEditando(p);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    precoMobilizacaoStore.setAtivo(inativando.id, false);
    toast.success("Item inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoMobilizacao) => {
    precoMobilizacaoStore.setAtivo(p.id, true);
    toast.success("Item reativado.");
  };

  const columns: Column<PrecoMobilizacao>[] = [
    {
      header: "Descrição",
      cell: (p) => (
        <div className={cn("min-w-0 max-w-[28rem]", !p.ativo && "opacity-60")}>
          <span className="text-foreground">{p.descricao}</span>
        </div>
      ),
    },
    { header: "Valor", className: "font-mono", cell: (p) => formatBRL(p.valor) },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PrecoMobilizacao) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(p)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {p.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(p)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(p)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (p: PrecoMobilizacao) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm font-medium text-card-foreground">{p.descricao}</div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-foreground">{formatBRL(p.valor)}</span>
        {rowActions(p)}
      </div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
      <Button
        onClick={abrirNovo}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Novo item
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataList
        data={lista}
        columns={columns}
        getRowKey={(p) => p.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:truck",
          titulo: todos.length === 0 ? "Nenhuma mobilização" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro valor de mobilização/transporte."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeira mobilização
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar mobilização" : "Nova mobilização"}
        descricao="Os campos com * são obrigatórios."
      >
        <PrecoMobilizacaoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar item?"
        descricao="Este item deixa de ser oferecido a novos faturamentos, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 3: Rodar o gate**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/precos/components/preco-mobilizacao-form.tsx src/features/precos/components/preco-mobilizacao-list.tsx
git commit -m "feat: add preco mobilizacao form and list"
```

---

## Task 8: Página com abas, rota, barrel e item de navegação

**Files:**
- Create: `src/features/precos/components/precos-page.tsx`
- Create: `src/features/precos/index.ts`
- Create: `src/routes/admin.precos.tsx`
- Modify: `src/features/retaguarda/retaguarda-shell.tsx`

**Interfaces:**
- Consumes: as 3 listas (T5-T7); `PageHeader`; `Tabs`.
- Produces: `PrecosPage`; rota `/admin/precos`; item de nav "Preços".

- [ ] **Step 1: Criar `precos-page.tsx`**

```tsx
import { PageHeader } from "@/shared/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";
import { PrecoFundacaoList } from "@/features/precos/components/preco-fundacao-list";
import { PrecoMobilizacaoList } from "@/features/precos/components/preco-mobilizacao-list";

export function PrecosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Tabela de Preços"
        descricao="Valores que alimentam orçamento e faturamento. Visível apenas na retaguarda."
      />

      <Tabs defaultValue="hora-maquina" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="hora-maquina">Hora-Máquina</TabsTrigger>
          <TabsTrigger value="por-metro">Por Metro</TabsTrigger>
          <TabsTrigger value="mobilizacao">Mobilização</TabsTrigger>
        </TabsList>

        <TabsContent value="hora-maquina">
          <PrecoHoraMaquinaList />
        </TabsContent>
        <TabsContent value="por-metro">
          <PrecoFundacaoList />
        </TabsContent>
        <TabsContent value="mobilizacao">
          <PrecoMobilizacaoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Criar o barrel `index.ts`**

```typescript
// src/features/precos/index.ts
export { PrecosPage } from "@/features/precos/components/precos-page";
export { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
export { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
export { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
```

- [ ] **Step 3: Criar a rota `admin.precos.tsx`**

```tsx
// src/routes/admin.precos.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PrecosPage } from "@/features/precos";

export const Route = createFileRoute("/admin/precos")({
  head: () => ({
    meta: [
      { title: "Preços · Antonello" },
      {
        name: "description",
        content: "Tabela de preços (hora-máquina e por metro) da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PrecosPage,
});
```

- [ ] **Step 4: Adicionar o item de navegação no shell**

Em `src/features/retaguarda/retaguarda-shell.tsx`:

1. Acrescentar `Tags` ao import de `lucide-react`:

```typescript
import {
  LayoutDashboard,
  FileText,
  Truck,
  Building2,
  HardHat,
  Receipt,
  Tags,
  Menu,
  ChevronRight,
} from "lucide-react";
```

2. Inserir o item entre "Operadores" e "Faturamento" no array `itens`:

```typescript
const itens: NavItem[] = [
  { to: "/admin", label: "Dashboard", icone: LayoutDashboard },
  { to: "/admin/ordens", label: "Ordens de Serviço", icone: FileText },
  { to: "/admin/equipamentos", label: "Equipamentos", icone: Truck },
  { to: "/admin/clientes", label: "Clientes", icone: Building2 },
  { to: "/admin/operadores", label: "Operadores", icone: HardHat },
  { to: "/admin/precos", label: "Preços", icone: Tags },
  { to: "/admin/faturamento", label: "Faturamento", icone: Receipt },
];
```

- [ ] **Step 5: Regenerar o routeTree e rodar o gate**

O dev server (:8082) regenera `src/routeTree.gen.ts` ao detectar a nova rota. Se não
regenerar, rode `npm run build` para forçar. Confirmar que `AdminPrecosRoute` aparece
em `src/routeTree.gen.ts`, depois:

Run: `npx tsc --noEmit && npm test`
Expected: tsc EXIT 0; suíte completa PASS.

- [ ] **Step 6: Smoke SSR**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/admin/precos`
Expected: `200`. (Verificar render das 3 abas e ausência de erro no console.)

- [ ] **Step 7: Commit**

```bash
git add src/features/precos/components/precos-page.tsx src/features/precos/index.ts src/routes/admin.precos.tsx src/features/retaguarda/retaguarda-shell.tsx src/routeTree.gen.ts
git commit -m "feat: add precos page with tabs, route and sidebar nav"
```

---

## Task 9: Barreira financeira + release (versão, changelog, PRD, INDEX)

**Files:**
- Modify: `package.json`
- Modify: `CHANGELOG.md`
- Rename: `docs/prds/PRD-005-ret-tabela-precos.md` → `..._DONE.md` (+ preencher status)
- Modify: `docs/prds/INDEX-PRDs-antonello.md`

**Interfaces:** nenhuma (tarefa de verificação + bookkeeping).

- [ ] **Step 1: Verificar a barreira financeira (deve não retornar nada)**

Run:
```bash
grep -rEn "features/precos|mocks/precos|brlExato|formatBRL" src/routes/app.* src/features/operador src/features/apontamento
```
Expected: **nenhuma saída** (exit 1). Qualquer match é violação da barreira — parar e corrigir.

- [ ] **Step 2: Bump de versão**

Em `package.json`, alterar `"version": "0.2.0"` → `"version": "0.3.0"`.

- [ ] **Step 3: Atualizar o `CHANGELOG.md`**

Inserir no topo da lista de versões (acima de `## [0.2.0]`):

```markdown
## [0.3.0] - 2026-06-28 - Tariff

### Added
- Tabela de preços na retaguarda (`/admin/precos`) com três abas: hora-máquina
  (valor seca/operada, vínculo por equipamento ou por tipo), por metro (fundação,
  por diâmetro de broca) e mobilização/transporte.
- Tipos de contrato `PrecoHoraMaquina`, `PrecoFundacao`, `PrecoMobilizacao`.
- Componente de entrada monetária `CurrencyInput` (máscara R$, 2 casas) e
  formatador `formatBRL`/`brlExato`.
- CRUD em memória com soft-delete (inativar/reativar) e validação de valores
  positivos.

### Security
- Barreira financeira: nada de `features/precos` é importado pelo ambiente do
  operador (`/app/*`); valores de preço nunca são carregados no app de campo.
```

- [ ] **Step 4: Marcar o PRD como concluído**

Renomear `docs/prds/PRD-005-ret-tabela-precos.md` →
`docs/prds/PRD-005-ret-tabela-precos_DONE.md` e atualizar a seção "Status de
Implementação":

```markdown
## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-28 |
| **Versão do App** | 0.3.0 (Tariff) |
| **Implementado por** | Claude Opus 4.8 (Claude Code CLI) |
| **Observações** | Frontend First / mockado. Vínculo hora-máquina por equipamento OU tipo. 3 abas (inclui mobilização). Types sem prefixo `I` p/ consistência. |
```

- [ ] **Step 5: Atualizar o `INDEX-PRDs-antonello.md`**

Corrigir a contagem de implementados (está defasada em 0 mesmo após PRD-001/002):
- Tabela "Informações do Projeto": **PRDs Implementados** → 3; **Versão Atual** → 0.3.0 (Tariff).
- "Resumo de Status (implementação)": ✅ Implementado **3** (20%), ⏳ Pendente **12** (80%).
- Roadmap Onda 1: status de PRD-001, PRD-002 e PRD-005 → ✅; ajustar o link de PRD-005 para `_DONE`.
- Catálogo: mover PRD-001, PRD-002 e PRD-005 para "✅ Implementados"; remover dos "Documentados, aguardando".
- "Histórico de Versões do App": adicionar linhas 0.1.0 (PRD-001), 0.2.0 Tally (PRD-002) e 0.3.0 Tariff (PRD-005), conforme já registrado.

- [ ] **Step 6: Gate final**

Run: `npx tsc --noEmit && npm test`
Expected: tsc EXIT 0; suíte completa PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json CHANGELOG.md docs/prds/
git commit -m "chore: release 0.3.0 (Tariff) — PRD-005 tabela de precos"
```

---

## Self-Review (autor do plano)

- **Cobertura do spec:** types (T1) · money/máscara (T1/T4) · schemas+validação positiva
  (T2) · mocks com edge cases (T3) · stores soft-delete (T3) · 3 CRUDs com estados de
  tela (T5-T7) · página com abas + rota + nav (T8) · barreira + release (T9). ✓
- **Sem placeholders:** todo passo de código traz o código completo. ✓
- **Consistência de tipos:** `PrecoHoraMaquina.tipo_equipamento: TipoEquipamento | null`;
  o form usa `z.enum(TIPO_VALUES)` cujo union é estruturalmente `TipoEquipamento`;
  payload `?? null` reconcilia `undefined`→`null`. `formatBRL`/`brlExato` definidos em
  T1 e consumidos em T5-T7. `descreverVinculo` (T4) recebe `equipamentos` da store. ✓
- **Barreira:** verificada por grep em T9; nada de precos em código do operador. ✓
