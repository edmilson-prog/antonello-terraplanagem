# Detalhe de OS / Orçamento / Faturamento / Comprovante — Refatoração Visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-vestir as quatro páginas de detalhe transacionais (OS, Orçamento, Faturamento, Comprovante) com a linguagem visual do design system (hero rico + faixa de estatísticas reais + seções `CardSecao`), preservando 100% dos fluxos.

**Architecture:** Extrair dois componentes de apresentação compartilhados (`DocumentoHero`, `StatStrip`) em `src/shared/components/` e reescrever apenas o `return()` de cada um dos quatro componentes de detalhe, mantendo todo o estado/handlers/effects/diálogos existentes intactos. Nenhum dado de exemplo (showcase): a faixa de estatísticas usa só números deriváveis do próprio documento.

**Tech Stack:** React + TypeScript, Tailwind (tokens semânticos), shadcn/ui, `@iconify/react` (lucide), TanStack Router, Vitest.

## Global Constraints

- Nunca hex em componente — só tokens (`bg-card`, `text-primary`, `border-border`, `text-foreground-faint`, `bg-surface`, `bg-destructive/15`, etc.). Copiado do CLAUDE.md / DESIGN-SYSTEM.md.
- Sem `any`; `optional chaining` (`os?.cliente?.nome`), nunca `!`.
- Ícones via `@iconify/react` com prefixo `lucide:`.
- Toda a lógica de fluxo existente (editar, enviar, aprovar/recusar, confirmar, fechar OS, gerar OS/comprovante, assinar/recusar, `ConfirmDialog`/`FormDialog`, toasts, guardas, disparo WhatsApp, IA) permanece **idêntica** — muda só o invólucro visual.
- Ações de fluxo **não** migram para o hero (barra própria re-estilizada).
- Comprovante **não** tem `StatStrip`.
- Financeiro é permitido (todas as rotas são `/admin`).
- Commits: Conventional Commits em inglês.

---

### Task 1: `StatStrip` compartilhado

**Files:**
- Create: `src/shared/components/stat-strip.tsx`
- Test: `src/shared/components/stat-strip.test.tsx`

**Interfaces:**
- Produces:
  - `interface StatItem { rotulo: string; valor: string; icone: string; rodape?: string; alerta?: boolean; mono?: boolean }`
  - `function StatStrip({ itens }: { itens: StatItem[] }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatStrip } from "./stat-strip";

describe("StatStrip", () => {
  it("renderiza rótulo, valor e rodapé de cada item", () => {
    render(
      <StatStrip
        itens={[
          { rotulo: "Itens", valor: "3", icone: "lucide:list", rodape: "no orçamento" },
          { rotulo: "Total", valor: "R$ 1.200,00", icone: "lucide:banknote", alerta: true },
        ]}
      />,
    );
    expect(screen.getByText("Itens")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("no orçamento")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.200,00")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/components/stat-strip.test.tsx`
Expected: FAIL — não resolve `./stat-strip`.

- [ ] **Step 3: Write minimal implementation**

```tsx
import { Icon } from "@iconify/react";

export interface StatItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape?: string;
  alerta?: boolean;
  mono?: boolean; // valor em font-mono; default true
}

// Faixa de estatísticas REAIS (sem sparkline/trend) para as páginas de detalhe
// transacionais. Reusa a estética do KpiCard (cliente-kpis), só com dado real.
export function StatStrip({ itens }: { itens: StatItem[] }) {
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {itens.map((s) => (
        <StatTile key={s.rotulo} stat={s} />
      ))}
    </section>
  );
}

function StatTile({ stat }: { stat: StatItem }) {
  const mono = stat.mono ?? true;
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {stat.rotulo}
        </span>
        <span
          className={
            stat.alerta
              ? "grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive"
              : "grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary"
          }
        >
          <Icon icon={stat.icone} className="h-4 w-4" />
        </span>
      </div>
      <div
        className={
          (stat.alerta ? "text-destructive" : "text-foreground") +
          (mono ? " font-mono" : " font-display") +
          " mt-3 text-2xl font-bold"
        }
      >
        {stat.valor}
      </div>
      {stat.rodape ? (
        <div className="mt-1.5 text-xs text-muted-foreground">{stat.rodape}</div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/components/stat-strip.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/stat-strip.tsx src/shared/components/stat-strip.test.tsx
git commit -m "feat: add shared StatStrip for real-data detail metrics"
```

