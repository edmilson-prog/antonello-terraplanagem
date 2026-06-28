# PRD-002 — Apontamento de Horímetro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a UI mockada do apontamento de campo no App do Operador (`/app/apontamento`): iniciar (equipamento + horímetro inicial), finalizar (horímetro final + cálculo de horas) e listar "Meus apontamentos".

**Architecture:** Feature standalone `src/features/apontamento/` com store dedicado em memória (`useSyncExternalStore`, padrão de `ordens-store.ts`). Captura de horímetro e badge de pendência extraídos para `src/shared/`. OCR simulado e isolado em `src/shared/lib/ocr.ts`. Três sub-rotas full-screen sob `/app/apontamento` espelhando a estrutura de `app.ordens.*`.

**Tech Stack:** React 19, TanStack Start/Router (file-based), TypeScript estrito, Tailwind v4 + shadcn/ui, react-hook-form + zod, sonner (toasts), @iconify/react, vitest.

## Global Constraints

Toda task herda implicitamente estas regras (valores copiados do spec e do `CLAUDE.md`):

- **Zero dado financeiro** em qualquer tela `/app/*` (preço, valor, custo). Restrição rígida.
- **Tokens, nunca hardcode** de cor/fonte. Cores via classes de token (`bg-primary`, `text-destructive`, `bg-surface`, `text-foreground-faint`, `border-steel/40`, etc.). Números (horímetro/horas) em `font-mono`.
- **Ícones de aplicação via Iconify** (`@iconify/react`, set `lucide:*`).
- **TypeScript estrito, sem `any`** (usar `unknown` ou tipo específico). Optional chaining, não `!`.
- **Mobile-first**, alvos de toque ≥ 44px no operador (botões `size="lg"` ou `h-14`/`min-h-[56px]`).
- **Nomenclatura do type:** `Apontamento` / `StatusApontamento` (sem prefixo `I`), consistente com `Equipamento`/`Operador` do codebase.
- **Operador logado:** constante `OPERADOR_LOGADO_ID = "op-001"`.
- **Gate de verificação autoritativo:** `npx tsc --noEmit` deve sair **EXIT 0**. (`npm run lint` produz ~milhares de erros `prettier/prettier` de CRLF pré-existentes no Windows — ruído; ao usar lint, filtrar `prettier/prettier`/`Delete ␍`.) Testes: `npm test` (vitest, `vitest run`).
- **`src/routeTree.gen.ts` é auto-gerado** pela toolchain do TanStack (o dev server o regenera ao detectar novos arquivos em `src/routes/`). É `@ts-nocheck`. Após criar/remover arquivos de rota, confirmar que a rota nova aparece em `src/routeTree.gen.ts` antes de rodar `tsc`; fallback determinístico: `npm run build`.
- **Commits Conventional em inglês**, terminando com a linha:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## File Structure

**Criar:**
- `src/features/apontamento/calcular-horas.ts` — `calcularHoras(inicial, final)` puro.
- `src/features/apontamento/calcular-horas.test.ts`
- `src/features/apontamento/apontamentos-store.ts` — store dedicado (factory + singleton) + `OPERADOR_LOGADO_ID` + `apontamentosDoOperador`.
- `src/features/apontamento/apontamentos-store.test.ts`
- `src/features/apontamento/apontamento-schema.ts` — zod iniciar/finalizar.
- `src/features/apontamento/apontamento-schema.test.ts`
- `src/features/apontamento/labels.ts` — rótulos de status.
- `src/features/apontamento/components/status-apontamento-badge.tsx`
- `src/features/apontamento/components/iniciar-apontamento-form.tsx`
- `src/features/apontamento/components/apontamento-detalhe.tsx` — detalhe + finalizar.
- `src/features/apontamento/components/apontamentos-page.tsx` — lista.
- `src/features/apontamento/components/apontamento-card.tsx`
- `src/features/apontamento/index.ts` — barrel.
- `src/shared/lib/ocr.ts` — OCR simulado e plugável.
- `src/shared/lib/ocr.test.ts`
- `src/shared/components/horimetro-capture.tsx` — captura reutilizável (manual + foto/OCR).
- `src/shared/components/sync-badge.tsx` — badge "pendente de sincronização".
- `src/mocks/apontamentos.ts` — ~6 apontamentos com edge cases.
- `src/mocks/apontamentos.test.ts` — sanidade dos edge cases.
- `src/routes/app.apontamento.index.tsx` — lista.
- `src/routes/app.apontamento.novo.tsx` — iniciar.
- `src/routes/app.apontamento.$apontamentoId.tsx` — detalhe/finalizar.

**Modificar:**
- `src/shared/types/index.ts` — add `StatusApontamento`, `Apontamento`.
- `src/shared/lib/format.ts` — add `formatDataHora`.
- `src/shared/lib/format.test.ts` — add teste de `formatDataHora`.
- `package.json` — `version` → `0.2.0`.
- `CHANGELOG.md` — seção `[0.2.0]`.
- `docs/prds/PRD-002-op-apontamento-horimetro.md` — Status + rename `_DONE`.
- `docs/prds/INDEX-PRDs-antonello.md` — status PRD-002.

**Remover:**
- `src/routes/app.apontamento.tsx` — placeholder substituído pela rota index (na Task 10).

---

## Sequenciamento (por que esta ordem)

1–6 são lógica/apresentacional pura (testáveis isoladamente). 7 é a captura compartilhada. **8 (Iniciar) → 9 (Detalhe) → 10 (Lista)**: cada rota só referencia (`Link`/`navigate`) rotas já existentes — a rota `/app/apontamento` (placeholder) permanece resolvível até a Task 10, quando é trocada pela index. Isso mantém `tsc` verde em cada task. 11 fecha barrel + versão/docs.

---

### Task 1: Contrato (`Apontamento`) + cálculo de horas

**Files:**
- Modify: `src/shared/types/index.ts` (append ao fim)
- Create: `src/features/apontamento/calcular-horas.ts`
- Test: `src/features/apontamento/calcular-horas.test.ts`

**Interfaces:**
- Produces: `type StatusApontamento`, `interface Apontamento` (em `@/shared/types`); `calcularHoras(inicial: number, final: number): number` (em `@/features/apontamento/calcular-horas`).

- [ ] **Step 1: Add types ao contrato compartilhado**

Append em `src/shared/types/index.ts`:

```typescript

export type StatusApontamento = "em_andamento" | "finalizado";

export interface Apontamento {
  id: string;
  equipamento_id: string; // FK → Equipamento
  operador_id: string; // FK → Operador (quem apontou)
  os_id: string | null; // FK → OS (opcional nesta fase)
  horimetro_inicial: number; // horas, 1 casa decimal
  horimetro_final: number | null; // null enquanto em andamento
  horas_trabalhadas: number | null; // calculado: round1(final - inicial)
  foto_inicial_url: string | null; // evidência (mock nesta fase)
  foto_final_url: string | null;
  observacao: string | null;
  status: StatusApontamento;
  pendente_sync: boolean; // afford. de offline (só visual)
  iniciado_em: string; // ISO 8601
  finalizado_em: string | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Write the failing test**

`src/features/apontamento/calcular-horas.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calcularHoras } from "./calcular-horas";

