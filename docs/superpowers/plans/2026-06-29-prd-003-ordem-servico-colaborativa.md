# PRD-003 — Ordem de Serviço Colaborativa · Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Entregar a OS colaborativa (mockada) nos dois ambientes, reconciliando o modelo
legado `OrdemServicoOperador` com o novo `OrdemServico` (contêiner; horas derivadas dos
apontamentos; fechar = retaguarda).

**Architecture:** Feature `src/features/ordem-servico/` com store dedicado
(`useSyncExternalStore`), derivações puras e componentes para operador + retaguarda. O
modelo legado é mantido até todos os consumidores migrarem (T10 remove). Reconcilia o
PRD-002 (mock `os_id`, seletor de OS, lookup, pré-preenchimento `?os=`).

**Tech Stack:** React 19 + TanStack Router + Vite + TS strict + Tailwind + shadcn/ui +
react-hook-form + zod + sonner + Iconify. Testes: vitest (node, `src/**/*.test.ts`).

## Global Constraints

- **Barreira financeira (RF-014):** a OS não tem campos R$; componentes de OS do operador
  não importam/renderizam valor. Nada de `features/precos|mocks/precos|brlExato|formatBRL`
  em `/app/*`, `features/operador`, `features/apontamento`, `features/ordem-servico`.
- **Sem `any`**; **sem `!`** (usar optional chaining / narrowing); **types sem prefixo `I`**.
- **Status terminal `fechada`** (não `concluida`). **Horas/horario são derivados** dos
  apontamentos — não duplicar na OS.
- **Fechar OS** é discriminado e bloqueia se há apontamento `em_andamento` (RF-012).
- **Coexistência**: NÃO remover `OrdemServicoOperador`/`OrdemStatus`/store legado/badge
  legado/`ordens-operador.ts` até T10 (mantém `tsc` verde por task).
- **Gate:** `npx tsc --noEmit` (EXIT 0) + `npm test`. `npm run lint` é ruído CRLF — não é gate.
- **Dev server :8082** regenera `src/routeTree.gen.ts` quando rotas mudam (T5/T6/T7/T8/T9/T10);
  verificar a rota presente antes do `tsc`, fallback `npm run build`.
- Commits Conventional + rodapé `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## Task 1: Types (aditivo) + derivações + numeração (puro, testado)

**Files:**
- Modify: `src/shared/types/index.ts` (append — NÃO remover legado)
- Create: `src/features/ordem-servico/derivacoes.ts` + `derivacoes.test.ts`
- Create: `src/features/ordem-servico/numero-os.ts` + `numero-os.test.ts`

**Interfaces — Produces:** `OrdemServico`, `StatusOS`, `ModeloCobranca`;
`totalHorasOS`, `statusEfetivoOS`, `podeFecharOS` (+ `ResultadoFechar`), `ordensDoOperador`,
`apontamentosDaOS`; `proximoNumeroOS`.

- [ ] **Step 1: Append dos types** em `src/shared/types/index.ts`:

```typescript

// OS colaborativa (PRD-003). A OS é contêiner: horas e status efetivo são DERIVADOS
// dos apontamentos vinculados (via Apontamento.os_id). Sem campos R$, equipamento,
// operador ou horímetro na OS. (Substitui o legado OrdemServicoOperador na T10.)
export type ModeloCobranca = "hora_maquina" | "por_metro";
export type StatusOS = "aberta" | "em_andamento" | "fechada";

