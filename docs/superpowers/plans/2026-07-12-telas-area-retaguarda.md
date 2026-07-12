# Telas de Área da Retaguarda (Faturamento/OS/Orçamentos/Comprovantes) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-vestir as 4 telas de área da retaguarda (Faturamento, Ordens, Orçamentos, Comprovantes) para bater visualmente com os mocks do UI kit (`docs/html/.../ui_kits/retaguarda/*.jsx`), usando 100% dado real das stores, preservando toda busca/filtro/navegação/criação já implementada.

**Architecture:** Um componente compartilhado novo (`StatusFilterChips`) substitui os `Select` de status nas 3 telas de lista simples (OS/Orçamentos/Comprovantes). O Faturamento ganha derivações reais novas (agregação mensal) e uma reescrita completa de página (de 2 abas para 1 página com KPIs+cards+gráfico), sem módulo de showcase.

**Tech Stack:** React + TypeScript, Tailwind (tokens semânticos), shadcn/ui, `@iconify/react` (lucide), TanStack Router, Vitest.

## Global Constraints

- Nunca hex em componente — só tokens (`bg-card`, `text-primary`, `border-border`, `text-foreground-faint`, `bg-surface`, `text-destructive`, `bg-primary/15`, etc.).
- Sem `any`; optional chaining (nunca `!`).
- Ícones via `@iconify/react`, prefixo `lucide:`.
- Badges de status usam os componentes de domínio já existentes (`StatusOSBadge`, `StatusOrcamentoBadge`, `StatusFaturamentoBadge`, `StatusComprovanteBadge`) — nunca um `StatusChip` genérico novo.
- Nenhum botão sem ação real ("Exportar"/"Emitir NF"/"Anexar comprovante" do mock, sem handler real, são omitidos — ver spec decisões 2 e 5).
- Toda métrica em Faturamento é derivada de dado real — nenhum módulo `*-showcase-data.ts`.
- Conventional Commits em inglês.

---

### Task 1: Derivações reais de Faturamento (agregação mensal)

**Files:**
- Modify: `src/features/faturamento/derivacoes.ts`
- Test: `src/features/faturamento/derivacoes.test.ts` (arquivo já existe — estender)

**Interfaces:**
- Consumes: `Faturamento`, `ContaReceber` (`@/shared/types`), `round2` (`@/features/faturamento/calculo`, já importado no arquivo).
- Produces:
  - `interface AgregadoMensalFaturamento { mes: string; rotulo: string; valor: number; qtd: number }`
  - `function agregadoMensal(faturamentos: Faturamento[], referenciaISO: string, meses?: number): AgregadoMensalFaturamento[]` (default `meses = 6`)
  - `function contaDoFaturamento(faturamentoId: string, contas: ContaReceber[]): ContaReceber | null`

- [ ] **Step 1: Write the failing tests**

Append to `src/features/faturamento/derivacoes.test.ts` (verifique os imports já existentes no topo do arquivo — `describe`/`it`/`expect` de vitest, e os tipos/fábricas de `Faturamento` usados nos testes existentes; reaproveite o padrão de fixture já usado nesse arquivo):

```ts
import { agregadoMensal, contaDoFaturamento } from "@/features/faturamento/derivacoes";

describe("agregadoMensal", () => {
  const base = (over: Partial<Faturamento>): Faturamento => ({
    id: over.id ?? "f1",
    numero: over.numero ?? "FAT-2026-0001",
    os_id: "os1",
    cliente_id: "cli1",
    modelo_cobranca: "hora_maquina",
    itens: [],
    desconto: 0,
    valor_total: over.valor_total ?? 1000,
    observacao: null,
    status: over.status ?? "faturado",
    gerado_em: "2026-05-01T10:00:00.000Z",
    faturado_em: over.faturado_em ?? null,
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
  });

  it("agrupa por mês de faturado_em, últimos 6 meses até a referência, ignorando rascunhos", () => {
    const faturamentos = [
      base({ id: "f1", valor_total: 1000, status: "faturado", faturado_em: "2026-07-05T00:00:00.000Z" }),
      base({ id: "f2", valor_total: 500, status: "faturado", faturado_em: "2026-07-20T00:00:00.000Z" }),
      base({ id: "f3", valor_total: 2000, status: "faturado", faturado_em: "2026-06-10T00:00:00.000Z" }),
      base({ id: "f4", valor_total: 9999, status: "rascunho", faturado_em: null }),
    ];
    const r = agregadoMensal(faturamentos, "2026-07-15T12:00:00.000Z", 6);
    expect(r).toHaveLength(6);
    expect(r[r.length - 1]).toEqual({ mes: "2026-07", rotulo: "Jul", valor: 1500, qtd: 2 });
    expect(r[r.length - 2]).toEqual({ mes: "2026-06", rotulo: "Jun", valor: 2000, qtd: 1 });
    expect(r[0]).toEqual({ mes: "2026-02", rotulo: "Fev", valor: 0, qtd: 0 });
  });

  it("retorna array vazio de meses com valor 0 quando não há faturamentos", () => {
    const r = agregadoMensal([], "2026-01-15T00:00:00.000Z", 3);
    expect(r).toEqual([
      { mes: "2025-11", rotulo: "Nov", valor: 0, qtd: 0 },
      { mes: "2025-12", rotulo: "Dez", valor: 0, qtd: 0 },
      { mes: "2026-01", rotulo: "Jan", valor: 0, qtd: 0 },
    ]);
  });
});

describe("contaDoFaturamento", () => {
  it("encontra a conta a receber vinculada pelo faturamento_id", () => {
    const contas = [
      { id: "c1", faturamento_id: "f1", cliente_id: "cli1", valor: 100, vencimento: "2026-08-01", status: "aberta" as const, recebido_em: null, forma_recebimento: null, created_at: "", updated_at: "" },
    ];
    expect(contaDoFaturamento("f1", contas)?.id).toBe("c1");
    expect(contaDoFaturamento("f2", contas)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/faturamento/derivacoes.test.ts`
