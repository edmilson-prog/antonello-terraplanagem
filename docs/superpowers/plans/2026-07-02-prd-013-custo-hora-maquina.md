# PRD-013: Custo Real da Hora-Máquina — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o "achismo" de custo por um painel retaguarda-only que calcula o custo real por hora de cada equipamento (fixos + variáveis + diesel + manutenção ÷ horas trabalhadas no mês) e compara com o preço praticado, mostrando a margem.

**Architecture:** Feature nova `src/features/custo-hora/` inteiramente derivada — um único contrato persistido (`ComponenteCusto`, configurável pelo usuário) e um resultado 100% calculado (`CustoHoraEquipamento`, nunca armazenado) que reaproveita funções já existentes de `faturamento` (resolução de preço, arredondamento) e `diesel` (custo do abastecimento) em vez de duplicá-las. UI: página com 2 abas (painel analítico + configuração de componentes) e um navegador de mês.

**Tech Stack:** React + Vite + TypeScript, TanStack Router (rota `/admin/custo-hora`), Tailwind + shadcn/ui, react-hook-form + zod, vitest.

## Global Constraints

- **Retaguarda-only, financeiro estratégico.** `src/features/custo-hora/` **nunca** é importado por `/app/*` ou por `src/features/operador/`. Verificar com `grep -rniE "custo-hora|custoHora|ComponenteCusto" src/features/operador src/routes/app.*` (deve retornar vazio) antes de fechar o PRD.
- **Derivar, não duplicar.** Reaproveitar:
  - `precoHoraDoEquipamento` e `round2` de `@/features/faturamento/calculo` (resolução de preço ativo por equipamento/tipo e aritmética monetária em centavos).
  - `custoAbastecimento` de `@/features/diesel/derivacoes` (custo de um abastecimento: `custo_total` tem prioridade; senão `litros × preco_litro`; `null` se não houver dado).
  - `createMockStore` genérico para o CRUD de `ComponenteCusto`.
  - `CurrencyInput` de `@/features/precos/components/currency-input` e `KpiCard` de `@/features/dashboard/components/kpi-card` (reuso cross-feature já é padrão no repo: `ManutencaoIndicador`, `RegistrarAbastecimentoOperadorDialog` etc. são reaproveitados da mesma forma).
- **Contrato persistido vs. derivado.** Só `ComponenteCusto` (e seu `TipoComponenteCusto`) entram em `src/shared/types/index.ts` — é o único dado que vira tabela real no backend. `CustoHoraEquipamento`/`DetalheItemCusto` são resultados 100% calculados (nunca persistidos) e ficam locais a `src/features/custo-hora/derivacoes.ts`, **não** em `shared/types` — mesmo padrão já usado no PRD-015 (`ContagemOSPorStatus`, `PipelineFinanceiroPeriodo` vivem em `dashboard/derivacoes.ts`, não em `shared/types`).
- **`TipoComponenteCusto` tem 4 valores** (`fixo_mensal | variavel_hora | diesel | manutencao`) para dar forma homogênea ao array `detalhamento` (RF-004: uma lista única mostrando de onde vem cada parcela — configurada ou derivada). Mas o **formulário de cadastro só oferece `fixo_mensal`/`variavel_hora`** (`TIPOS_CONFIGURAVEIS`): diesel e manutenção **nunca** são um `ComponenteCusto` criado à mão — são sempre derivados do PRD-012/PRD-010.
- **Rateio de fixos.** O período do painel é sempre um **mês de competência inteiro** (`"YYYY-MM"`), nunca um recorte relativo (não é o `PeriodoDashboard` hoje/semana/mês do PRD-015 — custos fixos mensais não fazem sentido nesse recorte). Por isso `custo_fixo_rateado` é simplesmente a soma dos componentes `fixo_mensal` ativos daquele mês (já é um valor mensal); o "rateio por hora" (RNF-001) acontece ao dividir `custo_total` por `horas_trabalhadas` — não há proporcionalização adicional por dias.
- **`custo_variavel`** = soma dos componentes `variavel_hora` ativos (R$/h) × `horas_trabalhadas` do período.
- **Preço de comparação** = `valor_hora_operada` do `PrecoHoraMaquina` ativo aplicável ao equipamento (via `precoHoraDoEquipamento`). Decisão de produto: "operada" é o preço cheio comparável ao custo plenamente carregado (que já pode incluir "Operador" como componente variável quando configurado). Não bloqueante — documentar no relatório final.
- **Transparência do detalhamento (RNF-003).** `detalhamento` sempre inclui as 4 categorias — diesel e manutenção aparecem mesmo com valor `R$ 0,00` quando não há dado no período (mais transparente que omitir a linha).
- **Divisão por zero (RNF-001/edge case).** `custo_por_hora` é `null` quando `horas_trabalhadas === 0` — nunca `Infinity`/`NaN`. `margem_hora` é `null` quando faltar `custo_por_hora` **ou** `preco_hora`.
- **Configuração incompleta (edge case).** `configuracao_incompleta: true` quando o equipamento não tem nenhum `ComponenteCusto` ativo — independente de `horas_trabalhadas` (as duas condições são ortogonais e podem coexistir, ex.: `eq-004` no mock tem as duas).
- **Ranking (RF-006, Could).** Satisfeito pela ordenação padrão da tabela por `custo_por_hora` decrescente (nulls por último) — sem widget dedicado (YAGNI).
- **Sem Supabase.** Tudo mockado em `src/mocks/componentes-custo.ts`; demais dados vêm dos stores já existentes (equipamentos, apontamentos, abastecimentos, registros de manutenção, preços hora-máquina).
- **Sem prefixo `I`** em interfaces (`ComponenteCusto`, não `IComponenteCusto` — a spec do PRD usa o prefixo antigo, mas o repo já removeu esse padrão em todo o código).

---

### Task 1: Contrato, mocks e cálculo puro (`derivacoes`)

**Files:**
- Modify: `src/shared/types/index.ts` (adicionar ao final do arquivo)
- Create: `src/mocks/componentes-custo.ts`
- Create: `src/mocks/componentes-custo.test.ts`
- Create: `src/features/custo-hora/custo-hora-schema.ts`
- Create: `src/features/custo-hora/custo-hora-schema.test.ts`
- Create: `src/features/custo-hora/componentes-custo-store.ts`
- Create: `src/features/custo-hora/labels.tsx`
- Create: `src/features/custo-hora/periodo-mensal.ts`
- Create: `src/features/custo-hora/periodo-mensal.test.ts`
- Create: `src/features/custo-hora/derivacoes.ts`
- Create: `src/features/custo-hora/derivacoes.test.ts`

