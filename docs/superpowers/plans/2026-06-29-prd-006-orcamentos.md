# PRD-006 Orçamentos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a UI mockada de orçamentos na retaguarda (`/admin/orcamentos`): montar a partir das tabelas de preço, ciclo `rascunho → enviado → aprovado/recusado`, validade, desconto, e handoff opcional de orçamento aprovado → OS.

**Architecture:** Feature nova `src/features/orcamentos/`, espelho pré-venda do Faturamento (PRD-004). Reaproveita os helpers puros de `@/features/faturamento/calculo` (`round2`, `valorItem`, `precoHoraDoEquipamento`) onde o contrato é idêntico; código próprio onde a semântica difere (itens montados do zero, 4 status, validade). Stores em memória via `useSyncExternalStore` (padrão `faturamentos-store`). Só retaguarda — nunca importado em `/app/*`.

**Tech Stack:** React 19 + TanStack Start/Router (rotas file-based, `routeTree.gen.ts` auto-gerado) + Vite 8 + TypeScript strict + Tailwind v4 + shadcn/ui + Iconify (`@iconify/react`, `lucide:*`) + react-hook-form + zod + Vitest.

## Global Constraints

- **Barreira financeira (RF-011 / RNF-002):** `src/features/orcamentos/**` e `src/mocks/orcamentos*` **NUNCA** importados sob `src/routes/app.*`, `src/features/operador/**` ou `src/features/apontamento/**`.
- **Types sem prefixo `I`** (consistência com o codebase, apesar do contrato ilustrativo do PRD).
- **Sem `any`** (use `unknown`/tipo específico). **Sem `!` non-null** (use narrowing / optional chaining).
- **Dinheiro exato em R$, 2 casas**, sempre via `formatBRL` de `@/features/retaguarda/format`. Aritmética monetária via `round2` (centavos).
- **Numeração** `ORC-AAAA-NNNN`, sequencial por ano.
- **Validade padrão** ao criar = hoje + 30 dias (editável; pode ficar nula).
- **Nunca hardcodar cor/fonte** — só tokens (`primary`, `secondary`, `steel`, `destructive`, etc.). Não existe token verde: badge "aprovado" usa `secondary` (terra).
- **GATE:** `npx tsc --noEmit` (EXIT 0, autoritativo) + `npx vitest run`. `npm run lint` = ruído CRLF (Windows autocrlf), **NÃO é gate**.
- **Rotas:** dev server em `:8082` regenera `src/routeTree.gen.ts` ao adicionar rota. Validar por smoke SSR `curl`. Se `git diff src/routeTree.gen.ts` vier vazio (só CRLF), `git checkout -- src/routeTree.gen.ts`; se houver mudança estrutural real, commitar.
- **Estados de tela** (loading/empty/error/success) via `DataList` + `useMockResource`.
- **Mock → Seed:** mocks espelham o schema futuro (`snake_case` no banco; aqui o type), aritmética consistente.

---

## File Structure

```
src/shared/types/index.ts                         # (modify) append Orcamento, OrcamentoItem, StatusOrcamento, TipoItemOrcamento
src/features/orcamentos/
├── calculo.ts                                     # builders de item + total + pendência (reusa faturamento/calculo)
├── calculo.test.ts
├── numero-orcamento.ts                            # proximoNumeroORC
├── numero-orcamento.test.ts
├── derivacoes.ts                                  # validadeVencida, podeEnviar, podeDecidir
├── derivacoes.test.ts
├── orcamentos-store.ts                            # criarOrcamentosStore + singleton
├── orcamentos-store.test.ts
├── orcamento-schema.ts                            # zod do form "Novo orçamento"
├── labels.tsx                                     # StatusOrcamentoBadge + constantes
├── index.ts                                       # barrel: OrcamentosPage, OrcamentoDetalhe
└── components/
    ├── orcamentos-page.tsx                        # lista + filtros + CTA "Novo orçamento"
    ├── orcamento-form.tsx                         # form de criação
    ├── orcamento-detalhe.tsx                      # editor/visualização + ciclo + handoff
    ├── orcamento-item-row.tsx                     # linha de item
    └── adicionar-item-orcamento.tsx              # seletor tipo → fonte → qtd → "Adicionar"
src/mocks/orcamentos.ts                            # ~6 orçamentos (edge cases)
src/mocks/orcamentos.test.ts
src/routes/admin.orcamentos.index.tsx             # OrcamentosPage (noindex)
src/routes/admin.orcamentos.$orcamentoId.tsx      # OrcamentoDetalhe (noindex, notFound)
src/features/retaguarda/retaguarda-shell.tsx      # (modify) +1 item de nav "Orçamentos"
package.json / CHANGELOG.md / docs                 # (modify) release 0.6.0 Quote
```

---

## Task 1: Contrato (types) + cálculo puro

**Files:**
- Modify: `src/shared/types/index.ts` (append ao final)
- Create: `src/features/orcamentos/calculo.ts`
- Test: `src/features/orcamentos/calculo.test.ts`

**Interfaces:**
- Consumes: de `@/features/faturamento/calculo` → `round2(reais: number): number`, `valorItem(quantidade: number, valorUnitario: number): number`, `precoHoraDoEquipamento(equipamento: Equipamento, precos: PrecoHoraMaquina[]): PrecoHoraMaquina | null`. De `@/shared/lib/format` → `formatHorimetro(horas: number): string`.
- Produces:
  - `type StatusOrcamento = "rascunho" | "enviado" | "aprovado" | "recusado"`
  - `type TipoItemOrcamento = "hora_maquina" | "por_metro" | "mobilizacao"`
  - `interface OrcamentoItem`, `interface Orcamento` (campos abaixo)
  - `criarItemHora(equipamento: Equipamento, precosHM: PrecoHoraMaquina[], horasEstimadas: number, horaTipo?: "seca" | "operada"): OrcamentoItem`
  - `criarItemMetro(preco: PrecoFundacao, metrosEstimados: number): OrcamentoItem`
  - `criarItemMobilizacao(preco: PrecoMobilizacao): OrcamentoItem`
  - `aplicarHoraTipo(item: OrcamentoItem, equipamento: Equipamento | undefined, precosHM: PrecoHoraMaquina[], tipo: "seca" | "operada"): OrcamentoItem`
  - `calcularTotalOrcamento(itens: OrcamentoItem[], desconto: number): number`
  - `temPendencia(orc: { itens: OrcamentoItem[] }): boolean`

- [ ] **Step 1: Append os types ao contrato compartilhado**

No final de `src/shared/types/index.ts`, adicionar:

```typescript

// Orçamentos (PRD-006) — pré-venda; montados a partir das tabelas de preço. Só retaguarda;
// NUNCA importado/renderizado em /app/*. Item espelha FaturamentoItem (quantidade_estimada).
export type StatusOrcamento = "rascunho" | "enviado" | "aprovado" | "recusado";
export type TipoItemOrcamento = "hora_maquina" | "por_metro" | "mobilizacao";

export interface OrcamentoItem {
  id: string;
  tipo: TipoItemOrcamento;
  descricao: string; // "Escavadeira 10t — 40 h operada (estimado)"
  origem_id: string | null; // equipamento_id (hora) / preco_fundacao_id (metro) / preco_mobilizacao_id (mob.)
  hora_tipo: "seca" | "operada" | null; // só hora_maquina
  quantidade_estimada: number; // horas, metros ou 1
  valor_unitario: number | null; // null = SEM PREÇO ativo (pendência)
  valor_total: number; // round2(quantidade_estimada × valor_unitario); 0 se sem preço
  sem_preco: boolean;
}

export interface Orcamento {
  id: string;
  numero: string; // "ORC-2026-0001"
  cliente_id: string; // FK → Cliente (PRD-001)
  descricao_obra: string;
  itens: OrcamentoItem[];
  desconto: number; // R$ subtraído do subtotal (≥ 0)
  valor_total: number; // soma(itens) − desconto
  validade: string | null; // "YYYY-MM-DD" (limite); default hoje+30d na criação
  observacao: string | null;
  status: StatusOrcamento;
  os_id: string | null; // preenchido quando vira OS (PRD-003)
  enviado_em: string | null; // ISO — quando marcado enviado
  decidido_em: string | null; // ISO — quando aprovado/recusado
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Escrever os testes que falham** — `src/features/orcamentos/calculo.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import { precosMobilizacao } from "@/mocks/precos-mobilizacao";
import {
  aplicarHoraTipo,
  calcularTotalOrcamento,
  criarItemHora,
  criarItemMetro,
  criarItemMobilizacao,
  temPendencia,
} from "@/features/orcamentos/calculo";

const eq001 = equipamentos.find((e) => e.id === "eq-001")!; // tem preço (phm-001: seca 280 / operada 360)
const eq005 = equipamentos.find((e) => e.id === "eq-005")!; // só preço inativo (phm-005) → sem preço ativo
const pf001 = precosFundacao.find((p) => p.id === "pf-001")!; // Ø300, 90/m
const pm001 = precosMobilizacao.find((p) => p.id === "pm-001")!; // 850

describe("criarItemHora", () => {
  it("usa o preço operada por padrão", () => {
    const item = criarItemHora(eq001, precosHoraMaquina, 40);
    expect(item.tipo).toBe("hora_maquina");
    expect(item.hora_tipo).toBe("operada");
    expect(item.origem_id).toBe("eq-001");
    expect(item.quantidade_estimada).toBe(40);
    expect(item.valor_unitario).toBe(360);
    expect(item.valor_total).toBe(14400);
    expect(item.sem_preco).toBe(false);
    expect(item.descricao).toContain("operada (estimado)");
  });

  it("usa o preço seca quando solicitado", () => {
    const item = criarItemHora(eq001, precosHoraMaquina, 20, "seca");
    expect(item.valor_unitario).toBe(280);
    expect(item.valor_total).toBe(5600);
    expect(item.descricao).toContain("seca (estimado)");
  });

  it("marca sem_preco quando não há tarifa ativa", () => {
    const item = criarItemHora(eq005, precosHoraMaquina, 8);
    expect(item.valor_unitario).toBeNull();
    expect(item.valor_total).toBe(0);
    expect(item.sem_preco).toBe(true);
  });
});

