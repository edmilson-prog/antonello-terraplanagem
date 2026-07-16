# Onda Comercial — Preços + Financeiro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar visualmente Preços e Financeiro para bater com `docs/html/.../ui_kits/retaguarda/` (PrecosList.jsx, Financeiro.jsx), fechando as lacunas funcionais que o mock pressupõe (Custo ref./Margem em Preços, histórico de alterações, KPIs e 2 cards novos em Financeiro).

**Architecture:** Mesmo padrão já validado em Faturamento (Onda 5): `PageHeader` → Kpis (componente local `Tile`) → grid `lg:grid-cols-[1.6fr_1fr]` com `CardSecao` envolvendo cada bloco → seções extra abaixo. Preços mantém as 3 abas existentes (`DataList`-based, já token-consistente — mesmo padrão das listas de cadastro já ✅ refatoradas), ganhando 2 colunas novas e um diálogo de histórico. Financeiro sai do modelo 3-abas para KPIs + grid 2 colunas + seções extra, sem alterar nenhum fluxo (dar baixa, emitir cobrança).

**Tech Stack:** React + TypeScript + Vite, Tailwind + shadcn/ui, Vitest + Testing Library. Nenhuma dependência nova.

## Global Constraints

- Preços e Financeiro **não estão conectados ao Supabase** — todas as stores envolvidas (`precoHoraMaquinaStore`, `precoFundacaoStore`, `precoMobilizacaoStore`, `contasPagarStore`, `contasReceberStore`) são `createMockStore`/factories 100% em memória. Nenhuma migration, nenhuma chamada `supabase.*` nesta onda.
- `StatusConta = "aberta" | "liquidada"` (não existe status "recebido"/"pago" — a liquidação é marcada por `recebido_em`/`pago_em`).
- Aritmética monetária sempre via `round2` (`@/features/faturamento/calculo`) — nunca operar em ponto flutuante sem arredondar.
- `formatBRL` (`@/features/retaguarda/format`) para toda exibição de valor em R$.
- Sem `any` — tipar tudo explicitamente.
- Sem dado financeiro no ambiente `/app/*` — esta onda só toca `/admin/*`, não há risco aqui, mas nenhum arquivo fora de `src/features/precos`, `src/features/financeiro`, `src/features/custo-hora`, `src/shared/types` deve ser tocado.
- Responsividade: toda mudança em tabela/lista precisa ter equivalente mobile (o padrão `DataList` já trata isso via `renderCard`).
- Commits pequenos e frequentes, Conventional Commits em inglês (ver `CLAUDE.md` do projeto).

---

### Task 1: `custoEstimadoHoraEquipamento`

**Files:**
- Modify: `src/features/custo-hora/derivacoes.ts` (append after `custoHoraPorEquipamento`, end of file)
- Test: `src/features/custo-hora/derivacoes.test.ts` (extend existing file)

**Interfaces:**
- Consumes: `round2` (already imported in this file from `@/features/faturamento/calculo`), `componentesAtivosDoEquipamento` (already defined in this file), `ComponenteCusto` (`@/shared/types`).
- Produces: `custoEstimadoHoraEquipamento(equipamentoId: string, componentes: ComponenteCusto[], horasReferencia?: number): number | null` — used by Task 3 (`PrecoHoraMaquinaList`).

- [ ] **Step 1: Write the failing tests**

Open `src/features/custo-hora/derivacoes.test.ts`. Add `custoEstimadoHoraEquipamento` to the existing import block at the top of the file:

```ts
import {
  horasTrabalhadasNoPeriodo,
  custoDieselNoPeriodo,
  custoManutencaoNoPeriodo,
  componentesAtivosDoEquipamento,
  custoHoraEquipamento,
  custoHoraPorEquipamento,
  custoEstimadoHoraEquipamento,
} from "@/features/custo-hora/derivacoes";
```

Then add a new `import type { ComponenteCusto } from "@/shared/types";` line right after the existing imports (below the `@/mocks/*` imports), and append this new `describe` block at the end of the file (after the last existing `describe` block, before the final closing — i.e. as a new top-level block, same indentation as `describe("horasTrabalhadasNoPeriodo", ...)`):

```ts
describe("custoEstimadoHoraEquipamento", () => {
  it("soma fixo rateado por horas de referência (160h padrão) + variável por hora", () => {
    // eq-001: cc-001 fixo_mensal 4200 (/160 = 26.25) + cc-002 variavel_hora 45 = 71.25
    expect(custoEstimadoHoraEquipamento("eq-001", componentesCusto)).toBe(71.25);
  });

  it("aceita horasReferencia customizada", () => {
    // eq-001: 4200 / 200 = 21 + 45 = 66
    expect(custoEstimadoHoraEquipamento("eq-001", componentesCusto, 200)).toBe(66);
  });

  it("retorna null para equipamento sem nenhum componente ativo", () => {
    expect(custoEstimadoHoraEquipamento("eq-003", componentesCusto)).toBeNull();
  });

  it("soma só componentes fixos quando não há variável", () => {
    const somenteFixo: ComponenteCusto[] = [
      {
        id: "x1",
        equipamento_id: "eq-x",
        descricao: "Seguro",
        tipo: "fixo_mensal",
        valor: 1600,
        categoria: null,
        competencia: null,
        observacao: null,
        ativo: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(custoEstimadoHoraEquipamento("eq-x", somenteFixo, 160)).toBe(10);
  });

  it("soma só componentes variáveis quando não há fixo", () => {
    const somenteVariavel: ComponenteCusto[] = [
      {
        id: "x2",
        equipamento_id: "eq-y",
        descricao: "Operador",
        tipo: "variavel_hora",
        valor: 35,
        categoria: null,
        competencia: null,
        observacao: null,
        ativo: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(custoEstimadoHoraEquipamento("eq-y", somenteVariavel, 160)).toBe(35);
  });

  it("ignora componentes inativos", () => {
    const comInativo: ComponenteCusto[] = [
      {
        id: "x3",
        equipamento_id: "eq-z",
        descricao: "Peça antiga",
        tipo: "fixo_mensal",
        valor: 9999,
        categoria: null,
        competencia: null,
        observacao: null,
        ativo: false,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(custoEstimadoHoraEquipamento("eq-z", comInativo, 160)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/custo-hora/derivacoes.test.ts`
Expected: FAIL — `custoEstimadoHoraEquipamento` is not exported from `@/features/custo-hora/derivacoes` (TypeScript/import error).

- [ ] **Step 3: Implement the function**

In `src/features/custo-hora/derivacoes.ts`, append at the end of the file (after the closing `}` of `custoHoraPorEquipamento`):

```ts

// Estimativa de custo/hora INDEPENDENTE do uso real do período — soma os
// componentes ativos do equipamento usando horas/mês de referência fixas em
// vez de horas_trabalhadas reais (que podem ser 0 e zerar custo_por_hora em
// custoHoraEquipamento). Mesma fórmula do "impacto no custo/h" já usada no
// formulário de Componente de Custo, generalizada para todos os componentes
// do equipamento. Usada em Preços (coluna Custo ref./Margem).
export function custoEstimadoHoraEquipamento(
  equipamentoId: string,
  componentes: ComponenteCusto[],
  horasReferencia = 160,
): number | null {
  const ativos = componentesAtivosDoEquipamento(componentes, equipamentoId);
  if (ativos.length === 0) return null;
  const fixos = ativos.filter((c) => c.tipo === "fixo_mensal");
  const variaveis = ativos.filter((c) => c.tipo === "variavel_hora");
  const custoFixoRateado =
    horasReferencia > 0
      ? round2(fixos.reduce((soma, c) => soma + c.valor, 0) / horasReferencia)
      : 0;
  const custoVariavel = round2(variaveis.reduce((soma, c) => soma + c.valor, 0));
  return round2(custoFixoRateado + custoVariavel);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/custo-hora/derivacoes.test.ts`