**Interfaces:**
- Consumes: `Equipamento`, `Apontamento`, `Abastecimento`, `RegistroManutencao`, `PrecoHoraMaquina` de `@/shared/types`; `precoHoraDoEquipamento`/`round2` de `@/features/faturamento/calculo`; `custoAbastecimento` de `@/features/diesel/derivacoes`; `createMockStore` de `@/shared/lib/create-mock-store`.
- Produces: tipo `ComponenteCusto`/`TipoComponenteCusto` (shared/types); mock `componentesCusto`; `componentesCustoStore` (`useAll`, `create`, `update`, `setAtivo`); schema `componenteCustoSchema`/`ComponenteCustoFormValues`; labels `TIPO_COMPONENTE_LABEL`, `TIPOS_CONFIGURAVEIS`, `unidadeComponente`, componente `TipoComponenteCustoBadge`; funções de período `mesReferencia`, `mesAnterior`, `proximoMes`, `rotuloMes`; funções de cálculo `horasTrabalhadasNoPeriodo`, `custoDieselNoPeriodo`, `custoManutencaoNoPeriodo`, `componentesAtivosDoEquipamento`, `custoHoraEquipamento`, `custoHoraPorEquipamento`; interfaces `DetalheItemCusto`, `CustoHoraEquipamento` — todas usadas pelas Tasks 2/3/4.

- [ ] **Step 1: Adicionar o contrato `ComponenteCusto` a `shared/types`**

Abrir `src/shared/types/index.ts` e adicionar ao final do arquivo (depois do bloco de `Comprovante`):

```typescript
// Custo Real da Hora-Máquina (PRD-013) — RETAGUARDA-ONLY (financeiro
// estratégico). `ComponenteCusto` é o único contrato persistido: fixos
// mensais (ex.: parcela FINAME, seguro) ou variáveis por hora (ex.: material
// rodante, operador), configurados por equipamento. Diesel (PRD-012) e
// manutenção (PRD-010) entram no custo por DERIVAÇÃO (nunca como
// ComponenteCusto manual) — o custo/hora final é sempre calculado, nunca
// persistido (ver features/custo-hora/derivacoes.ts).
export type TipoComponenteCusto = "fixo_mensal" | "variavel_hora" | "diesel" | "manutencao";

export interface ComponenteCusto {
  id: string;
  equipamento_id: string; // FK → Equipamento
  descricao: string; // ex.: "Parcela FINAME", "Seguro", "Material rodante", "Operador"
  tipo: TipoComponenteCusto; // configurável pelo usuário: só fixo_mensal | variavel_hora
  valor: number; // R$ (mensal se fixo; por hora se variável)
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Criar o mock de componentes de custo**

Create `src/mocks/componentes-custo.ts`:

```typescript
import type { ComponenteCusto } from "@/shared/types";

// 9 componentes cobrindo 4 equipamentos ativos com diesel/manutenção reais em
// 2026-06 (eq-001, eq-002, eq-005, eq-006) — 1 fixo_mensal + 1 variavel_hora
// cada. eq-003 fica de propósito SEM nenhum componente (edge case
// "configuração incompleta" mesmo com horas > 0). eq-004 (status manutenção,
// sem apontamento nem abastecimento em junho) cobre "sem horas no período" —
// e também não tem componente, cobrindo as duas condições ao mesmo tempo.
// cc-005 é inativo (edge case "1 inativo" — revisão de depreciação superada).
export const componentesCusto: ComponenteCusto[] = [
  {
    id: "cc-001",
    equipamento_id: "eq-001",
    descricao: "Parcela FINAME",
    tipo: "fixo_mensal",
    valor: 4200,
    ativo: true,
    created_at: "2025-01-10T12:00:00.000Z",
    updated_at: "2025-01-10T12:00:00.000Z",
  },
  {
    id: "cc-002",
    equipamento_id: "eq-001",
    descricao: "Material rodante + operador",
    tipo: "variavel_hora",
    valor: 45,
    ativo: true,
    created_at: "2025-01-10T12:00:00.000Z",
    updated_at: "2025-01-10T12:00:00.000Z",
  },
  {
    id: "cc-003",
    equipamento_id: "eq-002",
    descricao: "Seguro",
    tipo: "fixo_mensal",
    valor: 380,
    ativo: true,
    created_at: "2025-02-05T12:00:00.000Z",
    updated_at: "2025-02-05T12:00:00.000Z",
  },
  {
    id: "cc-004",
    equipamento_id: "eq-002",
    descricao: "Operador",
    tipo: "variavel_hora",
    valor: 38,
    ativo: true,
    created_at: "2025-02-05T12:00:00.000Z",
    updated_at: "2025-02-05T12:00:00.000Z",
  },
  {
    id: "cc-005",
    equipamento_id: "eq-002",
    descricao: "Depreciação (revisão anterior)",
    tipo: "fixo_mensal",
    valor: 300,
    ativo: false,
    created_at: "2024-06-01T12:00:00.000Z",
    updated_at: "2025-02-05T12:00:00.000Z",
  },
  {
    id: "cc-006",
    equipamento_id: "eq-005",
    descricao: "Parcela FINAME",
    tipo: "fixo_mensal",
    valor: 3800,
    ativo: true,
    created_at: "2025-03-01T12:00:00.000Z",
    updated_at: "2025-03-01T12:00:00.000Z",
  },
  {
    id: "cc-007",
    equipamento_id: "eq-005",
    descricao: "Material rodante (pneus)",
    tipo: "variavel_hora",
    valor: 22,
    ativo: true,
    created_at: "2025-03-01T12:00:00.000Z",
    updated_at: "2025-03-01T12:00:00.000Z",
  },
  {
    id: "cc-008",
    equipamento_id: "eq-006",
    descricao: "Seguro",
    tipo: "fixo_mensal",
    valor: 350,
    ativo: true,
    created_at: "2025-04-18T12:00:00.000Z",
    updated_at: "2025-04-18T12:00:00.000Z",
  },
  {
    id: "cc-009",
    equipamento_id: "eq-006",
    descricao: "Operador",
    tipo: "variavel_hora",
    valor: 40,
    ativo: true,
    created_at: "2025-04-18T12:00:00.000Z",
    updated_at: "2025-04-18T12:00:00.000Z",
  },
];
```

- [ ] **Step 3: Testar o mock**

Create `src/mocks/componentes-custo.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { componentesCusto } from "@/mocks/componentes-custo";
import { equipamentos } from "@/mocks/equipamentos";

