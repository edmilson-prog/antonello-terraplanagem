# PRD-004 — Faturamento ao Fechar OS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar uma OS fechada em faturamento — aplicar preços (PRD-005) às horas/metros apontados (PRD-002/003), gerar rascunho, revisar/ajustar e confirmar (`rascunho → faturado`), com pipeline executado → faturado → recebido*. Só retaguarda.

**Architecture:** Nova feature isolada `src/features/faturamento/` (nunca importada em `/app/*`). Motor de cálculo puro em centavos; store `useSyncExternalStore` (espelha `ordensStore`); rota `/admin/faturamento` com abas **Faturas** (operacional) + **Análise** (dashboard de gráficos atual, extraído); detalhe em `/admin/faturamento/$faturamentoId`.

**Tech Stack:** React 19 + TanStack Start/Router (file-based) + Vite + TypeScript strict + Tailwind v4 + shadcn/ui + Iconify (`@iconify/react`, `lucide:*`) + Vitest.

## Global Constraints

- **Barreira financeira:** `src/features/faturamento/`, `src/mocks/faturamentos.ts` e qualquer valor R$ **NUNCA** são importados/renderizados em `/app/*` (RF-011).
- **TypeScript:** sem `any` (use `unknown`/tipo específico); sem `!` (use narrowing/optional chaining); types **sem prefixo `I`** (consistência com `OrdemServico`/`Apontamento`).
- **Money:** exato, aritmética em **centavos**, 2 casas; exibição via `formatBRL` de `@/features/retaguarda/format`.
- **Numeração:** `FAT-AAAA-NNNN` (espelha `OS-AAAA-NNNN`).
- **Ícones:** Iconify `@iconify/react` (`lucide:*`) para ícones de aplicação; cor/fonte via tokens, nunca hardcode.
- **Estados de tela:** loading / empty / error / success em toda tela de dados (usar `useMockResource` + `DataList`/`EmptyState`).
- **Gate (autoritativo):** `npx tsc --noEmit` EXIT 0 **+** `npm test` (vitest). `npm run lint` = ruído pré-existente de CRLF, **NÃO é gate**.
- **Tarefas de rota:** validar por **SSR smoke** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/<rota>` (dev server já roda na :8082; ele regenera `src/routeTree.gen.ts`). Se `routeTree.gen.ts` aparecer modificado só por CRLF (diff vazio), `git checkout -- src/routeTree.gen.ts`.
- **Commits:** Conventional Commits; cada commit termina com o trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Versão final:** MINOR **0.4.0 → 0.5.0**, codinome **"Invoice"**.

---

## Estrutura de Arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/shared/types/index.ts` (mod) | + `StatusFaturamento`, `TipoItemFaturamento`, `FaturamentoItem`, `Faturamento` |
| `src/features/faturamento/calculo.ts` | Puro: `round2`, `valorItem`, lookups de preço, `gerarItens`, `aplicarHoraTipo`, `calcularValorTotal`, `temPendencia` |
| `src/features/faturamento/numero-faturamento.ts` | `proximoNumeroFAT` |
| `src/features/faturamento/derivacoes.ts` | `faturamentoDaOS`, `osFechadasSemFaturamento`, `resumoPipeline` |
| `src/features/faturamento/faturamentos-store.ts` | Store: `gerarDeOS`, `atualizar`, `confirmar`, `useTodos`, `useFaturamento` |
| `src/features/faturamento/labels.tsx` | `StatusFaturamentoBadge`, `STATUS_FATURAMENTO*` |
| `src/features/faturamento/index.ts` | Barrel |
| `src/features/faturamento/components/faturamento-page.tsx` | Página com abas Faturas/Análise |
| `src/features/faturamento/components/analise-tab.tsx` | Dashboard de gráficos extraído |
| `src/features/faturamento/components/faturas-tab.tsx` | Pipeline + aguardando + lista |
| `src/features/faturamento/components/faturamento-pipeline.tsx` | 3 cartões executado/faturado/recebido |
| `src/features/faturamento/components/aguardando-faturamento.tsx` | OS fechadas sem fatura → Gerar |
| `src/features/faturamento/components/faturas-list.tsx` | Tabela de faturas + filtros |
| `src/features/faturamento/components/faturamento-detalhe.tsx` | Editor (rascunho) / leitura (faturado) |
| `src/features/faturamento/components/faturamento-item-row.tsx` | Linha de item editável |
| `src/routes/admin.faturamento.tsx` (del) | Removido (vira index) |
| `src/routes/admin.faturamento.index.tsx` | Rota da página com abas |
| `src/routes/admin.faturamento.$faturamentoId.tsx` | Rota do detalhe |
| `src/mocks/faturamentos.ts` | ~4 faturamentos coerentes |
| `src/mocks/ordens-servico.ts` (mod) | +os-007..os-010 (fechadas) |
| `src/mocks/apontamentos.ts` (mod) | +ap-007..ap-010 (finalizados) |

---

### Task 1: Contrato de dados + motor de cálculo

**Files:**
- Modify: `src/shared/types/index.ts` (append ao final)
- Create: `src/features/faturamento/calculo.ts`
- Test: `src/features/faturamento/calculo.test.ts`

**Interfaces:**
- Consumes: `Apontamento`, `Equipamento`, `OrdemServico`, `PrecoHoraMaquina`, `PrecoFundacao`, `ModeloCobranca` (existentes em `@/shared/types`); `formatHorimetro` de `@/shared/lib/format`.
- Produces: types `StatusFaturamento`, `TipoItemFaturamento`, `FaturamentoItem`, `Faturamento`; funções `round2(reais: number): number`, `valorItem(qtd: number, unit: number): number`, `precoHoraDoEquipamento(eq: Equipamento, precos: PrecoHoraMaquina[]): PrecoHoraMaquina | null`, `precoFundacaoDoDiametro(mm: number | null, precos: PrecoFundacao[]): PrecoFundacao | null`, `gerarItens(os, apontamentos, equipamentos, precosHM, precosFund): FaturamentoItem[]`, `aplicarHoraTipo(item, eq: Equipamento | undefined, precosHM, tipo: "seca"|"operada"): FaturamentoItem`, `calcularValorTotal(itens: FaturamentoItem[], desconto: number): number`, `temPendencia(fat: { itens: FaturamentoItem[] }): boolean`.

- [ ] **Step 1: Adicionar os types** ao final de `src/shared/types/index.ts`:

```typescript

// Faturamento (PRD-004) — deriva da OS fechada + apontamentos + preços. Só retaguarda;
// NUNCA importado/renderizado em /app/*. "recebido" é estágio do pipeline gerido no PRD-007.
export type StatusFaturamento = "rascunho" | "faturado";
export type TipoItemFaturamento = "hora_maquina" | "por_metro" | "mobilizacao";

export interface FaturamentoItem {
  id: string;
  tipo: TipoItemFaturamento;
  descricao: string; // "Escavadeira 10t — 18 h operada"
  origem_id: string | null; // equipamento_id (hora) / preco_mobilizacao_id (mob.) / null
  hora_tipo: "seca" | "operada" | null; // só hora_maquina
  quantidade: number; // horas, metros ou 1
  valor_unitario: number | null; // null = SEM PREÇO ativo (pendência)
  valor_total: number; // round2(quantidade × valor_unitario); 0 se sem preço
  sem_preco: boolean;
}

export interface Faturamento {
  id: string;
  numero: string; // "FAT-2026-0042"
  os_id: string; // FK → OrdemServico
  cliente_id: string; // FK → Cliente
  modelo_cobranca: ModeloCobranca; // herdado da OS
  itens: FaturamentoItem[];
  desconto: number; // R$ subtraído do subtotal (≥ 0)
  valor_total: number; // soma(itens) − desconto
  observacao: string | null;
  status: StatusFaturamento;
  gerado_em: string; // ISO — rascunho criado
  faturado_em: string | null; // ISO — confirmado
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Escrever o teste falho** em `src/features/faturamento/calculo.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  round2,
  valorItem,
  precoHoraDoEquipamento,
  precoFundacaoDoDiametro,
  gerarItens,
  aplicarHoraTipo,
  calcularValorTotal,
  temPendencia,
} from "@/features/faturamento/calculo";
import { equipamentos } from "@/mocks/equipamentos";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import type { Apontamento, OrdemServico } from "@/shared/types";

const eq = (id: string) => {
  const e = equipamentos.find((x) => x.id === id);
  if (!e) throw new Error(`equipamento ${id} ausente no mock`);
  return e;
};

function apontamentoFinalizado(
  id: string,
  equipamento_id: string,
  os_id: string,
  horas: number,
): Apontamento {
  return {
    id,
    equipamento_id,
    operador_id: "op-001",
    os_id,
    horimetro_inicial: 1000,
    horimetro_final: 1000 + horas,
    horas_trabalhadas: horas,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-20T07:00:00.000Z",
    finalizado_em: "2026-06-20T17:00:00.000Z",
    created_at: "2026-06-20T07:00:00.000Z",
    updated_at: "2026-06-20T17:00:00.000Z",
  };
}

function osHora(id: string): OrdemServico {
  return {
    id,
    numero: "OS-2026-9001",
    cliente_id: "cl-001",
    obra_nome: "Obra teste",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-001",
    observacao: null,
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-20T07:00:00.000Z",
    fechada_em: "2026-06-20T17:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-20T07:00:00.000Z",
    updated_at: "2026-06-20T17:00:00.000Z",
  };
}

function osMetro(id: string, metros: number | null, diametro: number | null): OrdemServico {
  return { ...osHora(id), modelo_cobranca: "por_metro", metragem_executada: metros, diametro_broca_mm: diametro };
}