Expected: PASS (all tests in the file, including the pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add src/features/custo-hora/derivacoes.ts src/features/custo-hora/derivacoes.test.ts
git commit -m "feat: add custoEstimadoHoraEquipamento for reference-hours cost estimate"
```

---

### Task 2: Histórico de preços (mock infra)

**Files:**
- Modify: `src/shared/types/index.ts` (insert after `PrecoMobilizacao`, currently ending at line 143)
- Create: `src/mocks/historico-precos.ts`
- Create: `src/features/precos/historico-precos-store.ts`
- Test: `src/features/precos/historico-precos-store.test.ts`
- Modify: `src/features/precos/labels.ts`
- Test: `src/features/precos/labels.test.ts`
- Create: `src/features/precos/components/tabelas-anteriores-dialog.tsx`
- Test: `src/features/precos/components/tabelas-anteriores-dialog.test.tsx`

**Interfaces:**
- Consumes: `PrecoHoraMaquina`, `PrecoFundacao`, `PrecoMobilizacao`, `Equipamento` (`@/shared/types`), `descreverVinculo` (already in `src/features/precos/labels.ts`), `formatBRL` (`@/features/retaguarda/format`), `equipamentosStore` (`@/features/equipamentos/equipamentos-store`).
- Produces: type `HistoricoPreco`, type `TipoHistoricoPreco`; `historicoPrecosStore` (`{ listar, registrar, useTodos }`) and its factory `criarHistoricoPrecosStore` from `src/features/precos/historico-precos-store.ts`; `MARGEM_MINIMA_PADRAO`, `margemPercentual`, `TIPO_HISTORICO_LABEL`, `descreverHistorico` from `src/features/precos/labels.ts`; `<TabelasAnterioresDialog open onOpenChange />` component — all consumed by Task 3.

- [ ] **Step 1: Add the `HistoricoPreco` type**

In `src/shared/types/index.ts`, right after the `PrecoMobilizacao` interface (ends at line 143, right before the `// OS colaborativa` comment on line 145), insert:

```ts

export type TipoHistoricoPreco = "hora_maquina" | "fundacao" | "mobilizacao";

// Snapshot do estado ANTERIOR de um preço, capturado no momento de uma
// edição/inativação/reativação — alimenta "Tabelas anteriores" (Onda
// Comercial). Ainda mock: Preços não está conectado ao Supabase.
export interface HistoricoPreco {
  id: string;
  tipo: TipoHistoricoPreco;
  preco_id: string;
  snapshot: PrecoHoraMaquina | PrecoFundacao | PrecoMobilizacao;
  alterado_em: string; // ISO 8601
}
```

- [ ] **Step 2: Create the mock seed**

Create `src/mocks/historico-precos.ts`:

```ts
import type { HistoricoPreco } from "@/shared/types";

// Vazio por padrão — populado em runtime conforme preços existentes são
// editados/inativados/reativados (ver historico-precos-store.ts).
export const historicoPrecos: HistoricoPreco[] = [];
```

- [ ] **Step 3: Write the failing test for the store**

Create `src/features/precos/historico-precos-store.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { criarHistoricoPrecosStore } from "@/features/precos/historico-precos-store";
import type { PrecoHoraMaquina, PrecoMobilizacao } from "@/shared/types";

const PRECO: PrecoHoraMaquina = {
  id: "phm-001",
  equipamento_id: "eq-001",
  tipo_equipamento: null,
  valor_hora_seca: 280,
  valor_hora_operada: 360,
  ativo: true,
  created_at: "2025-01-15T12:00:00.000Z",
  updated_at: "2026-03-10T09:00:00.000Z",
};

const MOBILIZACAO: PrecoMobilizacao = {
  id: "pm-001",
  descricao: "Mobilização escavadeira até 50km",
  valor: 850,
  ativo: true,
  created_at: "2025-04-01T12:00:00.000Z",
  updated_at: "2026-02-15T12:00:00.000Z",
};

describe("historicoPrecosStore", () => {
  it("começa vazio quando não há seed", () => {
    const store = criarHistoricoPrecosStore([]);
    expect(store.listar()).toEqual([]);
  });

  it("registrar adiciona uma entrada com tipo, preco_id e snapshot corretos", () => {
    const store = criarHistoricoPrecosStore([]);
    store.registrar("hora_maquina", PRECO);
    const itens = store.listar();
    expect(itens).toHaveLength(1);
    expect(itens[0].tipo).toBe("hora_maquina");
    expect(itens[0].preco_id).toBe("phm-001");
    expect(itens[0].snapshot).toEqual(PRECO);
  });

  it("registros mais recentes ficam primeiro", () => {
    const store = criarHistoricoPrecosStore([]);
    store.registrar("hora_maquina", PRECO);
    store.registrar("mobilizacao", MOBILIZACAO);
    const itens = store.listar();
    expect(itens[0].preco_id).toBe("pm-001");
    expect(itens[1].preco_id).toBe("phm-001");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/features/precos/historico-precos-store.test.ts`
Expected: FAIL — `src/features/precos/historico-precos-store` does not exist yet.

- [ ] **Step 5: Implement the store**

Create `src/features/precos/historico-precos-store.ts`:

```ts
import { useSyncExternalStore } from "react";
import { historicoPrecos as seed } from "@/mocks/historico-precos";
import type {
  HistoricoPreco,
  TipoHistoricoPreco,
  PrecoHoraMaquina,
  PrecoFundacao,
  PrecoMobilizacao,
} from "@/shared/types";

export function criarHistoricoPrecosStore(inicial: HistoricoPreco[]) {
  let itens: HistoricoPreco[] = inicial.map((h) => ({ ...h }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;

  function registrar(
    tipo: TipoHistoricoPreco,
    snapshot: PrecoHoraMaquina | PrecoFundacao | PrecoMobilizacao,
  ): void {
    const entrada: HistoricoPreco = {
      id: crypto.randomUUID(),
      tipo,
      preco_id: snapshot.id,
      snapshot,
      alterado_em: new Date().toISOString(),
    };
    itens = [entrada, ...itens];
    notificar();
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, registrar, useTodos };
}

export const historicoPrecosStore = criarHistoricoPrecosStore(seed);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/features/precos/historico-precos-store.test.ts`
Expected: PASS (3/3).

- [ ] **Step 7: Write the failing test for labels additions**

Create `src/features/precos/labels.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  margemPercentual,
  MARGEM_MINIMA_PADRAO,
  descreverHistorico,
  TIPO_HISTORICO_LABEL,
} from "@/features/precos/labels";
import { equipamentos } from "@/mocks/equipamentos";
import type { HistoricoPreco, PrecoHoraMaquina, PrecoFundacao, PrecoMobilizacao } from "@/shared/types";

describe("margemPercentual", () => {
  it("calcula a margem percentual entre preço e custo de referência", () => {
    expect(margemPercentual(360, 71.25)).toBeCloseTo(0.8021, 4);
  });

  it("retorna negativo quando o custo supera o preço", () => {
    expect(margemPercentual(100, 150)).toBeCloseTo(-0.5, 4);
  });
});

describe("MARGEM_MINIMA_PADRAO", () => {
  it("é 30%", () => {
    expect(MARGEM_MINIMA_PADRAO).toBe(0.3);
  });
});

describe("TIPO_HISTORICO_LABEL", () => {
  it("cobre os 3 tipos", () => {
    expect(TIPO_HISTORICO_LABEL.hora_maquina).toBe("Hora-Máquina");
    expect(TIPO_HISTORICO_LABEL.fundacao).toBe("Por Metro");
    expect(TIPO_HISTORICO_LABEL.mobilizacao).toBe("Mobilização");
  });
});

describe("descreverHistorico", () => {
  it("descreve um snapshot de hora-máquina, resolvendo o nome do equipamento", () => {
    const snap: PrecoHoraMaquina = {
      id: "phm-001",
      equipamento_id: "eq-001",
      tipo_equipamento: null,
      valor_hora_seca: 280,
      valor_hora_operada: 360,
      ativo: true,
      created_at: "2025-01-15T12:00:00.000Z",
      updated_at: "2026-03-10T09:00:00.000Z",
    };
    const entrada: HistoricoPreco = {
      id: "h1",
      tipo: "hora_maquina",
      preco_id: "phm-001",
      snapshot: snap,
      alterado_em: "2026-07-01T10:00:00.000Z",
    };
    const { titulo, detalhe } = descreverHistorico(entrada, equipamentos);
    expect(titulo).toBe("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    expect(detalhe).toContain("R$ 280,00");
    expect(detalhe).toContain("R$ 360,00");
  });

  it("descreve um snapshot por metro (fundação)", () => {
    const snap: PrecoFundacao = {
      id: "pf-001",
      diametro_broca_mm: 300,
      valor_metro: 90,
      descricao: "Estaca escavada Ø300mm",
      ativo: true,
      created_at: "2025-03-01T12:00:00.000Z",
      updated_at: "2026-01-20T12:00:00.000Z",
    };
    const entrada: HistoricoPreco = {
      id: "h2",
      tipo: "fundacao",
      preco_id: "pf-001",
      snapshot: snap,
      alterado_em: "2026-07-01T10:00:00.000Z",
    };
    const { titulo, detalhe } = descreverHistorico(entrada, []);
    expect(titulo).toBe("Ø300mm");
    expect(detalhe).toContain("Estaca escavada Ø300mm");
  });

  it("descreve um snapshot de mobilização", () => {
    const snap: PrecoMobilizacao = {
      id: "pm-001",
      descricao: "Mobilização escavadeira até 50km",
      valor: 850,
      ativo: true,
      created_at: "2025-04-01T12:00:00.000Z",
      updated_at: "2026-02-15T12:00:00.000Z",
    };
    const entrada: HistoricoPreco = {
      id: "h3",
      tipo: "mobilizacao",
      preco_id: "pm-001",
      snapshot: snap,
      alterado_em: "2026-07-01T10:00:00.000Z",
    };
    const { titulo, detalhe } = descreverHistorico(entrada, []);
    expect(titulo).toBe("Mobilização escavadeira até 50km");
    expect(detalhe).toContain("R$ 850,00");
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run src/features/precos/labels.test.ts`
Expected: FAIL — `margemPercentual`, `MARGEM_MINIMA_PADRAO`, `descreverHistorico`, `TIPO_HISTORICO_LABEL` are not exported yet.

- [ ] **Step 9: Implement the labels additions**

Replace the full contents of `src/features/precos/labels.ts` with:

```ts
// src/features/precos/labels.ts
import type {
  Equipamento,
  PrecoHoraMaquina,
  PrecoFundacao,
  PrecoMobilizacao,
  HistoricoPreco,
} from "@/shared/types";
import { TIPO_LABEL } from "@/features/equipamentos/labels";
import { formatBRL } from "@/features/retaguarda/format";

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

// Limiar de margem mínima da coluna "Margem" (Preços, aba Hora-Máquina).
// Fixo no código — não lido de Parâmetros (feature ainda não existe).
export const MARGEM_MINIMA_PADRAO = 0.3;

// Margem percentual entre o preço de hora operada e o custo de referência
// estimado. Pode ser negativa quando o custo supera o preço.
export function margemPercentual(precoOperada: number, custoRef: number): number {
  return (precoOperada - custoRef) / precoOperada;
}

export const TIPO_HISTORICO_LABEL: Record<HistoricoPreco["tipo"], string> = {
  hora_maquina: "Hora-Máquina",
  fundacao: "Por Metro",
  mobilizacao: "Mobilização",
};

// Descreve uma entrada de histórico de preços para exibição no diálogo
// "Tabelas anteriores" — título curto + detalhe com os valores do snapshot.
export function descreverHistorico(
  entrada: HistoricoPreco,
  equipamentos: Equipamento[],
): { titulo: string; detalhe: string } {
  if (entrada.tipo === "hora_maquina") {
    const s = entrada.snapshot as PrecoHoraMaquina;
    return {
      titulo: descreverVinculo(s, equipamentos),
      detalhe: `Hora seca: ${formatBRL(s.valor_hora_seca)} · Hora operada: ${formatBRL(s.valor_hora_operada)}`,
    };
  }
  if (entrada.tipo === "fundacao") {
    const s = entrada.snapshot as PrecoFundacao;
    return {
      titulo: `Ø${s.diametro_broca_mm}mm`,
      detalhe: `${s.descricao ?? "sem descrição"} · ${formatBRL(s.valor_metro)}/m`,
    };
  }
  const s = entrada.snapshot as PrecoMobilizacao;
  return { titulo: s.descricao, detalhe: formatBRL(s.valor) };
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npx vitest run src/features/precos/labels.test.ts`
Expected: PASS (7/7).

- [ ] **Step 11: Write the failing test for the dialog**

Create `src/features/precos/components/tabelas-anteriores-dialog.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { TabelasAnterioresDialog } from "@/features/precos/components/tabelas-anteriores-dialog";
import type { PrecoHoraMaquina, PrecoFundacao, PrecoMobilizacao } from "@/shared/types";

const HORA_MAQUINA: PrecoHoraMaquina = {
  id: "phm-001",
  equipamento_id: "eq-001",
  tipo_equipamento: null,
  valor_hora_seca: 280,
  valor_hora_operada: 360,
  ativo: true,
  created_at: "2025-01-15T12:00:00.000Z",
  updated_at: "2026-03-10T09:00:00.000Z",
};

const FUNDACAO: PrecoFundacao = {
  id: "pf-001",
  diametro_broca_mm: 300,
  valor_metro: 90,
  descricao: "Estaca escavada Ø300mm",
  ativo: true,
  created_at: "2025-03-01T12:00:00.000Z",
  updated_at: "2026-01-20T12:00:00.000Z",
};

const MOBILIZACAO: PrecoMobilizacao = {
  id: "pm-001",
  descricao: "Mobilização escavadeira até 50km",
  valor: 850,
  ativo: true,
  created_at: "2025-04-01T12:00:00.000Z",
  updated_at: "2026-02-15T12:00:00.000Z",
};

describe("TabelasAnterioresDialog", () => {
  beforeEach(() => {
    historicoPrecosStore.listar().length = 0;
  });

  it("mostra estado vazio quando não há histórico", () => {
    render(<TabelasAnterioresDialog open onOpenChange={() => {}} />);
    expect(screen.getByText("Nenhuma alteração registrada")).toBeInTheDocument();
  });

  it("lista entradas de histórico dos 3 tipos", () => {
    historicoPrecosStore.registrar("hora_maquina", HORA_MAQUINA);
    historicoPrecosStore.registrar("fundacao", FUNDACAO);
    historicoPrecosStore.registrar("mobilizacao", MOBILIZACAO);
    render(<TabelasAnterioresDialog open onOpenChange={() => {}} />);

    expect(screen.getByText("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D")).toBeInTheDocument();
    expect(screen.getByText("Hora-Máquina")).toBeInTheDocument();

    expect(screen.getByText("Ø300mm")).toBeInTheDocument();
    expect(screen.getByText("Por Metro")).toBeInTheDocument();

    expect(screen.getByText("Mobilização escavadeira até 50km")).toBeInTheDocument();
    expect(screen.getByText("Mobilização")).toBeInTheDocument();
  });

  it("não renderiza o conteúdo quando open é false", () => {
    render(<TabelasAnterioresDialog open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("Tabelas anteriores")).not.toBeInTheDocument();
  });
});
```

Note: this test renders the real `equipamentosStore` (backed by `src/mocks/equipamentos.ts`), which already contains `eq-001` with `nome: "ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D"` — no extra mocking needed for the equipment name to resolve.

Note: `historicoPrecosStore.listar().length = 0` mutates the array returned by the closure directly to reset state between tests (the store module is a singleton shared across the test file, same pattern needed because `historicoPrecosStore` has no `reset` method — this is acceptable here because `listar()` returns the live internal array reference, not a copy).

- [ ] **Step 12: Run test to verify it fails**

Run: `npx vitest run src/features/precos/components/tabelas-anteriores-dialog.test.tsx`
Expected: FAIL — `src/features/precos/components/tabelas-anteriores-dialog` does not exist yet.

- [ ] **Step 13: Implement the dialog**

Create `src/features/precos/components/tabelas-anteriores-dialog.tsx`:

```tsx
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_HISTORICO_LABEL, descreverHistorico } from "@/features/precos/labels";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function TabelasAnterioresDialog({ open, onOpenChange }: Props) {
  const historico = historicoPrecosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Tabelas anteriores</DialogTitle>
          <DialogDescription>
            Histórico de alterações nos preços de hora-máquina, por metro e mobilização.
          </DialogDescription>
        </DialogHeader>
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Icon icon="lucide:history" className="mb-3 h-10 w-10 text-foreground-faint" />
            <p className="text-sm font-medium text-foreground">Nenhuma alteração registrada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Alterações em preços existentes aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {historico.map((entrada) => {
              const { titulo, detalhe } = descreverHistorico(entrada, equipamentos);
              return (
                <li key={entrada.id} className="rounded-lg border bg-surface/40 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{titulo}</span>
                    <span className="rounded-full border bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {TIPO_HISTORICO_LABEL[entrada.tipo]}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{detalhe}</span>
                    <span className="font-mono">{formatarData(entrada.alterado_em)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 14: Run test to verify it passes**

Run: `npx vitest run src/features/precos/components/tabelas-anteriores-dialog.test.tsx`
Expected: PASS (3/3).

- [ ] **Step 15: Commit**

```bash
git add src/shared/types/index.ts src/mocks/historico-precos.ts src/features/precos/historico-precos-store.ts src/features/precos/historico-precos-store.test.ts src/features/precos/labels.ts src/features/precos/labels.test.ts src/features/precos/components/tabelas-anteriores-dialog.tsx src/features/precos/components/tabelas-anteriores-dialog.test.tsx
git commit -m "feat: add mock price-change history store and Tabelas Anteriores dialog"
```

---

### Task 3: Wire Preços — histórico, Custo ref./Margem, header

**Files:**
- Modify: `src/features/precos/components/precos-page.tsx`
- Modify: `src/features/precos/components/preco-hora-maquina-form.tsx`
- Modify: `src/features/precos/components/preco-fundacao-form.tsx`
- Modify: `src/features/precos/components/preco-mobilizacao-form.tsx`
- Modify: `src/features/precos/components/preco-hora-maquina-list.tsx`
- Modify: `src/features/precos/components/preco-fundacao-list.tsx`
- Modify: `src/features/precos/components/preco-mobilizacao-list.tsx`
- Test: `src/features/precos/components/preco-hora-maquina-list.test.tsx` (new)
- Test: `src/features/precos/components/preco-hora-maquina-form.test.tsx` (new)

**Interfaces:**
- Consumes: `historicoPrecosStore.registrar` (Task 2), `TabelasAnterioresDialog` (Task 2), `custoEstimadoHoraEquipamento` (Task 1), `margemPercentual`/`MARGEM_MINIMA_PADRAO` (Task 2's `labels.ts`), `componentesCustoStore` (`@/features/custo-hora/componentes-custo-store`, pre-existing).
- Produces: nothing new consumed by later tasks (Preços is done after this task).

- [ ] **Step 1: Write the failing test for Custo ref./Margem columns**

Create `src/features/precos/components/preco-hora-maquina-list.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";

describe("PrecoHoraMaquinaList — Custo ref./Margem", () => {
  it("mostra custo de referência e margem para um preço vinculado a equipamento com componentes de custo", () => {
    render(<PrecoHoraMaquinaList />);
    // phm-001 (eq-001): custo ref. = 71.25, preço operada = 360 → margem ≈ 80%
    expect(screen.getAllByText("R$ 71,25").length).toBeGreaterThan(0);
    expect(screen.getAllByText("80%").length).toBeGreaterThan(0);
  });

  it('mostra "—" para preço vinculado a tipo de equipamento (sem componente de custo próprio)', () => {
    render(<PrecoHoraMaquinaList />);
    // phm-003 é vinculado a tipo_equipamento "carregadeira", sem equipamento_id
    const linhaTipo = screen.getByText("Tipo: Carregadeira").closest("tr");
    expect(linhaTipo).not.toBeNull();
    expect(linhaTipo!.textContent).toContain("—");
  });

  it('mostra "—" para preço de equipamento sem nenhum componente de custo cadastrado (phm-006/eq-007)', () => {
    render(<PrecoHoraMaquinaList />);
    const linhaSemComponente = screen
      .getByText("RETROESCAVADEIRA JCB 3CX PARA SERVIÇOS DE FUNDAÇÃO, VALA E NIVELAMENTO FINO EM TERRENO URBANO")
      .closest("tr");
    expect(linhaSemComponente).not.toBeNull();
    expect(linhaSemComponente!.textContent).toContain("—");
  });

  it("aplica destaque de alerta quando a margem fica abaixo de 30%", () => {
    render(<PrecoHoraMaquinaList />);
    const margemBaixa = screen.getAllByText(/%$/).find((el) => {
      const valor = Number(el.textContent?.replace("%", ""));
      return valor < 30;
    });
    if (margemBaixa) {
      expect(margemBaixa.className).toContain("text-destructive");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/precos/components/preco-hora-maquina-list.test.tsx`
Expected: FAIL — no "R$ 71,25" or "80%" text found (columns don't exist yet).

- [ ] **Step 3: Add Custo ref./Margem columns to `PrecoHoraMaquinaList`**

In `src/features/precos/components/preco-hora-maquina-list.tsx`, add imports (after the existing `import { descreverVinculo } from "@/features/precos/labels";` line):

```ts
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { custoEstimadoHoraEquipamento } from "@/features/custo-hora/derivacoes";
import { margemPercentual, MARGEM_MINIMA_PADRAO } from "@/features/precos/labels";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { useMemo } from "react"; // já existe "useMemo, useState" no import de react — mesclar, não duplicar
```

The last line above duplicates the existing `react` import — instead, edit the existing line `import { useMemo, useState } from "react";` to stay as-is (it already imports `useMemo`), and skip adding a second `react` import line.

Inside `PrecoHoraMaquinaList`, right after the `const equipamentos = equipamentosStore.useAll();` line, add:

```ts
  const componentes = componentesCustoStore.useAll();
  const custoRefPorId = useMemo(() => {
    const mapa = new Map<string, number | null>();
    for (const p of todos) {
      mapa.set(
        p.id,
        p.equipamento_id ? custoEstimadoHoraEquipamento(p.equipamento_id, componentes) : null,
      );
    }
    return mapa;
  }, [todos, componentes]);
```

Update the `columns` array — replace the current array (from `const columns: Column<PrecoHoraMaquina>[] = [` through its closing `];`) with:

```ts
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
    {
      header: "Custo ref.",
      className: "text-right font-mono",
      cell: (p) => {
        const custo = custoRefPorId.get(p.id);
        return custo == null ? (
          <span className="text-foreground-faint">—</span>
        ) : (
          formatBRL(custo)
        );
      },
    },
    {
      header: "Margem",
      className: "text-right font-mono",
      cell: (p) => {
        const custo = custoRefPorId.get(p.id);
        if (custo == null) return <span className="text-foreground-faint">—</span>;
        const margem = margemPercentual(p.valor_hora_operada, custo);
        return (
          <span className={cn(margem < MARGEM_MINIMA_PADRAO && "text-destructive")}>
            {Math.round(margem * 100)}%
          </span>
        );
      },
    },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];
```

Update `renderCard` (mobile view) to include the same two fields — replace the `<dl>` block inside `renderCard` with:

```tsx
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Hora seca</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_hora_seca)}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Hora operada</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_hora_operada)}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Custo ref.</dt>
          <dd className="font-mono text-foreground">
            {custoRefPorId.get(p.id) != null ? formatBRL(custoRefPorId.get(p.id)!) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Margem</dt>
          <dd
            className={cn(
              "font-mono text-foreground",
              (() => {
                const custo = custoRefPorId.get(p.id);
                if (custo == null) return false;
                return margemPercentual(p.valor_hora_operada, custo) < MARGEM_MINIMA_PADRAO;
              })() && "text-destructive",
            )}
          >
            {(() => {
              const custo = custoRefPorId.get(p.id);
              if (custo == null) return "—";
              return `${Math.round(margemPercentual(p.valor_hora_operada, custo) * 100)}%`;
            })()}
          </dd>
        </div>
      </dl>
```

- [ ] **Step 4: Wire `historicoPrecosStore.registrar` into `confirmarInativar`/`reativar`**

In the same file, update `confirmarInativar` and `reativar`:

```ts
  const confirmarInativar = () => {
    if (!inativando) return;
    historicoPrecosStore.registrar("hora_maquina", inativando);
    precoHoraMaquinaStore.setAtivo(inativando.id, false);
    toast.success("Preço inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoHoraMaquina) => {
    historicoPrecosStore.registrar("hora_maquina", p);
    precoHoraMaquinaStore.setAtivo(p.id, true);
    toast.success("Preço reativado.");
  };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/features/precos/components/preco-hora-maquina-list.test.tsx`
Expected: PASS (4/4). If the `eq-007` name assertion fails, read `src/mocks/equipamentos.ts` for the exact `nome` of `eq-007` and correct the test string to match.

- [ ] **Step 6: Write the failing test for historico registration on edit**

Create `src/features/precos/components/preco-hora-maquina-form.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { PrecoHoraMaquinaForm } from "@/features/precos/components/preco-hora-maquina-form";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import type { PrecoHoraMaquina } from "@/shared/types";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const PRECO: PrecoHoraMaquina = {
  id: "phm-001",
  equipamento_id: "eq-001",
  tipo_equipamento: null,
  valor_hora_seca: 280,
  valor_hora_operada: 360,
  ativo: true,
  created_at: "2025-01-15T12:00:00.000Z",
  updated_at: "2026-03-10T09:00:00.000Z",
};

describe("PrecoHoraMaquinaForm — histórico", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    historicoPrecosStore.listar().length = 0;
  });

  it("registra o snapshot anterior no histórico ao salvar uma edição", () => {
    render(<PrecoHoraMaquinaForm inicial={PRECO} onSuccess={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    const itens = historicoPrecosStore.listar();
    expect(itens).toHaveLength(1);
    expect(itens[0].tipo).toBe("hora_maquina");
    expect(itens[0].snapshot).toEqual(PRECO);
  });

  it("não registra histórico ao criar um preço novo", () => {
    render(<PrecoHoraMaquinaForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(historicoPrecosStore.listar()).toHaveLength(0);
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run src/features/precos/components/preco-hora-maquina-form.test.tsx`
Expected: FAIL — histórico stays empty after editing (registration not wired yet).

- [ ] **Step 8: Wire `historicoPrecosStore.registrar` into the 3 price forms**

In `src/features/precos/components/preco-hora-maquina-form.tsx`, add the import:

```ts
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
```

And update `onSubmit`:

```ts
  const onSubmit = (values: PrecoHoraMaquinaFormValues) => {
    const payload = {
      equipamento_id: values.vinculo === "equipamento" ? (values.equipamento_id ?? null) : null,
      tipo_equipamento: values.vinculo === "tipo" ? (values.tipo_equipamento ?? null) : null,
      valor_hora_seca: values.valor_hora_seca,
      valor_hora_operada: values.valor_hora_operada,
      ativo: values.ativo,
    };
    if (inicial) {
      historicoPrecosStore.registrar("hora_maquina", inicial);
      precoHoraMaquinaStore.update(inicial.id, payload);
      toast.success("Preço atualizado.");
    } else {
      precoHoraMaquinaStore.create(payload);
      toast.success("Preço cadastrado.");
    }
    onSuccess();
  };
```

In `src/features/precos/components/preco-fundacao-form.tsx`, add the same import and update `onSubmit`:

```ts
  const onSubmit = (values: PrecoFundacaoFormValues) => {
    const payload = {
      diametro_broca_mm: values.diametro_broca_mm,
      valor_metro: values.valor_metro,
      descricao: values.descricao?.trim() ? values.descricao.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      historicoPrecosStore.registrar("fundacao", inicial);
      precoFundacaoStore.update(inicial.id, payload);
      toast.success("Preço atualizado.");
    } else {
      precoFundacaoStore.create(payload);
      toast.success("Preço cadastrado.");
    }
    onSuccess();
  };
```

In `src/features/precos/components/preco-mobilizacao-form.tsx`, add the same import and update `onSubmit`:

```ts
  const onSubmit = (values: PrecoMobilizacaoFormValues) => {
    const payload = {
      descricao: values.descricao.trim(),
      valor: values.valor,
      ativo: values.ativo,
    };
    if (inicial) {
      historicoPrecosStore.registrar("mobilizacao", inicial);
      precoMobilizacaoStore.update(inicial.id, payload);
      toast.success("Mobilização atualizada.");
    } else {
      precoMobilizacaoStore.create(payload);
      toast.success("Mobilização cadastrada.");
    }
    onSuccess();
  };
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run src/features/precos/components/preco-hora-maquina-form.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 10: Wire historico into fundação/mobilização lists' inativar/reativar**

In `src/features/precos/components/preco-fundacao-list.tsx`, add the import:

```ts
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
```

Update `confirmarInativar`/`reativar`:

```ts
  const confirmarInativar = () => {
    if (!inativando) return;
    historicoPrecosStore.registrar("fundacao", inativando);
    precoFundacaoStore.setAtivo(inativando.id, false);
    toast.success("Preço inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoFundacao) => {
    historicoPrecosStore.registrar("fundacao", p);
    precoFundacaoStore.setAtivo(p.id, true);
    toast.success("Preço reativado.");
  };
```

In `src/features/precos/components/preco-mobilizacao-list.tsx`, add the same import and update:

```ts
  const confirmarInativar = () => {
    if (!inativando) return;
    historicoPrecosStore.registrar("mobilizacao", inativando);
    precoMobilizacaoStore.setAtivo(inativando.id, false);
    toast.success("Item inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoMobilizacao) => {
    historicoPrecosStore.registrar("mobilizacao", p);
    precoMobilizacaoStore.setAtivo(p.id, true);
    toast.success("Item reativado.");
  };
```

- [ ] **Step 11: Add the "Tabelas anteriores" button and header rename to `PrecosPage`**

Replace the full contents of `src/features/precos/components/precos-page.tsx` with:

```tsx
import { useState } from "react";
import { Icon } from "@iconify/react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";
import { PrecoFundacaoList } from "@/features/precos/components/preco-fundacao-list";
import { PrecoMobilizacaoList } from "@/features/precos/components/preco-mobilizacao-list";
import { TabelasAnterioresDialog } from "@/features/precos/components/tabelas-anteriores-dialog";

export function PrecosPage() {
  const [historicoAberto, setHistoricoAberto] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Preços"
        descricao="Valores que alimentam orçamento e faturamento. Visível apenas na retaguarda."
        acoes={
          <Button variant="ghost" onClick={() => setHistoricoAberto(true)} className="gap-1.5">
            <Icon icon="lucide:history" className="h-4 w-4" />
            Tabelas anteriores
          </Button>
        }
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

      <TabelasAnterioresDialog open={historicoAberto} onOpenChange={setHistoricoAberto} />
    </div>
  );
}
```

- [ ] **Step 12: Run the full Preços test suite**

Run: `npx vitest run src/features/precos`
Expected: PASS — all Preços test files green (`money.test.ts`, `precos-schema.test.ts`, `labels.test.ts`, `historico-precos-store.test.ts`, `tabelas-anteriores-dialog.test.tsx`, `preco-hora-maquina-list.test.tsx`, `preco-hora-maquina-form.test.tsx`).

- [ ] **Step 13: Run tsc to check for type errors**

Run: `npx tsc --noEmit`
Expected: no errors in any touched file.

- [ ] **Step 14: Commit**

```bash
git add src/features/precos
git commit -m "feat: add Custo ref./Margem columns and price-history wiring to Preços"
```

---

### Task 4: Financeiro — funções de derivação

**Files:**
- Modify: `src/features/faturamento/derivacoes.ts` (export 3 previously-private helpers)
- Modify: `src/features/financeiro/derivacoes.ts`
- Test: `src/features/financeiro/derivacoes.test.ts` (extend existing file)
- Modify: `src/features/financeiro/labels.tsx`
- Test: `src/features/financeiro/labels.test.tsx` (new)

**Interfaces:**
- Consumes: `round2` (`@/features/faturamento/calculo`), `ContaReceber`, `ContaPagar`, `FormaRecebimento`, `CategoriaDespesa` (`@/shared/types`).
- Produces: `agregadoMensalPorData<T>(...)`, `AgregadoMensalFinanceiro`, `recebimentosPorForma(...)`, `RecebimentoPorForma`, `comprovantesRecentes(...)` from `src/features/financeiro/derivacoes.ts`; `FORMA_RECEBIMENTO_ICONE`, `CATEGORIA_ICONE` from `src/features/financeiro/labels.tsx` — all consumed by Task 5/6.

- [ ] **Step 1: Export the month-bucketing helpers from `faturamento/derivacoes.ts`**

In `src/features/faturamento/derivacoes.ts`, change the 3 declarations (they currently have no `export` keyword, or are already `const`/`function` without export):

```ts
export const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function chaveMes(iso: string): string {
  return iso.slice(0, 7); // "YYYY-MM"
}

export function somarMeses(chaveMesRef: string, offset: number): string {
  const [ano, mes] = chaveMesRef.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1 + offset, 1));
  const anoNovo = data.getUTCFullYear();
  const mesNovo = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${anoNovo}-${mesNovo}`;
}
```

(This only adds the `export` keyword to each of the 3 existing declarations — no behavior change. Existing callers inside the same file, like `agregadoMensal`, are unaffected.)

- [ ] **Step 2: Write the failing tests for the new derivations**

Open `src/features/financeiro/derivacoes.test.ts`. It already exists, with tests covering `contaVencida`/`resumoCaixa`, importing via a relative path: `import { contaVencida, resumoCaixa } from "./derivacoes";`. Change that line to add the 3 new names (keep it relative, matching the file's existing style):

```ts
import { contaVencida, resumoCaixa, agregadoMensalPorData, recebimentosPorForma, comprovantesRecentes } from "./derivacoes";
```

Then append these `describe` blocks at the end of the file (after the closing `});` of the existing `describe("resumoCaixa", ...)` block):

```ts

const CR_LIQUIDADA: ContaReceber = {
  id: "cr-004",
  faturamento_id: "fat-006",
  cliente_id: "cl-002",
  valor: 3500,
  vencimento: "2026-06-20",
  status: "liquidada",
  recebido_em: "2026-06-25",
  forma_recebimento: "pix",
  created_at: "2026-05-21T10:00:00.000Z",
  updated_at: "2026-06-25T14:00:00.000Z",
};

const CR_ABERTA: ContaReceber = {
  id: "cr-001",
  faturamento_id: "fat-001",
  cliente_id: "cl-003",
  valor: 5220,
  vencimento: "2026-07-24",
  status: "aberta",
  recebido_em: null,
  forma_recebimento: null,
  created_at: "2026-06-24T09:00:00.000Z",
  updated_at: "2026-06-24T09:00:00.000Z",
};

describe("agregadoMensalPorData", () => {
  it("agrega valores por mês de uma data arbitrária do item, últimos N meses", () => {
    const resultado = agregadoMensalPorData(
      [CR_LIQUIDADA],
      (c: ContaReceber) => c.recebido_em,
      (c: ContaReceber) => c.valor,
      "2026-06-30",
      3,
    );
    expect(resultado).toHaveLength(3);
    expect(resultado[2].mes).toBe("2026-06");
    expect(resultado[2].valor).toBe(3500);
    expect(resultado[0].valor).toBe(0);
  });

  it("ignora itens com data nula", () => {
    const resultado = agregadoMensalPorData(
      [CR_ABERTA],
      (c: ContaReceber) => c.recebido_em,
      (c: ContaReceber) => c.valor,
      "2026-06-30",
      1,
    );
    expect(resultado[0].valor).toBe(0);
  });
});

describe("recebimentosPorForma", () => {
  it("agrupa contas liquidadas por forma de recebimento", () => {
    const resultado = recebimentosPorForma([CR_LIQUIDADA, CR_ABERTA]);
    expect(resultado).toEqual([{ forma: "pix", valor: 3500, quantidade: 1 }]);
  });

  it("retorna lista vazia quando não há contas liquidadas", () => {
    expect(recebimentosPorForma([CR_ABERTA])).toEqual([]);
  });
});

describe("comprovantesRecentes", () => {
  it("retorna só contas liquidadas, mais recentes primeiro", () => {
    const resultado = comprovantesRecentes([CR_ABERTA, CR_LIQUIDADA], 5);
    expect(resultado).toEqual([CR_LIQUIDADA]);
  });

  it("respeita o limite informado", () => {
    const outraLiquidada: ContaReceber = { ...CR_LIQUIDADA, id: "cr-009", recebido_em: "2026-06-26" };
    const resultado = comprovantesRecentes([CR_LIQUIDADA, outraLiquidada], 1);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("cr-009");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/features/financeiro/derivacoes.test.ts`
Expected: FAIL — `agregadoMensalPorData`, `recebimentosPorForma`, `comprovantesRecentes` not exported yet.

- [ ] **Step 4: Implement the new derivations**

Replace the full contents of `src/features/financeiro/derivacoes.ts` with:

```ts
import { round2 } from "@/features/faturamento/calculo";
import { chaveMes, somarMeses, MESES_ABREV } from "@/features/faturamento/derivacoes";
import type { ContaReceber, ContaPagar, FormaRecebimento } from "@/shared/types";

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

export interface AgregadoMensalFinanceiro {
  mes: string; // "YYYY-MM"
  rotulo: string;
  valor: number;
}

// Agrega `valor` de itens por mês de uma data escolhida por `obterData`
// (ex.: recebido_em, pago_em), últimos N meses até a referência. Generaliza
// o padrão de agregadoMensal (faturamento/derivacoes.ts) para qualquer campo
// de data nullable.
export function agregadoMensalPorData<T>(
  itens: T[],
  obterData: (item: T) => string | null,
  obterValor: (item: T) => number,
  referenciaISO: string,
  meses = 6,
): AgregadoMensalFinanceiro[] {
  const mesRef = chaveMes(referenciaISO);
  const chaves = Array.from({ length: meses }, (_, i) => somarMeses(mesRef, i - (meses - 1)));
  return chaves.map((chave) => {
    const doMes = itens.filter((item) => {
      const data = obterData(item);
      return data != null && chaveMes(data) === chave;
    });
    const mesIndex = Number(chave.slice(5, 7)) - 1;
    return {
      mes: chave,
      rotulo: MESES_ABREV[mesIndex],
      valor: round2(doMes.reduce((s, item) => s + obterValor(item), 0)),
    };
  });
}

export interface RecebimentoPorForma {
  forma: FormaRecebimento;
  valor: number;
  quantidade: number;
}

// Agrupa contas a receber liquidadas por forma de recebimento, ordenado por
// valor desc. Usado pelo card "Recebimentos por forma" do Financeiro.
export function recebimentosPorForma(contas: ContaReceber[]): RecebimentoPorForma[] {
  const liquidadas = contas.filter(
    (c) => c.status === "liquidada" && c.forma_recebimento != null,
  );
  const mapa = new Map<FormaRecebimento, { valor: number; quantidade: number }>();
  for (const c of liquidadas) {
    const forma = c.forma_recebimento as FormaRecebimento;
    const atual = mapa.get(forma) ?? { valor: 0, quantidade: 0 };
    mapa.set(forma, { valor: round2(atual.valor + c.valor), quantidade: atual.quantidade + 1 });
  }
  return Array.from(mapa.entries())
    .map(([forma, { valor, quantidade }]) => ({ forma, valor, quantidade }))
    .sort((a, b) => b.valor - a.valor);
}

// Últimas N contas a receber liquidadas, mais recentes primeiro (por
// recebido_em). Usado pelo card "Comprovantes recentes" do Financeiro.
export function comprovantesRecentes(contas: ContaReceber[], limite = 5): ContaReceber[] {
  return contas
    .filter((c) => c.status === "liquidada" && c.recebido_em != null)
    .sort((a, b) => (b.recebido_em as string).localeCompare(a.recebido_em as string))
    .slice(0, limite);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/financeiro/derivacoes.test.ts`
Expected: PASS (all tests in the file, including any pre-existing ones).

- [ ] **Step 6: Write the failing test for the icon maps**

Create `src/features/financeiro/labels.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { FORMA_RECEBIMENTO_ICONE, CATEGORIA_ICONE } from "@/features/financeiro/labels";

describe("FORMA_RECEBIMENTO_ICONE", () => {
  it("cobre todas as formas de recebimento", () => {
    expect(FORMA_RECEBIMENTO_ICONE.pix).toBe("lucide:credit-card");
    expect(FORMA_RECEBIMENTO_ICONE.transferencia).toBe("lucide:landmark");
    expect(FORMA_RECEBIMENTO_ICONE.boleto).toBe("lucide:link");
    expect(FORMA_RECEBIMENTO_ICONE.dinheiro).toBe("lucide:banknote");
    expect(FORMA_RECEBIMENTO_ICONE.cheque).toBe("lucide:file-text");
    expect(FORMA_RECEBIMENTO_ICONE.outro).toBe("lucide:circle");
  });
});

describe("CATEGORIA_ICONE", () => {
  it("cobre todas as categorias de despesa", () => {
    expect(CATEGORIA_ICONE.diesel).toBe("lucide:fuel");
    expect(CATEGORIA_ICONE.manutencao).toBe("lucide:wrench");
    expect(CATEGORIA_ICONE.folha).toBe("lucide:hard-hat");
    expect(CATEGORIA_ICONE.fornecedor).toBe("lucide:truck");
    expect(CATEGORIA_ICONE.outro).toBe("lucide:circle");
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run src/features/financeiro/labels.test.tsx`
Expected: FAIL — `FORMA_RECEBIMENTO_ICONE`/`CATEGORIA_ICONE` not exported yet.

- [ ] **Step 8: Add the icon maps**

In `src/features/financeiro/labels.tsx`, append at the end of the file (after `FORMA_PAGAMENTO_LABEL`):

```ts

export const FORMA_RECEBIMENTO_ICONE: Record<FormaRecebimento, string> = {
  dinheiro: "lucide:banknote",
  pix: "lucide:credit-card",
  transferencia: "lucide:landmark",
  boleto: "lucide:link",
  cheque: "lucide:file-text",
  outro: "lucide:circle",
};

export const CATEGORIA_ICONE: Record<CategoriaDespesa, string> = {
  diesel: "lucide:fuel",
  manutencao: "lucide:wrench",
  folha: "lucide:hard-hat",
  fornecedor: "lucide:truck",
  outro: "lucide:circle",
};
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run src/features/financeiro/labels.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 10: Commit**

```bash
git add src/features/faturamento/derivacoes.ts src/features/financeiro/derivacoes.ts src/features/financeiro/derivacoes.test.ts src/features/financeiro/labels.tsx src/features/financeiro/labels.test.tsx
git commit -m "feat: add Financeiro monthly aggregation, recebimentos-por-forma and icon maps"
```

---

### Task 5: `FinanceiroKpis`, `RecebimentosPorFormaCard`, `ComprovantesRecentesCard`

**Files:**
- Create: `src/features/financeiro/components/financeiro-kpis.tsx`
- Test: `src/features/financeiro/components/financeiro-kpis.test.tsx`
- Create: `src/features/financeiro/components/recebimentos-por-forma-card.tsx`
- Test: `src/features/financeiro/components/recebimentos-por-forma-card.test.tsx`
- Create: `src/features/financeiro/components/comprovantes-recentes-card.tsx`
- Test: `src/features/financeiro/components/comprovantes-recentes-card.test.tsx`

**Interfaces:**
- Consumes: `Sparkline` (`@/shared/components/sparkline`), `CardSecao` (`@/shared/components/card-secao`), `formatBRL` (`@/features/retaguarda/format`), `FORMA_RECEBIMENTO_LABEL`/`FORMA_RECEBIMENTO_ICONE` (Task 4), `RecebimentoPorForma` type (Task 4), `faturamentosStore` (`@/features/faturamento/faturamentos-store`, pre-existing).
- Produces: `<FinanceiroKpis {...FinanceiroKpisProps} />`, `<RecebimentosPorFormaCard itens={RecebimentoPorForma[]} />`, `<ComprovantesRecentesCard itens={ContaReceber[]} />` — all consumed by Task 6.

- [ ] **Step 1: Write the failing test for `FinanceiroKpis`**

Create `src/features/financeiro/components/financeiro-kpis.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FinanceiroKpis } from "@/features/financeiro/components/financeiro-kpis";

describe("FinanceiroKpis", () => {
  it("renderiza os 4 tiles com os valores formatados em BRL", () => {
    render(
      <FinanceiroKpis
        aReceberValor={61900}
        aReceberRodape="5 títulos · 2 vencidos"
        aReceberAlerta
        aPagarValor={52350}
        aPagarRodape="3 títulos em aberto"
        recebidoNoMes={86200}
        recebidoRodape="↑ vs. mês anterior"
        seriesRecebido={[10, 20, 30, 40, 50, 60]}
        saldoDoMes={33850}
        seriesSaldo={[5, 10, 15, 20, 25, 30]}
      />,
    );
    expect(screen.getByText("A receber")).toBeInTheDocument();
    expect(screen.getByText("R$ 61.900,00")).toBeInTheDocument();
    expect(screen.getByText("5 títulos · 2 vencidos")).toBeInTheDocument();
    expect(screen.getByText("A pagar")).toBeInTheDocument();
    expect(screen.getByText("R$ 52.350,00")).toBeInTheDocument();
    expect(screen.getByText("Recebido no mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 86.200,00")).toBeInTheDocument();
    expect(screen.getByText("Saldo do mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 33.850,00")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/financeiro/components/financeiro-kpis.test.tsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Implement `FinanceiroKpis`**

Create `src/features/financeiro/components/financeiro-kpis.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import { formatBRL } from "@/features/retaguarda/format";

export interface FinanceiroKpisProps {
  aReceberValor: number;
  aReceberRodape: string;
  aReceberAlerta: boolean;
  aPagarValor: number;
  aPagarRodape: string;
  recebidoNoMes: number;
  recebidoRodape: string;
  seriesRecebido: number[]; // últimos N meses (para o spark de "Recebido no mês")
  saldoDoMes: number;
  seriesSaldo: number[]; // últimos N meses (para o spark de "Saldo do mês")
}

function escalar0a100(valores: number[]): number[] {
  const max = Math.max(...valores, 0);
  if (max === 0) return valores.map(() => 0);
  return valores.map((v) => Math.round((v / max) * 100));
}

export function FinanceiroKpis({
  aReceberValor,
  aReceberRodape,
  aReceberAlerta,
  aPagarValor,
  aPagarRodape,
  recebidoNoMes,
  recebidoRodape,
  seriesRecebido,
  saldoDoMes,
  seriesSaldo,
}: FinanceiroKpisProps) {
  const sparkRecebido = escalar0a100(seriesRecebido);
  const sparkSaldo = escalar0a100(seriesSaldo);
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <Tile
        rotulo="A receber"
        valor={formatBRL(aReceberValor)}
        icone="lucide:hand-coins"
        rodape={aReceberRodape}
        alerta={aReceberAlerta}
      />
      <Tile
        rotulo="A pagar"
        valor={formatBRL(aPagarValor)}
        icone="lucide:wallet"
        rodape={aPagarRodape}
      />
      <Tile
        rotulo="Recebido no mês"
        valor={formatBRL(recebidoNoMes)}
        icone="lucide:credit-card"
        rodape={recebidoRodape}
        spark={sparkRecebido}
      />
      <Tile
        rotulo="Saldo do mês"
        valor={formatBRL(saldoDoMes)}
        icone="lucide:trending-up"
        rodape="recebido − pago"
        spark={sparkSaldo}
      />
    </section>
  );
}

function Tile({
  rotulo,
  valor,
  icone,
  rodape,
  spark,
  alerta,
}: {
  rotulo: string;
  valor: string;
  icone: string;
  rodape?: string;
  spark?: number[];
  alerta?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </span>
        <span
          className={
            alerta
              ? "grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive"
              : "grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary"
          }
        >
          <Icon icon={icone} className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div
        className={
          (alerta ? "text-destructive" : "text-foreground") + " mt-3 font-mono text-2xl font-bold"
        }
      >
        {valor}
      </div>
      {rodape ? <div className="mt-1.5 text-xs text-muted-foreground">{rodape}</div> : null}
      {spark ? (
        <Sparkline pontos={spark} className="absolute bottom-3.5 right-3.5 h-6 w-16" />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/financeiro/components/financeiro-kpis.test.tsx`
Expected: PASS (1/1).

- [ ] **Step 5: Write the failing test for `RecebimentosPorFormaCard`**

Create `src/features/financeiro/components/recebimentos-por-forma-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RecebimentosPorFormaCard } from "@/features/financeiro/components/recebimentos-por-forma-card";

describe("RecebimentosPorFormaCard", () => {
  it("mostra estado vazio quando não há recebimentos", () => {
    render(<RecebimentosPorFormaCard itens={[]} />);
    expect(screen.getByText("Nenhum recebimento registrado ainda.")).toBeInTheDocument();
  });

  it("lista as formas com valor e quantidade", () => {
    render(
      <RecebimentosPorFormaCard
        itens={[
          { forma: "pix", valor: 38400, quantidade: 12 },
          { forma: "boleto", valor: 18700, quantidade: 7 },
        ]}
      />,
    );
    expect(screen.getByText("PIX")).toBeInTheDocument();
    expect(screen.getByText("R$ 38.400,00")).toBeInTheDocument();
    expect(screen.getByText("12 recebimentos")).toBeInTheDocument();
    expect(screen.getByText("Boleto")).toBeInTheDocument();
    expect(screen.getByText("7 recebimentos")).toBeInTheDocument();
  });

  it("usa singular para quantidade 1", () => {
    render(<RecebimentosPorFormaCard itens={[{ forma: "dinheiro", valor: 100, quantidade: 1 }]} />);
    expect(screen.getByText("1 recebimento")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/features/financeiro/components/recebimentos-por-forma-card.test.tsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 7: Implement `RecebimentosPorFormaCard`**

Create `src/features/financeiro/components/recebimentos-por-forma-card.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { FORMA_RECEBIMENTO_LABEL, FORMA_RECEBIMENTO_ICONE } from "@/features/financeiro/labels";
import type { RecebimentoPorForma } from "@/features/financeiro/derivacoes";

interface Props {
  itens: RecebimentoPorForma[];
}

export function RecebimentosPorFormaCard({ itens }: Props) {
  return (
    <CardSecao titulo="Recebimentos por forma" icone="lucide:credit-card" bodyClassName="p-4">
      {itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum recebimento registrado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {itens.map((item) => (
            <li key={item.forma} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                <Icon icon={FORMA_RECEBIMENTO_ICONE[item.forma]} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">
                  {FORMA_RECEBIMENTO_LABEL[item.forma]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.quantidade} recebimento{item.quantidade > 1 ? "s" : ""}
                </div>
              </div>
              <div className="font-mono text-sm text-foreground">{formatBRL(item.valor)}</div>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/features/financeiro/components/recebimentos-por-forma-card.test.tsx`
Expected: PASS (3/3).

- [ ] **Step 9: Write the failing test for `ComprovantesRecentesCard`**

Create `src/features/financeiro/components/comprovantes-recentes-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComprovantesRecentesCard } from "@/features/financeiro/components/comprovantes-recentes-card";
import type { ContaReceber } from "@/shared/types";

const CONTA: ContaReceber = {
  id: "cr-004",
  faturamento_id: "fat-004", // existe em src/mocks/faturamentos.ts com numero "FAT-..."
  cliente_id: "cl-004",
  valor: 3500,
  vencimento: "2026-06-20",
  status: "liquidada",
  recebido_em: "2026-06-25",
  forma_recebimento: "pix",
  created_at: "2026-05-21T10:00:00.000Z",
  updated_at: "2026-06-25T14:00:00.000Z",
};

describe("ComprovantesRecentesCard", () => {
  it("mostra estado vazio quando não há itens", () => {
    render(<ComprovantesRecentesCard itens={[]} />);
    expect(screen.getByText("Nenhum comprovante recente.")).toBeInTheDocument();
  });

  it("lista um comprovante com forma, valor e data", () => {
    render(<ComprovantesRecentesCard itens={[CONTA]} />);
    expect(screen.getByText(/PIX recebido —/)).toBeInTheDocument();
    expect(screen.getByText("R$ 3.500,00")).toBeInTheDocument();
    expect(screen.getByText("25/06/2026")).toBeInTheDocument();
  });
});
```

Before running, confirm `fat-004` exists in `src/mocks/faturamentos.ts` (it is referenced this way in `src/mocks/contas-receber.ts`, read earlier in this plan's research). If its `numero` field is needed for a more specific assertion, read that file first — the test above only checks for the `"PIX recebido —"` prefix, not the exact `numero`, so it does not depend on the exact value.

- [ ] **Step 10: Run test to verify it fails**

Run: `npx vitest run src/features/financeiro/components/comprovantes-recentes-card.test.tsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 11: Implement `ComprovantesRecentesCard`**

Create `src/features/financeiro/components/comprovantes-recentes-card.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { FORMA_RECEBIMENTO_LABEL, FORMA_RECEBIMENTO_ICONE } from "@/features/financeiro/labels";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import type { ContaReceber } from "@/shared/types";

interface Props {
  itens: ContaReceber[]; // já filtrados/ordenados por comprovantesRecentes()
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function ComprovantesRecentesCard({ itens }: Props) {
  return (
    <CardSecao titulo="Comprovantes recentes" icone="lucide:receipt" bodyClassName="p-4">
      {itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum comprovante recente.
        </p>
      ) : (
        <ul className="space-y-3">
          {itens.map((conta) => {
            const forma = conta.forma_recebimento ?? "outro";
            const fat = faturamentosStore.obter(conta.faturamento_id);
            return (
              <li key={conta.id} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                  <Icon icon={FORMA_RECEBIMENTO_ICONE[forma]} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {FORMA_RECEBIMENTO_LABEL[forma]} recebido — {fat?.numero ?? conta.faturamento_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conta.recebido_em ? formatarData(conta.recebido_em) : "—"}
                  </div>
                </div>
                <div className="font-mono text-sm text-foreground">{formatBRL(conta.valor)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </CardSecao>
  );
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `npx vitest run src/features/financeiro/components/comprovantes-recentes-card.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 13: Commit**

```bash
git add src/features/financeiro/components/financeiro-kpis.tsx src/features/financeiro/components/financeiro-kpis.test.tsx src/features/financeiro/components/recebimentos-por-forma-card.tsx src/features/financeiro/components/recebimentos-por-forma-card.test.tsx src/features/financeiro/components/comprovantes-recentes-card.tsx src/features/financeiro/components/comprovantes-recentes-card.test.tsx
git commit -m "feat: add FinanceiroKpis, RecebimentosPorFormaCard and ComprovantesRecentesCard"
```

---

### Task 6: Reescrever `FinanceiroPage`

**Files:**
- Modify: `src/features/financeiro/components/financeiro-page.tsx`
- Modify: `src/features/financeiro/components/contas-pagar-tab.tsx` (ícone por categoria)
- Test: `src/features/financeiro/components/financeiro-page.test.tsx` (new)

**Interfaces:**
- Consumes: everything produced by Tasks 4 and 5 (`FinanceiroKpis`, `RecebimentosPorFormaCard`, `ComprovantesRecentesCard`, `agregadoMensalPorData`, `recebimentosPorForma`, `comprovantesRecentes`, `CATEGORIA_ICONE`), plus pre-existing `CardSecao`, `ContasReceberTab`, `ContasPagarTab`, `CaixaTab`, `PrevisaoCaixaCard`, `contasReceberStore`, `contasPagarStore`, `clientesStore`, `cobrancasStore`.
- Produces: nothing new (terminal task for this plan).

- [ ] **Step 1: Add category icon to `ContasPagarTab`**

In `src/features/financeiro/components/contas-pagar-tab.tsx`, add `CATEGORIA_ICONE` to the existing labels import:

```ts
import { StatusContaBadge, CATEGORIA_LABEL, CATEGORIA_ICONE } from "@/features/financeiro/labels";
```

Replace the "Categoria" cell (currently `<td className="px-4 py-3 text-muted-foreground">{CATEGORIA_LABEL[conta.categoria]}</td>`) with:

```tsx
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon icon={CATEGORIA_ICONE[conta.categoria]} className="h-3.5 w-3.5" />
                        {CATEGORIA_LABEL[conta.categoria]}
                      </span>
                    </td>
```

(`Icon` from `@iconify/react` is already imported at the top of this file.)

- [ ] **Step 2: Write the failing test for the new `FinanceiroPage` layout**

Create `src/features/financeiro/components/financeiro-page.test.tsx`:

`FinanceiroPage` renders `ContasPagarTab`, which uses TanStack Router's `<Link>` (the "Nova Conta a Pagar" button) — this throws outside a router context. Follow the same wrapper pattern already established in `src/shared/components/pagina-cadastro-dedicada.test.tsx` (`createRootRoute` + `createRouter` + `RouterProvider`):

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { FinanceiroPage } from "@/features/financeiro/components/financeiro-page";

function renderComRouter() {
  const rootRoute = createRootRoute({ component: FinanceiroPage });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
}

describe("FinanceiroPage", () => {
  it("mostra os 4 KPIs, as duas colunas de contas e os cards novos, sem abas", async () => {
    renderComRouter();

    expect(await screen.findByText("A receber")).toBeInTheDocument();
    expect(screen.getByText("A pagar")).toBeInTheDocument();
    expect(screen.getByText("Recebido no mês")).toBeInTheDocument();
    expect(screen.getByText("Saldo do mês")).toBeInTheDocument();

    expect(screen.getByText("Contas a receber")).toBeInTheDocument();
    expect(screen.getByText("Contas a pagar")).toBeInTheDocument();
    expect(screen.getByText("Recebimentos por forma")).toBeInTheDocument();
    expect(screen.getByText("Comprovantes recentes")).toBeInTheDocument();
    expect(screen.getByText("Caixa")).toBeInTheDocument();

    // Não há mais TabsList com "A Receber"/"A Pagar"/"Caixa" como abas clicáveis
    expect(screen.queryByRole("tab", { name: "A Receber" })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/features/financeiro/components/financeiro-page.test.tsx`
Expected: FAIL — current page still renders `Tabs`/`TabsTrigger` with "A Receber"/"A Pagar"/"Caixa", no KPIs, no new cards.

- [ ] **Step 4: Rewrite `FinanceiroPage`**

Replace the full contents of `src/features/financeiro/components/financeiro-page.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/shared/components/page-header";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { FinanceiroKpis } from "@/features/financeiro/components/financeiro-kpis";
import { RecebimentosPorFormaCard } from "@/features/financeiro/components/recebimentos-por-forma-card";
import { ComprovantesRecentesCard } from "@/features/financeiro/components/comprovantes-recentes-card";
import { DarBaixaReceberDialog } from "@/features/financeiro/components/dar-baixa-receber-dialog";
import { DarBaixaPagarDialog } from "@/features/financeiro/components/dar-baixa-pagar-dialog";
import { EmitirCobrancaDialog } from "@/features/cobranca-gateway/components/emitir-cobranca-dialog";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
import {
  contaVencida,
  agregadoMensalPorData,
  recebimentosPorForma,
  comprovantesRecentes,
} from "@/features/financeiro/derivacoes";
import { PrevisaoCaixaCard } from "@/features/ia/components/previsao-caixa-card";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { ContaReceber, ContaPagar, CobrancaGateway } from "@/shared/types";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();
  const clientes = clientesStore.useAll();

  const [contaReceberSelecionada, setContaReceberSelecionada] = useState<ContaReceber | null>(null);
  const [contaPagarSelecionada, setContaPagarSelecionada] = useState<ContaPagar | null>(null);
  const [contaParaEmitirCobranca, setContaParaEmitirCobranca] = useState<ContaReceber | null>(null);

  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const aReceberAbertas = useMemo(
    () => contasReceber.filter((c) => c.status === "aberta"),
    [contasReceber],
  );
  const aPagarAbertas = useMemo(
    () => contasPagar.filter((c) => c.status === "aberta"),
    [contasPagar],
  );
  const vencidasReceber = useMemo(
    () => aReceberAbertas.filter((c) => contaVencida(c, agoraISO)).length,
    [aReceberAbertas, agoraISO],
  );

  const seriesRecebido = useMemo(
    () =>
      agregadoMensalPorData(
        contasReceber,
        (c: ContaReceber) => c.recebido_em,
        (c: ContaReceber) => c.valor,
        agoraISO,
        6,
      ),
    [contasReceber, agoraISO],
  );
  const seriesPago = useMemo(
    () =>
      agregadoMensalPorData(
        contasPagar,
        (c: ContaPagar) => c.pago_em,
        (c: ContaPagar) => c.valor,
        agoraISO,
        6,
      ),
    [contasPagar, agoraISO],
  );
  const recebidoNoMes = seriesRecebido[seriesRecebido.length - 1]?.valor ?? 0;
  const pagoNoMes = seriesPago[seriesPago.length - 1]?.valor ?? 0;
  const recebidoMesAnterior = seriesRecebido[seriesRecebido.length - 2]?.valor ?? 0;
  const recebidoRodape =
    recebidoMesAnterior > 0
      ? `${recebidoNoMes >= recebidoMesAnterior ? "↑" : "↓"} vs. mês anterior`
      : "no mês";

  const porForma = useMemo(() => recebimentosPorForma(contasReceber), [contasReceber]);
  const recentes = useMemo(() => comprovantesRecentes(contasReceber, 5), [contasReceber]);

  function handleSimularPagamento(cobranca: CobrancaGateway) {
    const r = cobrancasStore.simularWebhookPago(cobranca.id);
    if (r.ok) {
      toast.success("Pagamento confirmado (simulado) — conta liquidada automaticamente.");
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader titulo="Financeiro" descricao="Contas a receber, a pagar e visão de caixa" />

      <FinanceiroKpis
        aReceberValor={aReceberAbertas.reduce((s, c) => s + c.valor, 0)}
        aReceberRodape={
          vencidasReceber > 0
            ? `${aReceberAbertas.length} títulos · ${vencidasReceber} vencidos`
            : `${aReceberAbertas.length} títulos`
        }
        aReceberAlerta={vencidasReceber > 0}
        aPagarValor={aPagarAbertas.reduce((s, c) => s + c.valor, 0)}
        aPagarRodape={`${aPagarAbertas.length} títulos em aberto`}
        recebidoNoMes={recebidoNoMes}
        recebidoRodape={recebidoRodape}
        seriesRecebido={seriesRecebido.map((m) => m.valor)}
        saldoDoMes={recebidoNoMes - pagoNoMes}
        seriesSaldo={seriesRecebido.map((m, i) => m.valor - (seriesPago[i]?.valor ?? 0))}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <CardSecao
            titulo="Contas a receber"
            icone="lucide:hand-coins"
            acessorio={<CardPill>{formatBRL(aReceberAbertas.reduce((s, c) => s + c.valor, 0))} em aberto</CardPill>}
            bodyClassName="p-4"
          >
            <ContasReceberTab
              contasReceber={contasReceber}
              onDarBaixa={setContaReceberSelecionada}
              onEmitirCobranca={setContaParaEmitirCobranca}
              onSimularPagamento={handleSimularPagamento}
            />
          </CardSecao>
          <CardSecao
            titulo="Contas a pagar"
            icone="lucide:wallet"
            acessorio={<CardPill>{formatBRL(aPagarAbertas.reduce((s, c) => s + c.valor, 0))} em aberto</CardPill>}
            bodyClassName="p-4"
          >
            <ContasPagarTab contasPagar={contasPagar} onDarBaixa={setContaPagarSelecionada} />
          </CardSecao>
        </div>
        <div className="space-y-4">
          <RecebimentosPorFormaCard itens={porForma} />
          <ComprovantesRecentesCard itens={recentes} />
        </div>
      </div>

      <PrevisaoCaixaCard contasReceber={contasReceber} clientes={clientes} />

      <CardSecao titulo="Caixa" icone="lucide:scale" bodyClassName="p-4">
        <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
      </CardSecao>

      <DarBaixaReceberDialog
        conta={contaReceberSelecionada}
        onOpenChange={(open) => {
          if (!open) setContaReceberSelecionada(null);
        }}
      />
      <DarBaixaPagarDialog
        conta={contaPagarSelecionada}
        onOpenChange={(open) => {
          if (!open) setContaPagarSelecionada(null);
        }}
      />
      <EmitirCobrancaDialog
        conta={contaParaEmitirCobranca}
        onOpenChange={(open) => {
          if (!open) setContaParaEmitirCobranca(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/features/financeiro/components/financeiro-page.test.tsx`
Expected: PASS (1/1).

- [ ] **Step 6: Run the full Financeiro test suite**

Run: `npx vitest run src/features/financeiro`
Expected: PASS — every test file in the feature green, including `contas-receber-store.test.ts`, `contas-pagar-store.test.ts`, `conta-pagar-form.test.tsx`, `derivacoes.test.ts`, `labels.test.tsx`, and the new component tests from Tasks 5–6.

- [ ] **Step 7: Run the whole suite and tsc**

Run: `npx vitest run`
Expected: PASS — no regressions anywhere else in the app (in particular, `src/features/dashboard` and any other consumer of `financeiro/derivacoes.ts` or `faturamento/derivacoes.ts` still pass, since Task 4 only added `export` keywords and new functions, never changed existing signatures).

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/features/financeiro/components/financeiro-page.tsx src/features/financeiro/components/contas-pagar-tab.tsx src/features/financeiro/components/financeiro-page.test.tsx
git commit -m "feat: rewrite FinanceiroPage with KPIs, 2-column grid and new cards"
```