describe("mocks/componentes-custo", () => {
  it("tem 9 registros", () => {
    expect(componentesCusto).toHaveLength(9);
  });

  it("todos os ids são únicos", () => {
    const ids = componentesCusto.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todo equipamento_id existe em mocks/equipamentos", () => {
    const idsValidos = new Set(equipamentos.map((e) => e.id));
    for (const c of componentesCusto) {
      expect(idsValidos.has(c.equipamento_id)).toBe(true);
    }
  });

  it("valor é sempre positivo", () => {
    for (const c of componentesCusto) {
      expect(c.valor).toBeGreaterThan(0);
    }
  });

  it("tipo é sempre fixo_mensal ou variavel_hora (diesel/manutenção nunca são manuais)", () => {
    for (const c of componentesCusto) {
      expect(["fixo_mensal", "variavel_hora"]).toContain(c.tipo);
    }
  });

  it("inclui ao menos um componente inativo", () => {
    expect(componentesCusto.some((c) => !c.ativo)).toBe(true);
  });

  it("eq-003 não tem nenhum componente configurado (configuração incompleta)", () => {
    expect(componentesCusto.some((c) => c.equipamento_id === "eq-003")).toBe(false);
  });

  it("eq-004 não tem nenhum componente configurado (configuração incompleta)", () => {
    expect(componentesCusto.some((c) => c.equipamento_id === "eq-004")).toBe(false);
  });
});
```

- [ ] **Step 4: Rodar os testes do mock**

Run: `npx vitest run src/mocks/componentes-custo.test.ts`
Expected: 8 testes passando.

- [ ] **Step 5: Criar o schema de validação do formulário**

Create `src/features/custo-hora/custo-hora-schema.ts`:

```typescript
import { z } from "zod";

const valorPositivo = (msg = "Informe um valor maior que zero") =>
  z.number({ invalid_type_error: "Informe um valor válido" }).positive(msg);

export const componenteCustoSchema = z.object({
  equipamento_id: z.string().min(1, "Selecione o equipamento"),
  descricao: z.string().trim().min(2, "Informe a descrição"),
  tipo: z.enum(["fixo_mensal", "variavel_hora"]),
  valor: valorPositivo(),
  ativo: z.boolean(),
});

export type ComponenteCustoFormValues = z.infer<typeof componenteCustoSchema>;
```

- [ ] **Step 6: Testar o schema**

Create `src/features/custo-hora/custo-hora-schema.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { componenteCustoSchema } from "@/features/custo-hora/custo-hora-schema";