export interface OrdemServico {
  id: string;
  numero: string; // "OS-2026-0042"
  cliente_id: string; // FK → Cliente
  obra_nome: string;
  endereco: string | null;
  modelo_cobranca: ModeloCobranca;
  status: StatusOS;
  responsavel_id: string | null; // FK → Operador
  observacao: string | null;
  metragem_executada: number | null; // por_metro
  diametro_broca_mm: number | null; // por_metro
  aberta_em: string; // ISO 8601
  fechada_em: string | null;
  pendente_sync: boolean;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Escrever `derivacoes.test.ts` (RED)**

```typescript
import { describe, it, expect } from "vitest";
import {
  totalHorasOS,
  statusEfetivoOS,
  podeFecharOS,
  ordensDoOperador,
  apontamentosDaOS,
} from "@/features/ordem-servico/derivacoes";
import type { Apontamento, OrdemServico } from "@/shared/types";

function os(over: Partial<OrdemServico> & { id: string }): OrdemServico {
  return {
    id: over.id,
    numero: over.numero ?? "OS-2026-0001",
    cliente_id: over.cliente_id ?? "cl-001",
    obra_nome: over.obra_nome ?? "Obra",
    endereco: over.endereco ?? null,
    modelo_cobranca: over.modelo_cobranca ?? "hora_maquina",
    status: over.status ?? "aberta",
    responsavel_id: over.responsavel_id ?? null,
    observacao: over.observacao ?? null,
    metragem_executada: over.metragem_executada ?? null,
    diametro_broca_mm: over.diametro_broca_mm ?? null,
    aberta_em: "2026-06-01T00:00:00.000Z",
    fechada_em: over.fechada_em ?? null,
    pendente_sync: over.pendente_sync ?? false,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

function ap(over: Partial<Apontamento> & { id: string }): Apontamento {
  return {
    id: over.id,
    equipamento_id: over.equipamento_id ?? "eq-001",
    operador_id: over.operador_id ?? "op-001",
    os_id: over.os_id ?? null,
    horimetro_inicial: 100,
    horimetro_final: over.horimetro_final ?? null,
    horas_trabalhadas: over.horas_trabalhadas ?? null,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    status: over.status ?? "em_andamento",
    pendente_sync: false,
    iniciado_em: "2026-06-01T00:00:00.000Z",
    finalizado_em: over.finalizado_em ?? null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

describe("totalHorasOS", () => {
  it("soma só apontamentos finalizados da OS", () => {
    const aps = [
      ap({ id: "a1", os_id: "x", status: "finalizado", horas_trabalhadas: 8 }),
      ap({ id: "a2", os_id: "x", status: "finalizado", horas_trabalhadas: 5 }),
      ap({ id: "a3", os_id: "x", status: "em_andamento" }), // ignorado
      ap({ id: "a4", os_id: "y", status: "finalizado", horas_trabalhadas: 9 }), // outra OS
    ];
    expect(totalHorasOS("x", aps)).toBe(13);
  });
  it("retorna 0 sem apontamentos", () => {
    expect(totalHorasOS("x", [])).toBe(0);
  });
});

describe("statusEfetivoOS", () => {
  it("fechada quando status é fechada", () => {
    expect(statusEfetivoOS(os({ id: "x", status: "fechada" }), [])).toBe("fechada");
  });
  it("em_andamento quando há apontamento (deriva de aberta)", () => {
    const aps = [ap({ id: "a1", os_id: "x", status: "finalizado", horas_trabalhadas: 1 })];
    expect(statusEfetivoOS(os({ id: "x", status: "aberta" }), aps)).toBe("em_andamento");
  });
  it("mantém status armazenado quando não há apontamento", () => {
    expect(statusEfetivoOS(os({ id: "x", status: "aberta" }), [])).toBe("aberta");
    expect(statusEfetivoOS(os({ id: "x", status: "em_andamento" }), [])).toBe("em_andamento");
  });
});

describe("podeFecharOS", () => {
  it("bloqueia OS já fechada", () => {
    const r = podeFecharOS(os({ id: "x", status: "fechada" }), []);
    expect(r.pode).toBe(false);
  });
  it("bloqueia se há apontamento em andamento", () => {
    const aps = [ap({ id: "a1", os_id: "x", status: "em_andamento" })];
    const r = podeFecharOS(os({ id: "x", status: "aberta" }), aps);
    expect(r.pode).toBe(false);
    if (!r.pode) expect(r.motivo).toMatch(/andamento/i);
  });
  it("permite fechar quando só há finalizados", () => {
    const aps = [ap({ id: "a1", os_id: "x", status: "finalizado", horas_trabalhadas: 8 })];
    expect(podeFecharOS(os({ id: "x", status: "aberta" }), aps).pode).toBe(true);
  });
});

describe("ordensDoOperador", () => {
  it("inclui OS onde é responsável OU tem apontamento", () => {
    const ordens = [
      os({ id: "o1", responsavel_id: "op-001" }),
      os({ id: "o2", responsavel_id: "op-002" }),
      os({ id: "o3", responsavel_id: "op-002" }),
    ];
    const aps = [ap({ id: "a1", os_id: "o3", operador_id: "op-001", status: "finalizado", horas_trabalhadas: 1 })];
    const r = ordensDoOperador(ordens, aps, "op-001").map((o) => o.id);
    expect(r).toContain("o1"); // responsável
    expect(r).toContain("o3"); // tem apontamento
    expect(r).not.toContain("o2");
  });
});

describe("apontamentosDaOS", () => {
  it("filtra por os_id", () => {
    const aps = [ap({ id: "a1", os_id: "x" }), ap({ id: "a2", os_id: "y" })];
    expect(apontamentosDaOS("x", aps).map((a) => a.id)).toEqual(["a1"]);
  });
});
```

- [ ] **Step 3: Rodar (RED)** — `npx vitest run src/features/ordem-servico/derivacoes.test.ts` → FAIL.

- [ ] **Step 4: Implementar `derivacoes.ts`**

```typescript
import type { Apontamento, OrdemServico, StatusOS } from "@/shared/types";

export function apontamentosDaOS(osId: string, apontamentos: Apontamento[]): Apontamento[] {
  return apontamentos.filter((a) => a.os_id === osId);
}

// Total de horas da OS = soma de horas_trabalhadas dos apontamentos finalizados.
export function totalHorasOS(osId: string, apontamentos: Apontamento[]): number {
  return apontamentos
    .filter((a) => a.os_id === osId && a.status === "finalizado")
    .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
}

// Status para exibição: fechada > em_andamento (se há apontamento) > status armazenado.
export function statusEfetivoOS(os: OrdemServico, apontamentos: Apontamento[]): StatusOS {
  if (os.status === "fechada") return "fechada";
  const temApontamento = apontamentos.some((a) => a.os_id === os.id);
  if (temApontamento) return "em_andamento";
  return os.status;
}

export type ResultadoFechar = { pode: true } | { pode: false; motivo: string };

export function podeFecharOS(os: OrdemServico, apontamentos: Apontamento[]): ResultadoFechar {
  if (os.status === "fechada") {
    return { pode: false, motivo: "Esta OS já está fechada." };
  }
  const temEmAndamento = apontamentos.some(
    (a) => a.os_id === os.id && a.status === "em_andamento",
  );
  if (temEmAndamento) {
    return {
      pode: false,
      motivo: "Há apontamento em andamento (horímetro final pendente) nesta OS.",
    };
  }
  return { pode: true };
}

// "Minhas OS": responsável OU tem apontamento do operador.
export function ordensDoOperador(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  operadorId: string,
): OrdemServico[] {
  return ordens.filter(
    (os) =>
      os.responsavel_id === operadorId ||
      apontamentos.some((a) => a.os_id === os.id && a.operador_id === operadorId),
  );
}
```

- [ ] **Step 5: Escrever `numero-os.test.ts` (RED)**

```typescript
import { describe, it, expect } from "vitest";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";

describe("proximoNumeroOS", () => {
  it("incrementa o maior sufixo do ano e faz zero-pad", () => {
    const ordens = [{ numero: "OS-2026-0042" }, { numero: "OS-2026-0007" }, { numero: "OS-2025-9999" }];
    expect(proximoNumeroOS(ordens, 2026)).toBe("OS-2026-0043");
  });
  it("começa em 0001 quando não há OS no ano", () => {
    expect(proximoNumeroOS([], 2026)).toBe("OS-2026-0001");
    expect(proximoNumeroOS([{ numero: "OS-2025-0050" }], 2026)).toBe("OS-2026-0001");
  });
});
```

- [ ] **Step 6: Rodar (RED)** → FAIL.

- [ ] **Step 7: Implementar `numero-os.ts`**

```typescript
import type { OrdemServico } from "@/shared/types";

// Próximo número no formato OS-AAAA-NNNN (sequencial por ano).
export function proximoNumeroOS(ordens: Pick<OrdemServico, "numero">[], ano: number): string {
  const prefixo = `OS-${ano}-`;
  const maior = ordens
    .map((o) => o.numero)
    .filter((n) => n.startsWith(prefixo))
    .map((n) => Number.parseInt(n.slice(prefixo.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => (n > max ? n : max), 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}
```

- [ ] **Step 8: Gate** — `npx vitest run src/features/ordem-servico/ && npx tsc --noEmit` → PASS / EXIT 0.

- [ ] **Step 9: Commit**

```bash
git add src/shared/types/index.ts src/features/ordem-servico/derivacoes.ts src/features/ordem-servico/derivacoes.test.ts src/features/ordem-servico/numero-os.ts src/features/ordem-servico/numero-os.test.ts
git commit -m "feat: add OrdemServico types, derivations and OS numbering"
```

---

## Task 2: Mocks da OS + reconciliação dos apontamentos

**Files:**
- Create: `src/mocks/ordens-servico.ts`
- Modify: `src/mocks/apontamentos.ts` (remapeia `os_id` + comentário)
- Test: `src/mocks/ordens-servico.test.ts`

**Interfaces — Consumes:** `OrdemServico`, `clientes`, `operadores`, `apontamentos`.
Produces: `ordensServico`.

- [ ] **Step 1: Criar `src/mocks/ordens-servico.ts`**

```typescript
import type { OrdemServico } from "@/shared/types";

// 6 OS reusando clientes (cl-001..cl-004) e operadores (op-001/op-002). Edge cases:
// os-001 colaborativa (apontamentos de op-001 e op-002; tem em_andamento → bloqueia
// fechar), os-002 aberta sem apontamentos + pendente_sync, os-003 fechada, os-004
// pode fechar (só finalizados), os-005/006 por_metro. (Apontamentos ligam via os_id.)
export const ordensServico: OrdemServico[] = [
  {
    id: "os-001",
    numero: "OS-2026-0042",
    cliente_id: "cl-001",
    obra_nome: "Loteamento Vista Verde — quadra 7",
    endereco: "Rod. PR-444, km 12, São Pedro do Ivaí",
    modelo_cobranca: "hora_maquina",
    status: "aberta",
    responsavel_id: "op-001",
    observacao: "Escavação para fundação dos blocos A e B.",
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-24T07:15:00.000Z",
    fechada_em: null,
    pendente_sync: false,
    created_at: "2026-06-24T07:15:00.000Z",
    updated_at: "2026-06-27T07:15:00.000Z",
  },
  {
    id: "os-002",
    numero: "OS-2026-0041",
    cliente_id: "cl-002",
    obra_nome: "Residencial Vale do Sol",
    endereco: "Av. Brasil, 2200, Jandaia do Sul",
    modelo_cobranca: "hora_maquina",
    status: "aberta",
    responsavel_id: "op-001",
    observacao: "Transporte de terra do bota-fora para o aterro.",
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-24T13:00:00.000Z",
    fechada_em: null,
    pendente_sync: true,
    created_at: "2026-06-24T13:00:00.000Z",
    updated_at: "2026-06-24T13:00:00.000Z",
  },
  {
    id: "os-003",
    numero: "OS-2026-0039",
    cliente_id: "cl-003",
    obra_nome: "Pavimentação Rua das Acácias",
    endereco: "Rua das Acácias, centro",
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-001",
    observacao: "Nivelamento concluído sem intercorrências.",
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-23T07:00:00.000Z",
    fechada_em: "2026-06-23T17:30:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-23T07:00:00.000Z",
    updated_at: "2026-06-23T17:30:00.000Z",
  },
  {
    id: "os-004",
    numero: "OS-2026-0037",
    cliente_id: "cl-001",
    obra_nome: "Galpão logístico — terraplenagem",
    endereco: "Rod. BR-376, km 215",
    modelo_cobranca: "hora_maquina",
    status: "aberta",
    responsavel_id: "op-001",
    observacao: null,
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-21T07:30:00.000Z",
    fechada_em: null,
    pendente_sync: false,
    created_at: "2026-06-21T07:30:00.000Z",
    updated_at: "2026-06-21T16:50:00.000Z",
  },
  {
    id: "os-005",
    numero: "OS-2026-0044",
    cliente_id: "cl-004",
    obra_nome: "Estaqueamento Edifício Aurora",
    endereco: "Rua XV de Novembro, 980, Apucarana",
    modelo_cobranca: "por_metro",
    status: "em_andamento",
    responsavel_id: "op-002",
    observacao: "Estacas escavadas Ø400mm.",
    metragem_executada: 120,
    diametro_broca_mm: 400,
    aberta_em: "2026-06-25T08:00:00.000Z",
    fechada_em: null,
    pendente_sync: false,
    created_at: "2026-06-25T08:00:00.000Z",
    updated_at: "2026-06-26T17:00:00.000Z",
  },
  {
    id: "os-006",
    numero: "OS-2026-0040",
    cliente_id: "cl-002",
    obra_nome: "Estacas — galpão B",
    endereco: null,
    modelo_cobranca: "por_metro",
    status: "aberta",
    responsavel_id: "op-002",
    observacao: null,
    metragem_executada: null,
    diametro_broca_mm: 300,
    aberta_em: "2026-06-24T09:00:00.000Z",
    fechada_em: null,
    pendente_sync: false,
    created_at: "2026-06-24T09:00:00.000Z",
    updated_at: "2026-06-24T09:00:00.000Z",
  },
];
```

- [ ] **Step 2: Remapear `os_id` em `src/mocks/apontamentos.ts`**

No comentário do topo, trocar a linha que cita as OS por:
```typescript
// (eq-001..eq-007) e OS (os-001/os-003/os-004) dos mocks. os-001 é colaborativa
// (ap-001 op-001 + ap-006 op-002). Edge cases: em andamento, finalizados, sem os_id,
```
E alterar os `os_id`: `ap-001` → `"os-001"`; `ap-002` → `"os-003"`; `ap-004` → `"os-004"`;
`ap-006` → `"os-001"`. Manter `ap-003` e `ap-005` com `os_id: null`. (Nenhum outro campo muda.)

- [ ] **Step 3: Escrever `src/mocks/ordens-servico.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { ordensServico } from "@/mocks/ordens-servico";
import { clientes } from "@/mocks/clientes";
import { operadores } from "@/mocks/operadores";
import { apontamentos } from "@/mocks/apontamentos";

describe("mock de ordens de serviço", () => {
  it("referencia clientes e responsáveis existentes", () => {
    const clienteIds = new Set(clientes.map((c) => c.id));
    const operadorIds = new Set(operadores.map((o) => o.id));
    for (const os of ordensServico) {
      expect(clienteIds.has(os.cliente_id)).toBe(true);
      if (os.responsavel_id) expect(operadorIds.has(os.responsavel_id)).toBe(true);
    }
  });

  it("tem números únicos no formato OS-AAAA-NNNN", () => {
    const numeros = ordensServico.map((o) => o.numero);
    expect(new Set(numeros).size).toBe(numeros.length);
    for (const n of numeros) expect(n).toMatch(/^OS-\d{4}-\d{4}$/);
  });

  it("inclui edge cases: ≥1 fechada, ≥1 por_metro, ≥1 pendente_sync", () => {
    expect(ordensServico.some((o) => o.status === "fechada")).toBe(true);
    expect(ordensServico.some((o) => o.modelo_cobranca === "por_metro")).toBe(true);
    expect(ordensServico.some((o) => o.pendente_sync)).toBe(true);
  });

  it("inclui uma OS colaborativa (apontamentos de 2+ operadores)", () => {
    const colaborativa = ordensServico.some((os) => {
      const ops = new Set(
        apontamentos.filter((a) => a.os_id === os.id).map((a) => a.operador_id),
      );
      return ops.size >= 2;
    });
    expect(colaborativa).toBe(true);
  });

  it("por_metro tem diâmetro definido", () => {
    for (const os of ordensServico) {
      if (os.modelo_cobranca === "por_metro") {
        expect(os.diametro_broca_mm).not.toBeNull();
      }
    }
  });
});
```

- [ ] **Step 4: Gate** — `npx vitest run src/mocks/ && npx tsc --noEmit` → PASS (incl. `apontamentos.test.ts` ainda verde).

- [ ] **Step 5: Commit**

```bash
git add src/mocks/ordens-servico.ts src/mocks/ordens-servico.test.ts src/mocks/apontamentos.ts
git commit -m "feat: add ordens-servico mock and reconcile apontamento os_id links"
```

---

## Task 3: Store + schema + labels da OS

**Files:**
- Create: `src/features/ordem-servico/ordens-store.ts`
- Create: `src/features/ordem-servico/ordem-schema.ts` + `ordem-schema.test.ts`
- Create: `src/features/ordem-servico/labels.tsx`

**Interfaces — Consumes:** derivações (T1), mock (T2). Produces: `ordensStore`
(`listar/obter/criar/atualizar/fechar/useTodas/useOrdem`, `ResultadoFecharOrdem`),
`ordemSchema`/`OrdemFormValues`, `STATUS_OS_LABEL`/`STATUS_OS`/`MODELO_LABEL`/`StatusOSBadge`.

- [ ] **Step 1: Criar `ordens-store.ts`**

```typescript
import { useSyncExternalStore } from "react";
import { ordensServico as seed } from "@/mocks/ordens-servico";
import { podeFecharOS } from "@/features/ordem-servico/derivacoes";
import type { Apontamento, OrdemServico } from "@/shared/types";

export type ResultadoFecharOrdem =
  | { ok: true; ordem: OrdemServico }
  | { ok: false; motivo: string };

type NovaOrdem = Omit<
  OrdemServico,
  "id" | "status" | "aberta_em" | "fechada_em" | "pendente_sync" | "created_at" | "updated_at"
>;

export function criarOrdensStore(inicial: OrdemServico[]) {
  let itens: OrdemServico[] = inicial.map((o) => ({ ...o }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((o) => o.id === id);

  function criar(data: NovaOrdem): OrdemServico {
    const agora = new Date().toISOString();
    const nova: OrdemServico = {
      ...data,
      id: crypto.randomUUID(),
      status: "aberta",
      aberta_em: agora,
      fechada_em: null,
      pendente_sync: false,
      created_at: agora,
      updated_at: agora,
    };
    itens = [nova, ...itens];
    notificar();
    return nova;
  }

  function atualizar(id: string, patch: Partial<Omit<OrdemServico, "id" | "created_at">>) {
    itens = itens.map((o) =>
      o.id === id ? { ...o, ...patch, updated_at: new Date().toISOString() } : o,
    );
    notificar();
  }

  function fechar(id: string, apontamentos: Apontamento[]): ResultadoFecharOrdem {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "OS não encontrada." };
    const r = podeFecharOS(atual, apontamentos);
    if (!r.pode) return { ok: false, motivo: r.motivo };
    const agora = new Date().toISOString();
    const fechada: OrdemServico = {
      ...atual,
      status: "fechada",
      fechada_em: agora,
      updated_at: agora,
    };
    itens = itens.map((o) => (o.id === id ? fechada : o));
    notificar();
    return { ok: true, ordem: fechada };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
  const useOrdem = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((o) => o.id === id),
      () => itens.find((o) => o.id === id),
    );

  return { listar, obter, criar, atualizar, fechar, useTodas, useOrdem };
}

export const ordensStore = criarOrdensStore(seed);
```

- [ ] **Step 2: Escrever `ordem-schema.test.ts` (RED)**

```typescript
import { describe, it, expect } from "vitest";
import { ordemSchema } from "@/features/ordem-servico/ordem-schema";

const base = { cliente_id: "cl-001", obra_nome: "Obra X", modelo_cobranca: "hora_maquina" as const };

describe("ordemSchema", () => {
  it("aceita hora_maquina válida", () => {
    expect(ordemSchema.safeParse(base).success).toBe(true);
  });
  it("rejeita obra curta", () => {
    expect(ordemSchema.safeParse({ ...base, obra_nome: "" }).success).toBe(false);
  });
  it("rejeita sem cliente", () => {
    expect(ordemSchema.safeParse({ ...base, cliente_id: "" }).success).toBe(false);
  });
  it("por_metro exige diâmetro", () => {
    const semDiam = ordemSchema.safeParse({ ...base, modelo_cobranca: "por_metro" });
    expect(semDiam.success).toBe(false);
    const comDiam = ordemSchema.safeParse({ ...base, modelo_cobranca: "por_metro", diametro_broca_mm: 300 });
    expect(comDiam.success).toBe(true);
  });
  it("rejeita metragem zero/negativa", () => {
    expect(
      ordemSchema.safeParse({ ...base, modelo_cobranca: "por_metro", diametro_broca_mm: 300, metragem_executada: 0 }).success,
    ).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar (RED)** → FAIL.

- [ ] **Step 4: Implementar `ordem-schema.ts`**

```typescript
import { z } from "zod";

// number opcional positivo que tolera "" (NaN do valueAsNumber) como ausência.
const numeroOpcionalPositivo = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z
    .number({ invalid_type_error: "Informe um número válido" })
    .positive("Informe um valor maior que zero")
    .optional(),
);