describe("criarItemMetro", () => {
  it("puxa o valor por metro do preço de fundação", () => {
    const item = criarItemMetro(pf001, 50);
    expect(item.tipo).toBe("por_metro");
    expect(item.origem_id).toBe("pf-001");
    expect(item.valor_unitario).toBe(90);
    expect(item.valor_total).toBe(4500);
    expect(item.sem_preco).toBe(false);
    expect(item.descricao).toBe("Estaca Ø300mm — 50m (estimado)");
  });
});

describe("criarItemMobilizacao", () => {
  it("cria item de quantidade 1 com o valor da mobilização", () => {
    const item = criarItemMobilizacao(pm001);
    expect(item.tipo).toBe("mobilizacao");
    expect(item.origem_id).toBe("pm-001");
    expect(item.quantidade_estimada).toBe(1);
    expect(item.valor_unitario).toBe(850);
    expect(item.valor_total).toBe(850);
  });
});

describe("aplicarHoraTipo", () => {
  it("troca operada → seca recalculando o valor", () => {
    const operada = criarItemHora(eq001, precosHoraMaquina, 10); // 10 × 360 = 3600
    const seca = aplicarHoraTipo(operada, eq001, precosHoraMaquina, "seca");
    expect(seca.hora_tipo).toBe("seca");
    expect(seca.valor_unitario).toBe(280);
    expect(seca.valor_total).toBe(2800);
    expect(seca.descricao).toContain("seca (estimado)");
  });

  it("não altera itens que não são hora-máquina", () => {
    const mob = criarItemMobilizacao(pm001);
    expect(aplicarHoraTipo(mob, undefined, precosHoraMaquina, "seca")).toEqual(mob);
  });
});

describe("calcularTotalOrcamento", () => {
  it("soma os itens e subtrai o desconto (round2)", () => {
    const itens = [criarItemHora(eq001, precosHoraMaquina, 40), criarItemMobilizacao(pm001)]; // 14400 + 850 = 15250
    expect(calcularTotalOrcamento(itens, 0)).toBe(15250);
    expect(calcularTotalOrcamento(itens, 250)).toBe(15000);
  });
});

