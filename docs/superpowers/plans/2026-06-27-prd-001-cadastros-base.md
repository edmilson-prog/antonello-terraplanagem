# PRD-001 Cadastros Base — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar os CRUDs mockados de Equipamentos, Operadores e Clientes na Retaguarda (`/admin/*`), estabelecendo o contrato de `types` que os PRDs 002–005 vão consumir.

**Architecture:** Primitivos compartilhados em `src/shared/` (store em memória sobre `useSyncExternalStore`, envelope de loading/erro simulado, lista responsiva tabela↔cards, diálogos de form/confirmação) reutilizados por 3 features por domínio (`src/features/{equipamentos,operadores,clientes}/`). Lógica pura (store, validadores CPF/CNPJ, formatadores) coberta por testes vitest; UI verificada por typecheck + lint + checagem visual no dev server.

**Tech Stack:** React 19 + TanStack Start/Router · TypeScript (strict) · Tailwind v4 + shadcn/ui · react-hook-form + zod · @iconify/react (ícones de aplicação, set `lucide:*`) · sonner (toasts) · vitest (lógica pura).

## Global Constraints

- **Fase Frontend First:** sem Supabase, sem backend. Todo dado vem de `src/mocks/` (`snake_case`, espelhando o schema futuro). **NÃO** conectar backend.
- **Operador nunca vê cadastro:** estas telas vivem só em `/admin/*`. **NUNCA** exibir preço/valor/dado financeiro (não há nenhum aqui — manter assim).
- **Sem `any`:** usar `unknown` ou tipo específico. Optional chaining em vez de `!`.
- **Tokens, nunca hardcode:** cores/fontes via classes Tailwind que mapeiam CSS variables (`bg-surface`, `text-foreground-faint`, `bg-primary`, `text-destructive`, etc.). Tema light/dark obrigatório — não introduzir cor fixa.
- **Ícones de aplicação:** `@iconify/react` com set `lucide:*`. Componentes shadcn mantêm seus ícones lucide internos.
- **Nomes de arquivo:** kebab-case (`create-mock-store.ts`). Funções/variáveis camelCase; interfaces sem prefixo aqui (o código atual não usa `I`-prefix — seguir o código, ex.: `Equipamento`, não `IEquipamento`).
- **Alias:** `@/` → `src/`. Imports na ordem: framework → libs externas → componentes internos → hooks → utils → types.
- **Soft-delete:** inativar (`ativo:false`), nunca apagar. Hard delete fora do escopo.
- **Branch:** trabalho na branch `feat/prd-001-cadastros-base` (já criada). Dev server já roda em http://localhost:8080 — **não** subir outro.
- **Responsividade:** validar 375 / 768 / 1280px. Tabela → cards em <768px (`md:` breakpoint).

---

### Task 1: Infraestrutura de testes (vitest)

Adiciona o runner de testes para a lógica pura. Sem jsdom (só ambiente node).

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `test`)
- Create: `vitest.config.ts`
- Create: `src/shared/lib/smoke.test.ts` (prova que o runner funciona; removido no fim da task)

**Interfaces:**
- Consumes: nada.
- Produces: comando `npm test` (= `vitest run`) executável; alias `@/` resolvido em testes via `vite-tsconfig-paths` (já em devDeps).

- [ ] **Step 1: Instalar vitest**

Run: `npm install -D vitest@^3`
Expected: adiciona `vitest` em devDependencies, sem erros de peer.