describe("features/custo-hora/custo-hora-schema", () => {
  const valido = {
    equipamento_id: "eq-001",
    descricao: "Parcela FINAME",
    tipo: "fixo_mensal" as const,
    valor: 4200,
    ativo: true,
  };

  it("aceita um payload válido", () => {
    expect(componenteCustoSchema.safeParse(valido).success).toBe(true);
  });

  it("rejeita equipamento_id vazio", () => {
    const resultado = componenteCustoSchema.safeParse({ ...valido, equipamento_id: "" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita descrição muito curta", () => {
    const resultado = componenteCustoSchema.safeParse({ ...valido, descricao: "A" });
    expect(resultado.success).toBe(false);
  });

  it("rejeita valor zero ou negativo", () => {
    expect(componenteCustoSchema.safeParse({ ...valido, valor: 0 }).success).toBe(false);
    expect(componenteCustoSchema.safeParse({ ...valido, valor: -10 }).success).toBe(false);
  });

  it("rejeita tipo fora de fixo_mensal/variavel_hora", () => {
    const resultado = componenteCustoSchema.safeParse({ ...valido, tipo: "diesel" });
    expect(resultado.success).toBe(false);
  });
});
```

- [ ] **Step 7: Rodar os testes do schema**

Run: `npx vitest run src/features/custo-hora/custo-hora-schema.test.ts`
Expected: 5 testes passando.

- [ ] **Step 8: Criar o store de componentes de custo**

Create `src/features/custo-hora/componentes-custo-store.ts`:

```typescript
import { createMockStore } from "@/shared/lib/create-mock-store";
import { componentesCusto } from "@/mocks/componentes-custo";
import type { ComponenteCusto } from "@/shared/types";

export const componentesCustoStore = createMockStore<ComponenteCusto>(componentesCusto);
```

- [ ] **Step 9: Criar os labels e o badge de tipo**

Create `src/features/custo-hora/labels.tsx`:

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { TipoComponenteCusto } from "@/shared/types";
import { cn } from "@/lib/utils";

export const TIPO_COMPONENTE_LABEL: Record<TipoComponenteCusto, string> = {
  fixo_mensal: "Fixo mensal",
  variavel_hora: "Variável por hora",
  diesel: "Diesel",
  manutencao: "Manutenção",
};

// Únicos tipos que o usuário configura manualmente — diesel/manutenção são
// sempre derivados (PRD-012/PRD-010), nunca um ComponenteCusto criado à mão.
export const TIPOS_CONFIGURAVEIS: TipoComponenteCusto[] = ["fixo_mensal", "variavel_hora"];

export function unidadeComponente(tipo: TipoComponenteCusto): string {
  return tipo === "variavel_hora" ? "/h" : "/mês";
}

export function TipoComponenteCustoBadge({ tipo }: { tipo: TipoComponenteCusto }) {
  const derivado = tipo === "diesel" || tipo === "manutencao";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        derivado
          ? "border-steel/40 bg-steel/20 text-foreground"
          : "border-primary/50 bg-primary/20 text-foreground",
      )}
    >
      {TIPO_COMPONENTE_LABEL[tipo]}
    </span>
  );
}
```

- [ ] **Step 10: Criar as funções puras de período mensal**

Create `src/features/custo-hora/periodo-mensal.ts`:

```typescript
// Mês de referência do painel de custo/hora — formato "YYYY-MM". Distinto do
// PeriodoDashboard (hoje/semana/mês relativo, PRD-015): custos fixos são
// mensais por natureza, então aqui o período é sempre um mês de competência.

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function mesReferencia(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function mesAnterior(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  return mesReferencia(new Date(ano, mes - 2, 1));
}

export function proximoMes(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  return mesReferencia(new Date(ano, mes, 1));
}

export function rotuloMes(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  return `${MESES[mes - 1]} ${ano}`;
}
```

- [ ] **Step 11: Testar as funções de período**

Create `src/features/custo-hora/periodo-mensal.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  mesReferencia,
  mesAnterior,
  proximoMes,
  rotuloMes,
} from "@/features/custo-hora/periodo-mensal";

describe("features/custo-hora/periodo-mensal", () => {
  describe("mesReferencia", () => {
    it("formata ano-mês com 2 dígitos", () => {
      expect(mesReferencia(new Date(2026, 6, 2))).toBe("2026-07");
    });

    it("preenche o zero à esquerda em meses de um dígito", () => {
      expect(mesReferencia(new Date(2026, 0, 15))).toBe("2026-01");
    });
  });

  describe("mesAnterior", () => {
    it("retrocede um mês dentro do mesmo ano", () => {
      expect(mesAnterior("2026-07")).toBe("2026-06");
    });

    it("retrocede de janeiro para dezembro do ano anterior", () => {
      expect(mesAnterior("2026-01")).toBe("2025-12");
    });
  });

  describe("proximoMes", () => {
    it("avança um mês dentro do mesmo ano", () => {
      expect(proximoMes("2026-06")).toBe("2026-07");
    });

    it("avança de dezembro para janeiro do ano seguinte", () => {
      expect(proximoMes("2025-12")).toBe("2026-01");
    });
  });

  describe("rotuloMes", () => {
    it("formata o rótulo por extenso", () => {
      expect(rotuloMes("2026-06")).toBe("Junho 2026");
    });
  });
});
```

- [ ] **Step 12: Rodar os testes de período**

Run: `npx vitest run src/features/custo-hora/periodo-mensal.test.ts`
Expected: 7 testes passando.

- [ ] **Step 13: Criar as funções de cálculo (derivacoes.ts)**

Create `src/features/custo-hora/derivacoes.ts`:

```typescript
import { precoHoraDoEquipamento, round2 } from "@/features/faturamento/calculo";
import { custoAbastecimento } from "@/features/diesel/derivacoes";
import type {
  Abastecimento,
  Apontamento,
  ComponenteCusto,
  Equipamento,
  PrecoHoraMaquina,
  RegistroManutencao,
  TipoComponenteCusto,
} from "@/shared/types";

// Custo/hora é sempre CALCULADO por (equipamento, período) — nunca
// persistido (PRD-013). Reaproveita precoHoraDoEquipamento/round2
// (faturamento) e custoAbastecimento (diesel) em vez de duplicar a lógica de
// resolução de preço e de custo de diesel.

export interface DetalheItemCusto {
  tipo: TipoComponenteCusto;
  descricao: string;
  valor: number;
}

export interface CustoHoraEquipamento {
  equipamento_id: string;
  periodo: string; // "YYYY-MM"
  horas_trabalhadas: number;
  custo_diesel: number;
  custo_manutencao: number;
  custo_fixo_rateado: number;
  custo_variavel: number;
  custo_total: number;
  custo_por_hora: number | null; // null quando horas_trabalhadas === 0 (evita divisão por zero)
  preco_hora: number | null; // valor_hora_operada do preço ativo do equipamento, se houver
  margem_hora: number | null; // preco_hora - custo_por_hora (null se qualquer um faltar)
  detalhamento: DetalheItemCusto[]; // sempre as 4 categorias, mesmo com valor 0 (RNF-003)
  configuracao_incompleta: boolean; // true quando não há nenhum ComponenteCusto ativo
}

function noPeriodo(iso: string, periodo: string): boolean {
  return iso.slice(0, 7) === periodo;
}

export function horasTrabalhadasNoPeriodo(
  apontamentos: Apontamento[],
  equipamentoId: string,
  periodo: string,
): number {
  const finalizados = apontamentos.filter(
    (a) =>
      a.equipamento_id === equipamentoId &&
      a.status === "finalizado" &&
      a.horas_trabalhadas != null &&
      a.finalizado_em != null &&
      noPeriodo(a.finalizado_em, periodo),
  );
  return round2(finalizados.reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0));
}

export function custoDieselNoPeriodo(
  abastecimentos: Abastecimento[],
  equipamentoId: string,
  periodo: string,
): number {
  const doPeriodo = abastecimentos.filter(
    (a) => a.equipamento_id === equipamentoId && noPeriodo(a.abastecido_em, periodo),
  );
  return round2(doPeriodo.reduce((soma, a) => soma + (custoAbastecimento(a) ?? 0), 0));
}

export function custoManutencaoNoPeriodo(
  registros: RegistroManutencao[],
  equipamentoId: string,
  periodo: string,
): number {
  const doPeriodo = registros.filter(
    (r) =>
      r.equipamento_id === equipamentoId &&
      r.status === "realizada" &&
      r.realizada_em != null &&
      noPeriodo(r.realizada_em, periodo),
  );
  return round2(doPeriodo.reduce((soma, r) => soma + (r.custo ?? 0), 0));
}

export function componentesAtivosDoEquipamento(
  componentes: ComponenteCusto[],
  equipamentoId: string,
): ComponenteCusto[] {
  return componentes.filter((c) => c.ativo && c.equipamento_id === equipamentoId);
}

export function custoHoraEquipamento(
  equipamento: Equipamento,
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): CustoHoraEquipamento {
  const horasTrabalhadas = horasTrabalhadasNoPeriodo(apontamentos, equipamento.id, periodo);
  const custoDiesel = custoDieselNoPeriodo(abastecimentos, equipamento.id, periodo);
  const custoManutencao = custoManutencaoNoPeriodo(registrosManutencao, equipamento.id, periodo);

  const ativos = componentesAtivosDoEquipamento(componentes, equipamento.id);
  const fixos = ativos.filter((c) => c.tipo === "fixo_mensal");
  const variaveis = ativos.filter((c) => c.tipo === "variavel_hora");

  const custoFixoRateado = round2(fixos.reduce((soma, c) => soma + c.valor, 0));
  const custoVariavel = round2(
    variaveis.reduce((soma, c) => soma + c.valor, 0) * horasTrabalhadas,
  );
  const custoTotal = round2(custoDiesel + custoManutencao + custoFixoRateado + custoVariavel);
  const custoPorHora = horasTrabalhadas > 0 ? round2(custoTotal / horasTrabalhadas) : null;

  const preco = precoHoraDoEquipamento(equipamento, precosHoraMaquina);
  const precoHora = preco ? preco.valor_hora_operada : null;
  const margemHora =
    custoPorHora != null && precoHora != null ? round2(precoHora - custoPorHora) : null;

  const detalhamento: DetalheItemCusto[] = [
    ...fixos.map((c) => ({ tipo: c.tipo, descricao: c.descricao, valor: c.valor })),
    ...variaveis.map((c) => ({
      tipo: c.tipo,
      descricao: c.descricao,
      valor: round2(c.valor * horasTrabalhadas),
    })),
    { tipo: "diesel", descricao: "Diesel", valor: custoDiesel },
    { tipo: "manutencao", descricao: "Manutenção", valor: custoManutencao },
  ];

  return {
    equipamento_id: equipamento.id,
    periodo,
    horas_trabalhadas: horasTrabalhadas,
    custo_diesel: custoDiesel,
    custo_manutencao: custoManutencao,
    custo_fixo_rateado: custoFixoRateado,
    custo_variavel: custoVariavel,
    custo_total: custoTotal,
    custo_por_hora: custoPorHora,
    preco_hora: precoHora,
    margem_hora: margemHora,
    detalhamento,
    configuracao_incompleta: ativos.length === 0,
  };
}

export function custoHoraPorEquipamento(
  equipamentos: Equipamento[],
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): CustoHoraEquipamento[] {
  return equipamentos
    .filter((e) => e.ativo)
    .map((e) =>
      custoHoraEquipamento(
        e,
        periodo,
        componentes,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ),
    );
}
```

- [ ] **Step 14: Testar o cálculo (valores conferidos à mão contra os mocks de 2026-06)**

Create `src/features/custo-hora/derivacoes.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { apontamentos } from "@/mocks/apontamentos";
import { abastecimentos } from "@/mocks/abastecimentos";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { componentesCusto } from "@/mocks/componentes-custo";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import {
  horasTrabalhadasNoPeriodo,
  custoDieselNoPeriodo,
  custoManutencaoNoPeriodo,
  componentesAtivosDoEquipamento,
  custoHoraEquipamento,
  custoHoraPorEquipamento,
} from "@/features/custo-hora/derivacoes";

const PERIODO = "2026-06";

describe("features/custo-hora/derivacoes", () => {
  describe("horasTrabalhadasNoPeriodo", () => {
    it("soma as horas finalizadas do equipamento no período", () => {
      expect(horasTrabalhadasNoPeriodo(apontamentos, "eq-002", PERIODO)).toBe(28);
    });

    it("ignora apontamentos em_andamento", () => {
      expect(horasTrabalhadasNoPeriodo(apontamentos, "eq-005", PERIODO)).toBe(8);
    });

    it("retorna 0 para equipamento sem apontamentos no período", () => {
      expect(horasTrabalhadasNoPeriodo(apontamentos, "eq-004", PERIODO)).toBe(0);
    });
  });

  describe("custoDieselNoPeriodo", () => {
    it("soma o custo dos abastecimentos do equipamento no período", () => {
      expect(custoDieselNoPeriodo(abastecimentos, "eq-001", PERIODO)).toBe(1041.6);
    });

    it("trata abastecimento sem nenhum dado de custo como 0", () => {
      expect(custoDieselNoPeriodo(abastecimentos, "eq-005", PERIODO)).toBe(0);
    });
  });

  describe("custoManutencaoNoPeriodo", () => {
    it("soma só registros realizados dentro do período", () => {
      expect(custoManutencaoNoPeriodo(registrosManutencao, "eq-001", PERIODO)).toBe(420);
    });

    it("ignora registro realizado fora do período", () => {
      expect(custoManutencaoNoPeriodo(registrosManutencao, "eq-002", PERIODO)).toBe(0);
    });

    it("ignora registros ainda 'prevista'", () => {
      expect(custoManutencaoNoPeriodo(registrosManutencao, "eq-006", PERIODO)).toBe(0);
    });
  });

  describe("componentesAtivosDoEquipamento", () => {
    it("exclui componentes inativos", () => {
      const ativos = componentesAtivosDoEquipamento(componentesCusto, "eq-002");
      expect(ativos.every((c) => c.ativo)).toBe(true);
      expect(ativos.some((c) => c.descricao.includes("revisão anterior"))).toBe(false);
    });

    it("retorna lista vazia para equipamento sem componentes", () => {
      expect(componentesAtivosDoEquipamento(componentesCusto, "eq-003")).toHaveLength(0);
    });
  });

  describe("custoHoraEquipamento", () => {
    it("calcula o custo/hora completo e sinaliza margem negativa (eq-001)", () => {
      const eq001 = equipamentos.find((e) => e.id === "eq-001")!;
      const resultado = custoHoraEquipamento(
        eq001,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.horas_trabalhadas).toBe(12);
      expect(resultado.custo_diesel).toBe(1041.6);
      expect(resultado.custo_manutencao).toBe(420);
      expect(resultado.custo_fixo_rateado).toBe(4200);
      expect(resultado.custo_variavel).toBe(540);
      expect(resultado.custo_total).toBe(6201.6);
      expect(resultado.custo_por_hora).toBe(516.8);
      expect(resultado.preco_hora).toBe(360);
      expect(resultado.margem_hora).toBe(-156.8);
      expect(resultado.configuracao_incompleta).toBe(false);
      expect(resultado.detalhamento).toHaveLength(4);
    });

    it("calcula margem positiva e ignora manutenção fora do período (eq-002)", () => {
      const eq002 = equipamentos.find((e) => e.id === "eq-002")!;
      const resultado = custoHoraEquipamento(
        eq002,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.custo_manutencao).toBe(0);
      expect(resultado.custo_fixo_rateado).toBe(380);
      expect(resultado.custo_por_hora).toBe(84.96);
      expect(resultado.margem_hora).toBe(205.04);
    });

    it("custo_por_hora é null quando não há horas no período (eq-004)", () => {
      const eq004 = equipamentos.find((e) => e.id === "eq-004")!;
      const resultado = custoHoraEquipamento(
        eq004,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.horas_trabalhadas).toBe(0);
      expect(resultado.custo_por_hora).toBeNull();
      expect(resultado.configuracao_incompleta).toBe(true);
    });

    it("sinaliza configuração incompleta quando não há componente ativo, mesmo com horas (eq-003)", () => {
      const eq003 = equipamentos.find((e) => e.id === "eq-003")!;
      const resultado = custoHoraEquipamento(
        eq003,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.horas_trabalhadas).toBe(6.5);
      expect(resultado.custo_total).toBe(0);
      expect(resultado.custo_por_hora).toBe(0);
      expect(resultado.configuracao_incompleta).toBe(true);
    });

    it("margem_hora é null quando não há preço ativo, mesmo com custo/hora calculado (eq-005)", () => {
      const eq005 = equipamentos.find((e) => e.id === "eq-005")!;
      const resultado = custoHoraEquipamento(
        eq005,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultado.custo_por_hora).toBe(497);
      expect(resultado.preco_hora).toBeNull();
      expect(resultado.margem_hora).toBeNull();
    });
  });

  describe("custoHoraPorEquipamento", () => {
    it("retorna um resultado por equipamento ativo, excluindo inativos", () => {
      const resultados = custoHoraPorEquipamento(
        equipamentos,
        PERIODO,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados).toHaveLength(7);
      expect(resultados.some((r) => r.equipamento_id === "eq-008")).toBe(false);
    });
  });
});
```

- [ ] **Step 15: Rodar os testes de cálculo**

Run: `npx vitest run src/features/custo-hora/derivacoes.test.ts`
Expected: 12 testes passando.

- [ ] **Step 16: Rodar o typecheck e a suíte completa**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 0 erros de tipo; todos os testes (incluindo os já existentes) passando.

- [ ] **Step 17: Commit**

```bash
git add src/shared/types/index.ts src/mocks/componentes-custo.ts src/mocks/componentes-custo.test.ts src/features/custo-hora/custo-hora-schema.ts src/features/custo-hora/custo-hora-schema.test.ts src/features/custo-hora/componentes-custo-store.ts src/features/custo-hora/labels.tsx src/features/custo-hora/periodo-mensal.ts src/features/custo-hora/periodo-mensal.test.ts src/features/custo-hora/derivacoes.ts src/features/custo-hora/derivacoes.test.ts
git commit -m "feat: add custo-hora contract, mocks and pure cost calculation"
```

---

### Task 2: Painel de Custo por Equipamento (analítico)

**Files:**
- Create: `src/features/custo-hora/components/seletor-mes.tsx`
- Create: `src/features/custo-hora/components/detalhamento-custo-dialog.tsx`
- Create: `src/features/custo-hora/components/painel-custo-hora.tsx`

**Interfaces:**
- Consumes (da Task 1): `mesAnterior`/`proximoMes`/`rotuloMes` de `@/features/custo-hora/periodo-mensal`; `custoHoraPorEquipamento`, tipo `CustoHoraEquipamento` de `@/features/custo-hora/derivacoes`; `TipoComponenteCustoBadge` de `@/features/custo-hora/labels`; `componentesCustoStore` de `@/features/custo-hora/componentes-custo-store`. Stores existentes: `equipamentosStore.useAll()`, `apontamentosStore.useTodos()`, `abastecimentosStore.useTodos()`, `registrosManutencaoStore.useTodos()`, `precoHoraMaquinaStore.useAll()`. `KpiCard` de `@/features/dashboard/components/kpi-card`. `formatBRL` de `@/features/retaguarda/format`, `formatHorimetro` de `@/shared/lib/format`. `useMockResource` de `@/shared/hooks/use-mock-resource`.
- Produces: componentes `SeletorMes`, `DetalhamentoCustoDialog`, `PainelCustoHora` (props `{ periodo: string }`) — usados pela Task 4.

- [ ] **Step 1: Criar o seletor de mês**

Create `src/features/custo-hora/components/seletor-mes.tsx`:

```tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mesAnterior, proximoMes, rotuloMes } from "@/features/custo-hora/periodo-mensal";

interface Props {
  periodo: string;
  onChange: (periodo: string) => void;
  maximo: string; // não permite navegar além deste mês (mês atual)
}

export function SeletorMes({ periodo, onChange, maximo }: Props) {
  const podeAvancar = periodo < maximo;
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(mesAnterior(periodo))}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-32 text-center font-display text-sm font-bold text-foreground">
        {rotuloMes(periodo)}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(proximoMes(periodo))}
        disabled={!podeAvancar}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Criar o diálogo de detalhamento (somente leitura)**

Create `src/features/custo-hora/components/detalhamento-custo-dialog.tsx`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { TipoComponenteCustoBadge } from "@/features/custo-hora/labels";
import { rotuloMes } from "@/features/custo-hora/periodo-mensal";
import type { CustoHoraEquipamento } from "@/features/custo-hora/derivacoes";

interface Props {
  equipamentoNome: string | null;
  resultado: CustoHoraEquipamento | null;
  onOpenChange: (open: boolean) => void;
}

export function DetalhamentoCustoDialog({ equipamentoNome, resultado, onOpenChange }: Props) {
  return (
    <Dialog open={!!resultado} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{equipamentoNome ?? "Equipamento"}</DialogTitle>
          <DialogDescription>
            {resultado ? `Detalhamento do custo — ${rotuloMes(resultado.periodo)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <ul className="divide-y divide-border rounded-lg border">
              {resultado.detalhamento.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <TipoComponenteCustoBadge tipo={item.tipo} />
                    <span className="text-sm text-foreground">{item.descricao}</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">{formatBRL(item.valor)}</span>
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-faint">Horas no período</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatHorimetro(resultado.horas_trabalhadas)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Custo total</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatBRL(resultado.custo_total)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Custo por hora</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {resultado.custo_por_hora != null
                    ? formatBRL(resultado.custo_por_hora)
                    : "Sem horas no período"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Preço praticado (operada)</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {resultado.preco_hora != null ? formatBRL(resultado.preco_hora) : "Sem preço ativo"}
                </dd>
              </div>
            </dl>

            {resultado.margem_hora != null ? (
              <div
                className={
                  resultado.margem_hora < 0
                    ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    : "rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-foreground"
                }
              >
                Margem: <span className="font-mono font-bold">{formatBRL(resultado.margem_hora)}</span>{" "}
                por hora
                {resultado.margem_hora < 0 ? " — operando abaixo do custo" : null}
              </div>
            ) : null}

            {resultado.configuracao_incompleta ? (
              <p className="text-xs text-foreground-faint">
                Configuração incompleta: nenhum componente de custo ativo cadastrado para este
                equipamento.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Criar o painel principal**

Create `src/features/custo-hora/components/painel-custo-hora.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  custoHoraPorEquipamento,
  type CustoHoraEquipamento,
} from "@/features/custo-hora/derivacoes";
import { DetalhamentoCustoDialog } from "@/features/custo-hora/components/detalhamento-custo-dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function PainelCustoHora({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();

  const [selecionado, setSelecionado] = useState<CustoHoraEquipamento | null>(null);

  const resultados = useMemo(
    () =>
      custoHoraPorEquipamento(
        equipamentos,
        periodo,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ).sort((a, b) => (b.custo_por_hora ?? -1) - (a.custo_por_hora ?? -1)),
    [equipamentos, periodo, componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina],
  );

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";

  const custoTotalPeriodo = resultados.reduce((s, r) => s + r.custo_total, 0);
  const horasTotais = resultados.reduce((s, r) => s + r.horas_trabalhadas, 0);
  const custoMedioHora = horasTotais > 0 ? custoTotalPeriodo / horasTotais : null;
  const margensNegativas = resultados.filter((r) => r.margem_hora != null && r.margem_hora < 0).length;

  if (componentesCusto.length === 0) {
    return (
      <EmptyState
        icon="lucide:calculator"
        titulo="Configure os componentes de custo"
        descricao="Cadastre ao menos um componente de custo (fixo mensal ou variável por hora) na aba Componentes de Custo para começar a calcular o custo por hora."
      />
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          rotulo="Custo total no período"
          valor={formatBRL(custoTotalPeriodo)}
          icone="lucide:wallet"
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Custo médio por hora"
          valor={custoMedioHora != null ? formatBRL(custoMedioHora) : "—"}
          icone="lucide:gauge"
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Equipamentos com margem negativa"
          valor={String(margensNegativas)}
          icone="lucide:triangle-alert"
          variante={margensNegativas > 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Horas</th>
                <th className="px-4 py-3 font-medium">Custo/hora</th>
                <th className="px-4 py-3 font-medium">Preço (operada)</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.equipamento_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {nomeDoEquipamento(r.equipamento_id)}
                    {r.configuracao_incompleta ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Config. incompleta
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatHorimetro(r.horas_trabalhadas)}</td>
                  <td className="px-4 py-3 font-mono">
                    {r.custo_por_hora != null ? formatBRL(r.custo_por_hora) : "Sem horas"}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {r.preco_hora != null ? formatBRL(r.preco_hora) : "Sem preço"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      r.margem_hora != null && r.margem_hora < 0 && "text-destructive",
                    )}
                  >
                    {r.margem_hora != null ? formatBRL(r.margem_hora) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelecionado(r)}>
                      Ver detalhamento
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DetalhamentoCustoDialog
        equipamentoNome={selecionado ? nomeDoEquipamento(selecionado.equipamento_id) : null}
        resultado={selecionado}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Rodar o typecheck**

Run: `npx tsc --noEmit`
Expected: 0 erros de tipo (a página que consome `PainelCustoHora` ainda não existe — a Task 4 monta a rota; este passo confirma que os 3 arquivos desta task compilam isoladamente).

- [ ] **Step 5: Commit**

```bash
git add src/features/custo-hora/components/seletor-mes.tsx src/features/custo-hora/components/detalhamento-custo-dialog.tsx src/features/custo-hora/components/painel-custo-hora.tsx
git commit -m "feat: add custo-hora cost panel with KPIs and breakdown dialog"
```

---

### Task 3: Configuração de Componentes de Custo (CRUD)

**Files:**
- Create: `src/features/custo-hora/components/componente-custo-form.tsx`
- Create: `src/features/custo-hora/components/componente-custo-list.tsx`

**Interfaces:**
- Consumes (da Task 1): `componentesCustoStore` de `@/features/custo-hora/componentes-custo-store`; `componenteCustoSchema`/`ComponenteCustoFormValues` de `@/features/custo-hora/custo-hora-schema`; `TIPOS_CONFIGURAVEIS`, `TIPO_COMPONENTE_LABEL`, `TipoComponenteCustoBadge`, `unidadeComponente` de `@/features/custo-hora/labels`. `equipamentosStore.useAll()`. `CurrencyInput` de `@/features/precos/components/currency-input` (reuso cross-feature, mesmo padrão de `ManutencaoIndicador`/`RegistrarAbastecimentoOperadorDialog` já usados por outras features). `DataList`, `FormDialog`, `ConfirmDialog`, `StatusAtivo` de `@/shared/components/*`. `formatBRL` de `@/features/retaguarda/format`.
- Produces: componente `ComponenteCustoList` — usado pela Task 4.

- [ ] **Step 1: Criar o formulário de componente de custo**

Create `src/features/custo-hora/components/componente-custo-form.tsx`:

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
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  componenteCustoSchema,
  type ComponenteCustoFormValues,
} from "@/features/custo-hora/custo-hora-schema";
import { TIPOS_CONFIGURAVEIS, TIPO_COMPONENTE_LABEL } from "@/features/custo-hora/labels";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import type { ComponenteCusto } from "@/shared/types";

interface Props {
  inicial: ComponenteCusto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ComponenteCustoForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ComponenteCustoFormValues>({
    resolver: zodResolver(componenteCustoSchema),
    defaultValues: {
      equipamento_id: inicial?.equipamento_id ?? "",
      descricao: inicial?.descricao ?? "",
      tipo: (inicial?.tipo as "fixo_mensal" | "variavel_hora") ?? "fixo_mensal",
      valor: inicial?.valor ?? 0,
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: ComponenteCustoFormValues) => {
    if (inicial) {
      componentesCustoStore.update(inicial.id, values);
      toast.success("Componente atualizado.");
    } else {
      componentesCustoStore.create(values);
      toast.success("Componente cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="equipamento_id">Equipamento *</Label>
        <Controller
          control={control}
          name="equipamento_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
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

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input id="descricao" {...register("descricao")} aria-invalid={!!errors.descricao} />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

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
                {TIPOS_CONFIGURAVEIS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_COMPONENTE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor (R$) *</Label>
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
        {errors.valor ? <p className="text-xs text-destructive">{errors.valor.message}</p> : null}
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Componente ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não entram no cálculo do custo/hora, mas ficam no histórico.
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

- [ ] **Step 2: Criar a lista/CRUD de componentes de custo**

Create `src/features/custo-hora/components/componente-custo-list.tsx`:

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
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TipoComponenteCustoBadge, unidadeComponente } from "@/features/custo-hora/labels";
import { ComponenteCustoForm } from "@/features/custo-hora/components/componente-custo-form";
import type { ComponenteCusto } from "@/shared/types";
import { cn } from "@/lib/utils";

export function ComponenteCustoList() {
  const todos = componentesCustoStore.useAll();
  const equipamentos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<ComponenteCusto | null>(null);
  const [inativando, setInativando] = useState<ComponenteCusto | null>(null);

  const lista = useMemo(
    () => todos.filter((c) => mostrarInativos || c.ativo),
    [todos, mostrarInativos],
  );

  const nomeDoEquipamento = (id: string) =>
    equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento removido";

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (c: ComponenteCusto) => {
    setEditando(c);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    componentesCustoStore.setAtivo(inativando.id, false);
    toast.success("Componente inativado.");
    setInativando(null);
  };
  const reativar = (c: ComponenteCusto) => {
    componentesCustoStore.setAtivo(c.id, true);
    toast.success("Componente reativado.");
  };

  const columns: Column<ComponenteCusto>[] = [
    {
      header: "Equipamento",
      cell: (c) => (
        <span className={cn("font-medium text-foreground", !c.ativo && "opacity-60")}>
          {nomeDoEquipamento(c.equipamento_id)}
        </span>
      ),
    },
    { header: "Descrição", cell: (c) => c.descricao },
    { header: "Tipo", cell: (c) => <TipoComponenteCustoBadge tipo={c.tipo} /> },
    {
      header: "Valor",
      className: "font-mono",
      cell: (c) => `${formatBRL(c.valor)}${unidadeComponente(c.tipo)}`,
    },
    { header: "Status", cell: (c) => <StatusAtivo ativo={c.ativo} /> },
  ];

  const rowActions = (c: ComponenteCusto) => (
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

  const renderCard = (c: ComponenteCusto) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !c.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">{c.descricao}</div>
          <div className="text-xs text-muted-foreground">{nomeDoEquipamento(c.equipamento_id)}</div>
        </div>
        <StatusAtivo ativo={c.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Tipo</dt>
          <dd>
            <TipoComponenteCustoBadge tipo={c.tipo} />
          </dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Valor</dt>
          <dd className="font-mono text-foreground">
            {formatBRL(c.valor)}
            {unidadeComponente(c.tipo)}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(c)}</div>
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
        Novo componente
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
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
          icon: "lucide:calculator",
          titulo: todos.length === 0 ? "Nenhum componente cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro componente de custo (fixo mensal ou variável por hora)."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro componente
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar componente de custo" : "Novo componente de custo"}
        descricao="Os campos com * são obrigatórios."
      >
        <ComponenteCustoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar componente?"
        descricao="Este componente deixa de entrar no cálculo do custo/hora, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 3: Rodar o typecheck**

Run: `npx tsc --noEmit`
Expected: 0 erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add src/features/custo-hora/components/componente-custo-form.tsx src/features/custo-hora/components/componente-custo-list.tsx
git commit -m "feat: add cost component CRUD (configuration tab)"
```

---

### Task 4: Página, rota e navegação

**Files:**
- Create: `src/features/custo-hora/components/custo-hora-page.tsx`
- Create: `src/features/custo-hora/index.ts`
- Create: `src/routes/admin.custo-hora.tsx`
- Modify: `src/features/retaguarda/retaguarda-shell.tsx`

**Interfaces:**
- Consumes (das Tasks 1/2/3): `mesReferencia`/`mesAnterior` de `@/features/custo-hora/periodo-mensal`; `SeletorMes` e `PainelCustoHora` (Task 2); `ComponenteCustoList` (Task 3).
- Produces: `CustoHoraPage` (barrel `@/features/custo-hora`), rota `/admin/custo-hora`, item de navegação "Custo da Hora" na sidebar da retaguarda.

- [ ] **Step 1: Criar a página com abas e seletor de mês**

Create `src/features/custo-hora/components/custo-hora-page.tsx`:

```tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { SeletorMes } from "@/features/custo-hora/components/seletor-mes";
import { PainelCustoHora } from "@/features/custo-hora/components/painel-custo-hora";
import { ComponenteCustoList } from "@/features/custo-hora/components/componente-custo-list";
import { mesReferencia, mesAnterior } from "@/features/custo-hora/periodo-mensal";

const MES_ATUAL = mesReferencia(new Date());
const MES_PADRAO = mesAnterior(MES_ATUAL);

export function CustoHoraPage() {
  const [periodo, setPeriodo] = useState(MES_PADRAO);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Custo Real da Hora-Máquina"
        descricao="Custo por equipamento no mês, comparado ao preço praticado. Visível apenas na retaguarda."
      />

      <Tabs defaultValue="painel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="painel">Custo por Equipamento</TabsTrigger>
          <TabsTrigger value="componentes">Componentes de Custo</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="space-y-4">
          <div className="flex justify-end">
            <SeletorMes periodo={periodo} onChange={setPeriodo} maximo={MES_ATUAL} />
          </div>
          <PainelCustoHora periodo={periodo} />
        </TabsContent>
        <TabsContent value="componentes">
          <ComponenteCustoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Criar o barrel da feature**

Create `src/features/custo-hora/index.ts`:

```typescript
export { CustoHoraPage } from "@/features/custo-hora/components/custo-hora-page";
export { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
```

- [ ] **Step 3: Criar a rota**

Create `src/routes/admin.custo-hora.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { CustoHoraPage } from "@/features/custo-hora";

export const Route = createFileRoute("/admin/custo-hora")({
  head: () => ({
    meta: [
      { title: "Custo da Hora-Máquina · Antonello" },
      {
        name: "description",
        content: "Custo real por hora de cada equipamento, comparado ao preço praticado.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CustoHoraPage,
});
```

- [ ] **Step 4: Adicionar o item de navegação na sidebar da retaguarda**

Modify `src/features/retaguarda/retaguarda-shell.tsx`. No bloco de import do `lucide-react` (topo do arquivo), adicionar `Calculator` à lista:

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
  Menu,
  ChevronRight,
} from "lucide-react";
```

E no array `itens`, adicionar uma nova entrada logo após "Financeiro":

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
];
```

- [ ] **Step 5: Rodar o typecheck e a suíte completa**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 0 erros de tipo; todos os testes passando (a rota nova é gerada automaticamente pelo plugin do TanStack Router com o dev server rodando — `src/routeTree.gen.ts` não precisa de edição manual).

- [ ] **Step 6: Verificação manual no navegador**

Com o dev server rodando (`http://localhost:8083`), abrir `/admin/custo-hora` e verificar:
- Item "Custo da Hora" aparece na sidebar, após "Financeiro".
- Aba "Custo por Equipamento": KPIs carregam (skeleton → valores), tabela lista os 7 equipamentos ativos ordenada por custo/hora decrescente, "Ver detalhamento" abre o diálogo com o breakdown de 4 categorias.
- Navegação de mês (‹ Junho 2026 ›) funciona; avançar além do mês atual fica desabilitado.
- Aba "Componentes de Custo": lista os 9 componentes, cadastrar/editar/inativar/reativar funcionam.
- Responsividade em 375px/768px/1280px (RNF-004 é "desktop analítico", mas a tela não pode quebrar em telas estreitas — scroll horizontal na tabela é aceitável).

- [ ] **Step 7: Commit**

```bash
git add src/features/custo-hora/components/custo-hora-page.tsx src/features/custo-hora/index.ts src/routes/admin.custo-hora.tsx src/features/retaguarda/retaguarda-shell.tsx
git commit -m "feat: assemble custo-hora page, route and sidebar navigation"
```

---

## Final Review & Closure

- [ ] **Barreira financeira:** `grep -rniE "custo-hora|custoHora|ComponenteCusto" src/features/operador src/routes/app.*` deve retornar vazio.
- [ ] **Suíte completa:** `npx tsc --noEmit && npx vitest run` — 0 erros, todos os testes passando.
- [ ] **Revisão final de branch inteira** (opus, range `merge-base(main, HEAD)..HEAD`) via `subagent-driven-development`.
- [ ] **Version bump:** `0.12.0` → `0.13.0` (MINOR — nova feature), codinome **"Meter"** (sugestão do próprio PRD — remete a medição/horímetro).
- [ ] **CHANGELOG.md:** nova seção `## [0.13.0] - 2026-07-02 - Meter` com Added (painel de custo/hora, componentes de custo configuráveis, comparação com preço/margem) — sem seção Changed (não há placeholder substituído desta vez, é rota nova).
- [ ] **Renomear PRD:** `docs/prds/PRD-013-ret-custo-hora-maquina.md` → `docs/prds/PRD-013-ret-custo-hora-maquina_DONE.md`, preenchendo "Status de Implementação" e "Histórico".
- [ ] **Atualizar `INDEX-PRDs-antonello.md`:** versão 0.13.0 (Meter); PRDs Implementados 12→13 (81%); Pendente 4→3 (19%); mover PRD-013 do catálogo "aguardando implementação" para "Implementados"; roadmap Onda 3 (⏳→✅); nova linha em "Histórico de Versões"; nova linha em "Decisões Importantes".
- [ ] **`superpowers:finishing-a-development-branch`** para mergear `feat/prd-013-custo-hora-maquina` de volta a `main`.