Expected: FAIL — `agregadoMensal`/`contaDoFaturamento` not exported.

- [ ] **Step 3: Implement**

Append to `src/features/faturamento/derivacoes.ts`:

```ts
const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function chaveMes(iso: string): string {
  return iso.slice(0, 7); // "YYYY-MM"
}

function somarMeses(chaveMesRef: string, offset: number): string {
  const [ano, mes] = chaveMesRef.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1 + offset, 1));
  const anoNovo = data.getUTCFullYear();
  const mesNovo = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${anoNovo}-${mesNovo}`;
}

export function agregadoMensal(
  faturamentos: Faturamento[],
  referenciaISO: string,
  meses = 6,
): AgregadoMensalFaturamento[] {
  const mesRef = chaveMes(referenciaISO);
  const chaves = Array.from({ length: meses }, (_, i) => somarMeses(mesRef, i - (meses - 1)));
  const faturados = faturamentos.filter((f) => f.status === "faturado" && f.faturado_em != null);
  return chaves.map((chave) => {
    const doMes = faturados.filter((f) => chaveMes(f.faturado_em as string) === chave);
    const mesIndex = Number(chave.slice(5, 7)) - 1;
    return {
      mes: chave,
      rotulo: MESES_ABREV[mesIndex],
      valor: round2(doMes.reduce((s, f) => s + f.valor_total, 0)),
      qtd: doMes.length,
    };
  });
}

export interface AgregadoMensalFaturamento {
  mes: string;
  rotulo: string;
  valor: number;
  qtd: number;
}

export function contaDoFaturamento(faturamentoId: string, contas: ContaReceber[]): ContaReceber | null {
  return contas.find((c) => c.faturamento_id === faturamentoId) ?? null;
}
```

(Posicione a `interface AgregadoMensalFaturamento` antes de `agregadoMensal` para ordem de leitura; TypeScript não exige, mas mantenha a convenção do arquivo. Ajuste import de `ContaReceber` no topo do arquivo se ainda não estiver — o arquivo já importa `ContaReceber` para `resumoPipeline`, reaproveite.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/faturamento/derivacoes.test.ts`
Expected: PASS (todos os testes do arquivo, novos e antigos).

- [ ] **Step 5: Commit**

```bash
git add src/features/faturamento/derivacoes.ts src/features/faturamento/derivacoes.test.ts
git commit -m "feat: add monthly aggregation and conta-a-receber lookup for faturamento"
```

---

### Task 2: `StatusFilterChips` compartilhado

**Files:**
- Create: `src/shared/components/status-filter-chips.tsx`
- Test: `src/shared/components/status-filter-chips.test.tsx`

**Interfaces:**
- Produces:
  - `interface StatusFilterChipItem { id: string; label: string; tone?: "info" | "success" | "warn" | "neutral" }`
  - `function StatusFilterChips(props: { itens: StatusFilterChipItem[]; ativo: string; onChange: (id: string) => void; counts: Record<string, number> }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusFilterChips } from "./status-filter-chips";

describe("StatusFilterChips", () => {
  it("renderiza label+contador, marca o ativo e dispara onChange ao clicar", () => {
    const onChange = vi.fn();
    render(
      <StatusFilterChips
        itens={[
          { id: "todos", label: "Todos" },
          { id: "aberta", label: "Abertas", tone: "info" },
        ]}
        ativo="todos"
        counts={{ todos: 5, aberta: 2 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Todos/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Abertas/ })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Abertas/ }));
    expect(onChange).toHaveBeenCalledWith("aberta");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/components/status-filter-chips.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write minimal implementation**

```tsx
import { cn } from "@/lib/utils";

export interface StatusFilterChipItem {
  id: string;
  label: string;
  tone?: "info" | "success" | "warn" | "neutral";
}

interface StatusFilterChipsProps {
  itens: StatusFilterChipItem[];
  ativo: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}

const TONE_CLASSE: Record<NonNullable<StatusFilterChipItem["tone"]>, string> = {
  info: "text-secondary",
  success: "text-primary",
  warn: "text-primary",
  neutral: "text-muted-foreground",
};