- [ ] **Step 2: Criar `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Adicionar o script `test` ao `package.json`**

No bloco `"scripts"`, adicionar após `"lint"`:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 4: Escrever um smoke test**

Create `src/shared/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest runner", () => {
  it("roda e resolve o alias @/", async () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Rodar os testes**

Run: `npm test`
Expected: PASS — 1 arquivo, 1 teste verde.

- [ ] **Step 6: Remover o smoke test**

Run: `rm src/shared/lib/smoke.test.ts`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "$(cat <<'EOF'
chore: add vitest for pure-logic unit tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Contrato de dados (types) + mocks

Estende as 3 interfaces e atualiza os 3 mocks no mesmo passo (mudam juntos — senão o typecheck quebra).

**Files:**
- Modify: `src/shared/types/index.ts`
- Modify: `src/mocks/equipamentos.ts`
- Modify: `src/mocks/operadores.ts`
- Modify: `src/mocks/clientes.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type TipoEquipamento = "escavadeira" | "carregadeira" | "caminhao_cacamba" | "trator_esteira" | "retroescavadeira" | "outro"`
  - `type EquipamentoStatus = "disponivel" | "em_uso" | "manutencao"` (operacional)
  - `interface Equipamento { id; nome; tipo: TipoEquipamento; capacidade; horimetro_atual: number; identificador: string | null; status: EquipamentoStatus; ativo: boolean; created_at: string; updated_at: string }`
  - `interface Operador { id; nome; telefone: string | null; ativo: boolean; created_at: string; updated_at: string }`
  - `interface Cliente { id; nome; documento: string | null; telefone: string | null; ativo: boolean; created_at: string; updated_at: string }`
  - mocks exportados: `equipamentos: Equipamento[]`, `operadores: Operador[]`, `clientes: Cliente[]`, `clientesVazio: Cliente[]`.

- [ ] **Step 1: Estender os types**

Em `src/shared/types/index.ts`, substituir o bloco que vai de `export type EquipamentoStatus` até o fim de `interface Cliente` por:

```ts
export type TipoEquipamento =
  | "escavadeira"
  | "carregadeira"
  | "caminhao_cacamba"
  | "trator_esteira"
  | "retroescavadeira"
  | "outro";

// status OPERACIONAL (onde a máquina está) — distinto de `ativo` (ciclo de vida)
export type EquipamentoStatus = "disponivel" | "em_uso" | "manutencao";

export interface Equipamento {
  id: string;
  nome: string;
  tipo: TipoEquipamento;
  capacidade: string; // texto livre ("18 toneladas", "2,5 m³")
  horimetro_atual: number;
  identificador: string | null; // patrimônio/placa (opcional)
  status: EquipamentoStatus; // operacional
  ativo: boolean; // soft-delete / cadastral
  created_at: string;
  updated_at: string;
}

export interface Operador {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string | null; // CPF/CNPJ (opcional nesta fase)
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

Deixar `Perfil`, `SessaoMock`, `OrdemStatus`, `OrdemServicoOperador` e os types de faturamento **inalterados**.

- [ ] **Step 2: Atualizar o mock de equipamentos**

Substituir todo o conteúdo de `src/mocks/equipamentos.ts` por:

```ts
import type { Equipamento } from "@/shared/types";

// ~8 equipamentos espelhando o schema futuro. Edge cases: 1 em manutenção,
// 1 inativo, 1 sem identificador, nome longo, horímetro alto com decimal.
export const equipamentos: Equipamento[] = [
  {
    id: "eq-001",
    nome: "Escavadeira Hidráulica Caterpillar 320D",
    tipo: "escavadeira",
    capacidade: "18 toneladas",
    horimetro_atual: 8432,
    identificador: "PAT-0001",
    status: "em_uso",
    ativo: true,
    created_at: "2024-01-10T12:00:00.000Z",
    updated_at: "2025-11-02T09:30:00.000Z",
  },
  {
    id: "eq-002",
    nome: "Escavadeira 10t",
    tipo: "escavadeira",
    capacidade: "10 toneladas",
    horimetro_atual: 5120,
    identificador: "PAT-0002",
    status: "disponivel",
    ativo: true,
    created_at: "2024-02-15T12:00:00.000Z",
    updated_at: "2025-10-20T14:00:00.000Z",
  },
  {
    id: "eq-003",
    nome: "Mini Escavadeira 5t",
    tipo: "escavadeira",
    capacidade: "5 toneladas",
    horimetro_atual: 2310.5,
    identificador: null,
    status: "disponivel",
    ativo: true,
    created_at: "2024-03-01T12:00:00.000Z",
    updated_at: "2025-09-12T08:15:00.000Z",
  },
  {
    id: "eq-004",
    nome: "Carregadeira de Rodas",
    tipo: "carregadeira",
    capacidade: "2,5 m³",
    horimetro_atual: 6740,
    identificador: "PAT-0004",
    status: "manutencao",
    ativo: true,
    created_at: "2024-01-22T12:00:00.000Z",
    updated_at: "2026-05-30T16:45:00.000Z",
  },
  {
    id: "eq-005",
    nome: "Caminhão Caçamba Basculante",
    tipo: "caminhao_cacamba",
    capacidade: "12 m³",
    horimetro_atual: 12890,
    identificador: "MER-5821",
    status: "em_uso",
    ativo: true,
    created_at: "2023-11-05T12:00:00.000Z",
    updated_at: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "eq-006",
    nome: "Trator de Esteira D6",
    tipo: "trator_esteira",
    capacidade: "20 toneladas",
    horimetro_atual: 4205,
    identificador: "PAT-0006",
    status: "disponivel",
    ativo: true,
    created_at: "2024-04-18T12:00:00.000Z",
    updated_at: "2025-12-01T11:20:00.000Z",
  },
  {
    id: "eq-007",
    nome: "Retroescavadeira JCB 3CX para serviços de fundação, vala e nivelamento fino em terreno urbano",
    tipo: "retroescavadeira",
    capacidade: "8 toneladas",
    horimetro_atual: 9876.5,
    identificador: "PAT-0007",
    status: "disponivel",
    ativo: true,
    created_at: "2024-05-09T12:00:00.000Z",
    updated_at: "2026-04-15T13:30:00.000Z",
  },
  {
    id: "eq-008",
    nome: "Escavadeira Antiga (desativada)",
    tipo: "escavadeira",
    capacidade: "15 toneladas",
    horimetro_atual: 21030,
    identificador: "PAT-0008",
    status: "disponivel",
    ativo: false,
    created_at: "2021-07-30T12:00:00.000Z",
    updated_at: "2025-08-10T09:00:00.000Z",
  },
];
```

- [ ] **Step 3: Atualizar o mock de operadores**

Substituir todo o conteúdo de `src/mocks/operadores.ts` por:

```ts
import type { Operador } from "@/shared/types";

// ~5 operadores. Edge cases: 1 inativo, 1 nome longo, 1 sem telefone.
export const operadores: Operador[] = [
  {
    id: "op-001",
    nome: "José Carlos da Silva",
    telefone: "44999990001",
    ativo: true,
    created_at: "2024-01-10T12:00:00.000Z",
    updated_at: "2024-01-10T12:00:00.000Z",
  },
  {
    id: "op-002",
    nome: "Antônio Pereira",
    telefone: "44999990002",
    ativo: true,
    created_at: "2024-02-01T12:00:00.000Z",
    updated_at: "2024-02-01T12:00:00.000Z",
  },
  {
    id: "op-003",
    nome: "Marcos Vinícius Rodrigues de Oliveira",
    telefone: null,
    ativo: true,
    created_at: "2024-03-12T12:00:00.000Z",
    updated_at: "2024-03-12T12:00:00.000Z",
  },
  {
    id: "op-004",
    nome: "Reinaldo Souza",
    telefone: "44988887777",
    ativo: false,
    created_at: "2023-09-20T12:00:00.000Z",
    updated_at: "2025-06-15T12:00:00.000Z",
  },
  {
    id: "op-005",
    nome: "Paulo Henrique Gomes",
    telefone: "44991234567",
    ativo: true,
    created_at: "2024-06-05T12:00:00.000Z",
    updated_at: "2024-06-05T12:00:00.000Z",
  },
];
```

- [ ] **Step 4: Atualizar o mock de clientes**

Substituir todo o conteúdo de `src/mocks/clientes.ts` por:

```ts
import type { Cliente } from "@/shared/types";

// ~4 clientes. Edge cases: 1 com CNPJ, 1 sem documento, 1 nome longo, 1 inativo (com CPF).
// Documentos com dígitos verificadores válidos (passam na validação do form).
export const clientes: Cliente[] = [
  {
    id: "cl-001",
    nome: "Construtora Horizonte Ltda.",
    documento: "11222333000181", // CNPJ válido
    telefone: "4432210000",
    ativo: true,
    created_at: "2024-01-15T12:00:00.000Z",
    updated_at: "2024-01-15T12:00:00.000Z",
  },
  {
    id: "cl-002",
    nome: "Incorporadora Vale Verde",
    documento: null,
    telefone: "44991110000",
    ativo: true,
    created_at: "2024-02-20T12:00:00.000Z",
    updated_at: "2024-02-20T12:00:00.000Z",
  },
  {
    id: "cl-003",
    nome: "Prefeitura Municipal de São Pedro do Ivaí — Secretaria de Obras e Infraestrutura",
    documento: null,
    telefone: null,
    ativo: true,
    created_at: "2024-03-30T12:00:00.000Z",
    updated_at: "2024-03-30T12:00:00.000Z",
  },
  {
    id: "cl-004",
    nome: "João da Silva Construções ME",
    documento: "52998224725", // CPF válido
    telefone: "44999998888",
    ativo: false,
    created_at: "2023-12-01T12:00:00.000Z",
    updated_at: "2025-05-10T12:00:00.000Z",
  },
];

// Lista vazia para validar o empty state.
export const clientesVazio: Cliente[] = [];
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS — sem erros. (Confirma que os mocks satisfazem os novos types e nada mais no código quebrou.)

- [ ] **Step 6: Commit**

```bash
git add src/shared/types/index.ts src/mocks/equipamentos.ts src/mocks/operadores.ts src/mocks/clientes.ts
git commit -m "$(cat <<'EOF'
feat: extend cadastro types and mocks (PRD-001 contract)

Two-axis equipment status (ativo + operational), tipo enum, documento/
telefone/timestamps on the three entities. Mocks updated with edge cases.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `createMockStore` (store genérico em memória) — TDD

Generaliza o padrão de `features/operador/ordens-store.ts` para qualquer entidade com `id`, `ativo` e timestamps.

**Files:**
- Create: `src/shared/lib/create-mock-store.ts`
- Test: `src/shared/lib/create-mock-store.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  ```ts
  type Entidade = { id: string; ativo: boolean; created_at: string; updated_at: string };
  interface MockStore<T extends Entidade> {
    getAll: () => T[];
    getById: (id: string) => T | undefined;
    useAll: () => T[];
    create: (data: Omit<T, "id" | "created_at" | "updated_at">) => T;
    update: (id: string, patch: Partial<Omit<T, "id" | "created_at">>) => void;
    setAtivo: (id: string, ativo: boolean) => void;
  }
  function createMockStore<T extends Entidade>(seed: T[]): MockStore<T>;
  ```

- [ ] **Step 1: Escrever os testes que falham**

Create `src/shared/lib/create-mock-store.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMockStore } from "./create-mock-store";

type Item = {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

const seed: Item[] = [
  { id: "a", nome: "Alpha", ativo: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
];

describe("createMockStore", () => {
  it("getAll retorna a seed inicial", () => {
    const store = createMockStore<Item>(seed);
    expect(store.getAll()).toHaveLength(1);
    expect(store.getAll()[0].nome).toBe("Alpha");
  });

  it("getById encontra por id", () => {
    const store = createMockStore<Item>(seed);
    expect(store.getById("a")?.nome).toBe("Alpha");
    expect(store.getById("inexistente")).toBeUndefined();
  });

  it("create adiciona com id e timestamps gerados", () => {
    const store = createMockStore<Item>(seed);
    const criado = store.create({ nome: "Beta", ativo: true });
    expect(criado.id).toBeTruthy();
    expect(criado.created_at).toBeTruthy();
    expect(criado.updated_at).toBe(criado.created_at);
    expect(store.getAll()).toHaveLength(2);
    expect(store.getById(criado.id)?.nome).toBe("Beta");
  });

  it("update aplica patch e atualiza updated_at sem tocar created_at", () => {
    const store = createMockStore<Item>(seed);
    store.update("a", { nome: "Alpha 2" });
    const item = store.getById("a");
    expect(item?.nome).toBe("Alpha 2");
    expect(item?.created_at).toBe("2024-01-01T00:00:00.000Z");
    expect(item?.updated_at).not.toBe("2024-01-01T00:00:00.000Z");
  });

  it("setAtivo alterna o flag ativo", () => {
    const store = createMockStore<Item>(seed);
    store.setAtivo("a", false);
    expect(store.getById("a")?.ativo).toBe(false);
    store.setAtivo("a", true);
    expect(store.getById("a")?.ativo).toBe(true);
  });

  it("não muta a seed original", () => {
    const original = [...seed];
    const store = createMockStore<Item>(seed);
    store.create({ nome: "Gamma", ativo: true });
    expect(seed).toEqual(original);
    expect(seed).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- create-mock-store`
Expected: FAIL — `createMockStore is not a function` / módulo não encontrado.

- [ ] **Step 3: Implementar**

Create `src/shared/lib/create-mock-store.ts`:

```ts
import { useSyncExternalStore } from "react";

// Store mock genérico em memória. Generaliza features/operador/ordens-store.ts.
// Em produção isto vira mutation no backend + invalidate das queries; aqui usamos
// useSyncExternalStore para refletir mudanças em qualquer tela que leia a lista.

type Entidade = {
  id: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export interface MockStore<T extends Entidade> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  useAll: () => T[];
  create: (data: Omit<T, "id" | "created_at" | "updated_at">) => T;
  update: (id: string, patch: Partial<Omit<T, "id" | "created_at">>) => void;
  setAtivo: (id: string, ativo: boolean) => void;
}

export function createMockStore<T extends Entidade>(seed: T[]): MockStore<T> {
  let itens: T[] = seed.map((item) => ({ ...item }));
  const ouvintes = new Set<() => void>();

  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const getAll = () => itens;
  const getById = (id: string) => itens.find((i) => i.id === id);

  const create: MockStore<T>["create"] = (data) => {
    const agora = new Date().toISOString();
    const novo = {
      ...(data as Omit<T, "id" | "created_at" | "updated_at">),
      id: crypto.randomUUID(),
      created_at: agora,
      updated_at: agora,
    } as T;
    itens = [novo, ...itens];
    notificar();
    return novo;
  };

  const update: MockStore<T>["update"] = (id, patch) => {
    itens = itens.map((i) =>
      i.id === id ? { ...i, ...patch, updated_at: new Date().toISOString() } : i,
    );
    notificar();
  };

  const setAtivo = (id: string, ativo: boolean) => update(id, { ativo } as Partial<T>);

  const useAll = () => useSyncExternalStore(inscrever, getAll, getAll);

  return { getAll, getById, useAll, create, update, setAtivo };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- create-mock-store`
Expected: PASS — 6 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/create-mock-store.ts src/shared/lib/create-mock-store.test.ts
git commit -m "$(cat <<'EOF'
feat: add generic in-memory mock store with tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Validadores CPF/CNPJ — TDD

**Files:**
- Create: `src/shared/lib/validators.ts`
- Test: `src/shared/lib/validators.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `isCpf(value: string): boolean`, `isCnpj(value: string): boolean`, `isCpfOuCnpj(value: string): boolean`.

- [ ] **Step 1: Escrever os testes que falham**

Create `src/shared/lib/validators.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isCpf, isCnpj, isCpfOuCnpj } from "./validators";