export const ordemSchema = z
  .object({
    cliente_id: z.string().min(1, "Selecione o cliente"),
    obra_nome: z.string().trim().min(2, "Informe a obra"),
    endereco: z.string().trim().optional(),
    modelo_cobranca: z.enum(["hora_maquina", "por_metro"]),
    responsavel_id: z.string().optional(),
    observacao: z.string().trim().max(500).optional(),
    metragem_executada: numeroOpcionalPositivo,
    diametro_broca_mm: numeroOpcionalPositivo,
  })
  .superRefine((val, ctx) => {
    if (val.modelo_cobranca === "por_metro" && !val.diametro_broca_mm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diametro_broca_mm"],
        message: "Informe o diâmetro da broca",
      });
    }
  });

export type OrdemFormValues = z.infer<typeof ordemSchema>;
```

- [ ] **Step 5: Criar `labels.tsx`**

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { ModeloCobranca, StatusOS } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_OS_LABEL: Record<StatusOS, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  fechada: "Fechada",
};

export const STATUS_OS: StatusOS[] = ["aberta", "em_andamento", "fechada"];

export const MODELO_LABEL: Record<ModeloCobranca, string> = {
  hora_maquina: "Hora-máquina",
  por_metro: "Por metro",
};

const STATUS_CLASSE: Record<StatusOS, string> = {
  aberta: "bg-steel/20 text-foreground border-steel/40",
  em_andamento: "bg-primary/20 text-foreground border-primary/50",
  fechada: "bg-secondary-soft/25 text-foreground border-secondary/40",
};

export function StatusOSBadge({ status, className }: { status: StatusOS; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_OS_LABEL[status]}
    </span>
  );
}
```