describe("calculo de faturamento", () => {
  it("round2 e valorItem fazem aritmética exata em 2 casas", () => {
    expect(round2(8.5 * 360)).toBe(3060);
    expect(valorItem(8.5, 360)).toBe(3060);
    expect(valorItem(6.5, 90)).toBe(585);
  });

  it("precoHoraDoEquipamento prioriza equipamento, cai p/ tipo, ignora inativo", () => {
    expect(precoHoraDoEquipamento(eq("eq-001"), precosHoraMaquina)?.id).toBe("phm-001");
    expect(precoHoraDoEquipamento(eq("eq-004"), precosHoraMaquina)?.id).toBe("phm-003"); // por tipo
    expect(precoHoraDoEquipamento(eq("eq-005"), precosHoraMaquina)).toBeNull(); // phm-005 inativo
    expect(precoHoraDoEquipamento(eq("eq-003"), precosHoraMaquina)).toBeNull(); // sem preço
  });

  it("precoFundacaoDoDiametro busca ativo por diâmetro", () => {
    expect(precoFundacaoDoDiametro(300, precosFundacao)?.id).toBe("pf-001");
    expect(precoFundacaoDoDiametro(500, precosFundacao)).toBeNull(); // pf-003 inativo
    expect(precoFundacaoDoDiametro(null, precosFundacao)).toBeNull();
  });

  it("gerarItens agrupa horas por equipamento e aplica operada", () => {
    const os = osHora("os-x");
    const aps = [
      apontamentoFinalizado("a1", "eq-001", "os-x", 12),
      apontamentoFinalizado("a2", "eq-002", "os-x", 10),
    ];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(2);
    expect(itens[0]).toMatchObject({ origem_id: "eq-001", hora_tipo: "operada", quantidade: 12, valor_unitario: 360, valor_total: 4320, sem_preco: false });
    expect(itens[1]).toMatchObject({ origem_id: "eq-002", quantidade: 10, valor_unitario: 290, valor_total: 2900 });
  });

  it("gerarItens soma múltiplos apontamentos do mesmo equipamento", () => {
    const os = osHora("os-y");
    const aps = [
      apontamentoFinalizado("a1", "eq-001", "os-y", 5),
      apontamentoFinalizado("a2", "eq-001", "os-y", 7),
    ];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ quantidade: 12, valor_total: 4320 });
  });

  it("gerarItens marca sem_preco quando não há tarifa ativa", () => {
    const os = osHora("os-z");
    const aps = [apontamentoFinalizado("a1", "eq-005", "os-z", 8)];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens[0]).toMatchObject({ sem_preco: true, valor_unitario: null, valor_total: 0, quantidade: 8 });
  });

  it("gerarItens ignora apontamentos em andamento e de outra OS", () => {
    const os = osHora("os-w");
    const emAndamento: Apontamento = { ...apontamentoFinalizado("a1", "eq-001", "os-w", 9), status: "em_andamento", horimetro_final: null, horas_trabalhadas: null };
    const outraOs = apontamentoFinalizado("a2", "eq-002", "os-outra", 4);
    const itens = gerarItens(os, [emAndamento, outraOs], equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(0);
  });

  it("gerarItens por_metro aplica valor do diâmetro", () => {
    const os = osMetro("os-m", 30, 300);
    const itens = gerarItens(os, [], equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ tipo: "por_metro", quantidade: 30, valor_unitario: 90, valor_total: 2700, sem_preco: false });
  });

  it("aplicarHoraTipo troca operada↔seca recalculando", () => {
    const os = osHora("os-t");
    const [item] = gerarItens(os, [apontamentoFinalizado("a1", "eq-001", "os-t", 10)], equipamentos, precosHoraMaquina, precosFundacao);
    const seca = aplicarHoraTipo(item, eq("eq-001"), precosHoraMaquina, "seca");
    expect(seca).toMatchObject({ hora_tipo: "seca", valor_unitario: 280, valor_total: 2800 });
    expect(seca.descricao).toContain("seca");
  });

  it("calcularValorTotal soma itens e subtrai desconto", () => {
    const os = osHora("os-d");
    const itens = gerarItens(os, [apontamentoFinalizado("a1", "eq-002", "os-d", 18)], equipamentos, precosHoraMaquina, precosFundacao);
    expect(calcularValorTotal(itens, 0)).toBe(5220);
    expect(calcularValorTotal(itens, 220)).toBe(5000);
  });

  it("temPendencia detecta item sem preço", () => {
    expect(temPendencia({ itens: [{ sem_preco: false } as never, { sem_preco: true } as never] })).toBe(true);
    expect(temPendencia({ itens: [{ sem_preco: false } as never] })).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/features/faturamento/calculo.test.ts`
Expected: FAIL — `calculo.ts` não existe.

- [ ] **Step 4: Implementar** `src/features/faturamento/calculo.ts`:

```typescript
import { formatHorimetro } from "@/shared/lib/format";
import type {
  Apontamento,
  Equipamento,
  FaturamentoItem,
  OrdemServico,
  PrecoFundacao,
  PrecoHoraMaquina,
} from "@/shared/types";

// Aritmética monetária em centavos (evita drift de ponto flutuante; RNF-001).
export function round2(reais: number): number {
  return Math.round(reais * 100) / 100;
}

export function valorItem(quantidade: number, valorUnitario: number): number {
  return round2(quantidade * valorUnitario);
}

// Preço hora-máquina: ativo por equipamento específico; senão por tipo; senão null.
export function precoHoraDoEquipamento(
  equipamento: Equipamento,
  precos: PrecoHoraMaquina[],
): PrecoHoraMaquina | null {
  const porEquip = precos.find((p) => p.ativo && p.equipamento_id === equipamento.id);
  if (porEquip) return porEquip;
  const porTipo = precos.find((p) => p.ativo && p.tipo_equipamento === equipamento.tipo);
  return porTipo ?? null;
}

export function precoFundacaoDoDiametro(
  diametroMm: number | null,
  precos: PrecoFundacao[],
): PrecoFundacao | null {
  if (diametroMm == null) return null;
  return precos.find((p) => p.ativo && p.diametro_broca_mm === diametroMm) ?? null;
}

function descricaoHora(nome: string, horas: number, horaTipo: "seca" | "operada"): string {
  return `${nome} — ${formatHorimetro(horas)} ${horaTipo}`;
}

// Monta os itens do faturamento a partir da OS fechada. Default hora = "operada".
export function gerarItens(
  os: OrdemServico,
  apontamentos: Apontamento[],
  equipamentos: Equipamento[],
  precosHM: PrecoHoraMaquina[],
  precosFund: PrecoFundacao[],
): FaturamentoItem[] {
  if (os.modelo_cobranca === "por_metro") {
    const metros = os.metragem_executada ?? 0;
    const preco = precoFundacaoDoDiametro(os.diametro_broca_mm, precosFund);
    const valorUnitario = preco ? preco.valor_metro : null;
    const diametro = os.diametro_broca_mm;
    return [
      {
        id: `${os.id}:metro`,
        tipo: "por_metro",
        descricao: diametro != null ? `Estaca Ø${diametro}mm — ${metros}m` : `Estaca — ${metros}m`,
        origem_id: null,
        hora_tipo: null,
        quantidade: metros,
        valor_unitario: valorUnitario,
        valor_total: valorUnitario != null ? valorItem(metros, valorUnitario) : 0,
        sem_preco: preco === null,
      },
    ];
  }

  const horasPorEquip = new Map<string, number>();
  for (const a of apontamentos) {
    if (a.os_id !== os.id || a.status !== "finalizado") continue;
    horasPorEquip.set(a.equipamento_id, (horasPorEquip.get(a.equipamento_id) ?? 0) + (a.horas_trabalhadas ?? 0));
  }

  const itens: FaturamentoItem[] = [];
  for (const [equipId, horasBrutas] of horasPorEquip) {
    const horas = round2(horasBrutas);
    const equipamento = equipamentos.find((e) => e.id === equipId);
    const nome = equipamento ? equipamento.nome : "Equipamento removido";
    const preco = equipamento ? precoHoraDoEquipamento(equipamento, precosHM) : null;
    const valorUnitario = preco ? preco.valor_hora_operada : null;
    itens.push({
      id: `${os.id}:${equipId}`,
      tipo: "hora_maquina",
      descricao: descricaoHora(nome, horas, "operada"),
      origem_id: equipId,
      hora_tipo: "operada",
      quantidade: horas,
      valor_unitario: valorUnitario,
      valor_total: valorUnitario != null ? valorItem(horas, valorUnitario) : 0,
      sem_preco: preco === null,
    });
  }
  return itens;
}

// Troca seca↔operada de um item hora-máquina, re-buscando o preço pelo equipamento.
export function aplicarHoraTipo(
  item: FaturamentoItem,
  equipamento: Equipamento | undefined,
  precosHM: PrecoHoraMaquina[],
  tipo: "seca" | "operada",
): FaturamentoItem {
  if (item.tipo !== "hora_maquina") return item;
  const preco = equipamento ? precoHoraDoEquipamento(equipamento, precosHM) : null;
  const valorUnitario = preco ? (tipo === "seca" ? preco.valor_hora_seca : preco.valor_hora_operada) : null;
  const nome = item.descricao.split(" — ")[0];
  return {
    ...item,
    hora_tipo: tipo,
    valor_unitario: valorUnitario,
    valor_total: valorUnitario != null ? valorItem(item.quantidade, valorUnitario) : 0,
    sem_preco: preco === null,
    descricao: descricaoHora(nome, item.quantidade, tipo),
  };
}

export function calcularValorTotal(itens: FaturamentoItem[], desconto: number): number {
  const soma = itens.reduce((s, i) => s + i.valor_total, 0);
  return round2(soma - desconto);
}

export function temPendencia(fat: { itens: FaturamentoItem[] }): boolean {
  return fat.itens.some((i) => i.sem_preco);
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/features/faturamento/calculo.test.ts`
Expected: PASS (11 testes).

- [ ] **Step 6: Gate completo**

Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc EXIT 0; toda a suíte verde.

- [ ] **Step 7: Commit**

```bash
git add src/shared/types/index.ts src/features/faturamento/calculo.ts src/features/faturamento/calculo.test.ts
git commit -m "feat: add faturamento types and pure calculation engine"
```

---

### Task 2: Numeração + derivações

**Files:**
- Create: `src/features/faturamento/numero-faturamento.ts`
- Create: `src/features/faturamento/derivacoes.ts`
- Test: `src/features/faturamento/numero-faturamento.test.ts`, `src/features/faturamento/derivacoes.test.ts`

**Interfaces:**
- Consumes: `Faturamento`, `OrdemServico` de `@/shared/types`; `round2` de `@/features/faturamento/calculo`.
- Produces: `proximoNumeroFAT(faturamentos: Pick<Faturamento,"numero">[], ano: number): string`; `faturamentoDaOS(osId: string, faturamentos: Faturamento[]): Faturamento | null`; `osFechadasSemFaturamento(ordens: OrdemServico[], faturamentos: Faturamento[]): OrdemServico[]`; `resumoPipeline(ordens: OrdemServico[], faturamentos: Faturamento[]): { executado: number; faturado: { qtd: number; total: number }; recebido: 0 }`.

- [ ] **Step 1: Teste falho** `src/features/faturamento/numero-faturamento.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { proximoNumeroFAT } from "@/features/faturamento/numero-faturamento";

describe("proximoNumeroFAT", () => {
  it("começa em 0001 quando não há faturas no ano", () => {
    expect(proximoNumeroFAT([], 2026)).toBe("FAT-2026-0001");
  });

  it("incrementa o maior do ano e ignora outros anos", () => {
    const fats = [{ numero: "FAT-2026-0004" }, { numero: "FAT-2025-0099" }, { numero: "FAT-2026-0002" }];
    expect(proximoNumeroFAT(fats, 2026)).toBe("FAT-2026-0005");
  });
});
```

- [ ] **Step 2: Teste falho** `src/features/faturamento/derivacoes.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { faturamentoDaOS, osFechadasSemFaturamento, resumoPipeline } from "@/features/faturamento/derivacoes";
import type { Faturamento, OrdemServico } from "@/shared/types";

function os(id: string, status: OrdemServico["status"]): OrdemServico {
  return {
    id, numero: `OS-2026-${id}`, cliente_id: "cl-001", obra_nome: "x", endereco: null,
    modelo_cobranca: "hora_maquina", status, responsavel_id: null, observacao: null,
    metragem_executada: null, diametro_broca_mm: null, aberta_em: "2026-06-01T00:00:00.000Z",
    fechada_em: status === "fechada" ? "2026-06-02T00:00:00.000Z" : null, pendente_sync: false,
    created_at: "2026-06-01T00:00:00.000Z", updated_at: "2026-06-01T00:00:00.000Z",
  };
}

function fat(id: string, os_id: string, status: Faturamento["status"], valor: number): Faturamento {
  return {
    id, numero: `FAT-2026-${id}`, os_id, cliente_id: "cl-001", modelo_cobranca: "hora_maquina",
    itens: [], desconto: 0, valor_total: valor, observacao: null, status,
    gerado_em: "2026-06-02T00:00:00.000Z", faturado_em: status === "faturado" ? "2026-06-03T00:00:00.000Z" : null,
    created_at: "2026-06-02T00:00:00.000Z", updated_at: "2026-06-02T00:00:00.000Z",
  };
}

const ordens = [os("a", "fechada"), os("b", "fechada"), os("c", "fechada"), os("d", "aberta")];
const fats = [fat("1", "a", "faturado", 5220), fat("2", "b", "rascunho", 0)];

describe("derivacoes de faturamento", () => {
  it("faturamentoDaOS encontra ou retorna null", () => {
    expect(faturamentoDaOS("a", fats)?.id).toBe("1");
    expect(faturamentoDaOS("c", fats)).toBeNull();
  });

  it("osFechadasSemFaturamento traz só fechadas sem fatura nenhuma", () => {
    const r = osFechadasSemFaturamento(ordens, fats);
    expect(r.map((o) => o.id)).toEqual(["c"]); // a=faturado, b=rascunho, d=aberta
  });

  it("resumoPipeline: executado = fechadas não confirmadas; faturado = qtd+total", () => {
    const r = resumoPipeline(ordens, fats);
    expect(r.executado).toBe(2); // b (rascunho) + c (sem fatura); a é faturado
    expect(r.faturado).toEqual({ qtd: 1, total: 5220 });
    expect(r.recebido).toBe(0);
  });
});
```

- [ ] **Step 3: Rodar e confirmar falha**

Run: `npx vitest run src/features/faturamento/numero-faturamento.test.ts src/features/faturamento/derivacoes.test.ts`
Expected: FAIL — módulos não existem.

- [ ] **Step 4: Implementar** `src/features/faturamento/numero-faturamento.ts`:

```typescript
import type { Faturamento } from "@/shared/types";

// Próximo número no formato FAT-AAAA-NNNN (sequencial por ano).
export function proximoNumeroFAT(faturamentos: Pick<Faturamento, "numero">[], ano: number): string {
  const prefixo = `FAT-${ano}-`;
  const maior = faturamentos
    .map((f) => f.numero)
    .filter((n) => n.startsWith(prefixo))
    .map((n) => Number.parseInt(n.slice(prefixo.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => (n > max ? n : max), 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}
```

- [ ] **Step 5: Implementar** `src/features/faturamento/derivacoes.ts`:

```typescript
import { round2 } from "@/features/faturamento/calculo";
import type { Faturamento, OrdemServico } from "@/shared/types";

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
// faturado = faturas confirmadas; recebido = 0 (placeholder PRD-007).
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

- [ ] **Step 6: Rodar e confirmar que passa + gate**

Run: `npx vitest run src/features/faturamento/numero-faturamento.test.ts src/features/faturamento/derivacoes.test.ts && npx tsc --noEmit`
Expected: PASS; tsc EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/faturamento/numero-faturamento.ts src/features/faturamento/derivacoes.ts src/features/faturamento/numero-faturamento.test.ts src/features/faturamento/derivacoes.test.ts
git commit -m "feat: add faturamento numbering and pipeline derivations"
```

---

### Task 3: Store + labels

**Files:**
- Create: `src/features/faturamento/faturamentos-store.ts`
- Create: `src/features/faturamento/labels.tsx`
- Test: `src/features/faturamento/faturamentos-store.test.ts`

> **Nota:** este task IMPORTA `@/mocks/faturamentos`, criado no Task 4. Para manter o `tsc` verde, crie **primeiro** um stub mínimo do mock (Step 1); o Task 4 o substitui pelo conteúdo real. (Se o Task 4 já tiver rodado, pule o Step 1.)

**Interfaces:**
- Consumes: `gerarItens`, `calcularValorTotal` de `calculo`; `proximoNumeroFAT` de `numero-faturamento`; types de `@/shared/types`.
- Produces: `criarFaturamentosStore(inicial: Faturamento[])` e singleton `faturamentosStore` com `{ listar, obter, gerarDeOS, atualizar, confirmar, useTodos, useFaturamento }`; `ResultadoConfirmar`; `PatchFaturamento`. Em `labels.tsx`: `STATUS_FATURAMENTO_LABEL`, `STATUS_FATURAMENTO`, `StatusFaturamentoBadge`.

- [ ] **Step 1: Stub do mock** `src/mocks/faturamentos.ts` (substituído no Task 4):

```typescript
import type { Faturamento } from "@/shared/types";

export const faturamentos: Faturamento[] = [];
```

- [ ] **Step 2: Teste falho** `src/features/faturamento/faturamentos-store.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { criarFaturamentosStore } from "@/features/faturamento/faturamentos-store";
import { equipamentos } from "@/mocks/equipamentos";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import type { Apontamento, OrdemServico } from "@/shared/types";

const os: OrdemServico = {
  id: "os-test", numero: "OS-2026-9001", cliente_id: "cl-001", obra_nome: "x", endereco: null,
  modelo_cobranca: "hora_maquina", status: "fechada", responsavel_id: "op-001", observacao: null,
  metragem_executada: null, diametro_broca_mm: null, aberta_em: "2026-06-20T07:00:00.000Z",
  fechada_em: "2026-06-20T17:00:00.000Z", pendente_sync: false,
  created_at: "2026-06-20T07:00:00.000Z", updated_at: "2026-06-20T17:00:00.000Z",
};
const aps: Apontamento[] = [
  {
    id: "a1", equipamento_id: "eq-002", operador_id: "op-001", os_id: "os-test",
    horimetro_inicial: 100, horimetro_final: 118, horas_trabalhadas: 18, foto_inicial_url: null,
    foto_final_url: null, observacao: null, status: "finalizado", pendente_sync: false,
    iniciado_em: "2026-06-20T07:00:00.000Z", finalizado_em: "2026-06-20T17:00:00.000Z",
    created_at: "2026-06-20T07:00:00.000Z", updated_at: "2026-06-20T17:00:00.000Z",
  },
];

describe("faturamentosStore", () => {
  it("gerarDeOS cria rascunho numerado com itens e total", () => {
    const store = criarFaturamentosStore([]);
    const fat = store.gerarDeOS(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(fat.status).toBe("rascunho");
    expect(fat.numero).toMatch(/^FAT-\d{4}-0001$/);
    expect(fat.itens).toHaveLength(1);
    expect(fat.valor_total).toBe(5220);
    expect(store.obter(fat.id)?.os_id).toBe("os-test");
  });

  it("atualizar recalcula valor_total com desconto", () => {
    const store = criarFaturamentosStore([]);
    const fat = store.gerarDeOS(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    store.atualizar(fat.id, { desconto: 220 });
    expect(store.obter(fat.id)?.valor_total).toBe(5000);
  });

  it("confirmar muda para faturado; segunda vez falha", () => {
    const store = criarFaturamentosStore([]);
    const fat = store.gerarDeOS(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    const r1 = store.confirmar(fat.id);
    expect(r1.ok).toBe(true);
    expect(store.obter(fat.id)?.status).toBe("faturado");
    expect(store.obter(fat.id)?.faturado_em).not.toBeNull();
    const r2 = store.confirmar(fat.id);
    expect(r2.ok).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar e confirmar falha**

Run: `npx vitest run src/features/faturamento/faturamentos-store.test.ts`
Expected: FAIL — store não existe.

- [ ] **Step 4: Implementar** `src/features/faturamento/faturamentos-store.ts`:

```typescript
import { useSyncExternalStore } from "react";
import { faturamentos as seed } from "@/mocks/faturamentos";
import { calcularValorTotal, gerarItens } from "@/features/faturamento/calculo";
import { proximoNumeroFAT } from "@/features/faturamento/numero-faturamento";
import type {
  Apontamento,
  Equipamento,
  Faturamento,
  PrecoFundacao,
  PrecoHoraMaquina,
} from "@/shared/types";

export type ResultadoConfirmar =
  | { ok: true; faturamento: Faturamento }
  | { ok: false; motivo: string };

export type PatchFaturamento = Partial<Pick<Faturamento, "itens" | "desconto" | "observacao">>;

export function criarFaturamentosStore(inicial: Faturamento[]) {
  let itens: Faturamento[] = inicial.map((f) => ({ ...f }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((f) => f.id === id);

  function gerarDeOS(
    os: { id: string; cliente_id: string; modelo_cobranca: Faturamento["modelo_cobranca"]; metragem_executada: number | null; diametro_broca_mm: number | null },
    apontamentos: Apontamento[],
    equipamentos: Equipamento[],
    precosHM: PrecoHoraMaquina[],
    precosFund: PrecoFundacao[],
  ): Faturamento {
    const agora = new Date().toISOString();
    const ano = new Date(agora).getFullYear();
    const osCompleta = {
      id: os.id,
      cliente_id: os.cliente_id,
      modelo_cobranca: os.modelo_cobranca,
      metragem_executada: os.metragem_executada,
      diametro_broca_mm: os.diametro_broca_mm,
    };
    const itensFat = gerarItens(
      osCompleta as Parameters<typeof gerarItens>[0],
      apontamentos,
      equipamentos,
      precosHM,
      precosFund,
    );
    const nova: Faturamento = {
      id: crypto.randomUUID(),
      numero: proximoNumeroFAT(itens, ano),
      os_id: os.id,
      cliente_id: os.cliente_id,
      modelo_cobranca: os.modelo_cobranca,
      itens: itensFat,
      desconto: 0,
      valor_total: calcularValorTotal(itensFat, 0),
      observacao: null,
      status: "rascunho",
      gerado_em: agora,
      faturado_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [nova, ...itens];
    notificar();
    return nova;
  }

  function atualizar(id: string, patch: PatchFaturamento) {
    itens = itens.map((f) => {
      if (f.id !== id) return f;
      const next: Faturamento = { ...f, ...patch, updated_at: new Date().toISOString() };
      next.valor_total = calcularValorTotal(next.itens, next.desconto);
      return next;
    });
    notificar();
  }

  function confirmar(id: string): ResultadoConfirmar {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Faturamento não encontrado." };
    if (atual.status === "faturado") return { ok: false, motivo: "Este faturamento já foi confirmado." };
    const agora = new Date().toISOString();
    const confirmado: Faturamento = { ...atual, status: "faturado", faturado_em: agora, updated_at: agora };
    itens = itens.map((f) => (f.id === id ? confirmado : f));
    notificar();
    return { ok: true, faturamento: confirmado };
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useFaturamento = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((f) => f.id === id),
      () => itens.find((f) => f.id === id),
    );

  return { listar, obter, gerarDeOS, atualizar, confirmar, useTodos, useFaturamento };
}

export const faturamentosStore = criarFaturamentosStore(seed);
```

> **Nota de tipos:** `gerarDeOS` aceita um objeto OS estrutural (apenas os campos que `gerarItens` lê) para evitar exigir o `OrdemServico` inteiro do chamador quando só há os campos relevantes. O cast `as Parameters<typeof gerarItens>[0]` é seguro porque `gerarItens` lê somente `id`, `modelo_cobranca`, `metragem_executada`, `diametro_broca_mm`. **Sem `any`.**

- [ ] **Step 5: Implementar** `src/features/faturamento/labels.tsx`:

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { StatusFaturamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_FATURAMENTO_LABEL: Record<StatusFaturamento, string> = {
  rascunho: "Rascunho",
  faturado: "Faturado",
};

export const STATUS_FATURAMENTO: StatusFaturamento[] = ["rascunho", "faturado"];

const STATUS_CLASSE: Record<StatusFaturamento, string> = {
  rascunho: "bg-steel/20 text-foreground border-steel/40",
  faturado: "bg-primary/20 text-foreground border-primary/50",
};

export function StatusFaturamentoBadge({
  status,
  className,
}: {
  status: StatusFaturamento;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_FATURAMENTO_LABEL[status]}
    </span>
  );
}
```

- [ ] **Step 6: Rodar teste + gate**

Run: `npx vitest run src/features/faturamento/faturamentos-store.test.ts && npx tsc --noEmit`
Expected: PASS (3 testes); tsc EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/faturamento/faturamentos-store.ts src/features/faturamento/labels.tsx src/features/faturamento/faturamentos-store.test.ts src/mocks/faturamentos.ts
git commit -m "feat: add faturamentos store and status labels"
```

---

### Task 4: Mocks coerentes

**Files:**
- Modify: `src/mocks/ordens-servico.ts` (append os-007..os-010 + atualizar comentário do topo)
- Modify: `src/mocks/apontamentos.ts` (append ap-007..ap-010 + atualizar comentário do topo)
- Create (substitui o stub): `src/mocks/faturamentos.ts`
- Test: `src/mocks/faturamentos.test.ts`

**Interfaces:**
- Consumes: types de `@/shared/types`; `calcularHoras` de `@/features/apontamento/calcular-horas`; `calcularValorTotal`, `valorItem` de `@/features/faturamento/calculo` (no teste).
- Produces: `faturamentos: Faturamento[]` (fat-001..fat-004); OS os-007..os-010 fechadas; apontamentos ap-007..ap-010 finalizados.

- [ ] **Step 1: Append em `src/mocks/ordens-servico.ts`** — adicionar estas 4 OS **antes** do `]` que fecha o array `ordensServico` (após o objeto `os-006`):

```typescript
  {
    id: "os-007",
    numero: "OS-2026-0045",
    cliente_id: "cl-001",
    obra_nome: "Terraplenagem pátio industrial — fase 2",
    endereco: "Rod. BR-376, km 210",
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-001",
    observacao: "Duas frentes: escavadeira grande + escavadeira 10t.",
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-18T07:00:00.000Z",
    fechada_em: "2026-06-19T17:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-18T07:00:00.000Z",
    updated_at: "2026-06-19T17:00:00.000Z",
  },
  {
    id: "os-008",
    numero: "OS-2026-0046",
    cliente_id: "cl-002",
    obra_nome: "Remoção de entulho — obra paralisada",
    endereco: "Av. Brasil, 2200, Jandaia do Sul",
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-001",
    observacao: "Caminhão caçamba sem tarifa ativa cadastrada.",
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-17T07:00:00.000Z",
    fechada_em: "2026-06-17T16:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-17T07:00:00.000Z",
    updated_at: "2026-06-17T16:00:00.000Z",
  },
  {
    id: "os-009",
    numero: "OS-2026-0047",
    cliente_id: "cl-004",
    obra_nome: "Estaqueamento bloco C",
    endereco: "Rua XV de Novembro, 980, Apucarana",
    modelo_cobranca: "por_metro",
    status: "fechada",
    responsavel_id: "op-002",
    observacao: "30 metros em broca Ø300mm.",
    metragem_executada: 30,
    diametro_broca_mm: 300,
    aberta_em: "2026-06-16T08:00:00.000Z",
    fechada_em: "2026-06-16T17:30:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-16T08:00:00.000Z",
    updated_at: "2026-06-16T17:30:00.000Z",
  },
  {
    id: "os-010",
    numero: "OS-2026-0048",
    cliente_id: "cl-001",
    obra_nome: "Nivelamento acesso — galpão",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-001",
    observacao: null,
    metragem_executada: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-15T07:30:00.000Z",
    fechada_em: "2026-06-15T15:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-15T07:30:00.000Z",
    updated_at: "2026-06-15T15:00:00.000Z",
  },
```

Atualizar o comentário do topo do arquivo (linha ~2-6) para mencionar as novas OS, anexando ao final do bloco de comentário existente:

```typescript
// os-007..os-010 fechadas para o PRD-004 (faturamento): os-007 multi-equipamento,
// os-008 equip. sem preço ativo, os-009 por_metro fechada, os-010 fechada sem fatura.
```

- [ ] **Step 2: Append em `src/mocks/apontamentos.ts`** — adicionar estes 4 apontamentos **antes** do `]` que fecha o array `apontamentos` (após o objeto `ap-006`):

```typescript
  {
    id: "ap-007",
    equipamento_id: "eq-001",
    operador_id: "op-001",
    os_id: "os-007",
    horimetro_inicial: 8500,
    horimetro_final: 8512,
    horas_trabalhadas: 12,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Escavação frente A.",
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-18T07:00:00.000Z",
    finalizado_em: "2026-06-18T17:00:00.000Z",
    created_at: "2026-06-18T07:00:00.000Z",
    updated_at: "2026-06-18T17:00:00.000Z",
  },
  {
    id: "ap-008",
    equipamento_id: "eq-002",
    operador_id: "op-001",
    os_id: "os-007",
    horimetro_inicial: 5200,
    horimetro_final: 5210,
    horas_trabalhadas: 10,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Escavação frente B.",
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-19T07:00:00.000Z",
    finalizado_em: "2026-06-19T17:00:00.000Z",
    created_at: "2026-06-19T07:00:00.000Z",
    updated_at: "2026-06-19T17:00:00.000Z",
  },
  {
    id: "ap-009",
    equipamento_id: "eq-005",
    operador_id: "op-001",
    os_id: "os-008",
    horimetro_inicial: 13000,
    horimetro_final: 13008,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Transporte de entulho.",
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-17T07:00:00.000Z",
    finalizado_em: "2026-06-17T15:00:00.000Z",
    created_at: "2026-06-17T07:00:00.000Z",
    updated_at: "2026-06-17T15:00:00.000Z",
  },
  {
    id: "ap-010",
    equipamento_id: "eq-006",
    operador_id: "op-001",
    os_id: "os-010",
    horimetro_inicial: 4300,
    horimetro_final: 4307,
    horas_trabalhadas: 7,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-15T07:30:00.000Z",
    finalizado_em: "2026-06-15T15:00:00.000Z",
    created_at: "2026-06-15T07:30:00.000Z",
    updated_at: "2026-06-15T15:00:00.000Z",
  },
```

- [ ] **Step 3: Escrever** `src/mocks/faturamentos.ts` (substitui o stub do Task 3):

```typescript
import type { Faturamento } from "@/shared/types";

// Faturamentos derivados das OS fechadas. Valores em BRL — só a Retaguarda consome.
// Coerência: quantidade/valor batem com apontamentos (PRD-002/003) × preços (PRD-005).
// Edge cases: fat-001 single, fat-002 multi-equip + mobilização, fat-003 item sem preço,
// fat-004 por metro. (os-010 fica SEM fatura → "Aguardando faturamento".)
export const faturamentos: Faturamento[] = [
  {
    id: "fat-001",
    numero: "FAT-2026-0001",
    os_id: "os-003",
    cliente_id: "cl-003",
    modelo_cobranca: "hora_maquina",
    itens: [
      {
        id: "fat-001:eq-002",
        tipo: "hora_maquina",
        descricao: "Escavadeira 10t — 18 h operada",
        origem_id: "eq-002",
        hora_tipo: "operada",
        quantidade: 18,
        valor_unitario: 290,
        valor_total: 5220,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 5220,
    observacao: null,
    status: "faturado",
    gerado_em: "2026-06-23T18:00:00.000Z",
    faturado_em: "2026-06-24T09:00:00.000Z",
    created_at: "2026-06-23T18:00:00.000Z",
    updated_at: "2026-06-24T09:00:00.000Z",
  },
  {
    id: "fat-002",
    numero: "FAT-2026-0002",
    os_id: "os-007",
    cliente_id: "cl-001",
    modelo_cobranca: "hora_maquina",
    itens: [
      {
        id: "fat-002:eq-001",
        tipo: "hora_maquina",
        descricao: "Escavadeira Hidráulica Caterpillar 320D — 12 h operada",
        origem_id: "eq-001",
        hora_tipo: "operada",
        quantidade: 12,
        valor_unitario: 360,
        valor_total: 4320,
        sem_preco: false,
      },
      {
        id: "fat-002:eq-002",
        tipo: "hora_maquina",
        descricao: "Escavadeira 10t — 10 h operada",
        origem_id: "eq-002",
        hora_tipo: "operada",
        quantidade: 10,
        valor_unitario: 290,
        valor_total: 2900,
        sem_preco: false,
      },
      {
        id: "fat-002:mob",
        tipo: "mobilizacao",
        descricao: "Mobilização e desmobilização de escavadeira até 50 km do pátio",
        origem_id: "pm-001",
        hora_tipo: null,
        quantidade: 1,
        valor_unitario: 850,
        valor_total: 850,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 8070,
    observacao: "Aguardando conferência do escritório.",
    status: "rascunho",
    gerado_em: "2026-06-19T18:00:00.000Z",
    faturado_em: null,
    created_at: "2026-06-19T18:00:00.000Z",
    updated_at: "2026-06-19T18:00:00.000Z",
  },
  {
    id: "fat-003",
    numero: "FAT-2026-0003",
    os_id: "os-008",
    cliente_id: "cl-002",
    modelo_cobranca: "hora_maquina",
    itens: [
      {
        id: "fat-003:eq-005",
        tipo: "hora_maquina",
        descricao: "Caminhão Caçamba Basculante — 8 h operada",
        origem_id: "eq-005",
        hora_tipo: "operada",
        quantidade: 8,
        valor_unitario: null,
        valor_total: 0,
        sem_preco: true,
      },
    ],
    desconto: 0,
    valor_total: 0,
    observacao: "Pendente: cadastrar tarifa do caminhão caçamba.",
    status: "rascunho",
    gerado_em: "2026-06-17T17:00:00.000Z",
    faturado_em: null,
    created_at: "2026-06-17T17:00:00.000Z",
    updated_at: "2026-06-17T17:00:00.000Z",
  },
  {
    id: "fat-004",
    numero: "FAT-2026-0004",
    os_id: "os-009",
    cliente_id: "cl-004",
    modelo_cobranca: "por_metro",
    itens: [
      {
        id: "fat-004:metro",
        tipo: "por_metro",
        descricao: "Estaca Ø300mm — 30m",
        origem_id: null,
        hora_tipo: null,
        quantidade: 30,
        valor_unitario: 90,
        valor_total: 2700,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 2700,
    observacao: null,
    status: "faturado",
    gerado_em: "2026-06-16T18:00:00.000Z",
    faturado_em: "2026-06-17T08:30:00.000Z",
    created_at: "2026-06-16T18:00:00.000Z",
    updated_at: "2026-06-17T08:30:00.000Z",
  },
];
```

- [ ] **Step 4: Teste falho** `src/mocks/faturamentos.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { faturamentos } from "@/mocks/faturamentos";
import { ordensServico } from "@/mocks/ordens-servico";
import { clientes } from "@/mocks/clientes";
import { apontamentos } from "@/mocks/apontamentos";
import { calcularValorTotal, valorItem } from "@/features/faturamento/calculo";

describe("mock de faturamentos", () => {
  it("referencia OS e clientes existentes", () => {
    const osIds = new Set(ordensServico.map((o) => o.id));
    const clienteIds = new Set(clientes.map((c) => c.id));
    for (const f of faturamentos) {
      expect(osIds.has(f.os_id)).toBe(true);
      expect(clienteIds.has(f.cliente_id)).toBe(true);
    }
  });

  it("toda OS de origem está fechada", () => {
    for (const f of faturamentos) {
      const os = ordensServico.find((o) => o.id === f.os_id);
      expect(os?.status).toBe("fechada");
    }
  });

  it("números únicos no formato FAT-AAAA-NNNN", () => {
    const numeros = faturamentos.map((f) => f.numero);
    expect(new Set(numeros).size).toBe(numeros.length);
    for (const n of numeros) expect(n).toMatch(/^FAT-\d{4}-\d{4}$/);
  });

  it("valor_total bate com calcularValorTotal(itens, desconto)", () => {
    for (const f of faturamentos) {
      expect(f.valor_total).toBe(calcularValorTotal(f.itens, f.desconto));
    }
  });

  it("itens com preço: valor_total = quantidade × valor_unitario; sem preço: total 0", () => {
    for (const f of faturamentos) {
      for (const item of f.itens) {
        if (item.sem_preco) {
          expect(item.valor_unitario).toBeNull();
          expect(item.valor_total).toBe(0);
        } else {
          expect(item.valor_unitario).not.toBeNull();
          if (item.valor_unitario != null) {
            expect(item.valor_total).toBe(valorItem(item.quantidade, item.valor_unitario));
          }
        }
      }
    }
  });

  it("itens hora_maquina batem com a soma de horas dos apontamentos da OS", () => {
    for (const f of faturamentos) {
      for (const item of f.itens) {
        if (item.tipo !== "hora_maquina" || item.origem_id == null) continue;
        const horas = apontamentos
          .filter((a) => a.os_id === f.os_id && a.equipamento_id === item.origem_id && a.status === "finalizado")
          .reduce((s, a) => s + (a.horas_trabalhadas ?? 0), 0);
        expect(item.quantidade).toBe(horas);
      }
    }
  });

  it("cobre edge cases: rascunho, faturado, mobilização, sem preço, por_metro", () => {
    expect(faturamentos.some((f) => f.status === "rascunho")).toBe(true);
    expect(faturamentos.some((f) => f.status === "faturado")).toBe(true);
    expect(faturamentos.some((f) => f.itens.some((i) => i.tipo === "mobilizacao"))).toBe(true);
    expect(faturamentos.some((f) => f.itens.some((i) => i.sem_preco))).toBe(true);
    expect(faturamentos.some((f) => f.modelo_cobranca === "por_metro")).toBe(true);
  });
});
```

- [ ] **Step 5: Rodar a suíte inteira** (verifica também que os testes de mock pré-existentes continuam verdes com os appends)

Run: `npx vitest run`
Expected: PASS — incluindo `faturamentos.test.ts` (7), `ordens-servico.test.ts`, `apontamentos.test.ts`.

> Se `ordens-servico.test.ts` ou `apontamentos.test.ts` falhar, foi erro de digitação no append (número de OS duplicado, `horas_trabalhadas` ≠ `final − inicial`, ou `cliente_id`/`responsavel_id` inexistente). Corrija o dado — **não** afrouxe o teste.

- [ ] **Step 6: Gate**

Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc EXIT 0; tudo verde.

- [ ] **Step 7: Commit**

```bash
git add src/mocks/ordens-servico.ts src/mocks/apontamentos.ts src/mocks/faturamentos.ts src/mocks/faturamentos.test.ts
git commit -m "feat: add coherent faturamento mocks and closed OS source data"
```

---

### Task 5: Reestruturação de rota — abas Faturas/Análise

**Files:**
- Delete: `src/routes/admin.faturamento.tsx`
- Create: `src/routes/admin.faturamento.index.tsx`
- Create: `src/features/faturamento/components/faturamento-page.tsx`
- Create: `src/features/faturamento/components/analise-tab.tsx`
- Create: `src/features/faturamento/components/faturas-tab.tsx` (placeholder; preenchido no Task 7)
- Create: `src/features/faturamento/index.ts` (barrel)

**Interfaces:**
- Consumes: `Tabs/TabsList/TabsTrigger/TabsContent` de `@/components/ui/tabs`; `PageHeader`; `EmptyState`; o conteúdo do dashboard atual (mover de `admin.faturamento.tsx`).
- Produces: `FaturamentoPage` (default da aba **Faturas**), `AnaliseTab`, `FaturasTab` (placeholder); barrel exporta `FaturamentoPage`.

- [ ] **Step 1: Criar** `src/features/faturamento/components/analise-tab.tsx` — mover **todo** o conteúdo de visualização do antigo `src/routes/admin.faturamento.tsx`, com 2 ajustes: (a) renomear o componente para `AnaliseTab` e **remover** o `createFileRoute`/`Route`; (b) remover o `<PageHeader>` (a página já tem um) e mover o botão "Exportar PDF" para o canto superior direito da seção de período:

```tsx
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp, Clock, Receipt, CalendarRange } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, numero } from "@/features/retaguarda/format";
import { exportarFaturamentoPdf } from "@/features/retaguarda/export-faturamento-pdf";
import {
  faturamentoMensal,
  faturamentoPorEquipamento,
  faturamentoPorCliente,
} from "@/mocks/faturamento";
import { cn } from "@/lib/utils";

const CORES = ["#FFB300", "#A2622F", "#717A82", "#C07B43", "#2C2719"];

type PeriodoPreset = "3m" | "6m" | "ytd" | "custom";

const MESES_ORDENADOS = [...faturamentoMensal].sort((a, b) => a.mes.localeCompare(b.mes));
const PRIMEIRO_MES = MESES_ORDENADOS[0]?.mes ?? "";
const ULTIMO_MES = MESES_ORDENADOS[MESES_ORDENADOS.length - 1]?.mes ?? "";

function rangeDePreset(preset: PeriodoPreset): { de: string; ate: string } {
  if (preset === "custom") return { de: PRIMEIRO_MES, ate: ULTIMO_MES };
  if (preset === "ytd") {
    const ano = ULTIMO_MES.slice(0, 4);
    return { de: `${ano}-01`, ate: ULTIMO_MES };
  }
  const n = preset === "3m" ? 3 : 6;
  const fim = MESES_ORDENADOS.length - 1;
  const inicio = Math.max(0, fim - n + 1);
  return { de: MESES_ORDENADOS[inicio].mes, ate: MESES_ORDENADOS[fim].mes };
}

export function AnaliseTab() {
  const [preset, setPreset] = useState<PeriodoPreset>("6m");
  const [{ de, ate }, setRange] = useState(() => rangeDePreset("6m"));

  const aplicarPreset = (p: PeriodoPreset) => {
    setPreset(p);
    if (p !== "custom") setRange(rangeDePreset(p));
  };

  const mesesFiltrados = useMemo(
    () => MESES_ORDENADOS.filter((m) => m.mes >= de && m.mes <= ate),
    [de, ate],
  );

  const totalHorasPeriodo = mesesFiltrados.reduce((s, m) => s + m.horas_faturadas, 0);
  const totalValorPeriodo = mesesFiltrados.reduce((s, m) => s + m.valor, 0);
  const totalHorasGeral = MESES_ORDENADOS.reduce((s, m) => s + m.horas_faturadas, 0);
  const totalValorGeral = MESES_ORDENADOS.reduce((s, m) => s + m.valor, 0);
  const fatorHoras = totalHorasGeral > 0 ? totalHorasPeriodo / totalHorasGeral : 0;
  const fatorValor = totalValorGeral > 0 ? totalValorPeriodo / totalValorGeral : 0;
  const ticketMedio = totalHorasPeriodo > 0 ? totalValorPeriodo / totalHorasPeriodo : 0;

  const equipamentosFiltrados = useMemo(
    () =>
      faturamentoPorEquipamento
        .map((e) => ({
          ...e,
          horas: Math.round(e.horas * fatorHoras),
          valor: Math.round(e.valor * fatorValor),
        }))
        .filter((e) => e.horas > 0 || e.valor > 0),
    [fatorHoras, fatorValor],
  );

  const clientesFiltrados = useMemo(
    () =>
      faturamentoPorCliente
        .map((c) => ({ ...c, valor: Math.round(c.valor * fatorValor) }))
        .filter((c) => c.valor > 0),
    [fatorValor],
  );

  const semDados = mesesFiltrados.length === 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <CalendarRange className="h-4 w-4" />
            Período
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "3m", label: "Últimos 3 meses" },
                { id: "6m", label: "Últimos 6 meses" },
                { id: "ytd", label: "Ano atual" },
                { id: "custom", label: "Personalizado" },
              ] as { id: PeriodoPreset; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => aplicarPreset(opt.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  preset === opt.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-mono uppercase text-foreground-faint">De</Label>
              <SeletorMes
                valor={de}
                aoMudar={(v) => {
                  setPreset("custom");
                  setRange((r) => ({ de: v, ate: v > r.ate ? v : r.ate }));
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-mono uppercase text-foreground-faint">Até</Label>
              <SeletorMes
                valor={ate}
                aoMudar={(v) => {
                  setPreset("custom");
                  setRange((r) => ({ de: v < r.de ? v : r.de, ate: v }));
                }}
              />
            </div>
            <Button
              onClick={exportarFaturamentoPdf}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi rotulo="Faturamento total" valor={brl.format(totalValorPeriodo)} icone={Receipt} />
        <Kpi rotulo="Horas faturadas" valor={`${numero.format(totalHorasPeriodo)} h`} icone={Clock} />
        <Kpi rotulo="Ticket médio / hora" valor={brl.format(ticketMedio)} icone={TrendingUp} />
      </div>

      {semDados ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Sem dados no período selecionado.
        </div>
      ) : (
        <>
          <Card titulo="Faturamento mensal" descricao="Valor faturado por mês (R$)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mesesFiltrados} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="rotulo" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-card-foreground)",
                  }}
                  formatter={(v: number) => brl.format(v)}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card titulo="Horas faturadas por equipamento" descricao="Horas trabalhadas no período">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={equipamentosFiltrados}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="equipamento_nome"
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-card-foreground)",
                    }}
                    formatter={(v: number) => `${numero.format(v)} h`}
                  />
                  <Bar dataKey="horas" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card titulo="Faturamento por cliente" descricao="Participação no faturamento do período">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={clientesFiltrados}
                    dataKey="valor"
                    nameKey="cliente_nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={2}
                  >
                    {clientesFiltrados.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} stroke="var(--color-card)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-card-foreground)",
                    }}
                    formatter={(v: number) => brl.format(v)}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card titulo="Detalhamento mensal" descricao="Horas e valores por mês">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                    <th className="py-2 pr-4">Mês</th>
                    <th className="py-2 pr-4">Horas faturadas</th>
                    <th className="py-2 pr-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {mesesFiltrados.map((m) => (
                    <tr key={m.mes} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{m.rotulo}</td>
                      <td className="py-2 pr-4 font-mono">{numero.format(m.horas_faturadas)} h</td>
                      <td className="py-2 pr-4 text-right font-mono font-semibold">
                        {brl.format(m.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="py-2 pr-4">Total</td>
                    <td className="py-2 pr-4 font-mono">{numero.format(totalHorasPeriodo)} h</td>
                    <td className="py-2 pr-4 text-right font-mono">{brl.format(totalValorPeriodo)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function SeletorMes({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  return (
    <Select value={valor} onValueChange={aoMudar}>
      <SelectTrigger className="h-9 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MESES_ORDENADOS.map((m) => (
          <SelectItem key={m.mes} value={m.mes}>
            {m.rotulo} / {m.mes.slice(0, 4)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Kpi({ rotulo, valor, icone: Icone }: { rotulo: string; valor: string; icone: LucideIcon }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
          {rotulo}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icone className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-card-foreground">{valor}</div>
    </div>
  );
}

function Card({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">{titulo}</h2>
        {descricao ? <p className="text-xs text-muted-foreground">{descricao}</p> : null}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Criar** placeholder `src/features/faturamento/components/faturas-tab.tsx` (preenchido no Task 7):

```tsx
import { EmptyState } from "@/shared/components/empty-state";

export function FaturasTab() {
  return (
    <EmptyState
      icon="lucide:receipt"
      titulo="Em breve"
      descricao="A lista de faturas e o pipeline aparecerão aqui."
    />
  );
}
```

- [ ] **Step 3: Criar** `src/features/faturamento/components/faturamento-page.tsx`:

```tsx
import { PageHeader } from "@/shared/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaturasTab } from "@/features/faturamento/components/faturas-tab";
import { AnaliseTab } from "@/features/faturamento/components/analise-tab";

export function FaturamentoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Faturamento"
        descricao="Gere e confirme as faturas das OS fechadas e acompanhe o consolidado."
      />
      <Tabs defaultValue="faturas">
        <TabsList>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>
        <TabsContent value="faturas" className="mt-6">
          <FaturasTab />
        </TabsContent>
        <TabsContent value="analise" className="mt-6">
          <AnaliseTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 4: Criar** barrel `src/features/faturamento/index.ts`:

```typescript
export { FaturamentoPage } from "@/features/faturamento/components/faturamento-page";
```

- [ ] **Step 5: Deletar** o route antigo e **criar** o novo index route.

```bash
git rm src/routes/admin.faturamento.tsx
```

Criar `src/routes/admin.faturamento.index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { FaturamentoPage } from "@/features/faturamento";

export const Route = createFileRoute("/admin/faturamento/")({
  head: () => ({
    meta: [
      { title: "Faturamento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FaturamentoPage,
});
```

- [ ] **Step 6: Gate + SSR smoke**

Run: `npx tsc --noEmit`
Expected: EXIT 0. (O dev server na :8082 regenera `src/routeTree.gen.ts`; aguarde ~2s.)

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8082/admin/faturamento`
Expected: `200`. (Abrir a aba Análise deve mostrar os gráficos; Faturas mostra o placeholder.)

Se `git status` mostrar `src/routeTree.gen.ts` com `git diff` vazio (só CRLF): `git checkout -- src/routeTree.gen.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/features/faturamento/components/faturamento-page.tsx src/features/faturamento/components/analise-tab.tsx src/features/faturamento/components/faturas-tab.tsx src/features/faturamento/index.ts src/routes/admin.faturamento.index.tsx src/routes/admin.faturamento.tsx src/routeTree.gen.ts
git commit -m "feat: restructure /admin/faturamento into Faturas/Análise tabs"
```

> Se `src/routeTree.gen.ts` foi revertido (CRLF), remova-o do `git add` acima.

---

### Task 6: Detalhe da fatura (editor + confirmação)

**Files:**
- Create: `src/features/faturamento/components/faturamento-item-row.tsx`
- Create: `src/features/faturamento/components/faturamento-detalhe.tsx`
- Create: `src/routes/admin.faturamento.$faturamentoId.tsx`
- Modify: `src/features/faturamento/index.ts` (export `FaturamentoDetalhe`)

**Interfaces:**
- Consumes: `faturamentosStore` (`useFaturamento`, `atualizar`, `confirmar`); `aplicarHoraTipo`, `temPendencia`, `valorItem`, `round2` de `calculo`; `formatBRL` de `@/features/retaguarda/format`; `StatusFaturamentoBadge`, `MODELO_LABEL` (de `@/features/ordem-servico/labels`); stores `equipamentosStore`, `clientesStore`, `ordensStore`, `precoHoraMaquinaStore`, `precoMobilizacaoStore`; `ConfirmDialog`; `toast`.
- Produces: `FaturamentoDetalhe({ faturamentoId }: { faturamentoId: string })` e `FaturamentoNaoEncontrado`.

- [ ] **Step 1: Criar** `src/features/faturamento/components/faturamento-item-row.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { FaturamentoItem } from "@/shared/types";

interface FaturamentoItemRowProps {
  item: FaturamentoItem;
  editavel: boolean;
  onQuantidade: (q: number) => void;
  onHoraTipo: (tipo: "seca" | "operada") => void;
  onValorUnitario: (v: number) => void;
  onRemover: () => void;
}

export function FaturamentoItemRow({
  item,
  editavel,
  onQuantidade,
  onHoraTipo,
  onValorUnitario,
  onRemover,
}: FaturamentoItemRowProps) {
  const unidade = item.tipo === "por_metro" ? "m" : item.tipo === "mobilizacao" ? "un" : "h";

  return (
    <div className="rounded-lg border bg-surface/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{item.descricao}</p>
          {item.sem_preco ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <Icon icon="lucide:triangle-alert" className="h-3 w-3" />
              Sem preço cadastrado
            </span>
          ) : null}
        </div>
        {editavel ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemover}
            aria-label="Remover item"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Icon icon="lucide:trash-2" className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Campo rotulo="Quantidade">
          {editavel ? (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={item.quantidade}
              onChange={(e) => onQuantidade(Number(e.target.value))}
              className="h-8 font-mono"
            />
          ) : (
            <span className="font-mono text-sm">{`${item.quantidade} ${unidade}`}</span>
          )}
        </Campo>

        <Campo rotulo="Valor unit.">
          {editavel ? (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={item.valor_unitario ?? ""}
              placeholder="—"
              onChange={(e) => onValorUnitario(Number(e.target.value))}
              className="h-8 font-mono"
            />
          ) : (
            <span className="font-mono text-sm">
              {item.valor_unitario != null ? formatBRL(item.valor_unitario) : "—"}
            </span>
          )}
        </Campo>

        <Campo rotulo="Tipo">
          {item.tipo === "hora_maquina" && item.hora_tipo ? (
            editavel ? (
              <div className="flex h-8 items-center gap-1">
                {(["operada", "seca"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onHoraTipo(t)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium capitalize transition-colors",
                      item.hora_tipo === t
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm capitalize">{item.hora_tipo}</span>
            )
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </Campo>

        <Campo rotulo="Total">
          <span className="font-mono text-sm font-semibold">{formatBRL(item.valor_total)}</span>
        </Campo>
      </div>
    </div>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">{rotulo}</div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Criar** `src/features/faturamento/components/faturamento-detalhe.tsx`:

```tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { FaturamentoItemRow } from "@/features/faturamento/components/faturamento-item-row";
import { StatusFaturamentoBadge } from "@/features/faturamento/labels";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { aplicarHoraTipo, temPendencia, valorItem } from "@/features/faturamento/calculo";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDataHora } from "@/shared/lib/format";
import type { FaturamentoItem } from "@/shared/types";

export function FaturamentoDetalhe({ faturamentoId }: { faturamentoId: string }) {
  const fat = faturamentosStore.useFaturamento(faturamentoId);
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const mobilizacoes = precoMobilizacaoStore.useAll().filter((m) => m.ativo);
  const [confirmar, setConfirmar] = useState(false);
  const [mobSelecionada, setMobSelecionada] = useState("");

  if (!fat) return <FaturamentoNaoEncontrado />;

  const cliente = clientesStore.getById(fat.cliente_id);
  const os = ordensStore.obter(fat.os_id);
  const editavel = fat.status === "rascunho";
  const pendente = temPendencia(fat);

  const setItens = (itens: FaturamentoItem[]) => faturamentosStore.atualizar(fat.id, { itens });

  const handleQuantidade = (itemId: string, q: number) => {
    const quantidade = Number.isFinite(q) && q >= 0 ? q : 0;
    setItens(
      fat.itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantidade,
              valor_total: i.valor_unitario != null ? valorItem(quantidade, i.valor_unitario) : 0,
            }
          : i,
      ),
    );
  };

  const handleValorUnitario = (itemId: string, v: number) => {
    const valor = Number.isFinite(v) && v >= 0 ? v : 0;
    setItens(
      fat.itens.map((i) =>
        i.id === itemId
          ? { ...i, valor_unitario: valor, valor_total: valorItem(i.quantidade, valor), sem_preco: false }
          : i,
      ),
    );
  };

  const handleHoraTipo = (itemId: string, tipo: "seca" | "operada") => {
    setItens(
      fat.itens.map((i) => {
        if (i.id !== itemId) return i;
        const equipamento = i.origem_id ? equipamentos.find((e) => e.id === i.origem_id) : undefined;
        return aplicarHoraTipo(i, equipamento, precosHM, tipo);
      }),
    );
  };

  const handleRemover = (itemId: string) => setItens(fat.itens.filter((i) => i.id !== itemId));

  const adicionarMobilizacao = (precoId: string) => {
    const preco = mobilizacoes.find((m) => m.id === precoId);
    if (!preco) return;
    const item: FaturamentoItem = {
      id: crypto.randomUUID(),
      tipo: "mobilizacao",
      descricao: preco.descricao,
      origem_id: preco.id,
      hora_tipo: null,
      quantidade: 1,
      valor_unitario: preco.valor,
      valor_total: preco.valor,
      sem_preco: false,
    };
    setItens([...fat.itens, item]);
    setMobSelecionada("");
  };

  const onConfirmar = () => {
    const r = faturamentosStore.confirmar(fat.id);
    setConfirmar(false);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(`Faturamento ${r.faturamento.numero} confirmado.`);
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/faturamento"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Faturamento
      </Link>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-lg font-bold text-card-foreground">{fat.numero}</div>
            <div className="mt-1 font-display font-bold text-foreground">{cliente?.nome ?? "—"}</div>
            <div className="text-sm text-muted-foreground">
              {os ? (
                <Link to="/admin/ordens/$ordemId" params={{ ordemId: os.id }} className="hover:text-primary">
                  {os.numero} · {os.obra_nome}
                </Link>
              ) : (
                "OS de origem removida"
              )}
            </div>
          </div>
          <StatusFaturamentoBadge status={fat.status} />
        </div>
        {fat.faturado_em ? (
          <p className="font-mono text-xs text-foreground-faint">
            Faturado em {formatDataHora(fat.faturado_em)}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Itens ({fat.itens.length})
        </h3>
        {fat.itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item neste faturamento.</p>
        ) : (
          <div className="space-y-2">
            {fat.itens.map((item) => (
              <FaturamentoItemRow
                key={item.id}
                item={item}
                editavel={editavel}
                onQuantidade={(q) => handleQuantidade(item.id, q)}
                onValorUnitario={(v) => handleValorUnitario(item.id, v)}
                onHoraTipo={(t) => handleHoraTipo(item.id, t)}
                onRemover={() => handleRemover(item.id)}
              />
            ))}
          </div>
        )}

        {editavel && mobilizacoes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Select value={mobSelecionada} onValueChange={adicionarMobilizacao}>
              <SelectTrigger className="w-auto min-w-[220px] gap-2">
                <Icon icon="lucide:plus" className="h-4 w-4" />
                <SelectValue placeholder="Adicionar mobilização" />
              </SelectTrigger>
              <SelectContent>
                {mobilizacoes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.descricao} · {formatBRL(m.valor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        {editavel ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                  Desconto (R$)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={fat.desconto || ""}
                  placeholder="0,00"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    faturamentosStore.atualizar(fat.id, { desconto: Number.isFinite(v) && v > 0 ? v : 0 });
                  }}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Observação
              </label>
              <Textarea
                value={fat.observacao ?? ""}
                placeholder="Notas internas sobre este faturamento"
                onChange={(e) =>
                  faturamentosStore.atualizar(fat.id, {
                    observacao: e.target.value.trim() ? e.target.value : null,
                  })
                }
              />
            </div>
          </>
        ) : fat.observacao ? (
          <p className="text-sm text-card-foreground">{fat.observacao}</p>
        ) : null}

        <div className="flex items-end justify-between border-t pt-4">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="font-mono text-2xl font-bold text-foreground">{formatBRL(fat.valor_total)}</span>
        </div>
      </section>

      {pendente ? (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <Icon icon="lucide:triangle-alert" className="h-4 w-4" />
          Há item sem preço cadastrado; o total não inclui esse serviço.
        </p>
      ) : null}

      {editavel ? (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setConfirmar(true)}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:check-circle-2" className="h-4 w-4" />
            Confirmar faturamento
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        titulo="Confirmar faturamento?"
        descricao={
          pendente
            ? `A fatura ${fat.numero} será marcada como faturada. Atenção: há item sem preço — o total (${formatBRL(fat.valor_total)}) não inclui esse serviço.`
            : `A fatura ${fat.numero} no valor de ${formatBRL(fat.valor_total)} será marcada como faturada.`
        }
        confirmLabel="Confirmar"
        onConfirm={onConfirmar}
      />
    </div>
  );
}

export function FaturamentoNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Faturamento não encontrado</h2>
      <Link
        to="/admin/faturamento"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Faturamento
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Exportar no barrel** — adicionar a `src/features/faturamento/index.ts`:

```typescript
export { FaturamentoDetalhe } from "@/features/faturamento/components/faturamento-detalhe";
```

- [ ] **Step 4: Criar** `src/routes/admin.faturamento.$faturamentoId.tsx`:

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { FaturamentoDetalhe } from "@/features/faturamento";

export const Route = createFileRoute("/admin/faturamento/$faturamentoId")({
  loader: ({ params }) => {
    if (!faturamentosStore.obter(params.faturamentoId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `${faturamentosStore.obter(params.faturamentoId)?.numero ?? "Faturamento"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FaturamentoDetalheRoute,
});

function FaturamentoDetalheRoute() {
  const { faturamentoId } = Route.useParams();
  return <FaturamentoDetalhe faturamentoId={faturamentoId} />;
}
```

- [ ] **Step 5: Gate + SSR smoke**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8082/admin/faturamento/fat-002` (rascunho editável) e `http://localhost:8082/admin/faturamento/fat-001` (faturado, leitura) e `http://localhost:8082/admin/faturamento/zzz` (inexistente).
Expected: `200`, `200`, `404`.

Se `src/routeTree.gen.ts` aparecer só com CRLF: `git checkout -- src/routeTree.gen.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/features/faturamento/components/faturamento-item-row.tsx src/features/faturamento/components/faturamento-detalhe.tsx src/routes/admin.faturamento.\$faturamentoId.tsx src/features/faturamento/index.ts src/routeTree.gen.ts
git commit -m "feat: add faturamento detail editor with confirm flow"
```

> Remova `src/routeTree.gen.ts` do `git add` se tiver sido revertido por CRLF.

---

### Task 7: Aba Faturas (pipeline + aguardando + lista)

**Files:**
- Create: `src/features/faturamento/components/faturamento-pipeline.tsx`
- Create: `src/features/faturamento/components/aguardando-faturamento.tsx`
- Create: `src/features/faturamento/components/faturas-list.tsx`
- Rewrite: `src/features/faturamento/components/faturas-tab.tsx` (substitui o placeholder do Task 5)

**Interfaces:**
- Consumes: `faturamentosStore` (`useTodos`, `gerarDeOS`); `ordensStore` (`useTodas`/`listar`); `apontamentosStore` (`useTodos`); stores `equipamentosStore`, `precoHoraMaquinaStore`, `precoFundacaoStore`, `clientesStore`; `resumoPipeline`, `osFechadasSemFaturamento` de `derivacoes`; `useMockResource`; `DataList`/`Column`; `formatBRL`; `StatusFaturamentoBadge`, `STATUS_FATURAMENTO*`; `useNavigate`, `Link`.
- Produces: `FaturamentoPipeline`, `AguardandoFaturamento`, `FaturasList`, `FaturasTab` (final).

- [ ] **Step 1: Criar** `src/features/faturamento/components/faturamento-pipeline.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

interface FaturamentoPipelineProps {
  executado: number;
  faturado: { qtd: number; total: number };
}

export function FaturamentoPipeline({ executado, faturado }: FaturamentoPipelineProps) {
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
        principal="—"
        secundario="Em breve (PRD-007)"
        esmaecido
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
  esmaecido = false,
}: {
  icone: string;
  rotulo: string;
  principal: string;
  secundario: string;
  destaque?: boolean;
  esmaecido?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        destaque && "border-primary/40",
        esmaecido && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">{rotulo}</span>
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

- [ ] **Step 2: Criar** `src/features/faturamento/components/aguardando-faturamento.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import type { Apontamento, OrdemServico } from "@/shared/types";

interface AguardandoFaturamentoProps {
  ordens: OrdemServico[];
  apontamentos: Apontamento[];
}

export function AguardandoFaturamento({ ordens, apontamentos }: AguardandoFaturamentoProps) {
  const navigate = useNavigate();

  if (ordens.length === 0) return null;

  const gerar = (os: OrdemServico) => {
    const fat = faturamentosStore.gerarDeOS(
      os,
      apontamentos,
      equipamentosStore.getAll(),
      precoHoraMaquinaStore.getAll(),
      precoFundacaoStore.getAll(),
    );
    toast.success(`Rascunho ${fat.numero} gerado.`);
    navigate({ to: "/admin/faturamento/$faturamentoId", params: { faturamentoId: fat.id } });
  };

  return (
    <section className="space-y-3 rounded-xl border border-dashed bg-surface/40 p-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
        <Icon icon="lucide:clock" className="h-4 w-4" />
        Aguardando faturamento ({ordens.length})
      </h3>
      <ul className="space-y-2">
        {ordens.map((os) => (
          <li
            key={os.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3"
          >
            <div className="min-w-0">
              <span className="font-mono text-sm font-semibold text-foreground">{os.numero}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {clientesStore.getById(os.cliente_id)?.nome ?? "—"} · {os.obra_nome}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => gerar(os)}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:file-plus-2" className="h-4 w-4" />
              Gerar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Criar** `src/features/faturamento/components/faturas-list.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataList, type Column } from "@/shared/components/data-list";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { StatusFaturamentoBadge, STATUS_FATURAMENTO, STATUS_FATURAMENTO_LABEL } from "@/features/faturamento/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { Faturamento, StatusFaturamento } from "@/shared/types";

export function FaturasList({ faturamentos }: { faturamentos: Faturamento[] }) {
  const { isLoading, error, retry } = useMockResource(faturamentos);
  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusFaturamento | "todos">("todos");

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return faturamentos.filter((f) => {
      if (filtroStatus !== "todos" && f.status !== filtroStatus) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(f.cliente_id);
      const os = ordensStore.obter(f.os_id);
      return (
        f.numero.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false) ||
        (os?.numero.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [faturamentos, q, filtroStatus]);

  const columns: Column<Faturamento>[] = [
    {
      header: "Fatura",
      cell: (f) => (
        <Link
          to="/admin/faturamento/$faturamentoId"
          params={{ faturamentoId: f.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {f.numero}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (f) => (
        <div className="min-w-0 max-w-[18rem] truncate">{clientesStore.getById(f.cliente_id)?.nome ?? "—"}</div>
      ),
    },
    {
      header: "OS",
      cell: (f) => <span className="font-mono text-muted-foreground">{ordensStore.obter(f.os_id)?.numero ?? "—"}</span>,
    },
    {
      header: "Valor",
      className: "font-mono",
      cell: (f) => formatBRL(f.valor_total),
    },
    { header: "Status", cell: (f) => <StatusFaturamentoBadge status={f.status} /> },
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
          placeholder="Buscar por fatura, cliente ou OS"
          className="pl-9"
        />
      </div>
      <Select
        value={filtroStatus}
        onValueChange={(v) => setFiltroStatus(v as StatusFaturamento | "todos")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_FATURAMENTO.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_FATURAMENTO_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCard = (f: Faturamento) => (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/faturamento/$faturamentoId"
          params={{ faturamentoId: f.id }}
          className="font-mono text-sm font-semibold text-foreground"
        >
          {f.numero}
        </Link>
        <StatusFaturamentoBadge status={f.status} />
      </div>
      <div className="mt-2 font-display font-bold text-card-foreground">
        {clientesStore.getById(f.cliente_id)?.nome ?? "—"}
      </div>
      <div className="text-xs text-muted-foreground">{ordensStore.obter(f.os_id)?.numero ?? "—"}</div>
      <div className="mt-2 font-mono text-sm font-semibold text-foreground">{formatBRL(f.valor_total)}</div>
    </div>
  );

  return (
    <DataList
      data={lista}
      columns={columns}
      getRowKey={(f) => f.id}
      renderCard={renderCard}
      isLoading={isLoading}
      error={error}
      onRetry={retry}
      toolbar={toolbar}
      empty={{
        icon: "lucide:receipt",
        titulo: faturamentos.length === 0 ? "Nenhum faturamento ainda" : "Nada encontrado",
        descricao:
          faturamentos.length === 0
            ? "Gere o primeiro faturamento a partir de uma OS fechada acima."
            : "Ajuste a busca ou o filtro.",
      }}
    />
  );
}
```

- [ ] **Step 4: Reescrever** `src/features/faturamento/components/faturas-tab.tsx` (substitui o placeholder):

```tsx
import { useMemo } from "react";
import { FaturamentoPipeline } from "@/features/faturamento/components/faturamento-pipeline";
import { AguardandoFaturamento } from "@/features/faturamento/components/aguardando-faturamento";
import { FaturasList } from "@/features/faturamento/components/faturas-list";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { osFechadasSemFaturamento, resumoPipeline } from "@/features/faturamento/derivacoes";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export function FaturasTab() {
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();

  const pipeline = useMemo(() => resumoPipeline(ordens, faturamentos), [ordens, faturamentos]);
  const aguardando = useMemo(
    () => osFechadasSemFaturamento(ordens, faturamentos),
    [ordens, faturamentos],
  );

  return (
    <div className="space-y-6">
      <FaturamentoPipeline executado={pipeline.executado} faturado={pipeline.faturado} />
      <AguardandoFaturamento ordens={aguardando} apontamentos={apontamentos} />
      <FaturasList faturamentos={faturamentos} />
    </div>
  );
}
```

- [ ] **Step 5: Gate + SSR smoke**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8082/admin/faturamento`
Expected: `200`. (A aba Faturas mostra pipeline + "Aguardando faturamento" com os-010 + lista das 4 faturas.)

- [ ] **Step 6: Commit**

```bash
git add src/features/faturamento/components/faturamento-pipeline.tsx src/features/faturamento/components/aguardando-faturamento.tsx src/features/faturamento/components/faturas-list.tsx src/features/faturamento/components/faturas-tab.tsx
git commit -m "feat: build Faturas tab with pipeline, pending OS and list"
```

---

### Task 8: Barreira + release 0.5.0 Invoice

**Files:**
- Modify: `package.json` (version 0.4.0 → 0.5.0)
- Modify: `CHANGELOG.md`
- Rename: `docs/prds/PRD-004-ret-faturamento-fechamento-os.md` → `..._DONE.md` + atualizar "Status de Implementação"
- Modify: `docs/prds/INDEX-PRDs-antonello.md`

- [ ] **Step 1: Checagem da barreira financeira (RF-011)** — garantir que nada de `features/faturamento`, `mocks/faturamentos` ou `mocks/faturamento` é importado em rotas/`features` do operador (`/app`).

Run: `git grep -nE "features/faturamento|mocks/faturamento" -- "src/routes/app.*" "src/features/apontamento" "src/features/operador" "src/shared/layouts"`
Expected: **sem resultados** (a barreira é dada por importações; o operador não toca faturamento).

> Se aparecer qualquer importação, é violação da RF-011 — remova-a antes de prosseguir.

- [ ] **Step 2: Bump de versão** em `package.json`:

```json
  "version": "0.5.0",
```

- [ ] **Step 3: Atualizar `CHANGELOG.md`** — adicionar no topo (abaixo do cabeçalho, acima de `[0.4.0]`):

```markdown
## [0.5.0] - 2026-06-29 - Invoice

### Added
- Faturamento ao fechar OS (PRD-004): geração de fatura em rascunho a partir de OS fechada, aplicando preços (hora-máquina operada/seca e por metro) às horas/metros apontados.
- Aba **Faturas** em `/admin/faturamento`: pipeline executado → faturado → recebido*, lista "Aguardando faturamento" com geração e lista de faturas com filtros.
- Editor de rascunho: ajuste de itens (quantidade, valor, seca/operada), inclusão de mobilização, desconto e observação; confirmação `rascunho → faturado` com aviso de pendência.
- Detalhe da fatura em `/admin/faturamento/$faturamentoId`.
- Sinalização de item "sem preço" (tarifa inativa/ausente) sem bloquear o restante do rascunho.
- `types` `Faturamento`, `FaturamentoItem`, `StatusFaturamento`, `TipoItemFaturamento`; mocks coerentes com OS/apontamentos/preços.

### Changed
- `/admin/faturamento` reorganizado em abas: **Faturas** (operacional) e **Análise** (o dashboard de gráficos, agora aba).
```

\* "recebido" é estágio futuro (PRD-007).

- [ ] **Step 4: Renomear o PRD** e atualizar seu status:

```bash
git mv docs/prds/PRD-004-ret-faturamento-fechamento-os.md docs/prds/PRD-004-ret-faturamento-fechamento-os_DONE.md
```

Na seção "## Status de Implementação" do arquivo renomeado, trocar a tabela por:

```markdown
| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-29 |
| **Versão do App** | 0.5.0 (Invoice) |
| **Implementado por** | Claude Code CLI (Claude Opus 4.8) |
| **Observações** | Frontend mockado. IA em abas (Faturas/Análise); seca/operada default operada com troca por item; geração pela tela a partir de OS fechadas. |
```

- [ ] **Step 5: Atualizar `docs/prds/INDEX-PRDs-antonello.md`** — aplicar:
  - "Versão Atual" → `0.5.0 (Invoice)`; "PRDs Implementados" → `6 (inclui o spike PRD-000)`.
  - Resumo de Status: ✅ Implementado `6` (40%); ⏳ Pendente `9` (60%).
  - Onda 1, linha 004: Doc/Status `✍️ | ✅` e arquivo `PRD-004-ret-faturamento-fechamento-os_DONE.md`.
  - Catálogo: remover PRD-004 de "Documentados, aguardando implementação"; adicionar em "✅ Implementados": `| [PRD-004](./PRD-004-ret-faturamento-fechamento-os_DONE.md) | Faturamento ao Fechar OS | Feature | ret | 0.5.0 Invoice |`.
  - Histórico de Versões: adicionar `| 0.5.0 | Invoice | 2026-06-29 | PRD-004 | MINOR |`.
  - "Última Atualização": Data `2026-06-29`; Motivo: `PRD-004 Faturamento implementado → 0.5.0 Invoice; 6/15 (40%)`.

- [ ] **Step 6: Gate final**

Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc EXIT 0; toda a suíte verde.

- [ ] **Step 7: Commit**

```bash
git add package.json CHANGELOG.md docs/prds/PRD-004-ret-faturamento-fechamento-os_DONE.md docs/prds/INDEX-PRDs-antonello.md
git commit -m "chore: release 0.5.0 Invoice (PRD-004 faturamento)"
```

---

## Self-Review (preenchido pelo autor do plano)

**Spec coverage:**
- RF-001 (gerar rascunho da OS fechada): Task 7 (AguardandoFaturamento → gerarDeOS). ✅
- RF-002 (itens por apontamento/metro, tarifa operada + toggle seca): Task 1 (gerarItens/aplicarHoraTipo), Task 6 (toggle). ✅
- RF-003 (total): Task 1 (calcularValorTotal). ✅
- RF-004 (mobilização): Task 6 (adicionarMobilizacao). ✅
- RF-005 (itens detalhados): Task 6 (FaturamentoItemRow). ✅
- RF-006 (ajustar): Task 6 (quantidade/valor/remover/desconto/obs). ✅
- RF-007 (confirmar → faturado): Task 3 (store.confirmar), Task 6 (UI). ✅
- RF-008 (lista): Task 7 (FaturasList). ✅
- RF-009 (pipeline): Task 7 (FaturamentoPipeline). ✅
- RF-010 (filtros status/cliente/período): Task 7 (FaturasList — busca + status). *Período não se aplica à lista de faturas (é da aba Análise); cliente coberto pela busca textual.* ✅
- RF-011 (barreira): Task 8 (grep). ✅
- RNF-001 (exatidão centavos): Task 1 (round2). ✅ RNF-004 (responsivo): DataList tabela→cards. ✅
- Estados de tela: `useMockResource` + `DataList` (loading/empty/error/success) na lista; notFound no detalhe. ✅

**Placeholder scan:** sem TBD/“implementar depois”; todo código presente. ✅

**Type consistency:** `gerarItens`/`aplicarHoraTipo`/`calcularValorTotal`/`gerarDeOS`/`atualizar`/`confirmar`/`resumoPipeline`/`osFechadasSemFaturamento`/`proximoNumeroFAT` com mesmas assinaturas entre Tasks 1–7. IDs de item determinísticos (`${os.id}:${equip}`) consistentes entre `gerarItens` e os mocks. ✅

> **Nota de execução (ordem):** Task 3 cria um stub de `src/mocks/faturamentos.ts` (array vazio) para o `tsc` ficar verde; Task 4 substitui pelo conteúdo real. Não pular o stub.