---

### Task 2: `DocumentoHero` compartilhado

**Files:**
- Create: `src/shared/components/documento-hero.tsx`
- Test: `src/shared/components/documento-hero.test.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces:
  - `interface DocumentoHeroQuickfact { rotulo: string; valor: ReactNode; mono?: boolean }` (valor aceita string ou nó — permite `<Link>` clicável, ex.: link da OS no faturamento/comprovante)
  - `interface DocumentoHeroProps { icone: string; numero: string; titulo?: string; badges?: ReactNode; quickfacts: DocumentoHeroQuickfact[]; acoes?: ReactNode }`
  - `function DocumentoHero(props: DocumentoHeroProps): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DocumentoHero } from "./documento-hero";

describe("DocumentoHero", () => {
  it("renderiza número, título, quickfacts e slots", () => {
    render(
      <DocumentoHero
        icone="lucide:file-text"
        numero="ORC-2026-0001"
        titulo="Terraplenagem lote 12"
        badges={<span>enviado</span>}
        quickfacts={[{ rotulo: "Cliente", valor: "Construtora XY" }]}
        acoes={<button>Editar</button>}
      />,
    );
    expect(screen.getByText("ORC-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Terraplenagem lote 12")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Construtora XY")).toBeInTheDocument();
    expect(screen.getByText("enviado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/components/documento-hero.test.tsx`
Expected: FAIL — não resolve `./documento-hero`.

- [ ] **Step 3: Write minimal implementation**

```tsx
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

export interface DocumentoHeroQuickfact {
  rotulo: string;
  valor: ReactNode; // string ou nó (ex.: <Link> da OS)
  mono?: boolean;
}

export interface DocumentoHeroProps {
  icone: string;
  numero: string;
  titulo?: string;
  badges?: ReactNode;
  quickfacts: DocumentoHeroQuickfact[];
  acoes?: ReactNode;
}

// Casca do hero para páginas de detalhe "documento" (OS, orçamento, faturamento,
// comprovante). Mesma estética do cliente-hero: card em gradiente, tile de ícone,
// número em mono, badges à direita, quickfacts e slot de ações.
export function DocumentoHero({ icone, numero, titulo, badges, quickfacts, acoes }: DocumentoHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-card to-surface p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          aria-hidden
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg"
        >
          <Icon icon={icone} className="h-9 w-9" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground sm:text-3xl">{numero}</h1>
            {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
          </div>
          {titulo ? (
            <p className="mt-1 font-display font-bold text-card-foreground">{titulo}</p>
          ) : null}

          {quickfacts.length > 0 ? (
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {quickfacts.map((q) => (
                <div key={q.rotulo} className="flex flex-col gap-1">
                  <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
                    {q.rotulo}
                  </dt>
                  <dd className={q.mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
                    {q.valor}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {acoes ? <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/components/documento-hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/documento-hero.tsx src/shared/components/documento-hero.test.tsx
git commit -m "feat: add shared DocumentoHero for transactional detail pages"
```

---

### Task 3: Re-vestir Detalhe da OS

**Files:**
- Modify: `src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx` (só o `return()` e imports; preservar todo o resto)

**Interfaces:**
- Consumes: `DocumentoHero` (Task 2), `StatStrip`/`StatItem` (Task 1), `CardSecao` (`@/shared/components/card-secao`), `StatusOSBadge` + `MODELO_LABEL` + `STATUS_OS_LABEL` (`@/features/ordem-servico/labels`), `statusEfetivoOS`/`apontamentosDaOS`/`podeFecharOS`/`totalHorasOS`/`totalMetragemOS` (`@/features/ordem-servico/derivacoes`), `formatDataHora` (`@/shared/lib/format`).
- Produces: nada consumido por tasks posteriores.

Preservar **sem alterar**: todo o topo do componente (imports de fluxo, `useState`, `fechar`, `abrirRevisaoComprovante`, `confirmarGeracaoComprovante`, blocos `isLoading`/`error`/`!ordem`, os três `FormDialog`/`ConfirmDialog` do fim, `OrdemNaoEncontradaAdmin`). O `OrdemResumoCard` é aposentado nesta página (seu conteúdo — número, cliente, obra, status, modelo, horas — passa ao hero + stat strip); remover o import e o uso.

- [ ] **Step 1: Ajustar imports**

Adicionar:
```tsx
import { DocumentoHero } from "@/shared/components/documento-hero";
import { StatStrip, type StatItem } from "@/shared/components/stat-strip";
import { CardSecao } from "@/shared/components/card-secao";
import { StatusOSBadge, MODELO_LABEL, STATUS_OS_LABEL } from "@/features/ordem-servico/labels";
import { totalHorasOS, totalMetragemOS } from "@/features/ordem-servico/derivacoes";
import { formatDataHora } from "@/shared/lib/format";
import { clientesStore } from "@/features/clientes/clientes-store";
```
Remover o import de `OrdemResumoCard`. (Se `clientesStore`/derivações já estiverem importados, não duplicar.)

- [ ] **Step 2: Calcular dados reais (logo após `const podeFechar = ...`)**

```tsx
const cliente = clientesStore.getById(ordem.cliente_id);
const statusEfetivo = statusEfetivoOS(ordem, apontamentos);
const horas = totalHorasOS(ordem.id, apontamentos);
const operadoresDistintos = new Set(daOS.map((a) => a.operador_id)).size;
const wa = (() => {
  const d = cliente?.telefone?.replace(/\D/g, "") ?? "";
  return d.length >= 10 ? `https://wa.me/55${d}` : null;
})();
const stats: StatItem[] = [
  { rotulo: "Apontamentos", valor: String(daOS.length), icone: "lucide:timer" },
  ordem.modelo_cobranca === "por_metro"
    ? { rotulo: "Metragem", valor: `${totalMetragemOS(ordem.id, apontamentos)} m`, icone: "lucide:ruler" }
    : { rotulo: "Horas totais", valor: String(horas), icone: "lucide:clock" },
  { rotulo: "Operadores", valor: String(operadoresDistintos), icone: "lucide:users" },
  { rotulo: "Status", valor: STATUS_OS_LABEL[statusEfetivo], icone: "lucide:activity", mono: false },
];
```

- [ ] **Step 3: Substituir o `return (...)` (mantendo os diálogos do fim)**

O novo corpo, do back-link até antes dos `FormDialog`/`ConfirmDialog` (que permanecem inalterados no fim do `return`):
```tsx
return (
  <div className="space-y-5">
    <Link
      to="/admin/ordens"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Ordens de Serviço
    </Link>

    <DocumentoHero
      icone="lucide:clipboard-list"
      numero={ordem.numero}
      titulo={cliente?.nome ? `${cliente.nome} · ${ordem.obra_nome}` : ordem.obra_nome}
      badges={
        <>
          <StatusOSBadge status={statusEfetivo} />
          <span className="rounded-full border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
            {MODELO_LABEL[ordem.modelo_cobranca]}
          </span>
          {ordem.pendente_sync ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-steel/40 bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <Icon icon="lucide:refresh-cw" className="h-3 w-3" />
              Sync pendente
            </span>
          ) : null}
        </>
      }
      quickfacts={[
        { rotulo: "Aberta em", valor: formatDataHora(ordem.aberta_em) },
        ...(ordem.endereco ? [{ rotulo: "Endereço", valor: ordem.endereco }] : []),
        ...(ordem.fechada_em ? [{ rotulo: "Fechada em", valor: formatDataHora(ordem.fechada_em) }] : []),
      ]}
      acoes={
        <>
          {!fechada ? (
            <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
              <Icon icon="lucide:pencil" className="h-4 w-4" />
              Editar
            </Button>
          ) : null}
          {wa ? (
            <Button asChild variant="outline" className="gap-1.5">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <Icon icon="lucide:message-circle" className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          ) : null}
        </>
      }
    />

    <StatStrip itens={stats} />

    {ordem.observacao ? (
      <CardSecao titulo="Observação" icone="lucide:sticky-note">
        <p className="px-4 py-4 text-sm text-card-foreground">{ordem.observacao}</p>
      </CardSecao>
    ) : null}

    <CardSecao titulo={`Apontamentos (${daOS.length})`} icone="lucide:timer">
      <div className="p-4">
        <ApontamentosDaOS apontamentos={daOS} />
      </div>
    </CardSecao>

    {!fechada ? (
      <div className="flex flex-wrap items-center gap-2">
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

    {fechada ? (
      <CardSecao titulo="Comprovante" icone="lucide:file-check-2">
        <div className="p-4">
          {comprovante ? (
            <Link
              to="/admin/comprovantes/$comprovanteId"
              params={{ comprovanteId: comprovante.id }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Icon icon="lucide:external-link" className="h-4 w-4" />
              Ver comprovante {comprovante.numero}
            </Link>
          ) : (
            <Button
              onClick={abrirRevisaoComprovante}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:file-check-2" className="h-4 w-4" />
              Gerar comprovante
            </Button>
          )}
        </div>
      </CardSecao>
    ) : null}

    {fechada && aviso ? (
      <CardSecao titulo="Aviso ao cliente" icone="lucide:message-circle">
        <div className="space-y-2 p-4 text-sm">
          <div className="flex items-center gap-2">
            <StatusAvisoBadge status={aviso.status} />
            <span className="text-xs text-muted-foreground">
              via {PROVEDOR_WHATSAPP_LABEL[aviso.provedor]}
            </span>
          </div>
          {aviso.status === "enviado" ? (
            <p className="text-muted-foreground">{aviso.mensagem_preview}</p>
          ) : (
            <p className="text-destructive">
              Cliente sem telefone válido cadastrado — atualize o cadastro para reenviar.
            </p>
          )}
        </div>
      </CardSecao>
    ) : null}

    {/* ——— manter aqui, inalterados, os três FormDialog/ConfirmDialog existentes ——— */}
  </div>
);
```

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx`
Expected: sem erros. (Se `ApontamentosDaOS` já aplicar padding próprio, remover o wrapper `p-4` para não duplicar.)

- [ ] **Step 5: Rodar a suíte e commitar**

```bash
npx vitest run
git add src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx
git commit -m "feat: rebuild OS detail with DocumentoHero, real StatStrip and card sections"
```

---

### Task 4: Re-vestir Detalhe do Orçamento

**Files:**
- Modify: `src/features/orcamentos/components/orcamento-detalhe.tsx` (só `return()` e imports; preservar todo o resto)

**Interfaces:**
- Consumes: `DocumentoHero`, `StatStrip`/`StatItem`, `CardSecao`, `StatusOrcamentoBadge` (`@/features/orcamentos/labels`), `validadeVencida`, `formatBRL`, `formatData`.
- Produces: nada.

Preservar **sem alterar**: todo o topo (imports de fluxo, `inferirModelo`, `useState`, `gerarOS`, `setItens`, `handleQuantidade/ValorUnitario/HoraTipo/Remover`, `onEnviar`, `onDecidir`, `onEnviarClick`, blocos `isLoading`/`error`/`!orc`, os dois `ConfirmDialog` do fim, `OrcamentoNaoEncontrado`).

- [ ] **Step 1: Ajustar imports**

Adicionar:
```tsx
import { DocumentoHero } from "@/shared/components/documento-hero";
import { StatStrip, type StatItem } from "@/shared/components/stat-strip";
import { CardSecao } from "@/shared/components/card-secao";
import { formatData } from "@/shared/lib/format";
```
Manter `formatBRL`, `formatDataHora`, `StatusOrcamentoBadge`, `validadeVencida`, `clientesStore` (já importados).

- [ ] **Step 2: Calcular dados reais (após `const vencida = ...`)**

```tsx
const subtotal = orc.itens.reduce((s, i) => s + i.valor_total, 0);
const stats: StatItem[] = [
  { rotulo: "Itens", valor: String(orc.itens.length), icone: "lucide:list" },
  { rotulo: "Subtotal", valor: formatBRL(subtotal), icone: "lucide:calculator" },
  { rotulo: "Desconto", valor: formatBRL(orc.desconto), icone: "lucide:tag" },
  { rotulo: "Total", valor: formatBRL(orc.valor_total), icone: "lucide:banknote" },
];
```

- [ ] **Step 3: Substituir back-link + `header` pelo hero + stat strip; envolver as seções em `CardSecao`**

Trocar o `<Link ...>Orçamentos</Link>` + `<header>...</header>` por:
```tsx
<Link
  to="/admin/orcamentos"
  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
>
  <Icon icon="lucide:arrow-left" className="h-4 w-4" />
  Orçamentos
</Link>

<DocumentoHero
  icone="lucide:file-text"
  numero={orc.numero}
  titulo={cliente?.nome ? `${cliente.nome} · ${orc.descricao_obra}` : orc.descricao_obra}
  badges={
    <>
      <StatusOrcamentoBadge status={orc.status} />
      {vencida ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
          <Icon icon="lucide:calendar-x" className="h-3 w-3" />
          Vencido
        </span>
      ) : null}
    </>
  }
  quickfacts={[
    { rotulo: "Validade", valor: formatData(orc.validade) },
    ...(orc.enviado_em ? [{ rotulo: "Enviado em", valor: formatDataHora(orc.enviado_em) }] : []),
    ...(orc.decidido_em ? [{ rotulo: "Decidido em", valor: formatDataHora(orc.decidido_em) }] : []),
  ]}
/>

<StatStrip itens={stats} />
```

Envolver a seção de itens em `CardSecao titulo={`Itens (${orc.itens.length})`} icone="lucide:list"` — mover o aviso "Há itens sem preço" (`pendente`) para o `acessorio` do `CardSecao`; o corpo (lista `OrcamentoItemRow` + `SugestaoOrcamentoDialog` + `AdicionarItemOrcamento` + empty state) fica dentro de um wrapper `p-4 space-y-4`, **preservando toda a lógica `editavel`/handlers**. Exemplo do header:
```tsx
<CardSecao
  titulo={`Itens (${orc.itens.length})`}
  icone="lucide:list"
  acessorio={
    pendente ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <Icon icon="lucide:triangle-alert" className="h-3.5 w-3.5" />
        Há itens sem preço
      </span>
    ) : undefined
  }
  bodyClassName="p-4 space-y-4"
>
  {/* mesma lógica de itens/empty/adicionar já existente */}
</CardSecao>
```

Envolver a seção de desconto/observação/total em `CardSecao titulo="Desconto e observação" icone="lucide:percent" bodyClassName="p-4 space-y-4"` — **preservar** os inputs `editavel` e o bloco de total ao pé (`border-t pt-4`).

Manter, **inalterada**, a `<section className="flex flex-wrap items-center justify-end gap-2">` com as ações de fluxo (Enviar/Recusar/Aprovar/Gerar OS/Ver OS) e os dois `ConfirmDialog` do fim.

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/orcamentos/components/orcamento-detalhe.tsx`
Expected: sem erros.

- [ ] **Step 5: Rodar a suíte e commitar**

```bash
npx vitest run
git add src/features/orcamentos/components/orcamento-detalhe.tsx
git commit -m "feat: rebuild orcamento detail with DocumentoHero, real StatStrip and card sections"
```

---

### Task 5: Re-vestir Detalhe do Faturamento

**Files:**
- Modify: `src/features/faturamento/components/faturamento-detalhe.tsx` (só `return()` e imports; preservar o resto)

**Interfaces:**
- Consumes: `DocumentoHero`, `StatStrip`/`StatItem`, `CardSecao`, `StatusFaturamentoBadge`, `MODELO_LABEL` (`@/features/ordem-servico/labels`), `temPendencia`, `formatBRL`, `formatDataHora`.
- Produces: nada.

Preservar **sem alterar**: todo o topo (`useState`, `setItens`, `handleQuantidade/ValorUnitario/HoraTipo/Remover`, `adicionarMobilizacao`, `onConfirmar`, `!fat`), o `ConfirmDialog` do fim e `FaturamentoNaoEncontrado`.

- [ ] **Step 1: Ajustar imports**

Adicionar:
```tsx
import { DocumentoHero } from "@/shared/components/documento-hero";
import { StatStrip, type StatItem } from "@/shared/components/stat-strip";
import { CardSecao } from "@/shared/components/card-secao";
import { MODELO_LABEL } from "@/features/ordem-servico/labels";
```

- [ ] **Step 2: Calcular dados reais (após `const pendente = temPendencia(fat);`)**

```tsx
const stats: StatItem[] = [
  { rotulo: "Itens", valor: String(fat.itens.length), icone: "lucide:list" },
  { rotulo: "Desconto", valor: formatBRL(fat.desconto), icone: "lucide:tag" },
  { rotulo: "Total", valor: formatBRL(fat.valor_total), icone: "lucide:banknote", alerta: pendente },
  { rotulo: "Status", valor: fat.status === "faturado" ? "Faturado" : "Rascunho", icone: "lucide:activity", mono: false },
];
```

- [ ] **Step 3: Substituir a `<section>` de header pelo hero + stat strip; envolver seções em `CardSecao`**

Trocar o back-link + a primeira `<section>` (header) por:
```tsx
<Link
  to="/admin/faturamento"
  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
>
  <Icon icon="lucide:arrow-left" className="h-4 w-4" />
  Faturamento
</Link>

<DocumentoHero
  icone="lucide:receipt"
  numero={fat.numero}
  titulo={cliente?.nome ?? "—"}
  badges={<StatusFaturamentoBadge status={fat.status} />}
  quickfacts={[
    {
      rotulo: "OS de origem",
      valor: os ? (
        <Link
          to="/admin/ordens/$ordemId"
          params={{ ordemId: os.id }}
          className="font-medium text-primary hover:underline"
        >
          {os.numero} · {os.obra_nome}
        </Link>
      ) : (
        "OS de origem removida"
      ),
    },
    { rotulo: "Modelo", valor: MODELO_LABEL[fat.modelo_cobranca] },
    { rotulo: "Gerado em", valor: formatDataHora(fat.gerado_em) },
    ...(fat.faturado_em ? [{ rotulo: "Faturado em", valor: formatDataHora(fat.faturado_em) }] : []),
  ]}
/>

<StatStrip itens={stats} />
```
> O link da OS permanece clicável (o quickfact aceita `ReactNode`), preservando o comportamento atual.

Envolver a seção de itens em `CardSecao titulo={`Itens (${fat.itens.length})`} icone="lucide:list" bodyClassName="p-4 space-y-3"` — **preservar** a lista `FaturamentoItemRow`, o empty state e o `Select` de mobilização (`editavel`).

Envolver a seção de observação/total em `CardSecao titulo="Observação e total" icone="lucide:file-text" bodyClassName="p-4 space-y-4"` — **preservar** o `Textarea` + `GerarTextoBotao` (`editavel` e há `os`) e o bloco de total ao pé.

Manter, **inalterados**, o banner de pendência (`pendente`), a barra de ação **Confirmar faturamento** (`editavel`) e o `ConfirmDialog` do fim.

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/faturamento/components/faturamento-detalhe.tsx`
Expected: sem erros.

- [ ] **Step 5: Rodar a suíte e commitar**

```bash
npx vitest run
git add src/features/faturamento/components/faturamento-detalhe.tsx
git commit -m "feat: rebuild faturamento detail with DocumentoHero, real StatStrip and card sections"
```

---

### Task 6: Re-vestir Detalhe do Comprovante

**Files:**
- Modify: `src/features/comprovantes/components/comprovante-detalhe.tsx` (só `return()` e imports; preservar o resto)

**Interfaces:**
- Consumes: `DocumentoHero`, `CardSecao`, `StatusComprovanteBadge`, `formatDataHora`. **Não** usa `StatStrip` (decisão 2 da spec).
- Produces: nada.

Preservar **sem alterar**: todo o topo (`useState`, `onAssinar`, `onRecusar`, `!comprovante`), o `FormDialog` de recusa do fim e `ComprovanteNaoEncontrado`.

- [ ] **Step 1: Ajustar imports**

Adicionar:
```tsx
import { DocumentoHero } from "@/shared/components/documento-hero";
import { CardSecao } from "@/shared/components/card-secao";
```

- [ ] **Step 2: Substituir o back-link + `header` pelo hero; envolver seções em `CardSecao`**

Trocar back-link + `<header>` por:
```tsx
<Link
  to="/admin/comprovantes"
  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
>
  <Icon icon="lucide:arrow-left" className="h-4 w-4" />
  Comprovantes
</Link>

<DocumentoHero
  icone="lucide:file-signature"
  numero={comprovante.numero}
  titulo={cliente?.nome ?? "—"}
  badges={<StatusComprovanteBadge status={comprovante.status} />}
  quickfacts={[
    ...(os
      ? [
          {
            rotulo: "OS",
            valor: (
              <Link
                to="/admin/ordens/$ordemId"
                params={{ ordemId: os.id }}
                className="font-medium text-primary hover:underline"
              >
                {os.numero} · {os.obra_nome}
              </Link>
            ),
          },
        ]
      : []),
    { rotulo: "Gerado em", valor: formatDataHora(comprovante.gerado_em) },
    ...(comprovante.assinado_em ? [{ rotulo: "Assinado em", valor: formatDataHora(comprovante.assinado_em) }] : []),
  ]}
/>
```
> O link da OS permanece clicável (o quickfact aceita `ReactNode`), preservando o "Ver OS" atual.

Envolver "Resumo do serviço" em `CardSecao titulo="Resumo do serviço" icone="lucide:file-text" bodyClassName="p-4"` mantendo o `<pre className="whitespace-pre-wrap font-sans text-sm text-card-foreground">`.

Envolver o bloco `pendente` em `CardSecao titulo="Assinatura do cliente" icone="lucide:pen-line" bodyClassName="p-4 space-y-4"` — **preservar** `Input` nome + `SignaturePad` + botões Recusar/Confirmar (guarda `podeConfirmar`).

Envolver o bloco `assinado` em `CardSecao titulo="Assinatura registrada" icone="lucide:check" bodyClassName="p-4 space-y-2"` — **preservar** nome + `img` da assinatura.

O bloco `recusado` permanece como card destrutivo próprio (não usar `CardSecao`, manter `border-destructive/40 bg-destructive/5`).

Manter, **inalterado**, o `FormDialog` de recusa do fim.

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/comprovantes/components/comprovante-detalhe.tsx`
Expected: sem erros.

- [ ] **Step 4: Rodar a suíte e commitar**

```bash
npx vitest run
git add src/features/comprovantes/components/comprovante-detalhe.tsx
git commit -m "feat: rebuild comprovante detail with DocumentoHero and card sections"
```

---

### Task 7: Verificação final e PR

**Files:** nenhum (só verificação/entrega).

- [ ] **Step 1: Type-check + lint completos**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 2: Suíte completa**

Run: `npx vitest run`
Expected: verde (sem regressões; +2 testes de `StatStrip`/`DocumentoHero`).

- [ ] **Step 3: Build de produção (sanidade)**

Run: `npm run build`
Expected: build sem erros.

- [ ] **Step 4: Smoke visual (usuário)**

Solicitar ao usuário conferência em light/dark e 375/768/1280px das quatro rotas:
`/admin/ordens/:id`, `/admin/orcamentos/:id`, `/admin/faturamento/:id`, `/admin/comprovantes/:id`.

- [ ] **Step 5: Push e abrir PR**

```bash
git push -u origin feat/detalhe-documentos-visual
gh pr create --fill --base main
```

---

## Self-Review

**Spec coverage:**
- Componentes compartilhados (`DocumentoHero`, `StatStrip`) → Tasks 1–2. ✓
- OS (hero + strip real + seções, ações de fluxo fora do hero, `OrdemResumoCard` absorvido) → Task 3. ✓
- Orçamento (hero + strip + seções, ações de fluxo preservadas) → Task 4. ✓
- Faturamento (hero + strip com alerta de pendência + seções) → Task 5. ✓
- Comprovante (hero + seções, **sem** strip) → Task 6. ✓
- "Real onde existe, sem showcase/sparkline" → nenhum módulo `*-showcase-data` criado; strips usam só derivações reais. ✓
- Fluxos preservados 100% → cada task lista explicitamente o que manter inalterado. ✓
- Light/dark só com tokens; a11y (`aria-hidden` no tile/blur, badges cor+label) → herdado dos componentes compartilhados. ✓
- Testes: sem novos testes de negócio; render básico de `StatStrip`/`DocumentoHero` → Tasks 1–2. ✓
- Verificação `tsc`/`vitest`/`lint`/`build` → Task 7. ✓

**Placeholder scan:** sem TBD/TODO; código real em cada step; back-links e diálogos preservados referenciados pelo texto exato.

**Type consistency:** `StatItem`/`DocumentoHeroProps` usados nas Tasks 3–6 batem com o definido nas Tasks 1–2 (`rotulo/valor/icone/rodape/alerta/mono`; `icone/numero/titulo/badges/quickfacts/acoes`). Derivações reais confirmadas: `totalHorasOS`, `totalMetragemOS`, `statusEfetivoOS`, `apontamentosDaOS`, `podeFecharOS` (assinaturas verificadas no código).