- [ ] **Step 6: Gate** — `npx vitest run src/features/ordem-servico/ && npx tsc --noEmit` → PASS / EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/ordem-servico/ordens-store.ts src/features/ordem-servico/ordem-schema.ts src/features/ordem-servico/ordem-schema.test.ts src/features/ordem-servico/labels.tsx
git commit -m "feat: add OS store, schema and labels"
```

---

## Task 4: Componentes compartilhados (resumo + apontamentos da OS)

**Files:**
- Create: `src/features/ordem-servico/components/apontamentos-da-os.tsx`
- Create: `src/features/ordem-servico/components/ordem-resumo-card.tsx`

**Interfaces — Consumes:** derivações/labels (T1/T3), `clientesStore`, `equipamentosStore`,
`operadoresStore`, `StatusApontamentoBadge`, `SyncBadge`, `formatHorimetro`. Produces:
`ApontamentosDaOS`, `OrdemResumoCard`.

- [ ] **Step 1: Criar `apontamentos-da-os.tsx`** (SEM valores; compartilhado operador+retaguarda)

```tsx
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { Apontamento } from "@/shared/types";

export function ApontamentosDaOS({ apontamentos }: { apontamentos: Apontamento[] }) {
  if (apontamentos.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem apontamentos ainda.</p>;
  }
  return (
    <ul className="space-y-2">
      {apontamentos.map((a) => {
        const equip = equipamentosStore.getById(a.equipamento_id);
        const op = operadoresStore.getById(a.operador_id);
        return (
          <li key={a.id} className="rounded-lg border bg-surface/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {op?.nome ?? "Operador"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {equip?.nome ?? "Equipamento"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusApontamentoBadge status={a.status} />
                {a.horas_trabalhadas != null ? (
                  <span className="font-mono text-xs text-foreground">
                    {formatHorimetro(a.horas_trabalhadas)}
                  </span>
                ) : null}
              </div>
            </div>
            {a.pendente_sync ? (
              <div className="mt-2">
                <SyncBadge />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Criar `ordem-resumo-card.tsx`** (cabeçalho; SEM valores R$)

```tsx
import { StatusOSBadge, MODELO_LABEL } from "@/features/ordem-servico/labels";
import { statusEfetivoOS, totalHorasOS } from "@/features/ordem-servico/derivacoes";
import { SyncBadge } from "@/shared/components/sync-badge";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { Apontamento, OrdemServico } from "@/shared/types";

export function OrdemResumoCard({
  ordem,
  apontamentos,
}: {
  ordem: OrdemServico;
  apontamentos: Apontamento[];
}) {
  const cliente = clientesStore.getById(ordem.cliente_id);
  const status = statusEfetivoOS(ordem, apontamentos);
  const total = totalHorasOS(ordem.id, apontamentos);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="font-mono text-sm font-semibold text-foreground">{ordem.numero}</div>
          <h2 className="font-display text-xl font-bold text-card-foreground">
            {cliente?.nome ?? "Cliente"}
          </h2>
          <p className="text-sm text-muted-foreground">{ordem.obra_nome}</p>
          {ordem.endereco ? (
            <p className="text-xs text-foreground-faint">{ordem.endereco}</p>
          ) : null}
        </div>
        <StatusOSBadge status={status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border bg-surface px-2.5 py-0.5 text-xs text-muted-foreground">
          {MODELO_LABEL[ordem.modelo_cobranca]}
        </span>
        {ordem.modelo_cobranca === "hora_maquina" ? (
          <span className="font-mono text-sm text-foreground">
            {formatHorimetro(total)} no total
          </span>
        ) : (
          <span className="font-mono text-sm text-foreground">
            {ordem.metragem_executada != null
              ? `${ordem.metragem_executada} m`
              : "metragem pendente"}
            {ordem.diametro_broca_mm != null ? ` · Ø${ordem.diametro_broca_mm}mm` : ""}
          </span>
        )}
        {ordem.pendente_sync ? <SyncBadge /> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Gate** — `npx tsc --noEmit` → EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/ordem-servico/components/apontamentos-da-os.tsx src/features/ordem-servico/components/ordem-resumo-card.tsx
git commit -m "feat: add shared OS summary card and apontamentos list"
```

---

## Task 5: Operador — lista "Minhas OS" (rota reescrita)

**Files:**
- Create: `src/features/ordem-servico/components/ordens-operador-page.tsx`
- Modify: `src/features/ordem-servico/index.ts` (criar barrel; exporta `OrdensOperadorPage`)
- Modify: `src/routes/app.ordens.index.tsx` (REWRITE — remove `validateSearch` legado)

**Interfaces — Consumes:** `ordensStore`, `apontamentosStore`+`OPERADOR_LOGADO_ID`,
`ordensDoOperador`/`statusEfetivoOS`, `clientesStore`, `StatusOSBadge`, `SyncBadge`,
`useMockResource`, `EmptyState`. Produces: `OrdensOperadorPage`.

- [ ] **Step 1: Criar `ordens-operador-page.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/shared/components/empty-state";
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusOSBadge, STATUS_OS, STATUS_OS_LABEL } from "@/features/ordem-servico/labels";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore, OPERADOR_LOGADO_ID } from "@/features/apontamento/apontamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import type { StatusOS } from "@/shared/types";
import { cn } from "@/lib/utils";

type FiltroId = "todas" | StatusOS;
const FILTROS: { id: FiltroId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "aberta", label: STATUS_OS_LABEL.aberta },
  { id: "em_andamento", label: STATUS_OS_LABEL.em_andamento },
  { id: "fechada", label: STATUS_OS_LABEL.fechada },
];

export function OrdensOperadorPage() {
  const todas = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<FiltroId>("todas");

  const minhas = useMemo(
    () => ordensDoOperador(todas, apontamentos, OPERADOR_LOGADO_ID),
    [todas, apontamentos],
  );

  const ordens = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return minhas.filter((o) => {
      if (filtro !== "todas" && statusEfetivoOS(o, apontamentos) !== filtro) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.obra_nome.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [minhas, q, filtro, apontamentos]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número, cliente ou obra"
          className="h-11 pl-9"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                filtro === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface/50 text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {ordens.length === 0 ? (
        <EmptyState
          icon="lucide:file-text"
          titulo="Nenhuma OS encontrada"
          descricao="Ajuste os filtros ou aguarde a recepção atribuir uma nova ordem."
        />
      ) : (
        <ul className="space-y-3">
          {ordens.map((o) => {
            const cliente = clientesStore.getById(o.cliente_id);
            return (
              <li key={o.id}>
                <Link
                  to="/app/ordens/$ordemId"
                  params={{ ordemId: o.id }}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/60 active:bg-surface"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {o.numero}
                      </span>
                      <StatusOSBadge status={statusEfetivoOS(o, apontamentos)} />
                    </div>
                    <div className="truncate font-display text-base font-bold text-card-foreground">
                      {cliente?.nome ?? "Cliente"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{o.obra_nome}</div>
                    {o.pendente_sync ? <SyncBadge /> : null}
                  </div>
                  <Icon icon="lucide:chevron-right" className="h-5 w-5 shrink-0 text-foreground-faint" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

> **Nota (EmptyState — confirmado):** `EmptyState` aceita `icon?: string` (Iconify),
> `titulo?`, `descricao?`, `acao?` (ver `src/shared/components/empty-state.tsx`). O uso
> acima (`icon="lucide:file-text"`) está correto. NÃO usar a prop legada `icone` (LucideIcon).

- [ ] **Step 2: Criar o barrel `src/features/ordem-servico/index.ts`**

```typescript
export { OrdensOperadorPage } from "@/features/ordem-servico/components/ordens-operador-page";
export { ordensStore } from "@/features/ordem-servico/ordens-store";
```

- [ ] **Step 3: Reescrever `src/routes/app.ordens.index.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { OrdensOperadorPage } from "@/features/ordem-servico";

export const Route = createFileRoute("/app/ordens/")({
  head: () => ({ meta: [{ title: "Minhas OS · Antonello" }] }),
  component: OrdensOperadorPage,
});
```

- [ ] **Step 4: Regenerar routeTree + gate** — dev server :8082 regenera; senão `npm run build`.
Run: `npx tsc --noEmit && npm test` → EXIT 0 / PASS. Smoke: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/app/ordens` → 200.

- [ ] **Step 5: Commit**

```bash
git add src/features/ordem-servico/components/ordens-operador-page.tsx src/features/ordem-servico/index.ts src/routes/app.ordens.index.tsx src/routeTree.gen.ts
git commit -m "feat: rewrite operador OS list as collaborative Minhas OS"
```

---

## Task 6: Operador — detalhe colaborativo (rota reescrita)

**Files:**
- Create: `src/features/ordem-servico/components/ordem-detalhe-operador.tsx`
- Modify: `src/features/ordem-servico/index.ts` (exporta `OrdemDetalheOperador`, `OrdemNaoEncontrada`)
- Modify: `src/routes/app.ordens.$ordemId.tsx` (REWRITE)

**Interfaces — Consumes:** `ordensStore`, `apontamentosStore`, derivações, `OrdemResumoCard`,
`ApontamentosDaOS`. Produces: `OrdemDetalheOperador`, `OrdemNaoEncontrada`.

- [ ] **Step 1: Criar `ordem-detalhe-operador.tsx`**

```tsx
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { OrdemResumoCard } from "@/features/ordem-servico/components/ordem-resumo-card";
import { ApontamentosDaOS } from "@/features/ordem-servico/components/apontamentos-da-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosDaOS, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export function OrdemDetalheOperador({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const apontamentos = apontamentosStore.useTodos();
  const navigate = useNavigate();

  if (!ordem) return <OrdemNaoEncontrada />;

  const daOS = apontamentosDaOS(ordem.id, apontamentos);
  const fechada = statusEfetivoOS(ordem, apontamentos) === "fechada";

  return (
    <div className="space-y-5">
      <Link
        to="/app/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Minhas OS
      </Link>

      <OrdemResumoCard ordem={ordem} apontamentos={apontamentos} />

      {ordem.observacao ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <Icon icon="lucide:sticky-note" className="h-4 w-4" />
            Observação
          </div>
          <p className="text-sm text-card-foreground">{ordem.observacao}</p>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Apontamentos ({daOS.length})
        </h3>
        <ApontamentosDaOS apontamentos={daOS} />
      </section>

      {!fechada ? (
        <Button
          size="lg"
          onClick={() => navigate({ to: "/app/apontamento/novo", search: { os: ordem.id } })}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Apontar nesta OS
        </Button>
      ) : null}
    </div>
  );
}

export function OrdemNaoEncontrada() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">OS não encontrada</h2>
      <p className="text-sm text-muted-foreground">
        Esta ordem pode ter sido removida ou ainda não foi atribuída a você.
      </p>
      <Link
        to="/app/ordens"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Minhas OS
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Atualizar o barrel** `src/features/ordem-servico/index.ts` (append):

```typescript
export { OrdemDetalheOperador, OrdemNaoEncontrada } from "@/features/ordem-servico/components/ordem-detalhe-operador";
```

- [ ] **Step 3: Reescrever `src/routes/app.ordens.$ordemId.tsx`**

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { OrdemDetalheOperador, OrdemNaoEncontrada } from "@/features/ordem-servico";

export const Route = createFileRoute("/app/ordens/$ordemId")({
  loader: ({ params }) => {
    if (!ordensStore.obter(params.ordemId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [{ title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` }],
  }),
  component: OrdemDetalheRoute,
  notFoundComponent: OrdemNaoEncontrada,
});

function OrdemDetalheRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheOperador ordemId={ordemId} />;
}
```

- [ ] **Step 4: Regenerar routeTree + gate** — `npx tsc --noEmit && npm test` → OK.
Smoke: `curl ... http://localhost:8082/app/ordens/os-001` → 200 (colaborativa, 2 operadores).

- [ ] **Step 5: Commit**

```bash
git add src/features/ordem-servico/components/ordem-detalhe-operador.tsx src/features/ordem-servico/index.ts src/routes/app.ordens.$ordemId.tsx src/routeTree.gen.ts
git commit -m "feat: rewrite operador OS detail as collaborative view"
```

---

## Task 7: Reconciliar o apontamento (PRD-002) com o novo modelo de OS

**Files:**
- Modify: `src/routes/app.apontamento.novo.tsx` (validateSearch `os`)
- Modify: `src/features/apontamento/components/iniciar-apontamento-form.tsx`
- Modify: `src/features/apontamento/components/apontamento-detalhe.tsx`

**Interfaces — Consumes:** `ordensStore`, `ordensDoOperador`. (Remove uso de `ordensOperador`.)

- [ ] **Step 1: `app.apontamento.novo.tsx` — aceitar `?os=`**

Adicionar `validateSearch` e passar para o form. Estado final do arquivo:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { IniciarApontamentoForm } from "@/features/apontamento/components/iniciar-apontamento-form";

interface NovoApontamentoSearch {
  os?: string;
}

export const Route = createFileRoute("/app/apontamento/novo")({
  validateSearch: (raw: Record<string, unknown>): NovoApontamentoSearch => ({
    os: typeof raw.os === "string" ? raw.os : undefined,
  }),
  head: () => ({ meta: [{ title: "Novo apontamento · Antonello" }] }),
  component: NovoApontamentoRoute,
});

function NovoApontamentoRoute() {
  const { os } = Route.useSearch();
  return <IniciarApontamentoForm osIdInicial={os} />;
}
```

> Se o arquivo atual diferir (ex.: já tem `head` ou outro nome de componente),
> **preservar** o que existe e apenas acrescentar `validateSearch` + passar `os` ao form.
> Ler o arquivo antes de reescrever.

- [ ] **Step 2: `iniciar-apontamento-form.tsx` — OS do novo store + pré-preenchimento**

Trocar o import e a fonte das OS, e aceitar `osIdInicial`:

1. Remover `import { ordensOperador } from "@/mocks/ordens-operador";`.
2. Adicionar:
```typescript
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador } from "@/features/ordem-servico/derivacoes";
```
3. Assinatura: `export function IniciarApontamentoForm({ osIdInicial }: { osIdInicial?: string }) {`
4. Trocar a linha das ordens por (lista de OS não-fechadas vinculadas ao operador):
```typescript
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensDoOperador(ordensStore.useTodas(), apontamentos, OPERADOR_LOGADO_ID).filter(
    (o) => o.status !== "fechada",
  );
```
5. No `defaultValues`, trocar `os_id: SEM_OS` por `os_id: osIdInicial ?? SEM_OS`.
6. No `<SelectItem>` das ordens, trocar `{o.numero} — {o.obra}` por `{o.numero} — {o.obra_nome}`.

(O restante do form permanece igual: o `os_id` continua opcional, mapeando `SEM_OS`→null.)

- [ ] **Step 3: `apontamento-detalhe.tsx` — lookup no novo store**

1. Remover `import { ordensOperador } from "@/mocks/ordens-operador";`.
2. Adicionar `import { ordensStore } from "@/features/ordem-servico/ordens-store";`.
3. Trocar:
```typescript
  const os = apontamento.os_id ? ordensStore.obter(apontamento.os_id) : null;
```
4. No JSX, trocar `{os.numero} — {os.obra}` por `{os.numero} — {os.obra_nome}`.

- [ ] **Step 4: Gate** — `npx tsc --noEmit && npm test` → EXIT 0 / PASS.
Smoke: `curl ... "http://localhost:8082/app/apontamento/novo?os=os-001"` → 200 (OS pré-selecionada).

- [ ] **Step 5: Commit**

```bash
git add src/routes/app.apontamento.novo.tsx src/features/apontamento/components/iniciar-apontamento-form.tsx src/features/apontamento/components/apontamento-detalhe.tsx src/routeTree.gen.ts
git commit -m "refactor: reconcile apontamento OS selector and lookup with OrdemServico"
```

---

## Task 8: Retaguarda — lista + criar OS

**Files:**
- Create: `src/features/ordem-servico/components/ordem-form.tsx`
- Create: `src/features/ordem-servico/components/ordens-retaguarda-page.tsx`
- Modify: `src/features/ordem-servico/index.ts` (exporta `OrdensRetaguardaPage`)
- Delete: `src/routes/admin.ordens.tsx`
- Create: `src/routes/admin.ordens.index.tsx`

**Interfaces — Consumes:** `ordensStore`, `apontamentosStore`, derivações/labels,
`proximoNumeroOS`, `clientesStore`, `operadoresStore`, `ordemSchema`, `DataList`,
`FormDialog`, `PageHeader`, `useMockResource`. Produces: `OrdemForm`, `OrdensRetaguardaPage`.

- [ ] **Step 1: Criar `ordem-form.tsx`**

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import { ordemSchema, type OrdemFormValues } from "@/features/ordem-servico/ordem-schema";
import { MODELO_LABEL } from "@/features/ordem-servico/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import type { ModeloCobranca, OrdemServico } from "@/shared/types";

const SEM_RESPONSAVEL = "sem-responsavel";
const MODELOS: ModeloCobranca[] = ["hora_maquina", "por_metro"];

interface Props {
  inicial: OrdemServico | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrdemForm({ inicial, onSuccess, onCancel }: Props) {
  const clientes = clientesStore.useAll().filter((c) => c.ativo);
  const operadores = operadoresStore.useAll().filter((o) => o.ativo);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrdemFormValues>({
    resolver: zodResolver(ordemSchema),
    defaultValues: {
      cliente_id: inicial?.cliente_id ?? "",
      obra_nome: inicial?.obra_nome ?? "",
      endereco: inicial?.endereco ?? "",
      modelo_cobranca: inicial?.modelo_cobranca ?? "hora_maquina",
      responsavel_id: inicial?.responsavel_id ?? undefined,
      observacao: inicial?.observacao ?? "",
      metragem_executada: inicial?.metragem_executada ?? undefined,
      diametro_broca_mm: inicial?.diametro_broca_mm ?? undefined,
    },
  });

  const modelo = watch("modelo_cobranca");

  const onSubmit = (values: OrdemFormValues) => {
    const responsavel =
      values.responsavel_id && values.responsavel_id !== SEM_RESPONSAVEL
        ? values.responsavel_id
        : null;
    const ehPorMetro = values.modelo_cobranca === "por_metro";
    const dados = {
      cliente_id: values.cliente_id,
      obra_nome: values.obra_nome,
      endereco: values.endereco?.trim() ? values.endereco.trim() : null,
      modelo_cobranca: values.modelo_cobranca,
      responsavel_id: responsavel,
      observacao: values.observacao?.trim() ? values.observacao.trim() : null,
      metragem_executada: ehPorMetro ? (values.metragem_executada ?? null) : null,
      diametro_broca_mm: ehPorMetro ? (values.diametro_broca_mm ?? null) : null,
    };

    if (inicial) {
      ordensStore.atualizar(inicial.id, dados);
      toast.success("OS atualizada.");
    } else {
      const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
      ordensStore.criar({ ...dados, numero });
      toast.success(`OS criada — ${numero}.`);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cliente_id">Cliente *</Label>
        <Controller
          control={control}
          name="cliente_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="cliente_id" aria-invalid={!!errors.cliente_id}>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.cliente_id ? (
          <p className="text-xs text-destructive">{errors.cliente_id.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obra_nome">Obra *</Label>
        <Input id="obra_nome" {...register("obra_nome")} aria-invalid={!!errors.obra_nome} />
        {errors.obra_nome ? (
          <p className="text-xs text-destructive">{errors.obra_nome.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="endereco">Endereço</Label>
        <Input id="endereco" placeholder="opcional" {...register("endereco")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="modelo_cobranca">Modelo de cobrança *</Label>
          <Controller
            control={control}
            name="modelo_cobranca"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="modelo_cobranca">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODELO_LABEL[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="responsavel_id">Responsável</Label>
          <Controller
            control={control}
            name="responsavel_id"
            render={({ field }) => (
              <Select
                value={field.value ?? SEM_RESPONSAVEL}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="responsavel_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_RESPONSAVEL}>Sem responsável</SelectItem>
                  {operadores.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {modelo === "por_metro" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="diametro_broca_mm">Diâmetro da broca (mm) *</Label>
            <Input
              id="diametro_broca_mm"
              type="number"
              step="1"
              min="0"
              className="font-mono"
              placeholder="ex.: 400"
              {...register("diametro_broca_mm", { valueAsNumber: true })}
              aria-invalid={!!errors.diametro_broca_mm}
            />
            {errors.diametro_broca_mm ? (
              <p className="text-xs text-destructive">{errors.diametro_broca_mm.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metragem_executada">Metragem executada (m)</Label>
            <Input
              id="metragem_executada"
              type="number"
              step="0.1"
              min="0"
              className="font-mono"
              placeholder="opcional"
              {...register("metragem_executada", { valueAsNumber: true })}
              aria-invalid={!!errors.metragem_executada}
            />
            {errors.metragem_executada ? (
              <p className="text-xs text-destructive">{errors.metragem_executada.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="observacao">Observação</Label>
        <Textarea id="observacao" rows={3} placeholder="opcional" {...register("observacao")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {inicial ? "Salvar alterações" : "Criar OS"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Criar `ordens-retaguarda-page.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
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
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import {
  statusEfetivoOS,
  totalHorasOS,
} from "@/features/ordem-servico/derivacoes";
import {
  StatusOSBadge,
  STATUS_OS,
  STATUS_OS_LABEL,
  MODELO_LABEL,
} from "@/features/ordem-servico/labels";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { OrdemServico, StatusOS } from "@/shared/types";

export function OrdensRetaguardaPage() {
  const todas = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const { isLoading, error, retry } = useMockResource(todas);

  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOS | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todas.filter((o) => {
      if (filtroStatus !== "todos" && statusEfetivoOS(o, apontamentos) !== filtroStatus) {
        return false;
      }
      if (!termo) return true;
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.obra_nome.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todas, q, filtroStatus, apontamentos]);

  const columns: Column<OrdemServico>[] = [
    {
      header: "OS",
      cell: (o) => (
        <Link
          to="/admin/ordens/$ordemId"
          params={{ ordemId: o.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {o.numero}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (o) => (
        <div className="min-w-0 max-w-[20rem] truncate">
          {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
        </div>
      ),
    },
    { header: "Obra", cell: (o) => <span className="text-muted-foreground">{o.obra_nome}</span> },
    { header: "Modelo", cell: (o) => MODELO_LABEL[o.modelo_cobranca] },
    {
      header: "Horas",
      className: "font-mono",
      cell: (o) =>
        o.modelo_cobranca === "hora_maquina"
          ? formatHorimetro(totalHorasOS(o.id, apontamentos))
          : o.metragem_executada != null
            ? `${o.metragem_executada} m`
            : "—",
    },
    { header: "Status", cell: (o) => <StatusOSBadge status={statusEfetivoOS(o, apontamentos)} /> },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número, cliente ou obra"
          className="pl-9"
        />
      </div>
      <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as StatusOS | "todos")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_OS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_OS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCard = (o: OrdemServico) => (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/ordens/$ordemId"
          params={{ ordemId: o.id }}
          className="font-mono text-sm font-semibold text-foreground"
        >
          {o.numero}
        </Link>
        <StatusOSBadge status={statusEfetivoOS(o, apontamentos)} />
      </div>
      <div className="mt-2 font-display font-bold text-card-foreground">
        {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
      </div>
      <div className="text-xs text-muted-foreground">{o.obra_nome}</div>
      <div className="mt-2 font-mono text-xs text-foreground">
        {MODELO_LABEL[o.modelo_cobranca]} ·{" "}
        {o.modelo_cobranca === "hora_maquina"
          ? formatHorimetro(totalHorasOS(o.id, apontamentos))
          : o.metragem_executada != null
            ? `${o.metragem_executada} m`
            : "—"}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Ordens de Serviço"
        descricao="Abertura, acompanhamento e fechamento das OS de campo."
        acoes={
          <Button
            onClick={() => setFormAberto(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Nova OS
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
        empty={{
          icon: "lucide:file-text",
          titulo: todas.length === 0 ? "Nenhuma OS" : "Nada encontrado",
          descricao:
            todas.length === 0
              ? "Abra a primeira ordem de serviço para começar."
              : "Ajuste a busca ou o filtro.",
          cta:
            todas.length === 0 ? (
              <Button
                onClick={() => setFormAberto(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Abrir primeira OS
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Nova OS"
        descricao="Os campos com * são obrigatórios."
      >
        <OrdemForm
          inicial={null}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>
    </div>
  );
}
```

- [ ] **Step 3: Atualizar o barrel** (append):

```typescript
export { OrdensRetaguardaPage } from "@/features/ordem-servico/components/ordens-retaguarda-page";
```

- [ ] **Step 4: Substituir a rota** — deletar `src/routes/admin.ordens.tsx` e criar
`src/routes/admin.ordens.index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { OrdensRetaguardaPage } from "@/features/ordem-servico";

export const Route = createFileRoute("/admin/ordens/")({
  head: () => ({
    meta: [
      { title: "Ordens de Serviço · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdensRetaguardaPage,
});
```

```bash
git rm src/routes/admin.ordens.tsx
```

- [ ] **Step 5: Regenerar routeTree + gate** — `npx tsc --noEmit && npm test` → OK.
Smoke: `curl ... http://localhost:8082/admin/ordens` → 200.

- [ ] **Step 6: Commit**

```bash
git add src/features/ordem-servico/components/ordem-form.tsx src/features/ordem-servico/components/ordens-retaguarda-page.tsx src/features/ordem-servico/index.ts src/routes/admin.ordens.index.tsx src/routeTree.gen.ts
git commit -m "feat: add retaguarda OS list and create form"
```

---

## Task 9: Retaguarda — detalhe + fechar + editar

**Files:**
- Create: `src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx`
- Modify: `src/features/ordem-servico/index.ts` (exporta `OrdemDetalheRetaguarda`)
- Create: `src/routes/admin.ordens.$ordemId.tsx`

**Interfaces — Consumes:** `ordensStore` (`fechar`), `apontamentosStore`, derivações,
`OrdemResumoCard`, `ApontamentosDaOS`, `OrdemForm`, `FormDialog`, `ConfirmDialog`.
Produces: `OrdemDetalheRetaguarda`.

- [ ] **Step 1: Criar `ordem-detalhe-retaguarda.tsx`**

```tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { OrdemResumoCard } from "@/features/ordem-servico/components/ordem-resumo-card";
import { ApontamentosDaOS } from "@/features/ordem-servico/components/apontamentos-da-os";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosDaOS, podeFecharOS, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export function OrdemDetalheRetaguarda({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const apontamentos = apontamentosStore.useTodos();
  const [editando, setEditando] = useState(false);
  const [confirmarFechar, setConfirmarFechar] = useState(false);

  if (!ordem) return <OrdemNaoEncontradaAdmin />;

  const daOS = apontamentosDaOS(ordem.id, apontamentos);
  const fechada = statusEfetivoOS(ordem, apontamentos) === "fechada";
  const podeFechar = podeFecharOS(ordem, apontamentos);

  const fechar = () => {
    const r = ordensStore.fechar(ordem.id, apontamentos);
    if (!r.ok) {
      toast.error(r.motivo);
      setConfirmarFechar(false);
      return;
    }
    toast.success(`OS ${r.ordem.numero} fechada.`);
    setConfirmarFechar(false);
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Ordens de Serviço
      </Link>

      <OrdemResumoCard ordem={ordem} apontamentos={apontamentos} />

      {ordem.observacao ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <Icon icon="lucide:sticky-note" className="h-4 w-4" />
            Observação
          </div>
          <p className="text-sm text-card-foreground">{ordem.observacao}</p>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Apontamentos ({daOS.length})
        </h3>
        <ApontamentosDaOS apontamentos={daOS} />
      </section>

      {!fechada ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
            <Icon icon="lucide:pencil" className="h-4 w-4" />
            Editar
          </Button>
          <Button
            onClick={() => setConfirmarFechar(true)}
            disabled={!podeFechar.pode}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:lock" className="h-4 w-4" />
            Fechar OS
          </Button>
          {!podeFechar.pode ? (
            <p className="w-full text-xs text-destructive">{podeFechar.motivo}</p>
          ) : null}
        </div>
      ) : null}

      <FormDialog
        open={editando}
        onOpenChange={setEditando}
        titulo="Editar OS"
        descricao="Os campos com * são obrigatórios."
      >
        <OrdemForm
          inicial={ordem}
          onSuccess={() => setEditando(false)}
          onCancel={() => setEditando(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={confirmarFechar}
        onOpenChange={setConfirmarFechar}
        titulo="Fechar esta OS?"
        descricao={`A OS ${ordem.numero} será marcada como fechada. Esta ação encerra os apontamentos da obra.`}
        confirmLabel="Fechar OS"
        onConfirm={fechar}
      />
    </div>
  );
}

function OrdemNaoEncontradaAdmin() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">OS não encontrada</h2>
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Ordens de Serviço
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Atualizar o barrel** (append):

```typescript
export { OrdemDetalheRetaguarda } from "@/features/ordem-servico/components/ordem-detalhe-retaguarda";
```

- [ ] **Step 3: Criar `src/routes/admin.ordens.$ordemId.tsx`**

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { OrdemDetalheRetaguarda } from "@/features/ordem-servico";

export const Route = createFileRoute("/admin/ordens/$ordemId")({
  loader: ({ params }) => {
    if (!ordensStore.obter(params.ordemId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `${ordensStore.obter(params.ordemId)?.numero ?? "OS"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdemDetalheAdminRoute,
});

function OrdemDetalheAdminRoute() {
  const { ordemId } = Route.useParams();
  return <OrdemDetalheRetaguarda ordemId={ordemId} />;
}
```

- [ ] **Step 4: Regenerar routeTree + gate** — `npx tsc --noEmit && npm test` → OK.
Smoke: `curl ... http://localhost:8082/admin/ordens/os-001` → 200 (fechar bloqueado — tem em_andamento); `.../os-004` → 200 (pode fechar).

- [ ] **Step 5: Commit**

```bash
git add src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx src/features/ordem-servico/index.ts src/routes/admin.ordens.$ordemId.tsx src/routeTree.gen.ts
git commit -m "feat: add retaguarda OS detail with close and edit"
```

---

## Task 10: Remover o modelo legado

**Files:**
- Modify: `src/shared/types/index.ts` (remove `OrdemServicoOperador`, `OrdemStatus`)
- Delete: `src/features/operador/ordens-store.ts`
- Delete: `src/features/operador/status-ordem-badge.tsx`
- Delete: `src/mocks/ordens-operador.ts`

**Interfaces:** nenhuma nova (limpeza). Pré-condição: T5-T9 migraram todos os consumidores.

- [ ] **Step 1: Confirmar que nada referencia o legado**

Run:
```bash
grep -rEn "OrdemServicoOperador|OrdemStatus|ordens-operador|status-ordem-badge|operador/ordens-store|StatusOrdemBadge|iniciarTurno|finalizarOrdem|proximoStatus|useOrdens|obterOrdem|listarOrdens" src/ --include=*.ts --include=*.tsx
```
Esperado: **somente** os próprios arquivos legados a remover (ordens-store.ts, status-ordem-badge.tsx) e o type em index.ts. Se qualquer OUTRO arquivo aparecer, **parar** e migrar antes (não remover).

- [ ] **Step 2: Remover os types legados** de `src/shared/types/index.ts` — apagar o
`export type OrdemStatus = ...` e toda a `export interface OrdemServicoOperador { ... }`.
(Manter `OrdemServico`/`StatusOS`/`ModeloCobranca` da T1.)

- [ ] **Step 3: Deletar os arquivos legados**

```bash
git rm src/features/operador/ordens-store.ts src/features/operador/status-ordem-badge.tsx src/mocks/ordens-operador.ts
```

- [ ] **Step 4: Gate** — `npx tsc --noEmit && npm test` → EXIT 0 / PASS (suíte completa).

- [ ] **Step 5: Commit**

```bash
git add src/shared/types/index.ts
git commit -m "refactor: remove legacy OrdemServicoOperador model"
```

---

## Task 11: Barreira financeira + release (0.4.0 Worksite)

**Files:**
- Modify: `package.json`, `CHANGELOG.md`
- Rename: `docs/prds/PRD-003-...md` → `..._DONE.md` (+ status)
- Modify: `docs/prds/INDEX-PRDs-antonello.md`

- [ ] **Step 1: Barreira financeira (deve ser vazio)**

```bash
grep -rEn "features/precos|mocks/precos|brlExato|formatBRL" src/routes/app.* src/features/operador src/features/apontamento src/features/ordem-servico
```
Esperado: **nenhuma saída**. Qualquer match = violação → parar e corrigir.

- [ ] **Step 2: Versão** — `package.json` `"version": "0.3.0"` → `"0.4.0"`.

- [ ] **Step 3: CHANGELOG** — inserir acima de `## [0.3.0]`:

```markdown
## [0.4.0] - 2026-06-29 - Worksite

### Added
- Ordem de Serviço colaborativa nos dois ambientes: lista + detalhe do operador
  ("Minhas OS", apontamentos dos colegas, "Apontar nesta OS") e retaguarda (lista,
  criar, detalhar, fechar, editar).
- Total de horas e status efetivo derivados dos apontamentos; numeração automática
  `OS-AAAA-NNNN`; modelo de cobrança hora-máquina/por-metro.
- Regra de fechamento: exclusivo da retaguarda, bloqueado com apontamento em andamento.

### Changed
- Modelo de OS migrado de `OrdemServicoOperador` (turno único por operador) para
  `OrdemServico` colaborativa; apontamentos (PRD-002) passam a vincular às novas OS,
  e o seletor de OS do apontamento aceita pré-preenchimento via `?os=`.

### Removed
- Modelo de OS legado (`OrdemServicoOperador`, store e mock do operador) e fluxo de
  "Iniciar turno / Finalizar OS" com horímetro direto na OS.
```

- [ ] **Step 4: PRD `_DONE`** — `git mv docs/prds/PRD-003-all-ordem-servico-colaborativa.md docs/prds/PRD-003-all-ordem-servico-colaborativa_DONE.md` e preencher "Status de Implementação":

```markdown
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-29 |
| **Versão do App** | 0.4.0 (Worksite) |
| **Implementado por** | Claude Opus 4.8 (Claude Code CLI) |
| **Observações** | Frontend First. Reconcilia o modelo legado (ADR-001). Fechar = retaguarda; horas derivadas; colaboração demonstrável (os-001). |
```

- [ ] **Step 5: INDEX** — implementados **4 → 5** (PRD-003 ✅); Resumo ✅ 5 / 33%, ⏳ 10 / 67%;
roadmap Onda 1 PRD-003 → `_DONE` + ✅; catálogo move PRD-003 para Implementados (versão
0.4.0 Worksite) e remove de "aguardando"; Histórico de Versões + 0.4.0 Worksite (PRD-003);
"Última Atualização" 2026-06-29.

- [ ] **Step 6: Gate final** — `npx tsc --noEmit && npm test` → EXIT 0 / PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json CHANGELOG.md docs/prds/
git commit -m "chore: release 0.4.0 (Worksite) — PRD-003 OS colaborativa"
```

---

## Self-Review (autor do plano)

- **Cobertura do spec:** types+derivações+numeração (T1) · mocks+reconciliação (T2) ·
  store+schema+labels (T3) · componentes compartilhados (T4) · operador lista (T5) +
  detalhe (T6) · reconciliação apontamento (T7) · retaguarda lista+criar (T8) +
  detalhe+fechar+editar (T9) · remoção do legado (T10) · barreira+release (T11). ✓
- **Sem placeholders:** todo passo de código traz o código completo, salvo 2 notas de
  verificação explícitas (assinatura de `EmptyState.icon` na T5; preservar conteúdo
  existente em `app.apontamento.novo.tsx` na T7) — ambas pedem LER antes de editar, não
  são placeholders de lógica. ✓
- **tsc verde por task:** o legado coexiste até T10; cada rota reescrita troca para o novo
  store mantendo o legado importável. ✓
- **Consistência de tipos:** `ordensStore` (useTodas/useOrdem/obter/listar/criar/atualizar/
  fechar), `apontamentosStore.useTodos`, derivações com assinaturas fixas, `OrdemFormValues`
  via `z.infer`, `proximoNumeroOS(Pick<…,"numero">[])`. ✓
- **Barreira:** OS sem R$; grep final em T11 cobre app/operador/apontamento/ordem-servico. ✓