describe("isCpf", () => {
  it("aceita CPF válido (com e sem máscara)", () => {
    expect(isCpf("529.982.247-25")).toBe(true);
    expect(isCpf("52998224725")).toBe(true);
  });
  it("rejeita dígito verificador errado", () => {
    expect(isCpf("529.982.247-24")).toBe(false);
  });
  it("rejeita sequência repetida e tamanho errado", () => {
    expect(isCpf("111.111.111-11")).toBe(false);
    expect(isCpf("123")).toBe(false);
  });
});

describe("isCnpj", () => {
  it("aceita CNPJ válido (com e sem máscara)", () => {
    expect(isCnpj("11.222.333/0001-81")).toBe(true);
    expect(isCnpj("11222333000181")).toBe(true);
  });
  it("rejeita dígito verificador errado", () => {
    expect(isCnpj("11.222.333/0001-80")).toBe(false);
  });
  it("rejeita sequência repetida e tamanho errado", () => {
    expect(isCnpj("00000000000000")).toBe(false);
    expect(isCnpj("123")).toBe(false);
  });
});

describe("isCpfOuCnpj", () => {
  it("aceita CPF e CNPJ válidos pelo comprimento", () => {
    expect(isCpfOuCnpj("529.982.247-25")).toBe(true);
    expect(isCpfOuCnpj("11.222.333/0001-81")).toBe(true);
  });
  it("rejeita comprimento que não é 11 nem 14", () => {
    expect(isCpfOuCnpj("12345")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- validators`
Expected: FAIL — módulo/funções inexistentes.

- [ ] **Step 3: Implementar**

Create `src/shared/lib/validators.ts`:

```ts
// Validação de CPF/CNPJ pelos dígitos verificadores. Aceita com ou sem máscara.

export function isCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let dv1 = (soma * 10) % 11;
  if (dv1 === 10) dv1 = 0;
  if (dv1 !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let dv2 = (soma * 10) % 11;
  if (dv2 === 10) dv2 = 0;
  return dv2 === Number(cpf[10]);
}

export function isCnpj(value: string): boolean {
  const cnpj = value.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const digito = (tamanho: number): number => {
    const pesos =
      tamanho === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cnpj[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  if (digito(12) !== Number(cnpj[12])) return false;
  return digito(13) === Number(cnpj[13]);
}

export function isCpfOuCnpj(value: string): boolean {
  const digitos = value.replace(/\D/g, "");
  if (digitos.length === 11) return isCpf(value);
  if (digitos.length === 14) return isCnpj(value);
  return false;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- validators`
Expected: PASS — todos verdes.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/validators.ts src/shared/lib/validators.test.ts
git commit -m "$(cat <<'EOF'
feat: add CPF/CNPJ validators with tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Formatadores (horímetro, documento, telefone) — TDD

**Files:**
- Create: `src/shared/lib/format.ts`
- Test: `src/shared/lib/format.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `formatHorimetro(horas: number): string`, `formatDocumento(doc: string | null): string`, `formatTelefone(tel: string | null): string`.

- [ ] **Step 1: Escrever os testes que falham**

Create `src/shared/lib/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatHorimetro, formatDocumento, formatTelefone } from "./format";

describe("formatHorimetro", () => {
  it("formata inteiro com sufixo h e milhar pt-BR", () => {
    expect(formatHorimetro(8432)).toBe("8.432 h");
  });
  it("mantém uma casa decimal quando há fração", () => {
    expect(formatHorimetro(9876.5)).toBe("9.876,5 h");
  });
});

describe("formatDocumento", () => {
  it("formata CPF", () => {
    expect(formatDocumento("52998224725")).toBe("529.982.247-25");
  });
  it("formata CNPJ", () => {
    expect(formatDocumento("11222333000181")).toBe("11.222.333/0001-81");
  });
  it("retorna travessão para nulo/vazio", () => {
    expect(formatDocumento(null)).toBe("—");
  });
});

describe("formatTelefone", () => {
  it("formata celular de 11 dígitos", () => {
    expect(formatTelefone("44999990001")).toBe("(44) 99999-0001");
  });
  it("formata fixo de 10 dígitos", () => {
    expect(formatTelefone("4432210000")).toBe("(44) 3221-0000");
  });
  it("retorna travessão para nulo", () => {
    expect(formatTelefone(null)).toBe("—");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- format`
Expected: FAIL — módulo/funções inexistentes.

- [ ] **Step 3: Implementar**

Create `src/shared/lib/format.ts`:

```ts
// Formatadores de exibição compartilhados. Nada de valor financeiro aqui
// (cadastros não exibem preço/valor).

const horimetroFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatHorimetro(horas: number): string {
  return `${horimetroFormatter.format(horas)} h`;
}

export function formatDocumento(doc: string | null): string {
  if (!doc) return "—";
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

export function formatTelefone(tel: string | null): string {
  if (!tel) return "—";
  const d = tel.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- format`
Expected: PASS — todos verdes.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/format.ts src/shared/lib/format.test.ts
git commit -m "$(cat <<'EOF'
feat: add horimetro/documento/telefone formatters with tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Infra de UI compartilhada (Iconify + EmptyState/PageHeader + Toaster)

Prepara o terreno visual: instala Iconify, dá suporte a ícone Iconify + ação (CTA) no `EmptyState`, e monta o `<Toaster/>` (hoje ausente — sem ele nenhum toast aparece).

**Files:**
- Modify: `package.json` (dependency `@iconify/react`)
- Modify: `src/shared/components/empty-state.tsx`
- Modify: `src/routes/__root.tsx`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `EmptyState` aceita, além de `icone?: LucideIcon`: `icon?: string` (nome Iconify) e `acao?: ReactNode` (CTA abaixo do texto). Backward-compatible.
  - `<Toaster richColors position="top-right" />` montado no root → `toast.success(...)` / `toast.error(...)` (de `sonner`) passam a renderizar.

- [ ] **Step 1: Instalar Iconify**

Run: `npm install @iconify/react`
Expected: adiciona `@iconify/react` em dependencies.

- [ ] **Step 2: Estender o `EmptyState`**

Substituir todo o conteúdo de `src/shared/components/empty-state.tsx` por:

```tsx
import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  titulo?: string;
  descricao?: string;
  /** Ícone Iconify (ex.: "lucide:truck"). Tem prioridade sobre `icone`. */
  icon?: string;
  /** Compatibilidade: componente de ícone lucide. */
  icone?: LucideIcon;
  /** CTA opcional renderizado abaixo do texto. */
  acao?: ReactNode;
  className?: string;
}

export function EmptyState({
  titulo = "Em construção",
  descricao = "Esta área ainda está sendo preparada. Em breve você verá tudo funcionando por aqui.",
  icon,
  icone: Icone = Construction,
  acao,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon ? (
          <Icon icon={icon} className="h-8 w-8" />
        ) : (
          <Icone className="h-8 w-8" strokeWidth={2.25} />
        )}
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-foreground">{titulo}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>
      </div>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  );
}
```

- [ ] **Step 3: Montar o `<Toaster/>` no root**

Em `src/routes/__root.tsx`:

1. Adicionar o import do Toaster junto aos outros imports internos (após o import de `reportLovableError`):

```ts
import { Toaster } from "@/components/ui/sonner";
```

2. No `RootComponent`, renderizar o Toaster dentro do provider:

```tsx
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 5: Verificação visual**

No navegador (dev server em http://localhost:8080):
- Abrir `/admin/equipamentos` (ainda placeholder) → o `EmptyState` continua renderizando normalmente (regressão do prop `icone` lucide OK).
- Sem erros no console relativos a Iconify/Toaster.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/shared/components/empty-state.tsx src/routes/__root.tsx
git commit -m "$(cat <<'EOF'
feat: add Iconify, EmptyState icon/cta support, mount sonner Toaster

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Kit de CRUD compartilhado (useMockResource, DataList, FormDialog, ConfirmDialog)

Os primitivos reutilizados pelas 3 features. Verificação por typecheck + lint (verificação visual acontece na Task 8, primeiro consumidor).

**Files:**
- Create: `src/shared/hooks/use-mock-resource.ts`
- Create: `src/shared/components/data-list.tsx`
- Create: `src/shared/components/form-dialog.tsx`
- Create: `src/shared/components/confirm-dialog.tsx`

**Interfaces:**
- Consumes: `EmptyState` (com `icon`/`acao`), shadcn `Button`/`Skeleton`/`Dialog`/`AlertDialog`, `Icon` do Iconify, `cn`.
- Produces:
  - `useMockResource<T>(data: T, opts?: { delayMs?: number; forceError?: boolean }): { data: T; isLoading: boolean; error: Error | null; retry: () => void }`
  - `interface Column<T> { header: string; cell: (item: T) => ReactNode; className?: string; headerClassName?: string }`
  - `DataList<T>(props)` com props `{ data, columns, getRowKey, renderCard, isLoading, error, onRetry, empty: { icon?, titulo, descricao, cta? }, toolbar?, rowActions? }`
  - `FormDialog(props)` com props `{ open, onOpenChange, titulo, descricao?, children }`
  - `ConfirmDialog(props)` com props `{ open, onOpenChange, titulo, descricao, confirmLabel?, onConfirm, destrutivo? }`

- [ ] **Step 1: Criar `use-mock-resource.ts`**

Create `src/shared/hooks/use-mock-resource.ts`:

```ts
import { useCallback, useEffect, useState } from "react";

// Envelope que simula um fetch assíncrono sobre dados já em memória, só para
// exercitar os estados de tela (loading / error / success) na fase mockada.
// As mutações continuam indo direto ao store; este hook só governa o estado
// de carregamento inicial e o retry.

interface Options {
  delayMs?: number;
  forceError?: boolean;
}

interface Resource<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useMockResource<T>(data: T, opts: Options = {}): Resource<T> {
  const { delayMs = 400, forceError = false } = opts;
  const [fase, setFase] = useState<"loading" | "ready" | "error">("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setFase("loading");
    const timer = setTimeout(() => {
      setFase(forceError ? "error" : "ready");
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, forceError, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data,
    isLoading: fase === "loading",
    error: fase === "error" ? new Error("Falha ao carregar os dados.") : null,
    retry,
  };
}
```

- [ ] **Step 2: Criar `data-list.tsx`**

Create `src/shared/components/data-list.tsx`:

```tsx
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataListProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  empty: { icon?: string; titulo: string; descricao: string; cta?: ReactNode };
  toolbar?: ReactNode;
  rowActions?: (item: T) => ReactNode;
}

export function DataList<T>({
  data,
  columns,
  getRowKey,
  renderCard,
  isLoading,
  error,
  onRetry,
  empty,
  toolbar,
  rowActions,
}: DataListProps<T>) {
  return (
    <div className="space-y-4">
      {toolbar}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center">
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={empty.icon}
          titulo={empty.titulo}
          descricao={empty.descricao}
          acao={empty.cta}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                  {columns.map((c) => (
                    <th key={c.header} className={cn("px-4 py-3 font-medium", c.headerClassName)}>
                      {c.header}
                    </th>
                  ))}
                  {rowActions ? (
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={getRowKey(item)} className="border-b last:border-b-0 hover:bg-surface/50">
                    {columns.map((c) => (
                      <td key={c.header} className={cn("px-4 py-3 align-middle", c.className)}>
                        {c.cell(item)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-4 py-3 text-right">{rowActions(item)}</td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {data.map((item) => (
              <li key={getRowKey(item)}>{renderCard(item)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Criar `form-dialog.tsx`**

Create `src/shared/components/form-dialog.tsx`:

```tsx
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{titulo}</DialogTitle>
          {descricao ? <DialogDescription>{descricao}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Criar `confirm-dialog.tsx`**

Create `src/shared/components/confirm-dialog.tsx`:

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  confirmLabel?: string;
  onConfirm: () => void;
  destrutivo?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  confirmLabel = "Confirmar",
  onConfirm,
  destrutivo = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              destrutivo &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/shared/hooks/use-mock-resource.ts src/shared/components/data-list.tsx src/shared/components/form-dialog.tsx src/shared/components/confirm-dialog.tsx
git commit -m "$(cat <<'EOF'
feat: add shared CRUD kit (useMockResource, DataList, Form/ConfirmDialog)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Feature Equipamentos + rota

CRUD completo de equipamentos. Primeiro consumidor do kit — exercita tudo visualmente.

**Files:**
- Create: `src/features/equipamentos/equipamentos-store.ts`
- Create: `src/features/equipamentos/labels.tsx`
- Create: `src/features/equipamentos/equipamento-schema.ts`
- Create: `src/features/equipamentos/components/equipamento-form.tsx`
- Create: `src/features/equipamentos/components/equipamentos-page.tsx`
- Create: `src/features/equipamentos/index.ts`
- Modify: `src/routes/admin.equipamentos.tsx`

**Interfaces:**
- Consumes: `createMockStore`, `useMockResource`, `DataList`/`Column`, `FormDialog`, `ConfirmDialog`, `PageHeader`, formatadores, types `Equipamento`/`TipoEquipamento`/`EquipamentoStatus`, shadcn `Input`/`Label`/`Select`/`Switch`/`Button`, `Icon`, `toast`.
- Produces: `EquipamentosPage` (default-ish export via barrel) montado em `/admin/equipamentos`. `equipamentosStore` (singleton) reutilizável por PRDs futuros.

- [ ] **Step 1: Store da feature**

Create `src/features/equipamentos/equipamentos-store.ts`:

```ts
import { createMockStore } from "@/shared/lib/create-mock-store";
import { equipamentos } from "@/mocks/equipamentos";
import type { Equipamento } from "@/shared/types";

export const equipamentosStore = createMockStore<Equipamento>(equipamentos);
```

- [ ] **Step 2: Labels e badge de status**

Create `src/features/equipamentos/labels.tsx`:

```tsx
import type { EquipamentoStatus, TipoEquipamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const TIPO_LABEL: Record<TipoEquipamento, string> = {
  escavadeira: "Escavadeira",
  carregadeira: "Carregadeira",
  caminhao_cacamba: "Caminhão Caçamba",
  trator_esteira: "Trator de Esteira",
  retroescavadeira: "Retroescavadeira",
  outro: "Outro",
};

export const TIPOS: TipoEquipamento[] = [
  "escavadeira",
  "carregadeira",
  "caminhao_cacamba",
  "trator_esteira",
  "retroescavadeira",
  "outro",
];

export const STATUS_LABEL: Record<EquipamentoStatus, string> = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  manutencao: "Em manutenção",
};

export const STATUS: EquipamentoStatus[] = ["disponivel", "em_uso", "manutencao"];

const STATUS_CLASSE: Record<EquipamentoStatus, string> = {
  disponivel: "bg-steel/20 text-foreground border-steel/40",
  em_uso: "bg-primary/20 text-foreground border-primary/50",
  manutencao: "bg-destructive/15 text-destructive border-destructive/40",
};

export function EquipamentoStatusBadge({ status }: { status: EquipamentoStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function InativoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground-faint">
      Inativo
    </span>
  );
}
```

- [ ] **Step 3: Schema do formulário**

Create `src/features/equipamentos/equipamento-schema.ts`:

```ts
import { z } from "zod";

export const equipamentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do equipamento"),
  tipo: z.enum([
    "escavadeira",
    "carregadeira",
    "caminhao_cacamba",
    "trator_esteira",
    "retroescavadeira",
    "outro",
  ]),
  capacidade: z.string().trim().min(1, "Informe a capacidade"),
  horimetro_atual: z
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0, "O horímetro não pode ser negativo"),
  identificador: z.string().trim().optional(),
  status: z.enum(["disponivel", "em_uso", "manutencao"]),
  ativo: z.boolean(),
});

export type EquipamentoFormValues = z.infer<typeof equipamentoSchema>;
```

- [ ] **Step 4: Formulário**

Create `src/features/equipamentos/components/equipamento-form.tsx`:

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPOS, TIPO_LABEL, STATUS, STATUS_LABEL } from "@/features/equipamentos/labels";
import {
  equipamentoSchema,
  type EquipamentoFormValues,
} from "@/features/equipamentos/equipamento-schema";
import type { Equipamento } from "@/shared/types";

interface Props {
  inicial: Equipamento | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EquipamentoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EquipamentoFormValues>({
    resolver: zodResolver(equipamentoSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      tipo: inicial?.tipo ?? "escavadeira",
      capacidade: inicial?.capacidade ?? "",
      horimetro_atual: inicial?.horimetro_atual ?? 0,
      identificador: inicial?.identificador ?? "",
      status: inicial?.status ?? "disponivel",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: EquipamentoFormValues) => {
    const payload = {
      nome: values.nome,
      tipo: values.tipo,
      capacidade: values.capacidade,
      horimetro_atual: values.horimetro_atual,
      identificador: values.identificador?.trim() ? values.identificador.trim() : null,
      status: values.status,
      ativo: values.ativo,
    };
    if (inicial) {
      equipamentosStore.update(inicial.id, payload);
      toast.success("Equipamento atualizado.");
    } else {
      equipamentosStore.create(payload);
      toast.success("Equipamento cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" {...register("nome")} aria-invalid={!!errors.nome} />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tipo">Tipo *</Label>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="tipo">
                  <SelectValue />
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="capacidade">Capacidade *</Label>
          <Input
            id="capacidade"
            placeholder="ex.: 18 toneladas"
            {...register("capacidade")}
            aria-invalid={!!errors.capacidade}
          />
          {errors.capacidade ? (
            <p className="text-xs text-destructive">{errors.capacidade.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="horimetro_atual">Horímetro atual *</Label>
          <Input
            id="horimetro_atual"
            type="number"
            step="0.1"
            min="0"
            className="font-mono"
            {...register("horimetro_atual", { valueAsNumber: true })}
            aria-invalid={!!errors.horimetro_atual}
          />
          {errors.horimetro_atual ? (
            <p className="text-xs text-destructive">{errors.horimetro_atual.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="identificador">Identificador / patrimônio</Label>
          <Input id="identificador" placeholder="opcional" {...register("identificador")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status operacional *</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Equipamento ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não aparecem para novas ordens, mas ficam no histórico.
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

- [ ] **Step 5: Página (lista + toolbar + diálogos)**

Create `src/features/equipamentos/components/equipamentos-page.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatHorimetro } from "@/shared/lib/format";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import {
  EquipamentoStatusBadge,
  InativoBadge,
  TIPOS,
  TIPO_LABEL,
  STATUS,
  STATUS_LABEL,
} from "@/features/equipamentos/labels";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";
import type { Equipamento, EquipamentoStatus, TipoEquipamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export function EquipamentosPage() {
  const todos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<EquipamentoStatus | "todos">("todos");
  const [mostrarInativos, setMostrarInativos] = useState(true);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Equipamento | null>(null);
  const [inativando, setInativando] = useState<Equipamento | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((e) => {
      if (!mostrarInativos && !e.ativo) return false;
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      if (filtroStatus !== "todos" && e.status !== filtroStatus) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        (e.identificador?.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroTipo, filtroStatus, mostrarInativos]);

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (e: Equipamento) => {
    setEditando(e);
    setFormAberto(true);
  };

  const confirmarInativar = () => {
    if (!inativando) return;
    equipamentosStore.setAtivo(inativando.id, false);
    toast.success("Equipamento inativado.");
    setInativando(null);
  };
  const reativar = (e: Equipamento) => {
    equipamentosStore.setAtivo(e.id, true);
    toast.success("Equipamento reativado.");
  };

  const columns: Column<Equipamento>[] = [
    {
      header: "Nome",
      cell: (e) => (
        <div className={cn("min-w-0", !e.ativo && "opacity-60")}>
          <div className="truncate font-medium text-foreground">{e.nome}</div>
          <div className="font-mono text-xs text-foreground-faint">
            {e.identificador ?? "sem identificador"}
          </div>
        </div>
      ),
    },
    { header: "Tipo", cell: (e) => TIPO_LABEL[e.tipo] },
    { header: "Capacidade", cell: (e) => e.capacidade },
    {
      header: "Horímetro",
      className: "font-mono",
      cell: (e) => formatHorimetro(e.horimetro_atual),
    },
    {
      header: "Status",
      cell: (e) =>
        e.ativo ? <EquipamentoStatusBadge status={e.status} /> : <InativoBadge />,
    },
  ];

  const rowActions = (e: Equipamento) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(e)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {e.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(e)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(e)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (e: Equipamento) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !e.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">{e.nome}</div>
          <div className="font-mono text-xs text-foreground-faint">
            {e.identificador ?? "sem identificador"}
          </div>
        </div>
        {e.ativo ? <EquipamentoStatusBadge status={e.status} /> : <InativoBadge />}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Tipo</dt>
          <dd className="text-foreground">{TIPO_LABEL[e.tipo]}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Capacidade</dt>
          <dd className="text-foreground">{e.capacidade}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Horímetro</dt>
          <dd className="font-mono text-foreground">{formatHorimetro(e.horimetro_atual)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(e)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder="Buscar por nome ou identificador"
          className="pl-9"
        />
      </div>
      <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoEquipamento | "todos")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os tipos</SelectItem>
          {TIPOS.map((t) => (
            <SelectItem key={t} value={t}>
              {TIPO_LABEL[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filtroStatus}
        onValueChange={(v) => setFiltroStatus(v as EquipamentoStatus | "todos")}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Equipamentos"
        descricao="Cadastro da frota: escavadeiras, carregadeiras, caçambas e tratores."
        acoes={
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo equipamento
          </Button>
        }
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(e) => e.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:truck",
          titulo: todos.length === 0 ? "Nenhum equipamento cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro equipamento da frota para começar."
              : "Ajuste a busca ou os filtros.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro equipamento
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar equipamento" : "Novo equipamento"}
        descricao="Os campos com * são obrigatórios."
      >
        <EquipamentoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar equipamento?"
        descricao={`"${inativando?.nome ?? ""}" deixará de aparecer para novas ordens, mas permanece no histórico. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 6: Barrel export**

Create `src/features/equipamentos/index.ts`:

```ts
export { EquipamentosPage } from "@/features/equipamentos/components/equipamentos-page";
export { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
```

- [ ] **Step 7: Ligar a rota**

Substituir todo o conteúdo de `src/routes/admin.equipamentos.tsx` por:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { EquipamentosPage } from "@/features/equipamentos";

export const Route = createFileRoute("/admin/equipamentos")({
  head: () => ({
    meta: [
      { title: "Equipamentos · Antonello" },
      {
        name: "description",
        content: "Cadastro da frota de equipamentos da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EquipamentosPage,
});
```

- [ ] **Step 8: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 9: Verificação visual (dev server em :8080)**

Em `/admin/equipamentos`, confirmar:
- **Loading:** ao entrar, aparece skeleton por ~400ms, depois a tabela com 8 equipamentos.
- **Tabela (desktop, ≥1280px):** colunas Nome/Tipo/Capacidade/Horímetro/Status/Ações; horímetro em fonte mono; "Carregadeira de Rodas" com badge "Em manutenção"; "Escavadeira Antiga" com badge "Inativo" e linha esmaecida.
- **Busca:** digitar "mini" filtra para a Mini Escavadeira; "PAT-0001" acha por identificador.
- **Filtros:** Tipo = "Escavadeira" reduz a lista; Status = "Disponível" idem; botão "Inativos" oculta/mostra a desativada.
- **Novo:** "Novo equipamento" abre o dialog; submeter vazio mostra erro inline em Nome/Capacidade e não fecha; preencher e salvar mostra toast "Equipamento cadastrado." e o item aparece no topo.
- **Editar:** "Editar" abre o dialog preenchido; salvar mostra toast e reflete na lista.
- **Inativar:** "Inativar" abre confirmação; confirmar muda o badge para "Inativo" (registro permanece) + toast.
- **Mobile (375px):** a tabela vira cards; toolbar quebra linha; toque confortável.
- **Empty/erro:** (opcional) passar `forceError: true` em `useMockResource(todos, { forceError: true })` mostra o estado de erro com "Tentar novamente"; reverter depois.

- [ ] **Step 10: Commit**

```bash
git add src/features/equipamentos src/routes/admin.equipamentos.tsx
git commit -m "$(cat <<'EOF'
feat: equipamentos CRUD with search, filters and soft-delete (RF-001..007)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Feature Operadores + rota

Mais enxuta: nome, telefone, ativo. Sem filtros de tipo/status; busca por nome + toggle de inativos.

**Files:**
- Create: `src/features/operadores/operadores-store.ts`
- Create: `src/features/operadores/operador-schema.ts`
- Create: `src/features/operadores/components/operador-form.tsx`
- Create: `src/features/operadores/components/operadores-page.tsx`
- Create: `src/features/operadores/index.ts`
- Modify: `src/routes/admin.operadores.tsx`

**Interfaces:**
- Consumes: kit compartilhado + `formatTelefone` + type `Operador`.
- Produces: `OperadoresPage` em `/admin/operadores`; `operadoresStore`.

- [ ] **Step 1: Store**

Create `src/features/operadores/operadores-store.ts`:

```ts
import { createMockStore } from "@/shared/lib/create-mock-store";
import { operadores } from "@/mocks/operadores";
import type { Operador } from "@/shared/types";

export const operadoresStore = createMockStore<Operador>(operadores);
```

- [ ] **Step 2: Schema**

Create `src/features/operadores/operador-schema.ts`:

```ts
import { z } from "zod";

export const operadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do operador"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type OperadorFormValues = z.infer<typeof operadorSchema>;
```

- [ ] **Step 3: Formulário**

Create `src/features/operadores/components/operador-form.tsx`:

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { operadoresStore } from "@/features/operadores/operadores-store";
import {
  operadorSchema,
  type OperadorFormValues,
} from "@/features/operadores/operador-schema";
import type { Operador } from "@/shared/types";

interface Props {
  inicial: Operador | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OperadorForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OperadorFormValues>({
    resolver: zodResolver(operadorSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: OperadorFormValues) => {
    const payload = {
      nome: values.nome,
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      operadoresStore.update(inicial.id, payload);
      toast.success("Operador atualizado.");
    } else {
      operadoresStore.create(payload);
      toast.success("Operador cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" {...register("nome")} aria-invalid={!!errors.nome} />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          inputMode="tel"
          placeholder="opcional — ex.: 44999990001"
          className="font-mono"
          {...register("telefone")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Operador ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não podem ser atribuídos a novas ordens.
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

- [ ] **Step 4: Página**

Create `src/features/operadores/components/operadores-page.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatTelefone } from "@/shared/lib/format";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import type { Operador } from "@/shared/types";
import { cn } from "@/lib/utils";

function StatusAtivo({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ativo
          ? "bg-primary/20 text-foreground border-primary/50"
          : "border-border bg-surface text-foreground-faint",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

export function OperadoresPage() {
  const todos = operadoresStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [q, setQ] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Operador | null>(null);
  const [inativando, setInativando] = useState<Operador | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((o) => {
      if (!mostrarInativos && !o.ativo) return false;
      if (!termo) return true;
      return o.nome.toLowerCase().includes(termo);
    });
  }, [todos, q, mostrarInativos]);

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (o: Operador) => {
    setEditando(o);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    operadoresStore.setAtivo(inativando.id, false);
    toast.success("Operador inativado.");
    setInativando(null);
  };
  const reativar = (o: Operador) => {
    operadoresStore.setAtivo(o.id, true);
    toast.success("Operador reativado.");
  };

  const columns: Column<Operador>[] = [
    {
      header: "Nome",
      cell: (o) => (
        <span className={cn("font-medium text-foreground", !o.ativo && "opacity-60")}>
          {o.nome}
        </span>
      ),
    },
    { header: "Telefone", className: "font-mono", cell: (o) => formatTelefone(o.telefone) },
    { header: "Status", cell: (o) => <StatusAtivo ativo={o.ativo} /> },
  ];

  const rowActions = (o: Operador) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(o)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {o.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(o)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(o)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (o: Operador) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !o.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-display font-bold text-card-foreground">{o.nome}</div>
        <StatusAtivo ativo={o.ativo} />
      </div>
      <div className="mt-1 font-mono text-sm text-muted-foreground">
        {formatTelefone(o.telefone)}
      </div>
      <div className="mt-3 flex justify-end">{rowActions(o)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder="Buscar por nome"
          className="pl-9"
        />
      </div>
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Operadores"
        descricao="Quem opera as máquinas e aponta as horas em campo."
        acoes={
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo operador
          </Button>
        }
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(o) => o.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:hard-hat",
          titulo: todos.length === 0 ? "Nenhum operador cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro operador da equipe."
              : "Ajuste a busca.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro operador
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar operador" : "Novo operador"}
        descricao="Os campos com * são obrigatórios."
      >
        <OperadorForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar operador?"
        descricao={`"${inativando?.nome ?? ""}" não poderá ser atribuído a novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 5: Barrel + rota**

Create `src/features/operadores/index.ts`:

```ts
export { OperadoresPage } from "@/features/operadores/components/operadores-page";
export { operadoresStore } from "@/features/operadores/operadores-store";
```

Substituir todo o conteúdo de `src/routes/admin.operadores.tsx` por:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { OperadoresPage } from "@/features/operadores";

export const Route = createFileRoute("/admin/operadores")({
  head: () => ({
    meta: [
      { title: "Operadores · Antonello" },
      {
        name: "description",
        content: "Cadastro de operadores da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OperadoresPage,
});
```

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 7: Verificação visual**

Em `/admin/operadores`: lista com 5 operadores; "Marcos Vinícius..." (nome longo) sem telefone mostra "—"; "Reinaldo Souza" como Inativo; busca por nome; toggle inativos; criar/editar/inativar/reativar com toasts; cards no mobile (375px).

- [ ] **Step 8: Commit**

```bash
git add src/features/operadores src/routes/admin.operadores.tsx
git commit -m "$(cat <<'EOF'
feat: operadores CRUD with search and soft-delete (RF-008..012)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Feature Clientes + rota

Inclui validação de CPF/CNPJ no formulário (RF-016) e busca por nome/documento (RF-017).

**Files:**
- Create: `src/features/clientes/clientes-store.ts`
- Create: `src/features/clientes/cliente-schema.ts`
- Create: `src/features/clientes/components/cliente-form.tsx`
- Create: `src/features/clientes/components/clientes-page.tsx`
- Create: `src/features/clientes/index.ts`
- Modify: `src/routes/admin.clientes.tsx`

**Interfaces:**
- Consumes: kit compartilhado + `isCpfOuCnpj` + `formatDocumento`/`formatTelefone` + type `Cliente`.
- Produces: `ClientesPage` em `/admin/clientes`; `clientesStore`.

- [ ] **Step 1: Store**

Create `src/features/clientes/clientes-store.ts`:

```ts
import { createMockStore } from "@/shared/lib/create-mock-store";
import { clientes } from "@/mocks/clientes";
import type { Cliente } from "@/shared/types";

export const clientesStore = createMockStore<Cliente>(clientes);
```

- [ ] **Step 2: Schema com validação de documento**

Create `src/features/clientes/cliente-schema.ts`:

```ts
import { z } from "zod";
import { isCpfOuCnpj } from "@/shared/lib/validators";

export const clienteSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente"),
  documento: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isCpfOuCnpj(v), "CPF ou CNPJ inválido"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
```

- [ ] **Step 3: Formulário**

Create `src/features/clientes/components/cliente-form.tsx`:

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clientesStore } from "@/features/clientes/clientes-store";
import {
  clienteSchema,
  type ClienteFormValues,
} from "@/features/clientes/cliente-schema";
import type { Cliente } from "@/shared/types";

interface Props {
  inicial: Cliente | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClienteForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      documento: inicial?.documento ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: ClienteFormValues) => {
    const payload = {
      nome: values.nome,
      documento: values.documento?.trim() ? values.documento.replace(/\D/g, "") : null,
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      clientesStore.update(inicial.id, payload);
      toast.success("Cliente atualizado.");
    } else {
      clientesStore.create(payload);
      toast.success("Cliente cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome / razão social *</Label>
        <Input id="nome" {...register("nome")} aria-invalid={!!errors.nome} />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="documento">CPF / CNPJ</Label>
        <Input
          id="documento"
          inputMode="numeric"
          placeholder="opcional"
          className="font-mono"
          {...register("documento")}
          aria-invalid={!!errors.documento}
        />
        {errors.documento ? (
          <p className="text-xs text-destructive">{errors.documento.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          inputMode="tel"
          placeholder="opcional"
          className="font-mono"
          {...register("telefone")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Cliente ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não aparecem para novas ordens.
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

- [ ] **Step 4: Página**

Create `src/features/clientes/components/clientes-page.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatDocumento, formatTelefone } from "@/shared/lib/format";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import type { Cliente } from "@/shared/types";
import { cn } from "@/lib/utils";

function StatusAtivo({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ativo
          ? "bg-primary/20 text-foreground border-primary/50"
          : "border-border bg-surface text-foreground-faint",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

export function ClientesPage() {
  const todos = clientesStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [q, setQ] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [inativando, setInativando] = useState<Cliente | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    const soDigitos = termo.replace(/\D/g, "");
    return todos.filter((c) => {
      if (!mostrarInativos && !c.ativo) return false;
      if (!termo) return true;
      const nomeMatch = c.nome.toLowerCase().includes(termo);
      const docMatch =
        soDigitos.length > 0 && (c.documento?.includes(soDigitos) ?? false);
      return nomeMatch || docMatch;
    });
  }, [todos, q, mostrarInativos]);

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (c: Cliente) => {
    setEditando(c);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    clientesStore.setAtivo(inativando.id, false);
    toast.success("Cliente inativado.");
    setInativando(null);
  };
  const reativar = (c: Cliente) => {
    clientesStore.setAtivo(c.id, true);
    toast.success("Cliente reativado.");
  };

  const columns: Column<Cliente>[] = [
    {
      header: "Nome",
      cell: (c) => (
        <span className={cn("font-medium text-foreground", !c.ativo && "opacity-60")}>
          {c.nome}
        </span>
      ),
    },
    { header: "Documento", className: "font-mono", cell: (c) => formatDocumento(c.documento) },
    { header: "Telefone", className: "font-mono", cell: (c) => formatTelefone(c.telefone) },
    { header: "Status", cell: (c) => <StatusAtivo ativo={c.ativo} /> },
  ];

  const rowActions = (c: Cliente) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(c)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {c.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(c)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(c)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (c: Cliente) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !c.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 font-display font-bold text-card-foreground">{c.nome}</div>
        <StatusAtivo ativo={c.ativo} />
      </div>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-foreground-faint">Documento</dt>
          <dd className="font-mono text-foreground">{formatDocumento(c.documento)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-foreground-faint">Telefone</dt>
          <dd className="font-mono text-foreground">{formatTelefone(c.telefone)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(c)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder="Buscar por nome ou documento"
          className="pl-9"
        />
      </div>
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Clientes"
        descricao="Para quem as obras são executadas e a cobrança é emitida."
        acoes={
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(c) => c.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:building-2",
          titulo: todos.length === 0 ? "Nenhum cliente cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro cliente para vincular às obras."
              : "Ajuste a busca.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro cliente
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar cliente" : "Novo cliente"}
        descricao="Os campos com * são obrigatórios."
      >
        <ClienteForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar cliente?"
        descricao={`"${inativando?.nome ?? ""}" não aparecerá para novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 5: Barrel + rota**

Create `src/features/clientes/index.ts`:

```ts
export { ClientesPage } from "@/features/clientes/components/clientes-page";
export { clientesStore } from "@/features/clientes/clientes-store";
```

Substituir todo o conteúdo de `src/routes/admin.clientes.tsx` por:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ClientesPage } from "@/features/clientes";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes · Antonello" },
      {
        name: "description",
        content: "Cadastro de clientes da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClientesPage,
});
```

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 7: Verificação visual**

Em `/admin/clientes`: 4 clientes; "Construtora Horizonte" com CNPJ formatado `11.222.333/0001-81`; "Incorporadora Vale Verde" sem documento → "—"; "João da Silva..." Inativo com CPF `529.982.247-25`; busca por nome e por documento (digitar "11222" acha pelo CNPJ); **validação:** no form, digitar documento "123" → erro inline "CPF ou CNPJ inválido" e salvar bloqueado; limpar o campo → salva (opcional). Criar/editar/inativar/reativar com toasts. Cards no mobile.

- [ ] **Step 8: Commit**

```bash
git add src/features/clientes src/routes/admin.clientes.tsx
git commit -m "$(cat <<'EOF'
feat: clientes CRUD with CPF/CNPJ validation and search (RF-013..018)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Sweep responsivo + release (versão, changelog, INDEX, PRD _DONE)

Fecha o PRD: valida os 3 breakpoints, roda a suíte completa, e cumpre o checklist de pós-implementação do CLAUDE.md.

**Files:**
- Modify: `package.json` (campo `version`)
- Create: `CHANGELOG.md`
- Rename: `docs/prds/PRD-001-ret-cadastros-base.md` → `docs/prds/PRD-001-ret-cadastros-base_DONE.md`
- Modify: `docs/prds/INDEX-PRDs-antonello.md`
- Delete: `docs/prds/INDEX-PRDs-antonello (1).md` (duplicata idêntica)

**Interfaces:**
- Consumes: tudo das tasks 1–10.
- Produces: release `0.1.0` ("Registry"); PRD-001 marcado como implementado.

- [ ] **Step 1: Suíte de testes completa**

Run: `npm test`
Expected: PASS — todos os arquivos de teste (create-mock-store, validators, format) verdes.

- [ ] **Step 2: Typecheck + lint finais**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Verificação responsiva (375 / 768 / 1280px)**

Para `/admin/equipamentos`, `/admin/operadores`, `/admin/clientes`:
- **1280px:** tabela completa, toolbar em linha única, ações alinhadas à direita.
- **768px:** tabela ainda visível (scroll horizontal se preciso) ou cards conforme breakpoint; toolbar quebra.
- **375px:** cards, toque ≥ 44px nos botões, dialog rola sem cortar.
- Alternar tema claro/escuro (toggle no header) — sem cor hardcoded, contraste OK.
- Confirmar que **nenhuma** tela de cadastro exibe valor/preço (regra do operador não se aplica aqui, mas não deve haver financeiro).

- [ ] **Step 4: Definir a versão do app**

Em `package.json`, adicionar o campo `"version"` logo após `"private": true,`:

```json
  "version": "0.1.0",
```

- [ ] **Step 5: Criar o CHANGELOG**

Create `CHANGELOG.md`:

```markdown
# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-06-27 - Registry

### Added
- Cadastro de Equipamentos com busca, filtros por tipo e status operacional,
  criação/edição e inativação (soft-delete) — PRD-001.
- Cadastro de Operadores com busca e inativação.
- Cadastro de Clientes com validação de CPF/CNPJ e busca por nome/documento.
- Kit de CRUD compartilhado: store em memória genérico, lista responsiva
  (tabela ↔ cards), diálogos de formulário e confirmação, e envelope de
  estados (loading/empty/error/success).
- Testes unitários (vitest) para a lógica pura: store, validadores e formatadores.
- Ícones de aplicação via Iconify e toasts via sonner.

### Changed
- Contrato de `types` estendido (Equipamento/Operador/Cliente) com status de
  ciclo de vida (`ativo`) separado do status operacional, documento, telefone
  e timestamps de auditoria. Mocks atualizados com edge cases.
```

- [ ] **Step 6: Marcar o PRD como concluído**

Run: `git mv "docs/prds/PRD-001-ret-cadastros-base.md" "docs/prds/PRD-001-ret-cadastros-base_DONE.md"`

Em `docs/prds/PRD-001-ret-cadastros-base_DONE.md`, atualizar a seção **Status de Implementação**:

```markdown
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-27 |
| **Versão do App** | 0.1.0 (Registry) |
| **Implementado por** | Claude Opus 4.8 (Claude Code) |
| **Observações** | CRUD mockado das 3 entidades com kit compartilhado e testes de lógica pura. Status do equipamento em dois eixos (ativo + operacional). |
```

- [ ] **Step 7: Atualizar o INDEX e remover a duplicata**

Run: `git rm "docs/prds/INDEX-PRDs-antonello (1).md"`

Em `docs/prds/INDEX-PRDs-antonello.md`:
- No "Resumo de Status": Implementado `1` (17%), Pendente `5` (83%).
- Mover PRD-001 da seção "Pendentes" para "Implementados" e atualizar o link para `PRD-001-ret-cadastros-base_DONE.md`.
- Em "Histórico de Versões do App", adicionar a linha:

```markdown
| 0.1.0 | Registry | 2026-06-27 | PRD-001 | MINOR |
```

- [ ] **Step 8: Commit**

```bash
git add package.json CHANGELOG.md "docs/prds/PRD-001-ret-cadastros-base_DONE.md" "docs/prds/INDEX-PRDs-antonello.md"
git commit -m "$(cat <<'EOF'
chore: release 0.1.0 (Registry) — close PRD-001 cadastros base

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Verificação de cobertura do spec (self-review)

| Requisito do spec / PRD | Task |
|---|---|
| Contrato de `types` (2 eixos, tipo enum, documento, timestamps) | 2 |
| Mocks com edge cases (snake_case) | 2 |
| `createMockStore` (padrão useSyncExternalStore) | 3 |
| Validadores CPF/CNPJ (RF-016) | 4 |
| Formatadores (horímetro/documento/telefone) | 5 |
| Iconify + Toaster + EmptyState com CTA | 6 |
| Kit: useMockResource, DataList (tabela↔cards), FormDialog, ConfirmDialog | 7 |
| Equipamentos CRUD + busca + filtros tipo/status + soft-delete (RF-001..007) | 8 |
| Operadores CRUD + busca + soft-delete (RF-008..012) | 9 |
| Clientes CRUD + validação documento + busca nome/documento (RF-013..018) | 10 |
| Estados loading/empty/error/success | 7 (kit) + 8/9/10 (uso) |
| Responsividade 375/768/1280 + tema | 11 |
| Pós-impl.: versão, changelog, PRD _DONE, INDEX, remover duplicata | 11 |
| Telas só em `/admin/*`, sem financeiro | 8/9/10 (rotas) + 11 (verificação) |