describe("temPendencia", () => {
  it("é true quando algum item está sem preço", () => {
    expect(temPendencia({ itens: [criarItemHora(eq005, precosHoraMaquina, 8)] })).toBe(true);
    expect(temPendencia({ itens: [criarItemHora(eq001, precosHoraMaquina, 8)] })).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/features/orcamentos/calculo.test.ts`
Expected: FAIL (módulo `@/features/orcamentos/calculo` não existe).

- [ ] **Step 4: Implementar** — `src/features/orcamentos/calculo.ts`

```typescript
import { formatHorimetro } from "@/shared/lib/format";
import { precoHoraDoEquipamento, round2, valorItem } from "@/features/faturamento/calculo";
import type {
  Equipamento,
  OrcamentoItem,
  PrecoFundacao,
  PrecoHoraMaquina,
  PrecoMobilizacao,
} from "@/shared/types";

function descricaoHora(nome: string, horas: number, horaTipo: "seca" | "operada"): string {
  return `${nome} — ${formatHorimetro(horas)} ${horaTipo} (estimado)`;
}

// Item hora-máquina (estimativa). Default tarifa "operada"; sem_preco se não há tarifa ativa.
export function criarItemHora(
  equipamento: Equipamento,
  precosHM: PrecoHoraMaquina[],
  horasEstimadas: number,
  horaTipo: "seca" | "operada" = "operada",
): OrcamentoItem {
  const horas = round2(horasEstimadas);
  const preco = precoHoraDoEquipamento(equipamento, precosHM);
  const valorUnitario = preco ? (horaTipo === "seca" ? preco.valor_hora_seca : preco.valor_hora_operada) : null;
  return {
    id: crypto.randomUUID(),
    tipo: "hora_maquina",
    descricao: descricaoHora(equipamento.nome, horas, horaTipo),
    origem_id: equipamento.id,
    hora_tipo: horaTipo,
    quantidade_estimada: horas,
    valor_unitario: valorUnitario,
    valor_total: valorUnitario != null ? valorItem(horas, valorUnitario) : 0,
    sem_preco: preco === null,
  };
}

// Item por metro (estimativa). origem_id guarda o id do preço de fundação (p/ o handoff ler o diâmetro).
export function criarItemMetro(preco: PrecoFundacao, metrosEstimados: number): OrcamentoItem {
  const metros = round2(metrosEstimados);
  return {
    id: crypto.randomUUID(),
    tipo: "por_metro",
    descricao: `Estaca Ø${preco.diametro_broca_mm}mm — ${metros}m (estimado)`,
    origem_id: preco.id,
    hora_tipo: null,
    quantidade_estimada: metros,
    valor_unitario: preco.valor_metro,
    valor_total: valorItem(metros, preco.valor_metro),
    sem_preco: false,
  };
}

export function criarItemMobilizacao(preco: PrecoMobilizacao): OrcamentoItem {
  return {
    id: crypto.randomUUID(),
    tipo: "mobilizacao",
    descricao: preco.descricao,
    origem_id: preco.id,
    hora_tipo: null,
    quantidade_estimada: 1,
    valor_unitario: preco.valor,
    valor_total: valorItem(1, preco.valor),
    sem_preco: false,
  };
}

// Troca seca↔operada de um item hora-máquina, re-buscando o preço pelo equipamento.
export function aplicarHoraTipo(
  item: OrcamentoItem,
  equipamento: Equipamento | undefined,
  precosHM: PrecoHoraMaquina[],
  tipo: "seca" | "operada",
): OrcamentoItem {
  if (item.tipo !== "hora_maquina") return item;
  const preco = equipamento ? precoHoraDoEquipamento(equipamento, precosHM) : null;
  const valorUnitario = preco ? (tipo === "seca" ? preco.valor_hora_seca : preco.valor_hora_operada) : null;
  const nome = equipamento ? equipamento.nome : item.descricao.split(" — ")[0];
  return {
    ...item,
    hora_tipo: tipo,
    valor_unitario: valorUnitario,
    valor_total: valorUnitario != null ? valorItem(item.quantidade_estimada, valorUnitario) : 0,
    sem_preco: preco === null,
    descricao: descricaoHora(nome, item.quantidade_estimada, tipo),
  };
}

export function calcularTotalOrcamento(itens: OrcamentoItem[], desconto: number): number {
  const soma = itens.reduce((s, i) => s + i.valor_total, 0);
  return round2(soma - desconto);
}

export function temPendencia(orc: { itens: OrcamentoItem[] }): boolean {
  return orc.itens.some((i) => i.sem_preco);
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/features/orcamentos/calculo.test.ts`
Expected: PASS (todos os testes).

- [ ] **Step 6: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add src/shared/types/index.ts src/features/orcamentos/calculo.ts src/features/orcamentos/calculo.test.ts
git commit -m "feat: add orcamento types and item calculation"
```

---

## Task 2: Número + derivações (guards de ciclo + validade)

**Files:**
- Create: `src/features/orcamentos/numero-orcamento.ts`
- Test: `src/features/orcamentos/numero-orcamento.test.ts`
- Create: `src/features/orcamentos/derivacoes.ts`
- Test: `src/features/orcamentos/derivacoes.test.ts`

**Interfaces:**
- Consumes: `Orcamento`, `OrcamentoItem` (Task 1).
- Produces:
  - `proximoNumeroORC(orcamentos: Pick<Orcamento, "numero">[], ano: number): string` → `"ORC-AAAA-NNNN"`
  - `validadeVencida(orc: Pick<Orcamento, "validade">, agoraISO: string): boolean`
  - `podeEnviar(orc: Pick<Orcamento, "status" | "itens">): { pode: boolean; motivo?: string }`
  - `podeDecidir(orc: Pick<Orcamento, "status">): { pode: boolean; motivo?: string }`

- [ ] **Step 1: Teste de numeração (falha)** — `src/features/orcamentos/numero-orcamento.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { proximoNumeroORC } from "@/features/orcamentos/numero-orcamento";

describe("proximoNumeroORC", () => {
  it("começa em 0001 quando não há orçamentos do ano", () => {
    expect(proximoNumeroORC([], 2026)).toBe("ORC-2026-0001");
  });

  it("incrementa a partir do maior sequencial do ano", () => {
    const orcs = [{ numero: "ORC-2026-0001" }, { numero: "ORC-2026-0003" }];
    expect(proximoNumeroORC(orcs, 2026)).toBe("ORC-2026-0004");
  });

  it("ignora outros anos e outros prefixos", () => {
    const orcs = [{ numero: "ORC-2025-0099" }, { numero: "FAT-2026-0050" }];
    expect(proximoNumeroORC(orcs, 2026)).toBe("ORC-2026-0001");
  });
});
```

- [ ] **Step 2: Rodar (falha)**

Run: `npx vitest run src/features/orcamentos/numero-orcamento.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar** — `src/features/orcamentos/numero-orcamento.ts`

```typescript
import type { Orcamento } from "@/shared/types";

// Próximo número no formato ORC-AAAA-NNNN (sequencial por ano).
export function proximoNumeroORC(orcamentos: Pick<Orcamento, "numero">[], ano: number): string {
  const prefixo = `ORC-${ano}-`;
  const maior = orcamentos
    .map((o) => o.numero)
    .filter((n) => n.startsWith(prefixo))
    .map((n) => Number.parseInt(n.slice(prefixo.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => (n > max ? n : max), 0);
  return `${prefixo}${String(maior + 1).padStart(4, "0")}`;
}
```

- [ ] **Step 4: Rodar (passa)**

Run: `npx vitest run src/features/orcamentos/numero-orcamento.test.ts`
Expected: PASS.

- [ ] **Step 5: Teste de derivações (falha)** — `src/features/orcamentos/derivacoes.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { podeDecidir, podeEnviar, validadeVencida } from "@/features/orcamentos/derivacoes";
import type { OrcamentoItem } from "@/shared/types";

const itemFake: OrcamentoItem = {
  id: "i1",
  tipo: "hora_maquina",
  descricao: "x",
  origem_id: "eq-001",
  hora_tipo: "operada",
  quantidade_estimada: 1,
  valor_unitario: 100,
  valor_total: 100,
  sem_preco: false,
};

describe("validadeVencida", () => {
  it("é false quando não há validade", () => {
    expect(validadeVencida({ validade: null }, "2026-06-29T12:00:00.000Z")).toBe(false);
  });
  it("é true quando a validade é anterior a hoje", () => {
    expect(validadeVencida({ validade: "2026-05-01" }, "2026-06-29T12:00:00.000Z")).toBe(true);
  });
  it("é false quando a validade é hoje ou futura", () => {
    expect(validadeVencida({ validade: "2026-06-29" }, "2026-06-29T12:00:00.000Z")).toBe(false);
    expect(validadeVencida({ validade: "2026-07-30" }, "2026-06-29T12:00:00.000Z")).toBe(false);
  });
});

describe("podeEnviar", () => {
  it("bloqueia orçamento vazio", () => {
    const r = podeEnviar({ status: "rascunho", itens: [] });
    expect(r.pode).toBe(false);
    expect(r.motivo).toMatch(/vazio/i);
  });
  it("permite rascunho com itens", () => {
    expect(podeEnviar({ status: "rascunho", itens: [itemFake] }).pode).toBe(true);
  });
  it("bloqueia quando já não é rascunho", () => {
    expect(podeEnviar({ status: "enviado", itens: [itemFake] }).pode).toBe(false);
  });
});

describe("podeDecidir", () => {
  it("só permite a partir de enviado", () => {
    expect(podeDecidir({ status: "enviado" }).pode).toBe(true);
    expect(podeDecidir({ status: "rascunho" }).pode).toBe(false);
    expect(podeDecidir({ status: "aprovado" }).pode).toBe(false);
  });
});
```

- [ ] **Step 6: Rodar (falha)**

Run: `npx vitest run src/features/orcamentos/derivacoes.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 7: Implementar** — `src/features/orcamentos/derivacoes.ts`

```typescript
import type { Orcamento } from "@/shared/types";

// Validade vencida: validade (YYYY-MM-DD) anterior à data de hoje. Comparação lexical de
// datas ISO date-only é segura. `agoraISO` injetado p/ pureza/determinismo nos testes.
export function validadeVencida(orc: Pick<Orcamento, "validade">, agoraISO: string): boolean {
  if (!orc.validade) return false;
  return orc.validade < agoraISO.slice(0, 10);
}

// Enviar: só de rascunho e com ao menos um item.
export function podeEnviar(
  orc: Pick<Orcamento, "status" | "itens">,
): { pode: boolean; motivo?: string } {
  if (orc.status !== "rascunho") return { pode: false, motivo: "Só rascunhos podem ser enviados." };
  if (orc.itens.length === 0) return { pode: false, motivo: "Orçamento vazio: adicione ao menos um item." };
  return { pode: true };
}

// Aprovar/recusar: só de enviado.
export function podeDecidir(orc: Pick<Orcamento, "status">): { pode: boolean; motivo?: string } {
  if (orc.status !== "enviado") return { pode: false, motivo: "Só orçamentos enviados podem ser decididos." };
  return { pode: true };
}
```

- [ ] **Step 8: Rodar (passa) + tipos**

Run: `npx vitest run src/features/orcamentos/numero-orcamento.test.ts src/features/orcamentos/derivacoes.test.ts && npx tsc --noEmit`
Expected: PASS + EXIT 0.

- [ ] **Step 9: Commit**

```bash
git add src/features/orcamentos/numero-orcamento.ts src/features/orcamentos/numero-orcamento.test.ts src/features/orcamentos/derivacoes.ts src/features/orcamentos/derivacoes.test.ts
git commit -m "feat: add orcamento numbering and cycle guards"
```

---

## Task 3: Store + labels + stub de mock

**Files:**
- Create: `src/mocks/orcamentos.ts` (STUB — array vazio; Task 4 substitui pelo conteúdo real)
- Create: `src/features/orcamentos/orcamentos-store.ts`
- Test: `src/features/orcamentos/orcamentos-store.test.ts`
- Create: `src/features/orcamentos/labels.tsx`

**Interfaces:**
- Consumes: `calcularTotalOrcamento` (Task 1), `proximoNumeroORC` (Task 2), `podeEnviar`, `podeDecidir` (Task 2); types (Task 1).
- Produces:
  - `criarOrcamentosStore(inicial: Orcamento[])` retornando `{ listar, obter, criar, atualizar, enviar, aprovar, recusar, vincularOS, useTodos, useOrcamento }`
  - `orcamentosStore` (singleton)
  - `type ResultadoTransicao = { ok: true; orcamento: Orcamento } | { ok: false; motivo: string }`
  - `type NovoOrcamento = { cliente_id: string; descricao_obra: string; validade: string | null }`
  - `type PatchOrcamento = Partial<Pick<Orcamento, "itens" | "desconto" | "observacao" | "descricao_obra" | "validade">>`
  - assinaturas: `criar(data: NovoOrcamento): Orcamento`; `atualizar(id: string, patch: PatchOrcamento): void`; `enviar(id: string): ResultadoTransicao`; `aprovar(id: string): ResultadoTransicao`; `recusar(id: string): ResultadoTransicao`; `vincularOS(id: string, osId: string): void`; `obter(id: string): Orcamento | undefined`; `listar(): Orcamento[]`; `useTodos(): Orcamento[]`; `useOrcamento(id: string): Orcamento | undefined`
  - `StatusOrcamentoBadge`, `STATUS_ORCAMENTO: StatusOrcamento[]`, `STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string>`

- [ ] **Step 1: Criar o stub do mock** — `src/mocks/orcamentos.ts`

```typescript
import type { Orcamento } from "@/shared/types";

// STUB — preenchido com dados reais na Task 4.
export const orcamentos: Orcamento[] = [];
```

- [ ] **Step 2: Escrever os testes do store (falha)** — `src/features/orcamentos/orcamentos-store.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { criarOrcamentosStore } from "@/features/orcamentos/orcamentos-store";
import type { Orcamento, OrcamentoItem } from "@/shared/types";

const item = (over: Partial<OrcamentoItem> = {}): OrcamentoItem => ({
  id: crypto.randomUUID(),
  tipo: "hora_maquina",
  descricao: "Escavadeira — 10 h operada (estimado)",
  origem_id: "eq-001",
  hora_tipo: "operada",
  quantidade_estimada: 10,
  valor_unitario: 360,
  valor_total: 3600,
  sem_preco: false,
  ...over,
});

const base = (over: Partial<Orcamento> = {}): Orcamento => ({
  id: "orc-x",
  numero: "ORC-2026-0001",
  cliente_id: "cl-001",
  descricao_obra: "Obra teste",
  itens: [],
  desconto: 0,
  valor_total: 0,
  validade: "2026-07-30",
  observacao: null,
  status: "rascunho",
  os_id: null,
  enviado_em: null,
  decidido_em: null,
  created_at: "2026-06-01T12:00:00.000Z",
  updated_at: "2026-06-01T12:00:00.000Z",
  ...over,
});

describe("criar", () => {
  it("cria rascunho com número, itens vazios e total zero", () => {
    const store = criarOrcamentosStore([]);
    const novo = store.criar({ cliente_id: "cl-002", descricao_obra: "Nova obra", validade: "2026-08-01" });
    expect(novo.status).toBe("rascunho");
    expect(novo.numero).toBe("ORC-2026-0001");
    expect(novo.itens).toEqual([]);
    expect(novo.valor_total).toBe(0);
    expect(novo.validade).toBe("2026-08-01");
    expect(store.listar()).toHaveLength(1);
  });
});

describe("atualizar", () => {
  it("recalcula o total ao trocar itens e desconto", () => {
    const store = criarOrcamentosStore([base()]);
    store.atualizar("orc-x", { itens: [item(), item({ valor_total: 850, tipo: "mobilizacao", hora_tipo: null })], desconto: 100 });
    expect(store.obter("orc-x")?.valor_total).toBe(4350); // 3600 + 850 − 100
  });
});

describe("enviar", () => {
  it("bloqueia orçamento vazio", () => {
    const store = criarOrcamentosStore([base()]);
    const r = store.enviar("orc-x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toMatch(/vazio/i);
  });
  it("envia rascunho com itens", () => {
    const store = criarOrcamentosStore([base({ itens: [item()], valor_total: 3600 })]);
    const r = store.enviar("orc-x");
    expect(r.ok).toBe(true);
    expect(store.obter("orc-x")?.status).toBe("enviado");
    expect(store.obter("orc-x")?.enviado_em).not.toBeNull();
  });
});

describe("aprovar / recusar", () => {
  it("aprova a partir de enviado", () => {
    const store = criarOrcamentosStore([base({ status: "enviado", itens: [item()], valor_total: 3600 })]);
    const r = store.aprovar("orc-x");
    expect(r.ok).toBe(true);
    expect(store.obter("orc-x")?.status).toBe("aprovado");
    expect(store.obter("orc-x")?.decidido_em).not.toBeNull();
  });
  it("recusa a partir de enviado", () => {
    const store = criarOrcamentosStore([base({ status: "enviado", itens: [item()], valor_total: 3600 })]);
    expect(store.recusar("orc-x").ok).toBe(true);
    expect(store.obter("orc-x")?.status).toBe("recusado");
  });
  it("bloqueia decidir um rascunho", () => {
    const store = criarOrcamentosStore([base({ itens: [item()] })]);
    expect(store.aprovar("orc-x").ok).toBe(false);
  });
});

describe("vincularOS", () => {
  it("grava o os_id", () => {
    const store = criarOrcamentosStore([base({ status: "aprovado", itens: [item()], valor_total: 3600 })]);
    store.vincularOS("orc-x", "os-123");
    expect(store.obter("orc-x")?.os_id).toBe("os-123");
  });
});
```

- [ ] **Step 3: Rodar (falha)**

Run: `npx vitest run src/features/orcamentos/orcamentos-store.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 4: Implementar o store** — `src/features/orcamentos/orcamentos-store.ts`

```typescript
import { useSyncExternalStore } from "react";
import { orcamentos as seed } from "@/mocks/orcamentos";
import { calcularTotalOrcamento } from "@/features/orcamentos/calculo";
import { proximoNumeroORC } from "@/features/orcamentos/numero-orcamento";
import { podeDecidir, podeEnviar } from "@/features/orcamentos/derivacoes";
import type { Orcamento } from "@/shared/types";

export type ResultadoTransicao =
  | { ok: true; orcamento: Orcamento }
  | { ok: false; motivo: string };

export type NovoOrcamento = {
  cliente_id: string;
  descricao_obra: string;
  validade: string | null;
};

export type PatchOrcamento = Partial<
  Pick<Orcamento, "itens" | "desconto" | "observacao" | "descricao_obra" | "validade">
>;

export function criarOrcamentosStore(inicial: Orcamento[]) {
  let itens: Orcamento[] = inicial.map((o) => ({ ...o }));
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

  function criar(data: NovoOrcamento): Orcamento {
    const agora = new Date().toISOString();
    const ano = new Date(agora).getFullYear();
    const novo: Orcamento = {
      id: crypto.randomUUID(),
      numero: proximoNumeroORC(itens, ano),
      cliente_id: data.cliente_id,
      descricao_obra: data.descricao_obra,
      itens: [],
      desconto: 0,
      valor_total: 0,
      validade: data.validade,
      observacao: null,
      status: "rascunho",
      os_id: null,
      enviado_em: null,
      decidido_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return novo;
  }

  function atualizar(id: string, patch: PatchOrcamento) {
    itens = itens.map((o) => {
      if (o.id !== id) return o;
      const next: Orcamento = { ...o, ...patch, updated_at: new Date().toISOString() };
      next.valor_total = calcularTotalOrcamento(next.itens, next.desconto);
      return next;
    });
    notificar();
  }

  function enviar(id: string): ResultadoTransicao {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Orçamento não encontrado." };
    const r = podeEnviar(atual);
    if (!r.pode) return { ok: false, motivo: r.motivo ?? "Não é possível enviar." };
    const agora = new Date().toISOString();
    const enviado: Orcamento = { ...atual, status: "enviado", enviado_em: agora, updated_at: agora };
    itens = itens.map((o) => (o.id === id ? enviado : o));
    notificar();
    return { ok: true, orcamento: enviado };
  }

  function decidir(id: string, status: "aprovado" | "recusado"): ResultadoTransicao {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Orçamento não encontrado." };
    const r = podeDecidir(atual);
    if (!r.pode) return { ok: false, motivo: r.motivo ?? "Não é possível decidir." };
    const agora = new Date().toISOString();
    const decidido: Orcamento = { ...atual, status, decidido_em: agora, updated_at: agora };
    itens = itens.map((o) => (o.id === id ? decidido : o));
    notificar();
    return { ok: true, orcamento: decidido };
  }

  const aprovar = (id: string) => decidir(id, "aprovado");
  const recusar = (id: string) => decidir(id, "recusado");

  function vincularOS(id: string, osId: string) {
    itens = itens.map((o) =>
      o.id === id ? { ...o, os_id: osId, updated_at: new Date().toISOString() } : o,
    );
    notificar();
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useOrcamento = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((o) => o.id === id),
      () => itens.find((o) => o.id === id),
    );

  return { listar, obter, criar, atualizar, enviar, aprovar, recusar, vincularOS, useTodos, useOrcamento };
}

export const orcamentosStore = criarOrcamentosStore(seed);
```

- [ ] **Step 5: Rodar (passa)**

Run: `npx vitest run src/features/orcamentos/orcamentos-store.test.ts`
Expected: PASS.

- [ ] **Step 6: Implementar os labels** — `src/features/orcamentos/labels.tsx`

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { StatusOrcamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export const STATUS_ORCAMENTO: StatusOrcamento[] = ["rascunho", "enviado", "aprovado", "recusado"];

// Sem token verde no design system: aprovado usa `secondary` (terra). recusado = destructive.
const STATUS_CLASSE: Record<StatusOrcamento, string> = {
  rascunho: "bg-steel/20 text-foreground border-steel/40",
  enviado: "bg-primary/20 text-foreground border-primary/50",
  aprovado: "bg-secondary/25 text-foreground border-secondary/50",
  recusado: "bg-destructive/15 text-foreground border-destructive/40",
};

export function StatusOrcamentoBadge({
  status,
  className,
}: {
  status: StatusOrcamento;
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
      {STATUS_ORCAMENTO_LABEL[status]}
    </span>
  );
}
```

- [ ] **Step 7: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 8: Commit**

```bash
git add src/mocks/orcamentos.ts src/features/orcamentos/orcamentos-store.ts src/features/orcamentos/orcamentos-store.test.ts src/features/orcamentos/labels.tsx
git commit -m "feat: add orcamentos store, cycle transitions and status labels"
```

---

## Task 4: Mocks reais

**Files:**
- Modify: `src/mocks/orcamentos.ts` (substituir o stub pelo conteúdo real)
- Test: `src/mocks/orcamentos.test.ts`

**Interfaces:**
- Consumes: `Orcamento`, `OrcamentoItem` (Task 1); `calcularTotalOrcamento` (Task 1); `validadeVencida` (Task 2). Ids de `clientes.ts` (cl-001..cl-004), `equipamentos.ts` (eq-001, eq-002, eq-005), `precos-*.ts` (phm-001/002/005, pf-001, pm-001/002), e uma OS existente (`os-010`).
- Produces: `export const orcamentos: Orcamento[]` (6 itens, edge cases).

**Tabela de referência (valores ativos):** eq-001 operada=360 / seca=280; eq-002 operada=290; eq-005 = sem tarifa ativa (phm-005 inativo); pf-001 Ø300=90/m; pm-001=850; pm-002=1200.

- [ ] **Step 1: Escrever o teste do mock (falha por causa do stub vazio)** — `src/mocks/orcamentos.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { orcamentos } from "@/mocks/orcamentos";
import { calcularTotalOrcamento } from "@/features/orcamentos/calculo";
import { validadeVencida } from "@/features/orcamentos/derivacoes";

const AGORA = "2026-06-29T12:00:00.000Z";

describe("mock de orçamentos", () => {
  it("tem 6 orçamentos com ids únicos", () => {
    expect(orcamentos).toHaveLength(6);
    expect(new Set(orcamentos.map((o) => o.id)).size).toBe(6);
  });

  it("cada valor_total bate com a soma dos itens menos o desconto", () => {
    for (const o of orcamentos) {
      expect(o.valor_total).toBe(calcularTotalOrcamento(o.itens, o.desconto));
    }
  });

  it("cobre os edge cases: rascunho vazio, sem-preço, validade vencida, vinculado a OS", () => {
    const vazio = orcamentos.find((o) => o.id === "orc-001");
    expect(vazio?.status).toBe("rascunho");
    expect(vazio?.itens).toHaveLength(0);
    expect(vazio?.valor_total).toBe(0);

    const semPreco = orcamentos.find((o) => o.id === "orc-004");
    expect(semPreco?.itens.some((i) => i.sem_preco)).toBe(true);

    const vencido = orcamentos.find((o) => o.id === "orc-005");
    expect(validadeVencida(vencido!, AGORA)).toBe(true);

    const aprovado = orcamentos.find((o) => o.id === "orc-003");
    expect(aprovado?.status).toBe("aprovado");
    expect(aprovado?.os_id).not.toBeNull();
  });

  it("apresenta os quatro status", () => {
    expect(new Set(orcamentos.map((o) => o.status))).toEqual(
      new Set(["rascunho", "enviado", "aprovado", "recusado"]),
    );
  });
});
```

- [ ] **Step 2: Rodar (falha)**

Run: `npx vitest run src/mocks/orcamentos.test.ts`
Expected: FAIL (stub vazio: 0 ≠ 6).

- [ ] **Step 3: Substituir o stub pelo conteúdo real** — `src/mocks/orcamentos.ts`

```typescript
import type { Orcamento } from "@/shared/types";

// ~6 orçamentos derivados de clientes.ts + precos-*.ts (aritmética consistente, como faturamentos.ts).
// Edge cases: orc-001 rascunho VAZIO; orc-002 enviado multi-item+mobilização; orc-003 aprovado por_metro
// com os_id; orc-004 recusado com item SEM PREÇO (eq-005, tarifa inativa); orc-005 enviado com validade
// VENCIDA; orc-006 rascunho hora seca + mobilização + desconto. Mocks viram seed.sql no backend.
export const orcamentos: Orcamento[] = [
  {
    id: "orc-001",
    numero: "ORC-2026-0001",
    cliente_id: "cl-002",
    descricao_obra: "Terraplanagem de lote — aguardando escopo do cliente",
    itens: [],
    desconto: 0,
    valor_total: 0,
    validade: "2026-07-30",
    observacao: null,
    status: "rascunho",
    os_id: null,
    enviado_em: null,
    decidido_em: null,
    created_at: "2026-06-26T12:00:00.000Z",
    updated_at: "2026-06-26T12:00:00.000Z",
  },
  {
    id: "orc-002",
    numero: "ORC-2026-0002",
    cliente_id: "cl-001",
    descricao_obra: "Movimentação de terra e nivelamento — Loteamento Horizonte, etapa 1",
    itens: [
      {
        id: "orc-002:eq-001",
        tipo: "hora_maquina",
        descricao: "Escavadeira Hidráulica Caterpillar 320D — 40 h operada (estimado)",
        origem_id: "eq-001",
        hora_tipo: "operada",
        quantidade_estimada: 40,
        valor_unitario: 360,
        valor_total: 14400,
        sem_preco: false,
      },
      {
        id: "orc-002:mob",
        tipo: "mobilizacao",
        descricao: "Mobilização e desmobilização de escavadeira até 50 km do pátio",
        origem_id: "pm-001",
        hora_tipo: null,
        quantidade_estimada: 1,
        valor_unitario: 850,
        valor_total: 850,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 15250,
    validade: "2026-07-22",
    observacao: "Estimativa enviada por e-mail ao cliente.",
    status: "enviado",
    os_id: null,
    enviado_em: "2026-06-22T14:00:00.000Z",
    decidido_em: null,
    created_at: "2026-06-21T17:00:00.000Z",
    updated_at: "2026-06-22T14:00:00.000Z",
  },
  {
    id: "orc-003",
    numero: "ORC-2026-0003",
    cliente_id: "cl-003",
    descricao_obra: "Estaqueamento de fundação — galpão municipal",
    itens: [
      {
        id: "orc-003:metro",
        tipo: "por_metro",
        descricao: "Estaca Ø300mm — 50m (estimado)",
        origem_id: "pf-001",
        hora_tipo: null,
        quantidade_estimada: 50,
        valor_unitario: 90,
        valor_total: 4500,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 4500,
    validade: "2026-07-10",
    observacao: null,
    status: "aprovado",
    os_id: "os-010",
    enviado_em: "2026-06-10T10:00:00.000Z",
    decidido_em: "2026-06-12T09:00:00.000Z",
    created_at: "2026-06-09T16:00:00.000Z",
    updated_at: "2026-06-12T09:00:00.000Z",
  },
  {
    id: "orc-004",
    numero: "ORC-2026-0004",
    cliente_id: "cl-002",
    descricao_obra: "Transporte de material — caçamba (tarifa pendente)",
    itens: [
      {
        id: "orc-004:eq-005",
        tipo: "hora_maquina",
        descricao: "Caminhão Caçamba Basculante — 12 h operada (estimado)",
        origem_id: "eq-005",
        hora_tipo: "operada",
        quantidade_estimada: 12,
        valor_unitario: null,
        valor_total: 0,
        sem_preco: true,
      },
    ],
    desconto: 0,
    valor_total: 0,
    validade: "2026-06-20",
    observacao: "Cliente recusou — faltava tarifa do caminhão caçamba para fechar o preço.",
    status: "recusado",
    os_id: null,
    enviado_em: "2026-06-05T11:00:00.000Z",
    decidido_em: "2026-06-08T15:00:00.000Z",
    created_at: "2026-06-04T13:00:00.000Z",
    updated_at: "2026-06-08T15:00:00.000Z",
  },
  {
    id: "orc-005",
    numero: "ORC-2026-0005",
    cliente_id: "cl-001",
    descricao_obra: "Escavação de vala — adutora setor B",
    itens: [
      {
        id: "orc-005:eq-002",
        tipo: "hora_maquina",
        descricao: "Escavadeira 10t — 30 h operada (estimado)",
        origem_id: "eq-002",
        hora_tipo: "operada",
        quantidade_estimada: 30,
        valor_unitario: 290,
        valor_total: 8700,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 8700,
    validade: "2026-05-01",
    observacao: "Sem resposta do cliente — validade expirada.",
    status: "enviado",
    os_id: null,
    enviado_em: "2026-04-15T09:00:00.000Z",
    decidido_em: null,
    created_at: "2026-04-14T16:00:00.000Z",
    updated_at: "2026-04-15T09:00:00.000Z",
  },
  {
    id: "orc-006",
    numero: "ORC-2026-0006",
    cliente_id: "cl-003",
    descricao_obra: "Locação de escavadeira (sem operador) + mobilização especial",
    itens: [
      {
        id: "orc-006:eq-001",
        tipo: "hora_maquina",
        descricao: "Escavadeira Hidráulica Caterpillar 320D — 20 h seca (estimado)",
        origem_id: "eq-001",
        hora_tipo: "seca",
        quantidade_estimada: 20,
        valor_unitario: 280,
        valor_total: 5600,
        sem_preco: false,
      },
      {
        id: "orc-006:mob",
        tipo: "mobilizacao",
        descricao:
          "Transporte em prancha na região metropolitana, ida e volta no mesmo dia, equipamento de médio porte, com escolta quando exigida pela legislação municipal de trânsito",
        origem_id: "pm-002",
        hora_tipo: null,
        quantidade_estimada: 1,
        valor_unitario: 1200,
        valor_total: 1200,
        sem_preco: false,
      },
    ],
    desconto: 800,
    valor_total: 6000,
    observacao: null,
    status: "rascunho",
    validade: "2026-07-15",
    os_id: null,
    enviado_em: null,
    decidido_em: null,
    created_at: "2026-06-27T10:00:00.000Z",
    updated_at: "2026-06-27T10:00:00.000Z",
  },
];
```

> Conferir que **toda** entrada do array tem o campo `validade` (o type exige `validade: string | null`): orc-001 `2026-07-30`, orc-002 `2026-07-22`, orc-003 `2026-07-10`, orc-004 `2026-06-20`, orc-005 `2026-05-01` (vencida vs. AGORA 2026-06-29), orc-006 `2026-07-15`.

- [ ] **Step 4: Rodar (passa)**

Run: `npx vitest run src/mocks/orcamentos.test.ts`
Expected: PASS (6 orçamentos, aritmética confere, edge cases presentes).

- [ ] **Step 5: Rodar a suíte completa + tipos**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS (toda a suíte, sem regressão) + EXIT 0.

- [ ] **Step 6: Commit**

```bash
git add src/mocks/orcamentos.ts src/mocks/orcamentos.test.ts
git commit -m "feat: add orcamentos mocks with edge cases"
```

---

## Task 5: Rota de lista + formulário de criação + menu

**Files:**
- Create: `src/features/orcamentos/orcamento-schema.ts`
- Create: `src/features/orcamentos/components/orcamento-form.tsx`
- Create: `src/features/orcamentos/components/orcamentos-page.tsx`
- Create: `src/features/orcamentos/index.ts` (barrel — só `OrcamentosPage` por enquanto)
- Create: `src/routes/admin.orcamentos.index.tsx`
- Modify: `src/features/retaguarda/retaguarda-shell.tsx` (+1 item de nav)
- Modify: `src/routeTree.gen.ts` (auto-gerado pelo dev server)

**Interfaces:**
- Consumes: `orcamentosStore` (`useTodos`, `criar`) (Task 3); `StatusOrcamentoBadge`, `STATUS_ORCAMENTO`, `STATUS_ORCAMENTO_LABEL` (Task 3); `validadeVencida` (Task 2); `clientesStore` (`useAll`, `getById`); `formatBRL`; `DataList`/`Column`, `PageHeader`, `FormDialog`, `useMockResource`.
- Produces: `OrcamentosPage` (default da rota `/admin/orcamentos`); `orcamentoSchema`, `OrcamentoFormValues`.

- [ ] **Step 1: Schema do formulário** — `src/features/orcamentos/orcamento-schema.ts`

```typescript
import { z } from "zod";

export const orcamentoSchema = z.object({
  cliente_id: z.string().min(1, "Selecione o cliente"),
  descricao_obra: z.string().trim().min(3, "Descreva a obra"),
  validade: z.string().optional(),
});

export type OrcamentoFormValues = z.infer<typeof orcamentoSchema>;
```

- [ ] **Step 2: Formulário de criação** — `src/features/orcamentos/components/orcamento-form.tsx`

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
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
import { clientesStore } from "@/features/clientes/clientes-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { orcamentoSchema, type OrcamentoFormValues } from "@/features/orcamentos/orcamento-schema";

// Validade padrão = hoje + 30 dias (YYYY-MM-DD).
function validadePadrao(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

interface Props {
  onCancel: () => void;
}

export function OrcamentoForm({ onCancel }: Props) {
  const clientes = clientesStore.useAll().filter((c) => c.ativo);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrcamentoFormValues>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: { cliente_id: "", descricao_obra: "", validade: validadePadrao() },
  });

  const onSubmit = (values: OrcamentoFormValues) => {
    const novo = orcamentosStore.criar({
      cliente_id: values.cliente_id,
      descricao_obra: values.descricao_obra.trim(),
      validade: values.validade?.trim() ? values.validade : null,
    });
    toast.success(`Orçamento criado — ${novo.numero}.`);
    navigate({ to: "/admin/orcamentos/$orcamentoId", params: { orcamentoId: novo.id } });
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
        <Label htmlFor="descricao_obra">Obra *</Label>
        <Input id="descricao_obra" {...register("descricao_obra")} aria-invalid={!!errors.descricao_obra} />
        {errors.descricao_obra ? (
          <p className="text-xs text-destructive">{errors.descricao_obra.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="validade">Validade</Label>
        <Input id="validade" type="date" className="font-mono" {...register("validade")} />
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
          Criar orçamento
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Página de lista** — `src/features/orcamentos/components/orcamentos-page.tsx`

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
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { OrcamentoForm } from "@/features/orcamentos/components/orcamento-form";
import {
  StatusOrcamentoBadge,
  STATUS_ORCAMENTO,
  STATUS_ORCAMENTO_LABEL,
} from "@/features/orcamentos/labels";
import { validadeVencida } from "@/features/orcamentos/derivacoes";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { Orcamento, StatusOrcamento } from "@/shared/types";
import { cn } from "@/lib/utils";

function validadeInfo(orc: Orcamento, agoraISO: string): { texto: string; vencida: boolean } {
  if (!orc.validade) return { texto: "—", vencida: false };
  return { texto: orc.validade.split("-").reverse().join("/"), vencida: validadeVencida(orc, agoraISO) };
}

export function OrcamentosPage() {
  const todos = orcamentosStore.useTodos();
  const { isLoading, error, retry } = useMockResource(todos);
  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOrcamento | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);
  const agoraISO = new Date().toISOString();

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((o) => {
      if (filtroStatus !== "todos" && o.status !== filtroStatus) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.descricao_obra.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroStatus]);

  const columns: Column<Orcamento>[] = [
    {
      header: "Número",
      cell: (o) => (
        <Link
          to="/admin/orcamentos/$orcamentoId"
          params={{ orcamentoId: o.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {o.numero}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (o) => (
        <div className="min-w-0 max-w-[16rem] truncate">{clientesStore.getById(o.cliente_id)?.nome ?? "—"}</div>
      ),
    },
    {
      header: "Obra",
      cell: (o) => <div className="min-w-0 max-w-[14rem] truncate text-muted-foreground">{o.descricao_obra}</div>,
    },
    { header: "Valor", className: "font-mono", cell: (o) => formatBRL(o.valor_total) },
    {
      header: "Validade",
      className: "font-mono",
      cell: (o) => {
        const v = validadeInfo(o, agoraISO);
        return <span className={cn(v.vencida && "text-destructive")}>{v.texto}</span>;
      },
    },
    { header: "Status", cell: (o) => <StatusOrcamentoBadge status={o.status} /> },
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
      <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as StatusOrcamento | "todos")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_ORCAMENTO.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_ORCAMENTO_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCard = (o: Orcamento) => {
    const v = validadeInfo(o, agoraISO);
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/admin/orcamentos/$orcamentoId"
            params={{ orcamentoId: o.id }}
            className="font-mono text-sm font-semibold text-foreground"
          >
            {o.numero}
          </Link>
          <StatusOrcamentoBadge status={o.status} />
        </div>
        <div className="mt-2 font-display font-bold text-card-foreground">
          {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
        </div>
        <div className="truncate text-xs text-muted-foreground">{o.descricao_obra}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-foreground">{formatBRL(o.valor_total)}</span>
          <span className={cn("font-mono text-xs", v.vencida ? "text-destructive" : "text-muted-foreground")}>
            {v.texto}
          </span>
        </div>
      </div>
    );
  };

  const novoBtn = (
    <Button
      onClick={() => setFormAberto(true)}
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
    >
      <Icon icon="lucide:plus" className="h-4 w-4" />
      Novo orçamento
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Orçamentos"
        descricao="Monte estimativas a partir das tabelas de preço, antes de executar a obra."
        acoes={novoBtn}
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
          icon: "lucide:file-spreadsheet",
          titulo: todos.length === 0 ? "Nenhum orçamento ainda" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Crie o primeiro orçamento para um cliente."
              : "Ajuste a busca ou o filtro.",
          cta: todos.length === 0 ? novoBtn : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Novo orçamento"
        descricao="Os campos com * são obrigatórios."
      >
        <OrcamentoForm onCancel={() => setFormAberto(false)} />
      </FormDialog>
    </div>
  );
}
```

- [ ] **Step 4: Barrel** — `src/features/orcamentos/index.ts`

```typescript
export { OrcamentosPage } from "@/features/orcamentos/components/orcamentos-page";
```

- [ ] **Step 5: Rota de lista** — `src/routes/admin.orcamentos.index.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { OrcamentosPage } from "@/features/orcamentos";

export const Route = createFileRoute("/admin/orcamentos/")({
  head: () => ({
    meta: [
      { title: "Orçamentos · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrcamentosPage,
});
```

- [ ] **Step 6: Adicionar o item de menu na sidebar** — `src/features/retaguarda/retaguarda-shell.tsx`

Na lista de imports de `lucide-react` (linhas ~3-13), adicionar `FileSpreadsheet`:

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
  Menu,
  ChevronRight,
} from "lucide-react";
```

No array `itens` (após `{ to: "/admin/precos", ... }` e antes de `{ to: "/admin/faturamento", ... }`), inserir:

```typescript
  { to: "/admin/orcamentos", label: "Orçamentos", icone: FileSpreadsheet },
```

(ordem do funil: Preços → Orçamentos → Faturamento.)

- [ ] **Step 7: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 8: Smoke SSR da rota de lista**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8082/admin/orcamentos`
Expected: `200`.

- [ ] **Step 9: Tratar o routeTree.gen.ts**

Run: `git diff --numstat src/routeTree.gen.ts`
- Se houver mudança estrutural real (linhas adicionadas para a nova rota): incluir no commit.
- Se vier vazio (só CRLF): `git checkout -- src/routeTree.gen.ts`.

- [ ] **Step 10: Commit**

```bash
git add src/features/orcamentos/orcamento-schema.ts src/features/orcamentos/components/orcamento-form.tsx src/features/orcamentos/components/orcamentos-page.tsx src/features/orcamentos/index.ts src/routes/admin.orcamentos.index.tsx src/features/retaguarda/retaguarda-shell.tsx
git add src/routeTree.gen.ts 2>/dev/null || true
git commit -m "feat: build orcamentos list page with create form and nav"
```

---

## Task 6: Rota de detalhe — editor + ciclo (sem handoff)

**Files:**
- Create: `src/features/orcamentos/components/orcamento-item-row.tsx`
- Create: `src/features/orcamentos/components/adicionar-item-orcamento.tsx`
- Create: `src/features/orcamentos/components/orcamento-detalhe.tsx`
- Modify: `src/features/orcamentos/index.ts` (+`OrcamentoDetalhe`)
- Create: `src/routes/admin.orcamentos.$orcamentoId.tsx`
- Modify: `src/routeTree.gen.ts` (auto-gerado)

**Interfaces:**
- Consumes: `orcamentosStore` (`useOrcamento`, `obter`, `atualizar`, `enviar`, `aprovar`, `recusar`) (Task 3); `aplicarHoraTipo`, `temPendencia`, `criarItemHora`, `criarItemMetro`, `criarItemMobilizacao` (Task 1); `valorItem` (de `@/features/faturamento/calculo`); `validadeVencida` (Task 2); `StatusOrcamentoBadge` (Task 3); stores `equipamentosStore`, `precoHoraMaquinaStore`, `precoFundacaoStore`, `precoMobilizacaoStore`, `clientesStore`; `formatBRL`, `formatDataHora`, `ConfirmDialog`.
- Produces: `OrcamentoDetalhe` (default da rota `/admin/orcamentos/$orcamentoId`); `OrcamentoItemRow`; `AdicionarItemOrcamento`.

- [ ] **Step 1: Linha de item** — `src/features/orcamentos/components/orcamento-item-row.tsx`

```tsx
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { OrcamentoItem } from "@/shared/types";

interface OrcamentoItemRowProps {
  item: OrcamentoItem;
  editavel: boolean;
  onQuantidade: (q: number) => void;
  onHoraTipo: (tipo: "seca" | "operada") => void;
  onValorUnitario: (v: number) => void;
  onRemover: () => void;
}

export function OrcamentoItemRow({
  item,
  editavel,
  onQuantidade,
  onHoraTipo,
  onValorUnitario,
  onRemover,
}: OrcamentoItemRowProps) {
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
        <Campo rotulo="Qtd. estimada">
          {editavel ? (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={item.quantidade_estimada}
              onChange={(e) => onQuantidade(Number(e.target.value))}
              className="h-8 font-mono"
            />
          ) : (
            <span className="font-mono text-sm">{`${item.quantidade_estimada} ${unidade}`}</span>
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

- [ ] **Step 2: Adicionar item** — `src/features/orcamentos/components/adicionar-item-orcamento.tsx`

```tsx
import { useState } from "react";
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
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import {
  criarItemHora,
  criarItemMetro,
  criarItemMobilizacao,
} from "@/features/orcamentos/calculo";
import { formatBRL } from "@/features/retaguarda/format";
import type { OrcamentoItem, TipoItemOrcamento } from "@/shared/types";

const TIPOS: { valor: TipoItemOrcamento; label: string }[] = [
  { valor: "hora_maquina", label: "Hora-máquina" },
  { valor: "por_metro", label: "Por metro (estaca)" },
  { valor: "mobilizacao", label: "Mobilização" },
];

export function AdicionarItemOrcamento({
  onAdicionar,
}: {
  onAdicionar: (item: OrcamentoItem) => void;
}) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const fundacoes = precoFundacaoStore.useAll().filter((p) => p.ativo);
  const mobilizacoes = precoMobilizacaoStore.useAll().filter((p) => p.ativo);
  const precosHM = precoHoraMaquinaStore.useAll();

  const [tipo, setTipo] = useState<TipoItemOrcamento>("hora_maquina");
  const [fonte, setFonte] = useState("");
  const [qtd, setQtd] = useState("1");

  const reset = () => {
    setFonte("");
    setQtd("1");
  };

  const adicionar = () => {
    if (!fonte) return;
    const n = Number(qtd);
    const quantidade = Number.isFinite(n) && n > 0 ? n : 1;
    if (tipo === "hora_maquina") {
      const equip = equipamentos.find((e) => e.id === fonte);
      if (!equip) return;
      onAdicionar(criarItemHora(equip, precosHM, quantidade));
    } else if (tipo === "por_metro") {
      const preco = fundacoes.find((p) => p.id === fonte);
      if (!preco) return;
      onAdicionar(criarItemMetro(preco, quantidade));
    } else {
      const preco = mobilizacoes.find((p) => p.id === fonte);
      if (!preco) return;
      onAdicionar(criarItemMobilizacao(preco));
    }
    reset();
  };

  const fontes =
    tipo === "hora_maquina"
      ? equipamentos.map((e) => ({ id: e.id, label: e.nome }))
      : tipo === "por_metro"
        ? fundacoes.map((p) => ({ id: p.id, label: `Ø${p.diametro_broca_mm}mm · ${formatBRL(p.valor_metro)}/m` }))
        : mobilizacoes.map((p) => ({ id: p.id, label: `${p.descricao} · ${formatBRL(p.valor)}` }));

  const mostrarQtd = tipo !== "mobilizacao";
  const unidadeQtd = tipo === "hora_maquina" ? "horas" : "metros";

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed bg-surface/40 p-3">
      <div className="space-y-1">
        <label className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">Tipo</label>
        <Select
          value={tipo}
          onValueChange={(v) => {
            setTipo(v as TipoItemOrcamento);
            reset();
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t.valor} value={t.valor}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[200px] flex-1 space-y-1">
        <label className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">Item</label>
        <Select value={fonte} onValueChange={setFonte}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {fontes.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mostrarQtd ? (
        <div className="w-28 space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">
            Qtd. ({unidadeQtd})
          </label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            className="font-mono"
          />
        </div>
      ) : null}

      <Button
        onClick={adicionar}
        disabled={!fonte}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Adicionar
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Detalhe (editor + ciclo, SEM handoff)** — `src/features/orcamentos/components/orcamento-detalhe.tsx`

```tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { OrcamentoItemRow } from "@/features/orcamentos/components/orcamento-item-row";
import { AdicionarItemOrcamento } from "@/features/orcamentos/components/adicionar-item-orcamento";
import { StatusOrcamentoBadge } from "@/features/orcamentos/labels";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { aplicarHoraTipo, temPendencia } from "@/features/orcamentos/calculo";
import { validadeVencida } from "@/features/orcamentos/derivacoes";
import { valorItem } from "@/features/faturamento/calculo";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDataHora } from "@/shared/lib/format";
import type { OrcamentoItem } from "@/shared/types";

export function OrcamentoDetalhe({ orcamentoId }: { orcamentoId: string }) {
  const orc = orcamentosStore.useOrcamento(orcamentoId);
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const [enviar, setEnviar] = useState(false);
  const [decisao, setDecisao] = useState<null | "aprovar" | "recusar">(null);

  if (!orc) return <OrcamentoNaoEncontrado />;

  const editavel = orc.status === "rascunho";
  const cliente = clientesStore.getById(orc.cliente_id);
  const pendente = temPendencia(orc);
  const vencida = validadeVencida(orc, new Date().toISOString());

  const setItens = (next: OrcamentoItem[]) => orcamentosStore.atualizar(orc.id, { itens: next });

  const handleQuantidade = (itemId: string, q: number) => {
    setItens(
      orc.itens.map((i) => {
        if (i.id !== itemId) return i;
        const qtd = Number.isFinite(q) && q > 0 ? q : 0;
        return {
          ...i,
          quantidade_estimada: qtd,
          valor_total: i.valor_unitario != null ? valorItem(qtd, i.valor_unitario) : 0,
        };
      }),
    );
  };

  const handleValorUnitario = (itemId: string, v: number) => {
    setItens(
      orc.itens.map((i) => {
        if (i.id !== itemId) return i;
        const valor = Number.isFinite(v) && v > 0 ? v : null;
        return {
          ...i,
          valor_unitario: valor,
          valor_total: valor != null ? valorItem(i.quantidade_estimada, valor) : 0,
          sem_preco: valor === null,
        };
      }),
    );
  };

  const handleHoraTipo = (itemId: string, tipo: "seca" | "operada") => {
    setItens(
      orc.itens.map((i) => {
        if (i.id !== itemId) return i;
        const equipamento = i.origem_id ? equipamentos.find((e) => e.id === i.origem_id) : undefined;
        return aplicarHoraTipo(i, equipamento, precosHM, tipo);
      }),
    );
  };

  const handleRemover = (itemId: string) => setItens(orc.itens.filter((i) => i.id !== itemId));

  const onEnviar = () => {
    const r = orcamentosStore.enviar(orc.id);
    setEnviar(false);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(`Orçamento ${r.orcamento.numero} enviado.`);
  };

  const onDecidir = () => {
    if (!decisao) return;
    const r = decisao === "aprovar" ? orcamentosStore.aprovar(orc.id) : orcamentosStore.recusar(orc.id);
    setDecisao(null);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(decisao === "aprovar" ? "Orçamento aprovado." : "Orçamento recusado.");
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/orcamentos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Orçamentos
      </Link>

      <header className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xl font-bold text-foreground">{orc.numero}</h1>
          <StatusOrcamentoBadge status={orc.status} />
        </div>
        <p className="mt-1 font-display font-bold text-card-foreground">{cliente?.nome ?? "—"}</p>
        <p className="text-sm text-muted-foreground">{orc.descricao_obra}</p>
        <p className="mt-2 text-xs text-foreground-faint">
          Validade:{" "}
          <span className={vencida ? "font-medium text-destructive" : ""}>
            {orc.validade ? orc.validade.split("-").reverse().join("/") : "—"}
          </span>
          {orc.enviado_em ? ` · Enviado em ${formatDataHora(orc.enviado_em)}` : ""}
          {orc.decidido_em ? ` · Decidido em ${formatDataHora(orc.decidido_em)}` : ""}
        </p>
      </header>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Itens ({orc.itens.length})</h2>
          {pendente ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <Icon icon="lucide:triangle-alert" className="h-3.5 w-3.5" />
              Há itens sem preço
            </span>
          ) : null}
        </div>

        {orc.itens.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-surface/40 p-6 text-center text-sm text-muted-foreground">
            Nenhum item ainda.{editavel ? " Adicione itens abaixo." : ""}
          </p>
        ) : (
          <div className="space-y-2">
            {orc.itens.map((item) => (
              <OrcamentoItemRow
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

        {editavel ? <AdicionarItemOrcamento onAdicionar={(item) => setItens([...orc.itens, item])} /> : null}
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
                  value={orc.desconto || ""}
                  placeholder="0,00"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    orcamentosStore.atualizar(orc.id, { desconto: Number.isFinite(v) && v > 0 ? v : 0 });
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
                value={orc.observacao ?? ""}
                placeholder="Notas internas sobre este orçamento"
                onChange={(e) =>
                  orcamentosStore.atualizar(orc.id, {
                    observacao: e.target.value.trim() ? e.target.value : null,
                  })
                }
              />
            </div>
          </>
        ) : orc.observacao ? (
          <p className="text-sm text-muted-foreground">{orc.observacao}</p>
        ) : null}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-mono text-sm uppercase tracking-wide text-foreground-faint">Total</span>
          <span className="font-mono text-2xl font-bold text-foreground">{formatBRL(orc.valor_total)}</span>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-end gap-2">
        {orc.status === "rascunho" ? (
          <Button
            onClick={() => setEnviar(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:send" className="h-4 w-4" />
            Enviar ao cliente
          </Button>
        ) : null}
        {orc.status === "enviado" ? (
          <>
            <Button
              variant="outline"
              onClick={() => setDecisao("recusar")}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Icon icon="lucide:x" className="h-4 w-4" />
              Recusar
            </Button>
            <Button
              onClick={() => setDecisao("aprovar")}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:check" className="h-4 w-4" />
              Aprovar
            </Button>
          </>
        ) : null}
        {orc.status === "aprovado" && orc.os_id ? (
          <Link
            to="/admin/ordens/$ordemId"
            params={{ ordemId: orc.os_id }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Icon icon="lucide:external-link" className="h-4 w-4" />
            Ver OS vinculada
          </Link>
        ) : null}
      </section>

      <ConfirmDialog
        open={enviar}
        onOpenChange={setEnviar}
        titulo="Enviar orçamento?"
        descricao={
          pendente
            ? "Há itens sem preço cadastrado. Você ainda pode enviar, mas revise os valores."
            : "O orçamento será marcado como enviado ao cliente."
        }
        confirmLabel="Enviar"
        onConfirm={onEnviar}
      />

      <ConfirmDialog
        open={!!decisao}
        onOpenChange={(o) => !o && setDecisao(null)}
        titulo={decisao === "recusar" ? "Recusar orçamento?" : "Aprovar orçamento?"}
        descricao={
          decisao === "recusar"
            ? "Registra o desfecho como recusado."
            : "Registra o desfecho como aprovado. Depois você poderá gerar a OS."
        }
        confirmLabel={decisao === "recusar" ? "Recusar" : "Aprovar"}
        destrutivo={decisao === "recusar"}
        onConfirm={onDecidir}
      />
    </div>
  );
}

function OrcamentoNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Orçamento não encontrado</h2>
      <Link
        to="/admin/orcamentos"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Orçamentos
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Estender o barrel** — `src/features/orcamentos/index.ts`

```typescript
export { OrcamentosPage } from "@/features/orcamentos/components/orcamentos-page";
export { OrcamentoDetalhe } from "@/features/orcamentos/components/orcamento-detalhe";
```

- [ ] **Step 5: Rota de detalhe** — `src/routes/admin.orcamentos.$orcamentoId.tsx`

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { OrcamentoDetalhe } from "@/features/orcamentos";

export const Route = createFileRoute("/admin/orcamentos/$orcamentoId")({
  loader: ({ params }) => {
    if (!orcamentosStore.obter(params.orcamentoId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `${orcamentosStore.obter(params.orcamentoId)?.numero ?? "Orçamento"} · Antonello` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrcamentoDetalheRoute,
});

function OrcamentoDetalheRoute() {
  const { orcamentoId } = Route.useParams();
  return <OrcamentoDetalhe orcamentoId={orcamentoId} />;
}
```

- [ ] **Step 6: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 7: Smoke SSR do detalhe (existente, inexistente)**

Run:
```bash
curl -s -o /dev/null -w "orc-002 %{http_code}\n" http://localhost:8082/admin/orcamentos/orc-002
curl -s -o /dev/null -w "inexistente %{http_code}\n" http://localhost:8082/admin/orcamentos/zzz
```
Expected: `orc-002 200` e `inexistente 404`.

- [ ] **Step 8: Tratar o routeTree.gen.ts**

Run: `git diff --numstat src/routeTree.gen.ts`
- Mudança estrutural (nova rota `$orcamentoId`): incluir no commit.
- Vazio (só CRLF): `git checkout -- src/routeTree.gen.ts`.

- [ ] **Step 9: Commit**

```bash
git add src/features/orcamentos/components/orcamento-item-row.tsx src/features/orcamentos/components/adicionar-item-orcamento.tsx src/features/orcamentos/components/orcamento-detalhe.tsx src/features/orcamentos/index.ts src/routes/admin.orcamentos.$orcamentoId.tsx
git add src/routeTree.gen.ts 2>/dev/null || true
git commit -m "feat: build orcamento detail editor with item assembly and status cycle"
```

---

## Task 7: Handoff — gerar OS a partir do orçamento aprovado

**Files:**
- Modify: `src/features/orcamentos/components/orcamento-detalhe.tsx` (adicionar o botão "Gerar OS" e a lógica)

**Interfaces:**
- Consumes: `ordensStore` (`criar`, `listar`), `proximoNumeroOS`, `precoFundacaoStore.getById`, `orcamentosStore.vincularOS`, `useNavigate`; tipos `ModeloCobranca`, `OrcamentoItem`.
- Produces: handoff `aprovado` (sem `os_id`) → cria OS pré-preenchida, grava `os_id`, navega para a OS.

- [ ] **Step 1: Adicionar imports** no topo de `src/features/orcamentos/components/orcamento-detalhe.tsx`

Trocar a linha `import { Link } from "@tanstack/react-router";` por:

```tsx
import { Link, useNavigate } from "@tanstack/react-router";
```

Adicionar (junto aos imports de features):

```tsx
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
```

Trocar o import de tipos por:

```tsx
import type { ModeloCobranca, OrcamentoItem } from "@/shared/types";
```

- [ ] **Step 2: Adicionar o helper de inferência** (fora do componente, antes de `export function OrcamentoDetalhe`)

```tsx
// Modelo de cobrança da OS gerada: o primeiro item não-mobilização decide (default hora_maquina).
function inferirModelo(itens: OrcamentoItem[]): ModeloCobranca {
  const naoMob = itens.find((i) => i.tipo !== "mobilizacao");
  return naoMob?.tipo === "por_metro" ? "por_metro" : "hora_maquina";
}
```

- [ ] **Step 3: Declarar `navigate` e a função `gerarOS`** dentro do componente (após `const vencida = ...`)

```tsx
  const navigate = useNavigate();

  const gerarOS = () => {
    const modelo = inferirModelo(orc.itens);
    const ehPorMetro = modelo === "por_metro";
    const itemMetro = ehPorMetro ? orc.itens.find((i) => i.tipo === "por_metro") : undefined;
    const diametro =
      itemMetro?.origem_id != null
        ? (precoFundacaoStore.getById(itemMetro.origem_id)?.diametro_broca_mm ?? null)
        : null;
    const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
    const nova = ordensStore.criar({
      numero,
      cliente_id: orc.cliente_id,
      obra_nome: orc.descricao_obra,
      endereco: null,
      modelo_cobranca: modelo,
      responsavel_id: null,
      observacao: `Gerado do orçamento ${orc.numero}`,
      metragem_executada: ehPorMetro && itemMetro ? itemMetro.quantidade_estimada : null,
      diametro_broca_mm: ehPorMetro ? diametro : null,
    });
    orcamentosStore.vincularOS(orc.id, nova.id);
    toast.success(`OS ${nova.numero} criada a partir do orçamento.`);
    navigate({ to: "/admin/ordens/$ordemId", params: { ordemId: nova.id } });
  };
```

- [ ] **Step 4: Adicionar o botão "Gerar OS"** na seção de ações — inserir ANTES do bloco `{orc.status === "aprovado" && orc.os_id ? (` :

```tsx
        {orc.status === "aprovado" && !orc.os_id ? (
          <Button
            onClick={gerarOS}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:file-plus-2" className="h-4 w-4" />
            Gerar OS
          </Button>
        ) : null}
```

(Mantém o bloco existente do link "Ver OS vinculada" para `aprovado && os_id`.)

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: EXIT 0 (sem variável `navigate` não-usada, pois agora `gerarOS` a usa).

- [ ] **Step 6: Smoke SSR do orçamento aprovado**

Run:
```bash
curl -s -o /dev/null -w "orc-003 %{http_code}\n" http://localhost:8082/admin/orcamentos/orc-003
```
Expected: `orc-003 200` (renderiza; orc-003 tem `os_id`, então mostra "Ver OS vinculada"; um aprovado sem os_id mostraria "Gerar OS").

- [ ] **Step 7: Tratar o routeTree.gen.ts (se tocado)**

Run: `git diff --numstat src/routeTree.gen.ts` → vazio: `git checkout -- src/routeTree.gen.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/features/orcamentos/components/orcamento-detalhe.tsx
git commit -m "feat: generate pre-filled OS from approved orcamento"
```

---

## Task 8: Barreira financeira + release 0.6.0 Quote + docs

**Files:**
- Verify (grep): `src/routes/app.*`, `src/features/operador/**`, `src/features/apontamento/**`
- Modify: `package.json` (version)
- Modify: `CHANGELOG.md`
- Rename: `docs/prds/PRD-006-ret-orcamentos.md` → `docs/prds/PRD-006-ret-orcamentos_DONE.md` (+ status)
- Modify: `docs/prds/INDEX-PRDs-antonello.md`

**Interfaces:**
- Consumes: nada novo. Esta é a task de fechamento.
- Produces: barreira verificada vazia; app em 0.6.0; docs atualizados.

- [ ] **Step 1: Verificar a barreira financeira (deve vir VAZIO)**

Run:
```bash
grep -rn "features/orcamentos\|mocks/orcamentos" src/routes/app.* src/features/operador src/features/apontamento 2>/dev/null
```
Expected: **nenhuma saída** (zero ocorrências). Se houver QUALQUER linha, é violação da RF-011 — corrigir antes de prosseguir.

- [ ] **Step 2: Bump de versão** — `package.json`

Trocar `"version": "0.5.0"` por `"version": "0.6.0"`.

- [ ] **Step 3: Changelog** — `CHANGELOG.md`

Inserir, logo após a linha 7 (antes de `## [0.5.0] - 2026-06-29 - Invoice`):

```markdown
## [0.6.0] - 2026-06-29 - Quote

### Added
- Orçamentos na retaguarda (`/admin/orcamentos`, PRD-006): CRUD mockado de orçamentos montados a partir das tabelas de preço (PRD-005) — hora-máquina (operada/seca), por metro (estaca) e mobilização.
- Editor de rascunho: adicionar/remover itens, ajustar quantidade estimada e valor unitário (override de negociação), desconto e observação; cálculo do total em R$.
- Ciclo de status `rascunho → enviado → aprovado/recusado` com guardas (envio bloqueado em orçamento vazio; decisão só a partir de enviado) e validade (default +30 dias, sinalização de vencida).
- Handoff: orçamento aprovado gera uma OS pré-preenchida (cliente, obra, modelo de cobrança, diâmetro/metragem) e vincula `os_id` (PRD-003).
- `types` `Orcamento`, `OrcamentoItem`, `StatusOrcamento`, `TipoItemOrcamento`; mocks com edge cases (rascunho vazio, sem-preço, validade vencida, vinculado a OS).
- Item "Orçamentos" no menu da retaguarda (entre Preços e Faturamento).

```

- [ ] **Step 4: Renomear o PRD e marcar status** — `docs/prds/PRD-006-ret-orcamentos.md`

```bash
git mv docs/prds/PRD-006-ret-orcamentos.md docs/prds/PRD-006-ret-orcamentos_DONE.md
```

Na seção "Status de Implementação" do arquivo renomeado, trocar a tabela por:

```markdown
| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-29 |
| **Versão do App** | 0.6.0 (Quote) |
| **Implementado por** | Claude Code CLI (Claude Opus 4.8) |
| **Observações** | Espelho pré-venda do Faturamento; só retaguarda; handoff aprovado → OS. |
```

- [ ] **Step 5: Atualizar o índice** — `docs/prds/INDEX-PRDs-antonello.md`

Aplicar:
- Cabeçalho: **Versão Atual** `0.5.0 (Invoice)` → `0.6.0 (Quote)`; **PRDs Implementados** `6` → `7`.
- Resumo de Status: ✅ Implementado `6` (40%) → `7` (47%); ⏳ Pendente `9` (60%) → `8` (53%).
- Onda 2, linha 006: Doc `📋` → `✍️`, Status `⏳` → `✅`, arquivo `PRD-006-ret-orcamentos.md` → `PRD-006-ret-orcamentos_DONE.md`.
- Catálogo "✅ Implementados": adicionar linha `| [PRD-006](./PRD-006-ret-orcamentos_DONE.md) | Orçamentos | Feature | ret | 0.6.0 Quote |`.
- Histórico de Versões do App: adicionar `| 0.6.0 | Quote | 2026-06-29 | PRD-006 | MINOR |`.
- Última Atualização: Data `2026-06-29`, Motivo `PRD-006 Orçamentos implementado → 0.6.0 Quote; 7/15 (47%)`.

- [ ] **Step 6: Gate final completo**

Run: `npx vitest run && npx tsc --noEmit`
Expected: toda a suíte PASS + EXIT 0.

- [ ] **Step 7: Commit**

```bash
git add package.json CHANGELOG.md docs/prds/INDEX-PRDs-antonello.md
git add docs/prds/PRD-006-ret-orcamentos_DONE.md
git commit -m "chore: release 0.6.0 Quote (PRD-006 orcamentos)"
```

---

## Notas de execução

- **Modelo dos implementers:** T1-T4 são transcrição de código completo → modelo barato (haiku). T5-T7 integração/UI → modelo padrão (sonnet). T8 docs/barreira → sonnet. Reviewers sonnet; review final whole-branch opus.
- **BASE de cada review:** o commit registrado ANTES de despachar o implementer (nunca `HEAD~1` — as tasks têm 1 commit cada, mas use o BASE registrado).
- **Barreira RF-011:** reconfirmar VAZIA na review final por execução independente do grep.
- **Cross-import faturamento→orcamentos:** ambos retaguarda; nenhum em `/app/*`. Seguro.

## Self-Review (preenchido pelo autor do plano)

- **Cobertura da spec:** types ✅(T1) · calculo/itens ✅(T1) · numeração ✅(T2) · validade/guards ✅(T2) · store/ciclo ✅(T3) · labels ✅(T3) · mocks/edge cases ✅(T4) · lista+form+menu ✅(T5) · detalhe/editor/adicionar-item ✅(T6) · handoff Gerar OS ✅(T7) · barreira+release+docs ✅(T8). Decisões resolvidas (validade 30d, handoff botão, desconto, override) todas implementadas.
- **Placeholders:** nenhum TODO/TBD; todo passo de código tem o código completo.
- **Consistência de tipos:** `quantidade_estimada` usado de forma idêntica em T1/T3/T4/T6; `criarItemMetro(preco, metros)` consistente entre T1 (def), T6 (adicionar-item) ; `origem_id` do por_metro = id do preço de fundação, lido pelo handoff em T7; `ResultadoTransicao.orcamento` consistente em T3/T6; assinaturas do store batem entre T3 (def) e T5/T6/T7 (uso).