// Chips de filtro por status com contador — reuso entre Ordens, Orçamentos e
// Comprovantes (padrão visual do UI kit de retaguarda).
export function StatusFilterChips({ itens, ativo, onChange, counts }: StatusFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {itens.map((item) => {
        const isAtivo = item.id === ativo;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isAtivo}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isAtivo
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {item.tone ? (
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-current",
                  isAtivo ? "text-primary-foreground" : TONE_CLASSE[item.tone],
                )}
              />
            ) : null}
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-mono",
                isAtivo ? "bg-primary-foreground/20" : "bg-card",
              )}
            >
              {counts[item.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/components/status-filter-chips.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/status-filter-chips.tsx src/shared/components/status-filter-chips.test.tsx
git commit -m "feat: add shared StatusFilterChips for area-screen status filters"
```

---

### Task 3: Reescrever a página de Faturamento (KPIs + cards + gráfico, sem abas)

**Files:**
- Modify: `src/features/faturamento/components/faturamento-page.tsx` (reescrever — deixa de montar `Tabs`/`FaturasTab`/`AnaliseTab`)
- Create: `src/features/faturamento/components/faturamento-kpis.tsx`
- Create: `src/features/faturamento/components/notas-fiscais-card.tsx`
- Create: `src/features/faturamento/components/a-faturar-card.tsx`
- Create: `src/features/faturamento/components/faturamento-mensal-card.tsx`
- Test: `src/features/faturamento/components/faturamento-kpis.test.tsx`

**Interfaces:**
- Consumes: `agregadoMensal`, `contaDoFaturamento` (Task 1); `Sparkline` (`@/shared/components/sparkline`); `CardSecao`/`CardPill` (`@/shared/components/card-secao`); `AguardandoFaturamento` (já existe, sem alteração); `faturamentosStore`, `contasReceberStore`, `ordensStore`, `apontamentosStore`, `clientesStore`; `StatusFaturamentoBadge`; `formatBRL` (`@/features/retaguarda/format`); `formatDataHora`/`formatData` (`@/shared/lib/format`); `exportarFaturamentoPdf` (`@/features/retaguarda/export-faturamento-pdf`); `osFechadasSemFaturamento`, `resumoPipeline` (não usado nesta página — `resumoPipeline` fica reservado para uma futura tela; não remover do arquivo `derivacoes.ts`, só não consumir aqui).
- Produces: `FaturamentoPage` (mesma export, mesmo nome — só o corpo muda). Não produz nada consumido por outras tasks.

**Nota importante:** este task **substitui** o conteúdo de `FaturamentoPage` mas **NÃO apaga** `faturas-tab.tsx`, `analise-tab.tsx`, `faturamento-pipeline.tsx`, `faturas-list.tsx` nem `aguardando-faturamento.tsx` — apenas `faturamento-page.tsx` para de importar `Tabs`/`FaturasTab`/`AnaliseTab` e passa a montar os componentes novos + `AguardandoFaturamento` reaproveitado. Os arquivos de aba ficam órfãos (sem consumidor) — não delete-os nesta task (a spec deixa a Análise como decisão em aberto, não descarte).

- [ ] **Step 1: Write the failing test for `FaturamentoKpis`**

```tsx
// src/features/faturamento/components/faturamento-kpis.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FaturamentoKpis } from "./faturamento-kpis";

describe("FaturamentoKpis", () => {
  it("renderiza os 4 KPIs com os valores formatados", () => {
    render(
      <FaturamentoKpis
        faturadoNoMes={86200}
        nfsNoMes={12}
        aFaturarValor={26200}
        aFaturarRodape="2 rascunhos sem confirmar"
        ticketMedio={7183.33}
        series={[18, 16, 17, 12, 13, 9]}
      />,
    );
    expect(screen.getByText("Faturado no mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 86.200,00")).toBeInTheDocument();
    expect(screen.getByText("NFs emitidas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("A faturar")).toBeInTheDocument();
    expect(screen.getByText("R$ 26.200,00")).toBeInTheDocument();
    expect(screen.getByText("2 rascunhos sem confirmar")).toBeInTheDocument();
    expect(screen.getByText("Ticket médio")).toBeInTheDocument();
    expect(screen.getByText("R$ 7.183,33")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/faturamento/components/faturamento-kpis.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implement `FaturamentoKpis`**

```tsx
// src/features/faturamento/components/faturamento-kpis.tsx
import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import { formatBRL } from "@/features/retaguarda/format";

export interface FaturamentoKpisProps {
  faturadoNoMes: number;
  nfsNoMes: number;
  aFaturarValor: number;
  aFaturarRodape: string;
  ticketMedio: number;
  series: number[]; // valores mensais reais (últimos N meses), para os sparks escalados 0..100
}

function escalar0a100(valores: number[]): number[] {
  const max = Math.max(...valores, 0);
  if (max === 0) return valores.map(() => 0);
  return valores.map((v) => Math.round((v / max) * 100));
}

export function FaturamentoKpis({
  faturadoNoMes,
  nfsNoMes,
  aFaturarValor,
  aFaturarRodape,
  ticketMedio,
  series,
}: FaturamentoKpisProps) {
  const spark = escalar0a100(series);
  const temPendencia = aFaturarValor > 0;
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <Tile rotulo="Faturado no mês" valor={formatBRL(faturadoNoMes)} icone="lucide:credit-card" spark={spark} />
      <Tile rotulo="NFs emitidas" valor={String(nfsNoMes)} icone="lucide:file-check" rodape="no mês" spark={spark} />
      <Tile
        rotulo="A faturar"
        valor={formatBRL(aFaturarValor)}
        icone="lucide:clipboard-list"
        rodape={aFaturarRodape}
        alerta={temPendencia}
      />
      <Tile rotulo="Ticket médio" valor={formatBRL(ticketMedio)} icone="lucide:dollar-sign" rodape="por NF no mês" />
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
      <div className={(alerta ? "text-destructive" : "text-foreground") + " mt-3 font-mono text-2xl font-bold"}>
        {valor}
      </div>
      {rodape ? <div className="mt-1.5 text-xs text-muted-foreground">{rodape}</div> : null}
      {spark ? <Sparkline pontos={spark} className="absolute bottom-3.5 right-3.5 h-6 w-16" /> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/faturamento/components/faturamento-kpis.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement `NotasFiscaisCard`**

```tsx
// src/features/faturamento/components/notas-fiscais-card.tsx
import { Link } from "@tanstack/react-router";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { StatusFaturamentoBadge } from "@/features/faturamento/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { contaDoFaturamento } from "@/features/faturamento/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData } from "@/shared/lib/format";
import type { ContaReceber, Faturamento } from "@/shared/types";

function situacao(fat: Faturamento, contas: ContaReceber[], hojeISO: string) {
  const conta = contaDoFaturamento(fat.id, contas);
  if (!conta) return "—";
  if (conta.status === "liquidada") return "Paga";
  return conta.vencimento < hojeISO.slice(0, 10) ? "Vencida" : "A vencer";
}

export function NotasFiscaisCard({
  faturados,
  contas,
}: {
  faturados: Faturamento[];
  contas: ContaReceber[];
}) {
  const hojeISO = new Date().toISOString();
  return (
    <CardSecao
      titulo="Notas fiscais emitidas"
      icone="lucide:file-check"
      acessorio={<CardPill>{faturados.length} no mês</CardPill>}
      bodyClassName="overflow-x-auto"
    >
      {faturados.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma NF emitida neste mês.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
              <th className="px-4 py-3 font-medium">NF</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Emissão</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-right font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {faturados.map((f) => (
              <tr key={f.id} className="border-b last:border-b-0 hover:bg-surface/50">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/faturamento/$faturamentoId"
                    params={{ faturamentoId: f.id }}
                    className="font-mono text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {f.numero}
                  </Link>
                </td>
                <td className="px-4 py-3">{clientesStore.getById(f.cliente_id)?.nome ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    to="/admin/ordens/$ordemId"
                    params={{ ordemId: f.os_id }}
                    className="font-mono text-xs text-muted-foreground hover:text-primary"
                  >
                    {ordensStore.obter(f.os_id)?.numero ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{formatData(f.faturado_em)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{formatBRL(f.valor_total)}</td>
                <td className="px-4 py-3 text-right">{situacao(f, contas, hojeISO)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </CardSecao>
  );
}
```

Nota: a coluna "Situação" usa texto simples ("Paga"/"Vencida"/"A vencer"/"—") em vez de um badge novo — não existe badge de status de `ContaReceber` no domínio hoje; não crie um `StatusContaReceberBadge` nesta task (fora de escopo, YAGNI — texto simples com `text-destructive` na vencida é suficiente e replica a única distinção visual real que o mock usa: cor de alerta na vencida). Ajuste a célula para:
```tsx
<td className="px-4 py-3 text-right text-xs font-medium">
  <span className={situacao(f, contas, hojeISO) === "Vencida" ? "text-destructive" : "text-muted-foreground"}>
    {situacao(f, contas, hojeISO)}
  </span>
</td>
```
(substitua a célula de Situação acima por este trecho — evita computar `situacao()` duas vezes por linha; prefira computar uma vez numa variável `sit` antes do `return` da linha, se preferir, mantendo o resultado idêntico.)

- [ ] **Step 6: Implement `AFaturarCard`**

```tsx
// src/features/faturamento/components/a-faturar-card.tsx
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { Faturamento } from "@/shared/types";

export function AFaturarCard({ rascunhos }: { rascunhos: Faturamento[] }) {
  const total = rascunhos.reduce((s, f) => s + f.valor_total, 0);
  return (
    <CardSecao titulo="A faturar" icone="lucide:clipboard-list" acessorio={<CardPill>{formatBRL(total)}</CardPill>}>
      {rascunhos.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Nenhum rascunho aguardando emissão.</p>
      ) : (
        <div className="space-y-2 p-4">
          {rascunhos.map((f) => {
            const os = ordensStore.obter(f.os_id);
            return (
              <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
                <span className="font-mono text-xs font-semibold text-foreground">{os?.numero ?? "—"}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-card-foreground">{os?.obra_nome ?? "—"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {clientesStore.getById(f.cliente_id)?.nome ?? "—"}
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground">{formatBRL(f.valor_total)}</span>
                <Link
                  to="/admin/faturamento/$faturamentoId"
                  params={{ faturamentoId: f.id }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
                >
                  <Icon icon="lucide:file-check" className="h-3.5 w-3.5" aria-hidden />
                  Emitir
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </CardSecao>
  );
}
```

- [ ] **Step 7: Implement `FaturamentoMensalCard`**

```tsx
// src/features/faturamento/components/faturamento-mensal-card.tsx
import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import type { AgregadoMensalFaturamento } from "@/features/faturamento/derivacoes";

export function FaturamentoMensalCard({ meses }: { meses: AgregadoMensalFaturamento[] }) {
  const valores = meses.map((m) => m.valor);
  const pico = Math.max(...valores, 0);
  const media = valores.length > 0 ? valores.reduce((s, v) => s + v, 0) / valores.length : 0;
  const mesPico = meses.find((m) => m.valor === pico);
  return (
    <CardSecao titulo="Faturamento por mês" icone="lucide:bar-chart" bodyClassName="p-4">
      <div className="flex h-24 items-end gap-2">
        {meses.map((m) => (
          <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className={m.valor === pico && pico > 0 ? "w-full max-w-[26px] rounded-t bg-primary" : "w-full max-w-[26px] rounded-t bg-primary/60"}
              style={{ height: pico > 0 ? `${Math.max((m.valor / pico) * 100, m.valor > 0 ? 4 : 0)}%` : "0%" }}
            />
            <span className="font-mono text-[10px] text-foreground-faint">{m.rotulo}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Média <b className="text-foreground">{formatBRL(media)}</b>/mês
        </span>
        <span>
          Pico <b className="text-foreground">{formatBRL(pico)}</b> {mesPico ? `(${mesPico.rotulo})` : ""}
        </span>
      </div>
    </CardSecao>
  );
}
```

- [ ] **Step 8: Reescrever `FaturamentoPage`**

```tsx
// src/features/faturamento/components/faturamento-page.tsx
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { osFechadasSemFaturamento } from "@/features/faturamento/derivacoes";
import { agregadoMensal } from "@/features/faturamento/derivacoes";
import { exportarFaturamentoPdf } from "@/features/retaguarda/export-faturamento-pdf";
import { FaturamentoKpis } from "@/features/faturamento/components/faturamento-kpis";
import { NotasFiscaisCard } from "@/features/faturamento/components/notas-fiscais-card";
import { AFaturarCard } from "@/features/faturamento/components/a-faturar-card";
import { FaturamentoMensalCard } from "@/features/faturamento/components/faturamento-mensal-card";
import { AguardandoFaturamento } from "@/features/faturamento/components/aguardando-faturamento";

const MESES_EXTENSO = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function FaturamentoPage() {
  const faturamentos = faturamentosStore.useTodos();
  const contas = contasReceberStore.useTodas();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();

  const agora = new Date();
  const agoraISO = agora.toISOString();
  const meses = agregadoMensal(faturamentos, agoraISO, 6);
  const mesAtual = meses[meses.length - 1];

  const rascunhos = faturamentos.filter((f) => f.status === "rascunho");
  const faturadosNoMes = faturamentos.filter(
    (f) => f.status === "faturado" && f.faturado_em?.slice(0, 7) === mesAtual.mes,
  );
  const aguardando = osFechadasSemFaturamento(ordens, faturamentos);

  const ticketMedio = mesAtual.qtd > 0 ? mesAtual.valor / mesAtual.qtd : 0;
  const rotuloMes = `${MESES_EXTENSO[agora.getMonth()]}/${agora.getFullYear()}`;

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Faturamento"
        descricao={rotuloMes}
        acoes={
          <Button variant="outline" onClick={exportarFaturamentoPdf} className="gap-2">
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      <FaturamentoKpis
        faturadoNoMes={mesAtual.valor}
        nfsNoMes={mesAtual.qtd}
        aFaturarValor={rascunhos.reduce((s, f) => s + f.valor_total, 0)}
        aFaturarRodape={
          rascunhos.length === 0 ? "nenhum rascunho" : `${rascunhos.length} rascunho${rascunhos.length > 1 ? "s" : ""} sem confirmar`
        }
        ticketMedio={ticketMedio}
        series={meses.map((m) => m.valor)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <NotasFiscaisCard faturados={faturadosNoMes} contas={contas} />
        </div>
        <div className="space-y-4">
          <AFaturarCard rascunhos={rascunhos} />
          <FaturamentoMensalCard meses={meses} />
        </div>
      </div>

      <AguardandoFaturamento ordens={aguardando} apontamentos={apontamentos} />
    </div>
  );
}
```

`PageHeader` aceita `titulo`/`descricao`/`acoes`/`className` (confirmado) — os nomes usados acima já batem. Confirme que `exportarFaturamentoPdf` é uma função síncrona sem argumentos (é chamada assim em `analise-tab.tsx:156`, `onClick={exportarFaturamentoPdf}`) antes de plugar direto no `onClick`.

- [ ] **Step 9: Verificar tipos, lint e suíte**

Run: `npx tsc --noEmit && npx eslint src/features/faturamento/components/faturamento-page.tsx src/features/faturamento/components/faturamento-kpis.tsx src/features/faturamento/components/notas-fiscais-card.tsx src/features/faturamento/components/a-faturar-card.tsx src/features/faturamento/components/faturamento-mensal-card.tsx && npx vitest run`
Expected: sem erros; suíte verde.

- [ ] **Step 10: Commit**

```bash
git add src/features/faturamento/components/faturamento-page.tsx src/features/faturamento/components/faturamento-kpis.tsx src/features/faturamento/components/faturamento-kpis.test.tsx src/features/faturamento/components/notas-fiscais-card.tsx src/features/faturamento/components/a-faturar-card.tsx src/features/faturamento/components/faturamento-mensal-card.tsx
git commit -m "feat: rebuild Faturamento page as single view with real KPIs, NF table and monthly chart"
```

---

### Task 4: Re-vestir Ordens de Serviço (chips + colunas novas)

**Files:**
- Modify: `src/features/ordem-servico/components/ordens-retaguarda-page.tsx`

**Interfaces:**
- Consumes: `StatusFilterChips`/`StatusFilterChipItem` (Task 2); `STATUS_OS`, `STATUS_OS_LABEL`, `StatusOSBadge`, `MODELO_LABEL` (já importados); `apontamentosDaOS` (`@/features/ordem-servico/derivacoes` — adicionar ao import existente); `faturamentosStore` (novo import); `operadoresStore` (`@/features/operadores/operadores-store`, novo import); `equipamentosStore` (`@/features/equipamentos/equipamentos-store`, novo import); `formatData` (`@/shared/lib/format`, para "Período").
- Produces: nada consumido por outras tasks.

Preservar **sem alterar**: `useMemo` de `lista` (filtro por busca+status), `columns` de Cliente/Obra/Modelo/Horas/Status (só inserir colunas novas entre elas), `toolbar` (o input de busca continua — reposicionado ao lado dos chips), `renderCard`, `FormDialog`+`OrdemForm` do fim, `empty` state.

- [ ] **Step 1: Trocar o filtro de status por chips**

Adicionar import:
```tsx
import { StatusFilterChips, type StatusFilterChipItem } from "@/shared/components/status-filter-chips";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store"; // já importado — não duplicar se presente
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { formatData } from "@/shared/lib/format";
```

Antes do `return`, calcular os itens/contadores dos chips a partir de `todas` filtradas só por busca (não pelo status ativo — para os contadores não mudarem ao trocar de chip, igual ao mock):

```tsx
const buscaAplicada = useMemo(() => {
  const termo = q.trim().toLowerCase();
  if (!termo) return todas;
  return todas.filter((o) => {
    const cliente = clientesStore.getById(o.cliente_id);
    return (
      o.numero.toLowerCase().includes(termo) ||
      o.obra_nome.toLowerCase().includes(termo) ||
      (cliente?.nome.toLowerCase().includes(termo) ?? false)
    );
  });
}, [todas, q]);

const chipItens: StatusFilterChipItem[] = [
  { id: "todos", label: "Todas" },
  { id: "aberta", label: "Abertas", tone: "info" },
  { id: "em_andamento", label: "Em andamento", tone: "warn" },
  { id: "fechada", label: "Concluídas", tone: "success" },
];
const chipCounts = {
  todos: buscaAplicada.length,
  aberta: buscaAplicada.filter((o) => statusEfetivoOS(o, apontamentos) === "aberta").length,
  em_andamento: buscaAplicada.filter((o) => statusEfetivoOS(o, apontamentos) === "em_andamento").length,
  fechada: buscaAplicada.filter((o) => statusEfetivoOS(o, apontamentos) === "fechada").length,
};
```
(`filtroStatus` continua sendo o `useState<StatusOS | "todos">` já existente — só troque o `id` usado por `StatusFilterChips` para `filtroStatus` e o `onChange` para `setFiltroStatus(id as StatusOS | "todos")`.)

Substitua o `<Select>` de status dentro de `toolbar` por:
```tsx
<StatusFilterChips itens={chipItens} ativo={filtroStatus} onChange={(id) => setFiltroStatus(id as StatusOS | "todos")} counts={chipCounts} />
```
mantendo o `Input` de busca ao lado (mesma `<div className="flex flex-wrap items-center gap-2">`).

- [ ] **Step 2: Adicionar colunas Equipamento, Operador, Valor, Período**

Helper local antes do `columns` array:
```tsx
function equipamentosDaOS(osId: string, apontamentos: Apontamento[]): string[] {
  return Array.from(new Set(apontamentosDaOS(osId, apontamentos).map((a) => a.equipamento_id)));
}
function operadorPrincipal(o: OrdemServico, apontamentos: Apontamento[]): { nome: string; extras: number } {
  if (o.responsavel_id) {
    const op = operadoresStore.getById(o.responsavel_id);
    return { nome: op?.nome ?? "—", extras: 0 };
  }
  const ids = Array.from(new Set(apontamentosDaOS(o.id, apontamentos).map((a) => a.operador_id)));
  if (ids.length === 0) return { nome: "—", extras: 0 };
  const primeiro = operadoresStore.getById(ids[0]);
  return { nome: primeiro?.nome ?? "—", extras: ids.length - 1 };
}
```
(Confirme a assinatura real de `Apontamento`/`operadoresStore.getById` antes de usar — já verificadas no plano: `operador_id: string`, `equipamento_id: string`, `operadoresStore.getById(id): Operador | undefined`.)

Inserir no array `columns`, entre "Obra" e "Modelo":
```tsx
{
  header: "Equipamento",
  cell: (o) => {
    const ids = equipamentosDaOS(o.id, apontamentos);
    if (ids.length === 0) return <span className="text-muted-foreground">—</span>;
    const nome = equipamentosStore.getById(ids[0])?.nome ?? "—";
    return (
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
          <Icon icon="lucide:truck" className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="truncate">{nome}</span>
        {ids.length > 1 ? <CardPill>+{ids.length - 1}</CardPill> : null}
      </div>
    );
  },
},
{
  header: "Operador",
  cell: (o) => {
    const { nome, extras } = operadorPrincipal(o, apontamentos);
    return (
      <span>
        {nome}
        {extras > 0 ? ` +${extras}` : ""}
      </span>
    );
  },
},
```
E depois de "Horas" (antes de "Status"):
```tsx
{
  header: "Valor",
  className: "font-mono text-right",
  cell: (o) => {
    const fat = faturamentosStore.listar().find((f) => f.os_id === o.id);
    return fat ? formatBRL(fat.valor_total) : "—";
  },
},
{
  header: "Período",
  className: "font-mono text-xs",
  cell: (o) =>
    o.fechada_em
      ? `${formatData(o.aberta_em)}–${formatData(o.fechada_em)}`
      : `desde ${formatData(o.aberta_em)}`,
},
```

`equipamentosStore.getById(id): Equipamento | undefined` já existe (confirmado) — use direto. Importe `formatBRL` de `@/features/retaguarda/format` e `CardPill` de `@/shared/components/card-secao` no topo do arquivo.

Atualize `renderCard` (mobile) para incluir, de forma compacta, equipamento (nome, sem ícone) · operador · valor · período numa linha extra de `text-xs text-muted-foreground`, sem remover o conteúdo atual do card.

- [ ] **Step 3: Verificar tipos, lint e suíte**

Run: `npx tsc --noEmit && npx eslint src/features/ordem-servico/components/ordens-retaguarda-page.tsx && npx vitest run`
Expected: sem erros; suíte verde.

- [ ] **Step 4: Commit**

```bash
git add src/features/ordem-servico/components/ordens-retaguarda-page.tsx
git commit -m "feat: add chip filters and equipamento/operador/valor/periodo columns to OS list"
```

---

### Task 5: Re-vestir Orçamentos (chips + Pill de total em aberto)

**Files:**
- Modify: `src/features/orcamentos/components/orcamentos-page.tsx`

**Interfaces:**
- Consumes: `StatusFilterChips`/`StatusFilterChipItem` (Task 2); `STATUS_ORCAMENTO`, `STATUS_ORCAMENTO_LABEL`, `StatusOrcamentoBadge` (já importados); `formatBRL` (já importado).
- Produces: nada consumido por outras tasks.

Preservar **sem alterar**: `useMemo` de `lista`, `columns`, `renderCard`, `FormDialog`+`OrcamentoForm`, `empty` state.

- [ ] **Step 1: Trocar Select por chips + Pill de total em aberto**

Adicionar imports:
```tsx
import { StatusFilterChips, type StatusFilterChipItem } from "@/shared/components/status-filter-chips";
import { CardPill } from "@/shared/components/card-secao";
```
`PageHeader` (`src/shared/components/page-header.tsx`) só aceita `titulo`/`descricao`/`acoes`/`className` — não tem slot para um Pill ao lado do título. **Não modifique `PageHeader`** (é usado por outras 15+ telas). Em vez disso, renderize o `CardPill` do total em aberto numa linha própria, logo abaixo do `<PageHeader ... />` e antes do `<DataList ... />`:
```tsx
<div className="-mt-2">
  <CardPill>{formatBRL(totalEmAberto)} em aberto</CardPill>
</div>
```

```tsx
const totalEmAberto = useMemo(
  () => todos.filter((o) => o.status === "rascunho" || o.status === "enviado").reduce((s, o) => s + o.valor_total, 0),
  [todos],
);

const chipItens: StatusFilterChipItem[] = [
  { id: "todos", label: "Todos" },
  ...STATUS_ORCAMENTO.map((s) => ({
    id: s,
    label: STATUS_ORCAMENTO_LABEL[s],
    tone: (s === "aprovado" ? "success" : s === "recusado" ? "neutral" : "info") as StatusFilterChipItem["tone"],
  })),
];
const buscaAplicada = useMemo(() => {
  const termo = q.trim().toLowerCase();
  if (!termo) return todos;
  return todos.filter((o) => {
    const cliente = clientesStore.getById(o.cliente_id);
    return (
      o.numero.toLowerCase().includes(termo) ||
      o.descricao_obra.toLowerCase().includes(termo) ||
      (cliente?.nome.toLowerCase().includes(termo) ?? false)
    );
  });
}, [todos, q]);
const chipCounts: Record<string, number> = { todos: buscaAplicada.length };
for (const s of STATUS_ORCAMENTO) chipCounts[s] = buscaAplicada.filter((o) => o.status === s).length;
```

Substituir o `<Select>` dentro de `toolbar` por:
```tsx
<StatusFilterChips itens={chipItens} ativo={filtroStatus} onChange={(id) => setFiltroStatus(id as StatusOrcamento | "todos")} counts={chipCounts} />
```

- [ ] **Step 2: Verificar tipos, lint e suíte**

Run: `npx tsc --noEmit && npx eslint src/features/orcamentos/components/orcamentos-page.tsx && npx vitest run`
Expected: sem erros; suíte verde.

- [ ] **Step 3: Commit**

```bash
git add src/features/orcamentos/components/orcamentos-page.tsx
git commit -m "feat: add chip filters and total-em-aberto pill to Orcamentos list"
```

---

### Task 6: Re-vestir Comprovantes (chips + Pill real + tile de ícone)

**Files:**
- Modify: `src/features/comprovantes/components/comprovantes-page.tsx`

**Interfaces:**
- Consumes: `StatusFilterChips`/`StatusFilterChipItem` (Task 2); `STATUS_COMPROVANTE`, `STATUS_COMPROVANTE_LABEL`, `StatusComprovanteBadge` (já importados).
- Produces: nada consumido por outras tasks.

Preservar **sem alterar**: `useMemo` de `lista`, `columns` (Número/OS/Cliente/Gerado em/Status), `renderCard`, `empty` state, `verOrdensBtn` (CTA real mantido).

- [ ] **Step 1: Trocar Select por chips + Pill de pendências**

```tsx
import { StatusFilterChips, type StatusFilterChipItem } from "@/shared/components/status-filter-chips";
import { CardPill } from "@/shared/components/card-secao";

const pendentes = todos.filter((c) => c.status === "pendente").length;
const pillTexto = pendentes > 0 ? `${pendentes} pendente${pendentes > 1 ? "s" : ""} de assinatura` : `${todos.length} comprovante${todos.length !== 1 ? "s" : ""}`;

const chipItens: StatusFilterChipItem[] = [
  { id: "todos", label: "Todos" },
  ...STATUS_COMPROVANTE.map((s) => ({
    id: s,
    label: STATUS_COMPROVANTE_LABEL[s],
    tone: (s === "assinado" ? "success" : s === "recusado" ? "neutral" : "warn") as StatusFilterChipItem["tone"],
  })),
];
const buscaAplicada = useMemo(() => {
  const termo = q.trim().toLowerCase();
  if (!termo) return todos;
  return todos.filter((c) => {
    const os = ordensStore.obter(c.os_id);
    const cliente = clientesStore.getById(c.cliente_id);
    return (
      c.numero.toLowerCase().includes(termo) ||
      (os?.numero.toLowerCase().includes(termo) ?? false) ||
      (cliente?.nome.toLowerCase().includes(termo) ?? false)
    );
  });
}, [todos, q]);
const chipCounts: Record<string, number> = { todos: buscaAplicada.length };
for (const s of STATUS_COMPROVANTE) chipCounts[s] = buscaAplicada.filter((c) => c.status === s).length;
```

Substituir `<Select>` dentro de `toolbar` por `StatusFilterChips` (mesmo padrão das tasks 4/5). Adicionar o Pill de pendências como linha própria abaixo do `<PageHeader ... />` e antes do `<DataList ... />` (mesma abordagem da Task 5 — `PageHeader` não tem slot para isso):
```tsx
<div className="-mt-2">
  <CardPill>{pillTexto}</CardPill>
</div>
```

- [ ] **Step 2: Ícone em tile na coluna Número**

Trocar a célula de "Número" para incluir um tile de ícone antes do link (mesma marcação usada em `NotasFiscaisCard`/OS list):
```tsx
{
  header: "Número",
  cell: (c) => (
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
        <Icon icon="lucide:file-signature" className="h-3.5 w-3.5" aria-hidden />
      </span>
      <Link to="/admin/comprovantes/$comprovanteId" params={{ comprovanteId: c.id }} className="font-mono text-sm font-semibold text-foreground hover:text-primary">
        {c.numero}
      </Link>
    </div>
  ),
},
```

- [ ] **Step 3: Verificar tipos, lint e suíte**

Run: `npx tsc --noEmit && npx eslint src/features/comprovantes/components/comprovantes-page.tsx && npx vitest run`
Expected: sem erros; suíte verde.

- [ ] **Step 4: Commit**

```bash
git add src/features/comprovantes/components/comprovantes-page.tsx
git commit -m "feat: add chip filters, real pending-count pill and icon tile to Comprovantes list"
```

---

### Task 7: Verificação final e PR

**Files:** nenhum (só verificação/entrega).

- [ ] **Step 1: Type-check + lint completos**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros. (Se `npm run lint` for lento no ambiente, rode `npx eslint` nos arquivos tocados nas Tasks 1–6 individualmente como já feito em cada task, e registre que o lint full-project ficou pendente de confirmação se estourar o timeout.)

- [ ] **Step 2: Suíte completa**

Run: `npx vitest run`
Expected: verde (sem regressões; +3 arquivos de teste novos: `derivacoes.test.ts` estendido, `status-filter-chips.test.tsx`, `faturamento-kpis.test.tsx`).

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: build sem erros.

- [ ] **Step 4: Smoke visual (usuário)**

Solicitar ao usuário conferência lado a lado com os mocks, em light/dark e 375/768/1280px:
`/admin/faturamento`, `/admin/ordens`, `/admin/orcamentos`, `/admin/comprovantes`
vs.
`docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/{Faturamento,OSList,OrcamentosList,ComprovantesList}.jsx`.

- [ ] **Step 5: Push e abrir PR**

```bash
git push -u origin feat/telas-area-retaguarda
gh pr create --fill --base main
```

---

## Self-Review

**Spec coverage:**
- Decisão 1 (Comprovantes real+visual mock) → Task 6. ✓
- Decisão 2/5 (sem Exportar/Emitir NF fake) → Task 3 (só Exportar real ligado a `exportarFaturamentoPdf`), Tasks 4/5/6 (sem botão de exportar). ✓
- Decisão 3 (Faturamento página única) → Task 3. ✓
- Decisão 4 (A faturar = rascunhos reais + Aguardando preservado) → Task 3. ✓
- Decisão 6 (Orçamentos rótulos reais + Pill real) → Task 5. ✓
- Decisão 7 (colunas OS novas com dado real derivado) → Task 4. ✓
- Decisão 8/9 (chips compartilhados) → Task 2, consumido nas Tasks 4/5/6. ✓
- Decisão 10 (Faturamento 100% real, sem showcase) → Task 1 (agregação real) + Task 3. ✓
- Decisão 11 (tokens, ícones, badges de domínio) → todas as tasks usam badges existentes, nenhuma hex. ✓
- Reuso de `DataList`/`CardSecao`/`Sparkline`/`AguardandoFaturamento` → confirmado em todas as tasks, nada recriado do zero. ✓
- Testes: `agregadoMensal`/`contaDoFaturamento` (Task 1), `StatusFilterChips` (Task 2), `FaturamentoKpis` (Task 3) — cobrem a lógica nova; Tasks 4–6 são re-vest de UI sem lógica de negócio nova (só leitura/derivação simples), consistente com o padrão de "sem novo teste unitário" das rodadas anteriores quando é puro re-vest.
- Verificação tsc/eslint/vitest/build → Task 7. ✓

**Placeholder scan:** sem TBD/TODO. Onde o plano diz "confirme a assinatura real antes de usar" (PageHeader, exportarFaturamentoPdf, equipamentosStore.getById), é uma instrução de verificação de fato — não uma decisão de design em aberto; o comportamento correto já está especificado (o que fazer se a prop/method não existir está descrito inline).

**Type consistency:** `AgregadoMensalFaturamento` (Task 1) usado em `FaturamentoMensalCard`/`FaturamentoPage` (Task 3) com os mesmos campos (`mes`,`rotulo`,`valor`,`qtd`). `StatusFilterChipItem`/`StatusFilterChips` (Task 2) consumido identicamente nas Tasks 4/5/6 (`itens`/`ativo`/`onChange`/`counts`). `contaDoFaturamento` (Task 1) consumido em `NotasFiscaisCard` (Task 3) com a mesma assinatura.