describe("calcularHoras", () => {
  it("subtrai final - inicial", () => {
    expect(calcularHoras(1200, 1208.5)).toBe(8.5);
  });

  it("arredonda para 1 casa decimal (sem drift de float)", () => {
    expect(calcularHoras(1200.1, 1208.3)).toBe(8.2);
  });

  it("retorna 0 quando final === inicial", () => {
    expect(calcularHoras(500, 500)).toBe(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/features/apontamento/calcular-horas.test.ts`
Expected: FAIL (`calcular-horas` não existe / `calcularHoras is not a function`).

- [ ] **Step 4: Implement**

`src/features/apontamento/calcular-horas.ts`:

```typescript
// Horas trabalhadas a partir do horímetro. Arredonda para 1 casa decimal
// para evitar drift de ponto flutuante (ex.: 1208.3 - 1200.1).
export function calcularHoras(inicial: number, final: number): number {
  return Math.round((final - inicial) * 10) / 10;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/features/apontamento/calcular-horas.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 6: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add src/shared/types/index.ts src/features/apontamento/calcular-horas.ts src/features/apontamento/calcular-horas.test.ts
git commit -m "feat: add Apontamento contract and calcularHoras helper"
```

---

### Task 2: OCR simulado e plugável

**Files:**
- Create: `src/shared/lib/ocr.ts`
- Test: `src/shared/lib/ocr.test.ts`

**Interfaces:**
- Produces: `OCR_HABILITADO: boolean`, `OCR_VALOR_SIMULADO: number`, `lerHorimetroDaFoto(arquivo: File | Blob, opts?: { base?: number; delayMs?: number; simularFalha?: boolean }): Promise<number>` (em `@/shared/lib/ocr`).

- [ ] **Step 1: Write the failing test**

`src/shared/lib/ocr.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { lerHorimetroDaFoto, OCR_VALOR_SIMULADO } from "./ocr";

describe("lerHorimetroDaFoto", () => {
  it("resolve um valor simulado quando não recebe base", async () => {
    const valor = await lerHorimetroDaFoto(new Blob(), { delayMs: 0 });
    expect(valor).toBe(OCR_VALOR_SIMULADO);
  });

  it("resolve a base arredondada a 1 casa quando recebe base", async () => {
    const valor = await lerHorimetroDaFoto(new Blob(), { base: 8432.04, delayMs: 0 });
    expect(valor).toBe(8432);
  });

  it("rejeita quando simularFalha é true (exercita o fallback manual)", async () => {
    await expect(
      lerHorimetroDaFoto(new Blob(), { delayMs: 0, simularFalha: true }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/lib/ocr.test.ts`
Expected: FAIL (módulo `./ocr` não existe).

- [ ] **Step 3: Implement**

`src/shared/lib/ocr.ts`:

```typescript
// Leitura automática do horímetro por foto — camada SIMULADA, isolada e
// plugável. O PRD-002 mantém o OCR opcional (RF-003, "Could"), com fallback
// de digitação manual. Quando um serviço real existir, troca-se só este
// arquivo; a UI consome apenas `OCR_HABILITADO` e `lerHorimetroDaFoto`.

export const OCR_HABILITADO = true;
export const OCR_VALOR_SIMULADO = 1234.5;

interface LeituraOpts {
  /** valor base plausível (ex.: horímetro atual do equipamento) */
  base?: number;
  /** atraso simulado da leitura (ms); use 0 em testes */
  delayMs?: number;
  /** força falha para exercitar o fallback manual */
  simularFalha?: boolean;
}

export async function lerHorimetroDaFoto(
  _arquivo: File | Blob,
  opts: LeituraOpts = {},
): Promise<number> {
  const { base, delayMs = 1200, simularFalha = false } = opts;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (simularFalha) {
    throw new Error("Não foi possível ler o horímetro da foto.");
  }
  return base != null ? Math.round(base * 10) / 10 : OCR_VALOR_SIMULADO;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/lib/ocr.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 6: Commit**

```bash
git add src/shared/lib/ocr.ts src/shared/lib/ocr.test.ts
git commit -m "feat: add simulated pluggable horimeter OCR layer"
```

---

### Task 3: Mock de apontamentos

**Files:**
- Create: `src/mocks/apontamentos.ts`
- Test: `src/mocks/apontamentos.test.ts`

**Interfaces:**
- Consumes: `Apontamento` (`@/shared/types`), `calcularHoras` (`@/features/apontamento/calcular-horas`).
- Produces: `export const apontamentos: Apontamento[]` (em `@/mocks/apontamentos`).

Edge cases obrigatórios: 1 `em_andamento`, ≥2 `finalizado`, 1 sem `os_id`, 1 com observação longa, 1 `pendente_sync: true`, 1 de outro operador (`op-002`). Reusa `equipamento_id` válidos (`eq-001`..`eq-007`) e `os_id` válidos (`os-1042`, `os-1039`, `os-1037`). `horas_trabalhadas` dos finalizados = `final - inicial`.

- [ ] **Step 1: Write the failing test**

`src/mocks/apontamentos.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { apontamentos } from "./apontamentos";
import { calcularHoras } from "@/features/apontamento/calcular-horas";

describe("mock de apontamentos", () => {
  it("inclui ao menos um em andamento e um finalizado", () => {
    expect(apontamentos.some((a) => a.status === "em_andamento")).toBe(true);
    expect(apontamentos.some((a) => a.status === "finalizado")).toBe(true);
  });

  it("cobre edge cases: sem os_id, pendente_sync e de outro operador", () => {
    expect(apontamentos.some((a) => a.os_id === null)).toBe(true);
    expect(apontamentos.some((a) => a.pendente_sync)).toBe(true);
    expect(apontamentos.some((a) => a.operador_id !== "op-001")).toBe(true);
  });

  it("horas_trabalhadas dos finalizados batem com calcularHoras", () => {
    for (const a of apontamentos) {
      if (a.status === "finalizado" && a.horimetro_final != null) {
        expect(a.horas_trabalhadas).toBe(
          calcularHoras(a.horimetro_inicial, a.horimetro_final),
        );
      }
    }
  });

  it("os em andamento não têm horímetro final nem horas", () => {
    for (const a of apontamentos) {
      if (a.status === "em_andamento") {
        expect(a.horimetro_final).toBeNull();
        expect(a.horas_trabalhadas).toBeNull();
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/mocks/apontamentos.test.ts`
Expected: FAIL (módulo `./apontamentos` não existe).

- [ ] **Step 3: Implement the mock**

`src/mocks/apontamentos.ts`:

```typescript
import type { Apontamento } from "@/shared/types";

// ~6 apontamentos espelhando o schema futuro (snake_case). Reusa equipamentos
// (eq-001..eq-007) e OS (os-1042/os-1039/os-1037) dos mocks existentes.
// Edge cases: em andamento, finalizados, sem os_id, observação longa,
// pendente_sync e um de outro operador (prova o filtro "Meus apontamentos").
export const apontamentos: Apontamento[] = [
  {
    id: "ap-001",
    equipamento_id: "eq-001",
    operador_id: "op-001",
    os_id: "os-1042",
    horimetro_inicial: 8432,
    horimetro_final: null,
    horas_trabalhadas: null,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Escavação para fundação dos blocos A e B.",
    status: "em_andamento",
    pendente_sync: true,
    iniciado_em: "2026-06-27T07:15:00.000Z",
    finalizado_em: null,
    created_at: "2026-06-27T07:15:00.000Z",
    updated_at: "2026-06-27T07:15:00.000Z",
  },
  {
    id: "ap-002",
    equipamento_id: "eq-002",
    operador_id: "op-001",
    os_id: "os-1039",
    horimetro_inicial: 5102,
    horimetro_final: 5120,
    horas_trabalhadas: 18,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Nivelamento concluído sem intercorrências.",
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-23T07:00:00.000Z",
    finalizado_em: "2026-06-23T17:20:00.000Z",
    created_at: "2026-06-23T07:00:00.000Z",
    updated_at: "2026-06-23T17:20:00.000Z",
  },
  {
    id: "ap-003",
    equipamento_id: "eq-003",
    operador_id: "op-001",
    os_id: null,
    horimetro_inicial: 2310.5,
    horimetro_final: 2317,
    horas_trabalhadas: 6.5,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-22T08:00:00.000Z",
    finalizado_em: "2026-06-22T14:30:00.000Z",
    created_at: "2026-06-22T08:00:00.000Z",
    updated_at: "2026-06-22T14:30:00.000Z",
  },
  {
    id: "ap-004",
    equipamento_id: "eq-006",
    operador_id: "op-001",
    os_id: "os-1037",
    horimetro_inicial: 4196,
    horimetro_final: 4205,
    horas_trabalhadas: 9,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao:
      "Terreno encharcado pela chuva da madrugada; avanço lento no período da manhã, com paradas para reposicionar a esteira. À tarde o serviço normalizou e concluímos o trecho previsto sem novas intercorrências.",
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-21T07:30:00.000Z",
    finalizado_em: "2026-06-21T16:50:00.000Z",
    created_at: "2026-06-21T07:30:00.000Z",
    updated_at: "2026-06-21T16:50:00.000Z",
  },
  {
    id: "ap-005",
    equipamento_id: "eq-005",
    operador_id: "op-001",
    os_id: null,
    horimetro_inicial: 12890,
    horimetro_final: null,
    horas_trabalhadas: null,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    status: "em_andamento",
    pendente_sync: true,
    iniciado_em: "2026-06-27T13:05:00.000Z",
    finalizado_em: null,
    created_at: "2026-06-27T13:05:00.000Z",
    updated_at: "2026-06-27T13:05:00.000Z",
  },
  {
    id: "ap-006",
    equipamento_id: "eq-007",
    operador_id: "op-002",
    os_id: null,
    horimetro_inicial: 9876.5,
    horimetro_final: 9881.5,
    horas_trabalhadas: 5,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Apontamento de outro operador.",
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-20T07:00:00.000Z",
    finalizado_em: "2026-06-20T12:00:00.000Z",
    created_at: "2026-06-20T07:00:00.000Z",
    updated_at: "2026-06-20T12:00:00.000Z",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/mocks/apontamentos.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 6: Commit**

```bash
git add src/mocks/apontamentos.ts src/mocks/apontamentos.test.ts
git commit -m "feat: add apontamentos mock data with edge cases"
```

---

### Task 4: Store dedicado de apontamentos

**Files:**
- Create: `src/features/apontamento/apontamentos-store.ts`
- Test: `src/features/apontamento/apontamentos-store.test.ts`

**Interfaces:**
- Consumes: `Apontamento` (`@/shared/types`), `calcularHoras` (`@/features/apontamento/calcular-horas`), `apontamentos` seed (`@/mocks/apontamentos`).
- Produces (em `@/features/apontamento/apontamentos-store`):
  - `OPERADOR_LOGADO_ID: string` (= `"op-001"`)
  - `criarApontamentosStore(seed: Apontamento[]): ApontamentosStore`
  - `apontamentosStore: ApontamentosStore` (singleton da seed mock)
  - `apontamentosDoOperador(lista: Apontamento[], operadorId: string): Apontamento[]`
  - tipos `IniciarInput`, `FinalizarInput`, `FinalizarResultado`, `ApontamentosStore`
  - `ApontamentosStore` métodos: `listar()`, `obter(id)`, `useTodos()`, `useApontamento(id)`, `iniciar(input)`, `finalizar(id, input)`

- [ ] **Step 1: Write the failing test**

`src/features/apontamento/apontamentos-store.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { criarApontamentosStore, apontamentosDoOperador } from "./apontamentos-store";
import type { Apontamento } from "@/shared/types";

function seedBase(): Apontamento[] {
  return [
    {
      id: "a1",
      equipamento_id: "eq-1",
      operador_id: "op-001",
      os_id: null,
      horimetro_inicial: 100,
      horimetro_final: null,
      horas_trabalhadas: null,
      foto_inicial_url: null,
      foto_final_url: null,
      observacao: null,
      status: "em_andamento",
      pendente_sync: false,
      iniciado_em: "2026-01-01T00:00:00.000Z",
      finalizado_em: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "a2",
      equipamento_id: "eq-2",
      operador_id: "op-002",
      os_id: null,
      horimetro_inicial: 50,
      horimetro_final: 58,
      horas_trabalhadas: 8,
      foto_inicial_url: null,
      foto_final_url: null,
      observacao: null,
      status: "finalizado",
      pendente_sync: false,
      iniciado_em: "2026-01-01T00:00:00.000Z",
      finalizado_em: "2026-01-01T08:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T08:00:00.000Z",
    },
  ];
}

describe("apontamentosStore", () => {
  it("iniciar cria um apontamento em andamento no topo da lista", () => {
    const store = criarApontamentosStore([]);
    const novo = store.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 });
    expect(novo.status).toBe("em_andamento");
    expect(novo.operador_id).toBe("op-001");
    expect(novo.pendente_sync).toBe(true);
    expect(novo.horimetro_final).toBeNull();
    expect(novo.horas_trabalhadas).toBeNull();
    expect(store.listar()[0].id).toBe(novo.id);
  });

  it("iniciar normaliza observação vazia para null e os_id ausente para null", () => {
    const store = criarApontamentosStore([]);
    const novo = store.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10, observacao: "   " });
    expect(novo.observacao).toBeNull();
    expect(novo.os_id).toBeNull();
  });

  it("finalizar calcula horas e marca finalizado", () => {
    const store = criarApontamentosStore(seedBase());
    const r = store.finalizar("a1", { horimetro_final: 108.5 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.apontamento.status).toBe("finalizado");
      expect(r.apontamento.horas_trabalhadas).toBe(8.5);
      expect(r.apontamento.finalizado_em).not.toBeNull();
      expect(r.apontamento.pendente_sync).toBe(true);
    }
  });

  it("rejeita finalizar com final menor que inicial e não muta o registro", () => {
    const store = criarApontamentosStore(seedBase());
    const r = store.finalizar("a1", { horimetro_final: 90 });
    expect(r).toEqual({ ok: false, erro: "final_menor_que_inicial" });
    expect(store.obter("a1")?.status).toBe("em_andamento");
  });

  it("rejeita finalizar id inexistente e já finalizado", () => {
    const store = criarApontamentosStore(seedBase());
    expect(store.finalizar("zzz", { horimetro_final: 200 })).toEqual({
      ok: false,
      erro: "nao_encontrado",
    });
    expect(store.finalizar("a2", { horimetro_final: 60 })).toEqual({
      ok: false,
      erro: "ja_finalizado",
    });
  });

  it("apontamentosDoOperador filtra por operador", () => {
    const store = criarApontamentosStore(seedBase());
    expect(apontamentosDoOperador(store.listar(), "op-001").map((a) => a.id)).toEqual(["a1"]);
    expect(apontamentosDoOperador(store.listar(), "op-002").map((a) => a.id)).toEqual(["a2"]);
  });

  it("não muta a seed original", () => {
    const seed = seedBase();
    const copia = JSON.parse(JSON.stringify(seed));
    const store = criarApontamentosStore(seed);
    store.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 });
    store.finalizar("a1", { horimetro_final: 110 });
    expect(seed).toEqual(copia);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/apontamento/apontamentos-store.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implement the store**

`src/features/apontamento/apontamentos-store.ts`:

```typescript
import { useSyncExternalStore } from "react";
import { apontamentos as apontamentosIniciais } from "@/mocks/apontamentos";
import { calcularHoras } from "@/features/apontamento/calcular-horas";
import type { Apontamento } from "@/shared/types";

// Operador "logado" (mock). A sessão (SessaoMock) não guarda operador_id nesta
// fase; quando o backend autenticado existir, isto vem da sessão real.
export const OPERADOR_LOGADO_ID = "op-001";

export interface IniciarInput {
  equipamento_id: string;
  horimetro_inicial: number;
  os_id?: string | null;
  observacao?: string | null;
  foto_inicial_url?: string | null;
}

export interface FinalizarInput {
  horimetro_final: number;
  foto_final_url?: string | null;
}

export type FinalizarResultado =
  | { ok: true; apontamento: Apontamento }
  | { ok: false; erro: "nao_encontrado" | "ja_finalizado" | "final_menor_que_inicial" };

export interface ApontamentosStore {
  listar: () => Apontamento[];
  obter: (id: string) => Apontamento | undefined;
  useTodos: () => Apontamento[];
  useApontamento: (id: string) => Apontamento | undefined;
  iniciar: (input: IniciarInput) => Apontamento;
  finalizar: (id: string, input: FinalizarInput) => FinalizarResultado;
}

// Store dedicado em memória. Não usa createMockStore porque Apontamento tem
// ciclo de vida (status em_andamento → finalizado), não soft-delete (ativo).
// Espelha o padrão de features/operador/ordens-store.ts.
export function criarApontamentosStore(seed: Apontamento[]): ApontamentosStore {
  let itens: Apontamento[] = seed.map((a) => ({ ...a }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((a) => a.id === id);

  const iniciar: ApontamentosStore["iniciar"] = (input) => {
    const agora = new Date().toISOString();
    const novo: Apontamento = {
      id: crypto.randomUUID(),
      equipamento_id: input.equipamento_id,
      operador_id: OPERADOR_LOGADO_ID,
      os_id: input.os_id ?? null,
      horimetro_inicial: input.horimetro_inicial,
      horimetro_final: null,
      horas_trabalhadas: null,
      foto_inicial_url: input.foto_inicial_url ?? null,
      foto_final_url: null,
      observacao: input.observacao?.trim() ? input.observacao.trim() : null,
      status: "em_andamento",
      pendente_sync: true,
      iniciado_em: agora,
      finalizado_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return novo;
  };

  const finalizar: ApontamentosStore["finalizar"] = (id, input) => {
    const atual = itens.find((a) => a.id === id);
    if (!atual) return { ok: false, erro: "nao_encontrado" };
    if (atual.status === "finalizado") return { ok: false, erro: "ja_finalizado" };
    if (input.horimetro_final < atual.horimetro_inicial) {
      return { ok: false, erro: "final_menor_que_inicial" };
    }
    const agora = new Date().toISOString();
    const atualizado: Apontamento = {
      ...atual,
      horimetro_final: input.horimetro_final,
      horas_trabalhadas: calcularHoras(atual.horimetro_inicial, input.horimetro_final),
      foto_final_url: input.foto_final_url ?? atual.foto_final_url,
      status: "finalizado",
      pendente_sync: true,
      finalizado_em: agora,
      updated_at: agora,
    };
    itens = itens.map((a) => (a.id === id ? atualizado : a));
    notificar();
    return { ok: true, apontamento: atualizado };
  };

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useApontamento = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((a) => a.id === id),
      () => itens.find((a) => a.id === id),
    );

  return { listar, obter, useTodos, useApontamento, iniciar, finalizar };
}

export const apontamentosStore = criarApontamentosStore(apontamentosIniciais);

// Filtro puro (testável) — usado pela tela "Meus apontamentos".
export function apontamentosDoOperador(
  lista: Apontamento[],
  operadorId: string,
): Apontamento[] {
  return lista.filter((a) => a.operador_id === operadorId);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/apontamento/apontamentos-store.test.ts`
Expected: PASS (7 passed).

- [ ] **Step 5: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/apontamento/apontamentos-store.ts src/features/apontamento/apontamentos-store.test.ts
git commit -m "feat: add dedicated apontamentos store with iniciar/finalizar"
```

---

### Task 5: Schema de validação (zod)

**Files:**
- Create: `src/features/apontamento/apontamento-schema.ts`
- Test: `src/features/apontamento/apontamento-schema.test.ts`

**Interfaces:**
- Produces (em `@/features/apontamento/apontamento-schema`): `iniciarApontamentoSchema`, `IniciarApontamentoValues`, `finalizarApontamentoSchema`, `FinalizarApontamentoValues`.

> A regra **`final ≥ inicial` NÃO mora no zod** (depende do inicial, cross-field) — é validada no store (`finalizar`, Task 4). O schema só valida formato de campo.

- [ ] **Step 1: Write the failing test**

`src/features/apontamento/apontamento-schema.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { iniciarApontamentoSchema, finalizarApontamentoSchema } from "./apontamento-schema";

describe("iniciarApontamentoSchema", () => {
  it("aceita entrada mínima válida", () => {
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "eq-1", horimetro_inicial: 100 }).success,
    ).toBe(true);
  });

  it("exige equipamento", () => {
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "", horimetro_inicial: 100 }).success,
    ).toBe(false);
  });

  it("rejeita horímetro negativo ou não numérico", () => {
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "eq-1", horimetro_inicial: -1 }).success,
    ).toBe(false);
    expect(
      iniciarApontamentoSchema.safeParse({ equipamento_id: "eq-1", horimetro_inicial: Number.NaN })
        .success,
    ).toBe(false);
  });

  it("rejeita observação acima de 280 caracteres", () => {
    expect(
      iniciarApontamentoSchema.safeParse({
        equipamento_id: "eq-1",
        horimetro_inicial: 1,
        observacao: "x".repeat(281),
      }).success,
    ).toBe(false);
  });
});

describe("finalizarApontamentoSchema", () => {
  it("aceita número válido e rejeita negativo/NaN", () => {
    expect(finalizarApontamentoSchema.safeParse({ horimetro_final: 10 }).success).toBe(true);
    expect(finalizarApontamentoSchema.safeParse({ horimetro_final: -1 }).success).toBe(false);
    expect(finalizarApontamentoSchema.safeParse({ horimetro_final: Number.NaN }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/apontamento/apontamento-schema.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implement**

`src/features/apontamento/apontamento-schema.ts`:

```typescript
import { z } from "zod";

export const iniciarApontamentoSchema = z.object({
  equipamento_id: z.string().min(1, "Selecione um equipamento"),
  horimetro_inicial: z
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0, "O horímetro não pode ser negativo"),
  os_id: z.string().optional(),
  observacao: z.string().trim().max(280, "Observação muito longa (máx. 280)").optional(),
});

export type IniciarApontamentoValues = z.infer<typeof iniciarApontamentoSchema>;

export const finalizarApontamentoSchema = z.object({
  horimetro_final: z
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0, "O horímetro não pode ser negativo"),
});

export type FinalizarApontamentoValues = z.infer<typeof finalizarApontamentoSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/apontamento/apontamento-schema.test.ts`
Expected: PASS (5 passed).

- [ ] **Step 5: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/apontamento/apontamento-schema.ts src/features/apontamento/apontamento-schema.test.ts
git commit -m "feat: add apontamento validation schemas"
```

---

### Task 6: Apresentacional compartilhado (badges, labels, formatDataHora)

**Files:**
- Create: `src/features/apontamento/labels.ts`
- Create: `src/features/apontamento/components/status-apontamento-badge.tsx`
- Create: `src/shared/components/sync-badge.tsx`
- Modify: `src/shared/lib/format.ts` (add `formatDataHora`)
- Test: `src/shared/lib/format.test.ts` (add casos de `formatDataHora`)

**Interfaces:**
- Produces: `STATUS_APONTAMENTO_LABEL` (`@/features/apontamento/labels`); `StatusApontamentoBadge` (`@/features/apontamento/components/status-apontamento-badge`); `SyncBadge` (`@/shared/components/sync-badge`); `formatDataHora(iso: string | null): string` (`@/shared/lib/format`).

- [ ] **Step 1: Write the failing test (formatDataHora)**

Append em `src/shared/lib/format.test.ts` um novo bloco (manter os existentes). Primeiro confira o conteúdo atual; em seguida adicione o `import { formatDataHora }` ao import existente de `./format` e este describe:

```typescript
describe("formatDataHora", () => {
  it("retorna travessão para null", () => {
    expect(formatDataHora(null)).toBe("—");
  });

  it("retorna travessão para ISO inválido", () => {
    expect(formatDataHora("não-é-data")).toBe("—");
  });

  it("formata uma data ISO válida incluindo o ano", () => {
    expect(formatDataHora("2026-06-27T07:15:00.000Z")).toContain("2026");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/lib/format.test.ts`
Expected: FAIL (`formatDataHora` não existe / não exportado).

- [ ] **Step 3: Implement formatDataHora**

Append em `src/shared/lib/format.ts`:

```typescript

export function formatDataHora(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/lib/format.test.ts`
Expected: PASS (todos, incluindo os 3 novos).

- [ ] **Step 5: Create labels**

`src/features/apontamento/labels.ts`:

```typescript
import type { StatusApontamento } from "@/shared/types";

export const STATUS_APONTAMENTO_LABEL: Record<StatusApontamento, string> = {
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
};
```

- [ ] **Step 6: Create status badge**

`src/features/apontamento/components/status-apontamento-badge.tsx`:

```typescript
import type { StatusApontamento } from "@/shared/types";
import { cn } from "@/lib/utils";

const config: Record<StatusApontamento, { label: string; classe: string }> = {
  em_andamento: {
    label: "Em andamento",
    classe: "bg-primary/20 text-foreground border-primary/50",
  },
  finalizado: {
    label: "Finalizado",
    classe: "bg-secondary-soft/25 text-foreground border-secondary/40",
  },
};

interface Props {
  status: StatusApontamento;
  className?: string;
}

export function StatusApontamentoBadge({ status, className }: Props) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.classe,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}
```

- [ ] **Step 7: Create sync badge**

`src/shared/components/sync-badge.tsx`:

```typescript
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

// Afford. visual de offline: marca um registro ainda não sincronizado com a
// central. O motor de sync real é o PRD-000/003; aqui é apenas indicador.
export function SyncBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-steel/40 bg-steel/15 px-2.5 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      <Icon icon="lucide:cloud-off" className="h-3.5 w-3.5" />
      Pendente de sincronização
    </span>
  );
}
```

- [ ] **Step 8: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 9: Commit**

```bash
git add src/features/apontamento/labels.ts src/features/apontamento/components/status-apontamento-badge.tsx src/shared/components/sync-badge.tsx src/shared/lib/format.ts src/shared/lib/format.test.ts
git commit -m "feat: add apontamento status badge, sync badge and date formatter"
```

---

### Task 7: HorimetroCapture (captura compartilhada manual + foto/OCR)

**Files:**
- Create: `src/shared/components/horimetro-capture.tsx`

**Interfaces:**
- Consumes: `OCR_HABILITADO`, `lerHorimetroDaFoto` (`@/shared/lib/ocr`).
- Produces: `HorimetroCapture` componente com props:
  `{ label: string; value: string; onChange: (v: string) => void; ocrBase?: number; onFotoCapturada?: (url: string) => void; error?: string; inputId?: string }`.

> Componente controlado: `value` é string (campo de form), número fica a cargo do consumidor. Input numérico grande em mono (legível sob sol). Quando `OCR_HABILITADO`, mostra botão de foto que simula a leitura e despeja o valor no mesmo input editável; falha de leitura cai para digitação sem travar.

- [ ] **Step 1: Implement**

`src/shared/components/horimetro-capture.tsx`:

```typescript
import { useId, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OCR_HABILITADO, lerHorimetroDaFoto } from "@/shared/lib/ocr";
import { cn } from "@/lib/utils";

interface HorimetroCaptureProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  /** valor base p/ o OCR simulado (ex.: horímetro atual do equipamento) */
  ocrBase?: number;
  onFotoCapturada?: (url: string) => void;
  error?: string;
  inputId?: string;
}

export function HorimetroCapture({
  label,
  value,
  onChange,
  ocrBase,
  onFotoCapturada,
  error,
  inputId,
}: HorimetroCaptureProps) {
  const gerado = useId();
  const id = inputId ?? gerado;
  const fileRef = useRef<HTMLInputElement>(null);
  const [lendo, setLendo] = useState(false);
  const [ocrErro, setOcrErro] = useState<string | null>(null);

  async function aoSelecionarFoto(ev: ChangeEvent<HTMLInputElement>) {
    const arquivo = ev.target.files?.[0];
    ev.target.value = ""; // permite recapturar o mesmo arquivo
    if (!arquivo) return;
    setLendo(true);
    setOcrErro(null);
    try {
      const valorLido = await lerHorimetroDaFoto(arquivo, { base: ocrBase });
      onChange(String(valorLido));
      onFotoCapturada?.(URL.createObjectURL(arquivo));
    } catch {
      setOcrErro("Não foi possível ler — digite manualmente.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          placeholder="0,0"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          aria-invalid={!!error}
          className="h-14 flex-1 font-mono text-2xl"
        />
        {OCR_HABILITADO ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={aoSelecionarFoto}
              aria-hidden="true"
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={lendo}
              className="h-14 min-w-[56px] gap-2 px-4"
              aria-label="Capturar horímetro por foto"
            >
              <Icon
                icon={lendo ? "lucide:loader-circle" : "lucide:camera"}
                className={cn("h-5 w-5", lendo && "animate-spin")}
              />
            </Button>
          </>
        ) : null}
      </div>
      {ocrErro ? <p className="text-xs text-destructive">{ocrErro}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/horimetro-capture.tsx
git commit -m "feat: add shared HorimetroCapture with simulated OCR"
```

---

### Task 8: Iniciar apontamento (form + rota /novo)

**Files:**
- Create: `src/features/apontamento/components/iniciar-apontamento-form.tsx`
- Create: `src/routes/app.apontamento.novo.tsx`

**Interfaces:**
- Consumes: `apontamentosStore`, `OPERADOR_LOGADO_ID` (`@/features/apontamento/apontamentos-store`); `iniciarApontamentoSchema`, `IniciarApontamentoValues` (`@/features/apontamento/apontamento-schema`); `HorimetroCapture` (`@/shared/components/horimetro-capture`); `equipamentosStore` (`@/features/equipamentos/equipamentos-store`); `ordensOperador` (`@/mocks/ordens-operador`).
- Produces: `IniciarApontamentoForm` componente; rota `/app/apontamento/novo`.

> A rota navega de volta para `/app/apontamento` (resolvido pelo placeholder `app.apontamento.tsx`, ainda presente nesta task). Seletor de OS usa o sentinela `"sem-os"` (Radix Select não aceita value `""`).

- [ ] **Step 1: Implement the form**

`src/features/apontamento/components/iniciar-apontamento-form.tsx`:

```typescript
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HorimetroCapture } from "@/shared/components/horimetro-capture";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { ordensOperador } from "@/mocks/ordens-operador";
import {
  apontamentosStore,
  OPERADOR_LOGADO_ID,
} from "@/features/apontamento/apontamentos-store";
import {
  iniciarApontamentoSchema,
  type IniciarApontamentoValues,
} from "@/features/apontamento/apontamento-schema";

const SEM_OS = "sem-os";

export function IniciarApontamentoForm() {
  const navigate = useNavigate();
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const ordens = ordensOperador.filter((o) => o.operador_id === OPERADOR_LOGADO_ID);
  const [fotoInicialUrl, setFotoInicialUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IniciarApontamentoValues>({
    resolver: zodResolver(iniciarApontamentoSchema),
    defaultValues: {
      equipamento_id: "",
      horimetro_inicial: Number.NaN,
      os_id: SEM_OS,
      observacao: "",
    },
  });

  const equipamentoId = watch("equipamento_id");
  const equipamentoSel = equipamentos.find((e) => e.id === equipamentoId);

  // Conveniência de campo: ao escolher o equipamento, sugere o horímetro atual
  // dele (editável). Trocar de equipamento atualiza a sugestão.
  useEffect(() => {
    if (equipamentoSel) setValue("horimetro_inicial", equipamentoSel.horimetro_atual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipamentoId]);

  const onSubmit = (values: IniciarApontamentoValues) => {
    apontamentosStore.iniciar({
      equipamento_id: values.equipamento_id,
      horimetro_inicial: values.horimetro_inicial,
      os_id: values.os_id && values.os_id !== SEM_OS ? values.os_id : null,
      observacao: values.observacao ?? null,
      foto_inicial_url: fotoInicialUrl,
    });
    toast.success("Apontamento iniciado.");
    navigate({ to: "/app/apontamento" });
  };

  return (
    <div className="space-y-5">
      <Link
        to="/app/apontamento"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Meus apontamentos
      </Link>

      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Iniciar apontamento</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o equipamento e registre o horímetro inicial.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="equipamento">Equipamento *</Label>
          <Controller
            control={control}
            name="equipamento_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="equipamento" className="h-12" aria-invalid={!!errors.equipamento_id}>
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

        <Controller
          control={control}
          name="horimetro_inicial"
          render={({ field }) => (
            <HorimetroCapture
              label="Horímetro inicial *"
              value={Number.isNaN(field.value) ? "" : String(field.value)}
              onChange={(v) => field.onChange(v === "" ? Number.NaN : Number(v))}
              ocrBase={equipamentoSel?.horimetro_atual}
              onFotoCapturada={setFotoInicialUrl}
              error={errors.horimetro_inicial?.message}
            />
          )}
        />

        <div className="space-y-1.5">
          <Label htmlFor="os">Ordem de Serviço (opcional)</Label>
          <Controller
            control={control}
            name="os_id"
            render={({ field }) => (
              <Select value={field.value ?? SEM_OS} onValueChange={field.onChange}>
                <SelectTrigger id="os" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_OS}>Sem OS</SelectItem>
                  {ordens.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.numero} — {o.obra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="observacao">Observação (opcional)</Label>
          <Controller
            control={control}
            name="observacao"
            render={({ field }) => (
              <Textarea
                id="observacao"
                rows={3}
                placeholder="Algo relevante sobre o serviço?"
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={!!errors.observacao}
              />
            )}
          />
          {errors.observacao ? (
            <p className="text-xs text-destructive">{errors.observacao.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:play" className="h-4 w-4" />
            Iniciar apontamento
          </Button>
          <Button type="button" variant="outline" size="lg" asChild className="w-full">
            <Link to="/app/apontamento">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

`src/routes/app.apontamento.novo.tsx`:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { IniciarApontamentoForm } from "@/features/apontamento/components/iniciar-apontamento-form";

export const Route = createFileRoute("/app/apontamento/novo")({
  head: () => ({
    meta: [
      { title: "Novo apontamento · Antonello" },
      {
        name: "description",
        content: "Iniciar um apontamento de horímetro no app do operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: IniciarApontamentoForm,
});
```

- [ ] **Step 3: Regenerate route tree + verify**

Run: confirme que `/app/apontamento/novo` aparece em `src/routeTree.gen.ts` (o dev server regenera automaticamente). Se ausente, rode `npm run build` para forçar a geração.
Then run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/apontamento/components/iniciar-apontamento-form.tsx src/routes/app.apontamento.novo.tsx src/routeTree.gen.ts
git commit -m "feat: add iniciar apontamento screen and route"
```

---

### Task 9: Detalhe + finalizar (component + rota /$apontamentoId)

**Files:**
- Create: `src/features/apontamento/components/apontamento-detalhe.tsx`
- Create: `src/routes/app.apontamento.$apontamentoId.tsx`

**Interfaces:**
- Consumes: `apontamentosStore` (`@/features/apontamento/apontamentos-store`); `HorimetroCapture` (`@/shared/components/horimetro-capture`); `StatusApontamentoBadge` (`@/features/apontamento/components/status-apontamento-badge`); `SyncBadge` (`@/shared/components/sync-badge`); `equipamentosStore` (`@/features/equipamentos/equipamentos-store`); `ordensOperador` (`@/mocks/ordens-operador`); `formatHorimetro`, `formatDataHora` (`@/shared/lib/format`).
- Produces: `ApontamentoDetalhe` e `ApontamentoNaoEncontrado` componentes; rota `/app/apontamento/$apontamentoId`.

> A regra `final ≥ inicial` é aplicada pelo store (`finalizar`); a UI trata o retorno discriminado: se `erro === "final_menor_que_inicial"`, **bloqueia** e mostra aviso, sem navegar.

- [ ] **Step 1: Implement the detail/finalize component**

`src/features/apontamento/components/apontamento-detalhe.tsx`:

```typescript
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HorimetroCapture } from "@/shared/components/horimetro-capture";
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { ordensOperador } from "@/mocks/ordens-operador";
import { formatHorimetro, formatDataHora } from "@/shared/lib/format";

interface Props {
  apontamentoId: string;
}

export function ApontamentoDetalhe({ apontamentoId }: Props) {
  const apontamento = apontamentosStore.useApontamento(apontamentoId);
  const [horimetroFinal, setHorimetroFinal] = useState("");
  const [fotoFinalUrl, setFotoFinalUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (!apontamento) return <ApontamentoNaoEncontrado />;

  const equipamento = equipamentosStore.getById(apontamento.equipamento_id);
  const os = apontamento.os_id
    ? ordensOperador.find((o) => o.id === apontamento.os_id)
    : null;

  function confirmarFinalizacao() {
    if (!apontamento) return;
    const valor = Number(horimetroFinal);
    if (horimetroFinal.trim() === "" || !Number.isFinite(valor) || valor < 0) {
      setErro("Informe o horímetro final.");
      return;
    }
    const r = apontamentosStore.finalizar(apontamento.id, {
      horimetro_final: valor,
      foto_final_url: fotoFinalUrl,
    });
    if (!r.ok) {
      setErro(
        r.erro === "final_menor_que_inicial"
          ? `O horímetro final não pode ser menor que o inicial (${apontamento.horimetro_inicial}).`
          : "Não foi possível finalizar este apontamento.",
      );
      return;
    }
    setErro(null);
    toast.success(`Apontamento finalizado — ${r.apontamento.horas_trabalhadas} h.`);
  }

  return (
    <div className="space-y-5">
      <Link
        to="/app/apontamento"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Meus apontamentos
      </Link>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="font-display text-xl font-bold text-card-foreground">
              {equipamento?.nome ?? "Equipamento"}
            </h2>
            {os ? (
              <p className="text-sm text-muted-foreground">
                {os.numero} — {os.obra}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sem OS vinculada</p>
            )}
          </div>
          <StatusApontamentoBadge status={apontamento.status} />
        </div>
        {apontamento.pendente_sync ? (
          <div className="mt-3">
            <SyncBadge />
          </div>
        ) : null}
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Horímetro
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CampoHorimetro rotulo="Inicial" valor={apontamento.horimetro_inicial} />
          <CampoHorimetro rotulo="Final" valor={apontamento.horimetro_final} />
        </div>
        {apontamento.horas_trabalhadas != null ? (
          <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm">
            <span className="text-muted-foreground">Horas trabalhadas</span>
            <span className="font-mono text-base font-semibold text-foreground">
              {apontamento.horas_trabalhadas} h
            </span>
          </div>
        ) : null}
      </section>

      {apontamento.observacao ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <Icon icon="lucide:sticky-note" className="h-4 w-4" />
            Observação
          </div>
          <p className="text-sm text-card-foreground">{apontamento.observacao}</p>
        </section>
      ) : null}

      <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Registro
        </h3>
        <LinhaInfo rotulo="Iniciado em" valor={formatDataHora(apontamento.iniciado_em)} />
        <LinhaInfo rotulo="Finalizado em" valor={formatDataHora(apontamento.finalizado_em)} />
      </section>

      {apontamento.status === "em_andamento" ? (
        <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Finalizar apontamento
          </h3>
          <HorimetroCapture
            label="Horímetro final *"
            value={horimetroFinal}
            onChange={(v) => {
              setHorimetroFinal(v);
              setErro(null);
            }}
            ocrBase={apontamento.horimetro_inicial}
            onFotoCapturada={setFotoFinalUrl}
            error={erro ?? undefined}
          />
          <Button
            type="button"
            size="lg"
            onClick={confirmarFinalizacao}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:check-circle-2" className="h-4 w-4" />
            Finalizar e calcular horas
          </Button>
        </section>
      ) : null}
    </div>
  );
}

function CampoHorimetro({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div className="rounded-md border bg-surface/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-foreground-faint">
        <Icon icon="lucide:gauge" className="h-3 w-3" />
        {rotulo}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-foreground">
        {valor != null ? formatHorimetro(valor) : "—"}
      </div>
    </div>
  );
}

function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="font-mono text-foreground">{valor}</span>
    </div>
  );
}

export function ApontamentoNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Apontamento não encontrado</h2>
      <p className="text-sm text-muted-foreground">
        Este apontamento pode ter sido removido ou não pertence a você.
      </p>
      <Link
        to="/app/apontamento"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Meus apontamentos
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

`src/routes/app.apontamento.$apontamentoId.tsx`:

```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ApontamentoDetalhe,
  ApontamentoNaoEncontrado,
} from "@/features/apontamento/components/apontamento-detalhe";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export const Route = createFileRoute("/app/apontamento/$apontamentoId")({
  loader: ({ params }) => {
    if (!apontamentosStore.obter(params.apontamentoId)) throw notFound();
    return null;
  },
  head: () => ({
    meta: [
      { title: "Apontamento · Antonello" },
      {
        name: "description",
        content: "Detalhe e finalização de um apontamento de horímetro no app do operador.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RouteComponent,
  notFoundComponent: ApontamentoNaoEncontrado,
});

function RouteComponent() {
  const { apontamentoId } = Route.useParams();
  return <ApontamentoDetalhe apontamentoId={apontamentoId} />;
}
```

- [ ] **Step 3: Regenerate route tree + verify**

Run: confirme que `/app/apontamento/$apontamentoId` aparece em `src/routeTree.gen.ts`. Se ausente, rode `npm run build`.
Then run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/apontamento/components/apontamento-detalhe.tsx src/routes/app.apontamento.$apontamentoId.tsx src/routeTree.gen.ts
git commit -m "feat: add apontamento detail and finalize screen with route"
```

---

### Task 10: Lista "Meus apontamentos" (page + card + rota index; remove placeholder)

**Files:**
- Create: `src/features/apontamento/components/apontamentos-page.tsx`
- Create: `src/features/apontamento/components/apontamento-card.tsx`
- Create: `src/routes/app.apontamento.index.tsx`
- Remove: `src/routes/app.apontamento.tsx`

**Interfaces:**
- Consumes: `apontamentosStore`, `OPERADOR_LOGADO_ID`, `apontamentosDoOperador` (`@/features/apontamento/apontamentos-store`); `useMockResource` (`@/shared/hooks/use-mock-resource`); `StatusApontamentoBadge` (`@/features/apontamento/components/status-apontamento-badge`); `SyncBadge` (`@/shared/components/sync-badge`); `equipamentosStore` (`@/features/equipamentos/equipamentos-store`); `formatHorimetro` (`@/shared/lib/format`); `Apontamento` (`@/shared/types`).
- Produces: `ApontamentosPage`, `ApontamentoCard`; rota index `/app/apontamento/`.

> O card linka para `/app/apontamento/$apontamentoId` (existe, Task 9) e a página para `/app/apontamento/novo` (existe, Task 8). Remover o placeholder `app.apontamento.tsx` e criar a index é o que estabelece a estrutura final (parent implícito, como `app.ordens.*`).

- [ ] **Step 1: Implement the card**

`src/features/apontamento/components/apontamento-card.tsx`:

```typescript
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { Apontamento } from "@/shared/types";

export function ApontamentoCard({ apontamento }: { apontamento: Apontamento }) {
  const equipamento = equipamentosStore.getById(apontamento.equipamento_id);
  const emAndamento = apontamento.status === "em_andamento";

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">
            {equipamento?.nome ?? "Equipamento"}
          </div>
          <div className="mt-0.5 font-mono text-xs text-foreground-faint">
            Início: {formatHorimetro(apontamento.horimetro_inicial)}
            {apontamento.horas_trabalhadas != null
              ? ` · ${apontamento.horas_trabalhadas} h trabalhadas`
              : ""}
          </div>
        </div>
        <StatusApontamentoBadge status={apontamento.status} />
      </div>

      {apontamento.pendente_sync ? (
        <div className="mt-3">
          <SyncBadge />
        </div>
      ) : null}

      <div className="mt-3 flex justify-end">
        <Link
          to="/app/apontamento/$apontamentoId"
          params={{ apontamentoId: apontamento.id }}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-primary hover:underline"
        >
          {emAndamento ? "Finalizar" : "Ver detalhes"}
          <Icon icon="lucide:arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement the page**

`src/features/apontamento/components/apontamentos-page.tsx`:

```typescript
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import {
  apontamentosStore,
  apontamentosDoOperador,
  OPERADOR_LOGADO_ID,
} from "@/features/apontamento/apontamentos-store";
import { ApontamentoCard } from "@/features/apontamento/components/apontamento-card";

export function ApontamentosPage() {
  const todos = apontamentosStore.useTodos();
  const meus = apontamentosDoOperador(todos, OPERADOR_LOGADO_ID);
  const { isLoading, error, retry } = useMockResource(meus);

  const emAndamento = meus.filter((a) => a.status === "em_andamento");
  const recentes = meus.filter((a) => a.status === "finalizado");

  const botaoIniciar = (
    <Button
      size="lg"
      asChild
      className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
    >
      <Link to="/app/apontamento/novo">
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Iniciar apontamento
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry} className="gap-2">
          <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (meus.length === 0) {
    return (
      <EmptyState
        icon="lucide:clipboard-list"
        titulo="Nenhum apontamento ainda"
        descricao="Inicie o primeiro apontamento de horímetro do seu turno."
        acao={botaoIniciar}
      />
    );
  }

  return (
    <div className="space-y-6">
      {botaoIniciar}

      {emAndamento.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Em andamento
          </h2>
          {emAndamento.map((a) => (
            <ApontamentoCard key={a.id} apontamento={a} />
          ))}
        </section>
      ) : null}

      {recentes.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Recentes
          </h2>
          {recentes.map((a) => (
            <ApontamentoCard key={a.id} apontamento={a} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Create the index route and remove the placeholder**

Create `src/routes/app.apontamento.index.tsx`:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { ApontamentosPage } from "@/features/apontamento/components/apontamentos-page";

export const Route = createFileRoute("/app/apontamento/")({
  head: () => ({
    meta: [
      { title: "Apontamento de Horímetro · Antonello" },
      {
        name: "description",
        content:
          "Meus apontamentos de horímetro: iniciar, finalizar e acompanhar as horas no app do operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ApontamentosPage,
});
```

Then delete the placeholder:

```bash
git rm src/routes/app.apontamento.tsx
```

- [ ] **Step 4: Regenerate route tree + verify**

Run: confirme que `src/routeTree.gen.ts` agora tem `/app/apontamento/` (index) e **não** tem mais o leaf antigo `app.apontamento`. Se necessário, rode `npm run build`.
Then run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: todos os arquivos de teste passam (incluindo os de PRD-001).

- [ ] **Step 6: Commit**

```bash
git add src/features/apontamento/components/apontamentos-page.tsx src/features/apontamento/components/apontamento-card.tsx src/routes/app.apontamento.index.tsx src/routes/app.apontamento.tsx src/routeTree.gen.ts
git commit -m "feat: add Meus apontamentos list screen and index route"
```

---

### Task 11: Barrel + versão + changelog + docs

**Files:**
- Create: `src/features/apontamento/index.ts`
- Modify: `package.json` (`version` → `0.2.0`)
- Modify: `CHANGELOG.md`
- Modify/Rename: `docs/prds/PRD-002-op-apontamento-horimetro.md` → `_DONE.md`
- Modify: `docs/prds/INDEX-PRDs-antonello.md`

**Interfaces:**
- Produces: barrel export da feature.

- [ ] **Step 1: Create the barrel**

`src/features/apontamento/index.ts`:

```typescript
export {
  apontamentosStore,
  apontamentosDoOperador,
  OPERADOR_LOGADO_ID,
} from "./apontamentos-store";
export { calcularHoras } from "./calcular-horas";
export { ApontamentosPage } from "./components/apontamentos-page";
export { ApontamentoDetalhe } from "./components/apontamento-detalhe";
export { IniciarApontamentoForm } from "./components/iniciar-apontamento-form";
```

- [ ] **Step 2: Bump version**

Em `package.json`, trocar `"version": "0.1.0"` por `"version": "0.2.0"`.

- [ ] **Step 3: Update CHANGELOG**

Inserir no topo das versões (após o cabeçalho, antes de `## [0.1.0]`) em `CHANGELOG.md`:

```markdown
## [0.2.0] - 2026-06-28 - Tally

### Added
- Apontamento de horímetro no app do operador (`/app/apontamento`): iniciar
  (seleção de equipamento + horímetro inicial), finalizar (horímetro final com
  cálculo automático de horas) e lista "Meus apontamentos" (em andamento +
  recentes) — PRD-002.
- Captura de horímetro compartilhada (`HorimetroCapture`) com digitação manual
  e leitura por foto via camada de OCR simulada, isolada e plugável.
- Indicador visual "pendente de sincronização" (afford. de offline; engine real
  fica para o PRD-000/003).
- Store dedicado de apontamentos em memória e validações (zod) da captura.
- Testes unitários (vitest): cálculo de horas, transições do store, schemas,
  OCR simulado e sanidade dos mocks.

### Changed
- Contrato de `types` estendido com `Apontamento` e `StatusApontamento`.
- Formatador compartilhado `formatDataHora` adicionado.
```

- [ ] **Step 4: Update PRD status and rename**

Em `docs/prds/PRD-002-op-apontamento-horimetro.md`, atualizar a seção "Status de Implementação":

```markdown
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-28 |
| **Versão do App** | 0.2.0 — Tally |
| **Implementado por** | Claude Opus 4.8 (Claude Code) |
| **Observações** | Frontend First (mockado). OS embutida na `/app/ordens` mantida; reconciliação fica no PRD-003. OCR simulado/plugável. |
```

Then rename:

```bash
git mv docs/prds/PRD-002-op-apontamento-horimetro.md docs/prds/PRD-002-op-apontamento-horimetro_DONE.md
```

> **Nota:** `docs/prds/` é uma área que o usuário mantém (frequentemente untracked). Se `git mv` falhar por o arquivo não estar rastreado, renomeie no disco (mover o arquivo) sem git. Confirmar com o estado real do repo.

- [ ] **Step 5: Update INDEX**

Em `docs/prds/INDEX-PRDs-antonello.md`:
- Resumo de status: ✅ Implementado `1 → 2`, ⏳ Pendente `14 → 13`; recomputar percentuais (2/15 ≈ 13%, 13/15 ≈ 87%).
- Linha do PRD-002 no roadmap da Onda 1: arquivo `PRD-002-op-apontamento-horimetro_DONE.md`, Doc ✍️, Status ✅.
- "PRDs Implementados" no bloco de Informações: `1 → 2`.

- [ ] **Step 6: Verify tsc + full suite**

Run: `npx tsc --noEmit` → EXIT 0.
Run: `npm test` → todos passam.

- [ ] **Step 7: Commit**

```bash
git add src/features/apontamento/index.ts package.json CHANGELOG.md docs/prds/
git commit -m "chore: release 0.2.0 (Tally) — PRD-002 apontamento de horímetro"
```

---

## Self-Review (do plano contra o spec)

**1. Cobertura do spec:**
- RF-001/002 (iniciar manual): Task 8 ✓. RF-003 (OCR fallback): Tasks 2+7 ✓. RF-004/005 (finalizar + validar): Tasks 4+9 ✓. RF-006 (observação): Task 8 ✓. RF-007 (OS opcional): Task 8 ✓. RF-008 (lista do operador): Tasks 4+10 ✓. RF-009 (pendente_sync): Tasks 6+9+10 ✓. RF-010 (mobile/toque): tamanhos `h-14`/`size="lg"`/`min-h-[44px]` ✓. RF-011 (sem financeiro): nenhuma tela exibe valor ✓.
- Estados de tela (loading/empty/error/success): Task 10 (lista) + Task 7 (captura) ✓.
- Contrato `Apontamento`: Task 1 ✓. Mocks com edge cases: Task 3 ✓. Testes híbridos: Tasks 1-6 (vitest) + verificação visual final (controller) ✓.
- Versão/changelog/PRD/INDEX: Task 11 ✓.

**2. Placeholders:** nenhum "TBD/TODO"; todo passo de código traz o código completo.

**3. Consistência de tipos/assinaturas:** `Apontamento` (T1) usado por mock (T3), store (T4), telas (T8-10). `criarApontamentosStore`/`apontamentosStore`/`apontamentosDoOperador`/`OPERADOR_LOGADO_ID` (T4) consumidos consistentemente. `lerHorimetroDaFoto`/`OCR_HABILITADO` (T2) → `HorimetroCapture` (T7). `calcularHoras` (T1) → store (T4) e mock test (T3). `formatDataHora` (T6) → detalhe (T9). Rotas referenciam apenas rotas já existentes na ordem T8→T9→T10. Sem divergências.

## Execução

Após salvar, a execução segue por **subagent-driven-development** (recomendado), com o dev server mantido vivo (porta 8082) para regenerar `routeTree.gen.ts`.
