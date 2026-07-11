# Detalhe do Operador — Refatoração Visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar `/admin/operadores/:id` para o layout rico do mock `docs/html/mock-detalhe-operador.html` (hero, faixa de KPIs, grid de cards de atividade), com identidade real do operador e enriquecimento por dados de exemplo.

**Architecture:** O componente orquestrador `operador-detalhe.tsx` compõe subcomponentes de apresentação pequenos e focados (hero, KPIs, cards de atividade). Toda a identidade vem do `operadoresStore` (Supabase, real); todo o enriquecimento vem de um único módulo isolado `operador-showcase-data.ts`, determinístico por `id`. Estilização 100% via tokens Tailwind (funciona light+dark). Sparklines e barras são SVG/CSS puros (fiéis ao mock, sem depender do Recharts para séries fixas de exemplo).

**Tech Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4 (tokens), shadcn/ui (`Table`, `Card`), Iconify (`@iconify/react`), TanStack Router (`Link`), Vitest + Testing Library.

## Global Constraints

- **Sem `any`.** Usar tipos específicos ou `unknown`. (CLAUDE.md TypeScript)
- **Sem hex hardcoded.** Cores/fontes só via tokens (`bg-card`, `text-primary`, `border-border`, `text-foreground-faint`, `font-display`, `font-mono`…). Light+dark obrigatórios. (CLAUDE.md Identidade Visual)
- **Ícones via Iconify** (`@iconify/react`), padrão `lucide:*`. (CLAUDE.md UI)
- **Nomenclatura:** arquivos de componente em kebab-case; componentes PascalCase; funções camelCase (verbos); nada de prefixo `I` em interfaces. (CLAUDE.md)
- **Status nunca por cor só:** sempre cor + ícone/label. (spec, a11y)
- **Zero dado financeiro** nesta tela (perfil de operador). (CLAUDE.md)
- **Todo dado de exemplo** vive só em `operador-showcase-data.ts`, claramente rotulado como temporário. (spec)
- **Cada arquivo tem uma responsabilidade.** Componentes de apresentação em `src/features/operadores/components/`.

---

### Task 1: Módulo de dados de exemplo (`operador-showcase-data.ts`)

Núcleo lógico do trabalho: gera dados de exemplo determinísticos por `id`. É a única peça com lógica real → tem teste de verdade (determinismo + variação + formato).

**Files:**
- Create: `src/features/operadores/operador-showcase-data.ts`
- Test: `src/features/operadores/operador-showcase-data.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export interface OperadorShowcase { kpis: ShowcaseKpis; apontamentos: ShowcaseApontamento[]; ordens: ShowcaseOrdem[]; horasSemana: ShowcaseSemana; equipamentos: ShowcaseEquip[]; cadastrais: ShowcaseCadastrais; acessoApp: ShowcaseAcessoApp }`
  - `export function showcaseDoOperador(id: string): OperadorShowcase`
  - Tipos nomeados (exportados) usados pelos componentes:
    - `export interface ShowcaseKpiItem { rotulo: string; valor: string; icone: string; rodape: string; trendPct: number | null; trendDir: "up" | "down" | null; spark: number[] }`
    - `export interface ShowcaseKpis { horasApontadas: ShowcaseKpiItem; osAtivas: ShowcaseKpiItem; osConcluidas: ShowcaseKpiItem; equipamentos: ShowcaseKpiItem }`
    - `export interface ShowcaseApontamento { id: string; data: string; equipamentoNome: string; equipamentoIcone: string; horimetroInicial: string; horimetroFinal: string; horas: string; osNumero: string }`
    - `export interface ShowcaseOrdem { id: string; numero: string; titulo: string; clienteNome: string; horas: string; desde: string; status: "aberta" | "em_andamento" | "fechada" }`
    - `export interface ShowcaseSemana { barras: { label: string; pct: number }[]; mediaHoras: string; picoHoras: string; picoLabel: string }`
    - `export interface ShowcaseEquip { nome: string; icone: string }`
    - `export interface ShowcaseCadastrais { cnhCategoria: string; cnhValidade: string; nascimento: string; idade: string; vinculo: string; admissao: string; base: string }`
    - `export interface ShowcaseAcessoApp { liberado: boolean; ultimoAcesso: string; dispositivo: string; versao: string; apontaVia: string }`

- [ ] **Step 1: Write the failing test**

Create `src/features/operadores/operador-showcase-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { showcaseDoOperador } from "./operador-showcase-data";

describe("showcaseDoOperador", () => {
  it("é determinístico: mesmo id → mesmo resultado", () => {
    const a = showcaseDoOperador("op-123");
    const b = showcaseDoOperador("op-123");
    expect(a).toEqual(b);
  });

  it("varia entre ids diferentes", () => {
    const a = showcaseDoOperador("op-aaa");
    const b = showcaseDoOperador("op-bbb");
    // Pelo menos um campo observável difere.
    expect(a.kpis.horasApontadas.valor).not.toEqual(b.kpis.horasApontadas.valor);
  });

  it("produz o formato esperado", () => {
    const s = showcaseDoOperador("op-xyz");
    expect(s.apontamentos.length).toBeGreaterThanOrEqual(3);
    expect(s.ordens.length).toBeGreaterThanOrEqual(3);
    expect(s.horasSemana.barras).toHaveLength(8);
    expect(s.equipamentos.length).toBeGreaterThanOrEqual(2);
    expect(["up", "down", null]).toContain(s.kpis.horasApontadas.trendDir);
    // Cada barra tem pct entre 0 e 100.
    for (const barra of s.horasSemana.barras) {
      expect(barra.pct).toBeGreaterThanOrEqual(0);
      expect(barra.pct).toBeLessThanOrEqual(100);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/operadores/operador-showcase-data.test.ts`
Expected: FAIL — "Failed to resolve import './operador-showcase-data'" (arquivo ainda não existe).

- [ ] **Step 3: Write the implementation**

Create `src/features/operadores/operador-showcase-data.ts`:

```ts
// DADOS DE EXEMPLO — TEMPORÁRIO.
// Enquanto apontamentos/OS/KPIs do operador não têm backing real (schema +
// migração mock→real pendentes), esta é a ÚNICA fonte de dados de exemplo da
// tela de detalhe do operador. É determinístico por `id` (mesmo operador →
// mesmos números, estáveis entre renders). Quando os dados reais existirem,
// trocar por queries reais SEM mexer nos componentes de apresentação.

export interface ShowcaseKpiItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[];
}

export interface ShowcaseKpis {
  horasApontadas: ShowcaseKpiItem;
  osAtivas: ShowcaseKpiItem;
  osConcluidas: ShowcaseKpiItem;
  equipamentos: ShowcaseKpiItem;
}

export interface ShowcaseApontamento {
  id: string;
  data: string;
  equipamentoNome: string;
  equipamentoIcone: string;
  horimetroInicial: string;
  horimetroFinal: string;
  horas: string;
  osNumero: string;
}

export interface ShowcaseOrdem {
  id: string;
  numero: string;
  titulo: string;
  clienteNome: string;
  horas: string;
  desde: string;
  status: "aberta" | "em_andamento" | "fechada";
}

export interface ShowcaseSemana {
  barras: { label: string; pct: number }[];
  mediaHoras: string;
  picoHoras: string;
  picoLabel: string;
}

export interface ShowcaseEquip {
  nome: string;
  icone: string;
}

export interface ShowcaseCadastrais {
  cnhCategoria: string;
  cnhValidade: string;
  nascimento: string;
  idade: string;
  vinculo: string;
  admissao: string;
  base: string;
}

export interface ShowcaseAcessoApp {
  liberado: boolean;
  ultimoAcesso: string;
  dispositivo: string;
  versao: string;
  apontaVia: string;
}

export interface OperadorShowcase {
  kpis: ShowcaseKpis;
  apontamentos: ShowcaseApontamento[];
  ordens: ShowcaseOrdem[];
  horasSemana: ShowcaseSemana;
  equipamentos: ShowcaseEquip[];
  cadastrais: ShowcaseCadastrais;
  acessoApp: ShowcaseAcessoApp;
}

const ICONE_ESCAVADEIRA = "lucide:truck";
const ICONE_RETRO = "lucide:tractor";
const ICONE_PA = "lucide:forklift";

const EQUIPAMENTOS_POOL: ShowcaseEquip[] = [
  { nome: "Escavadeira CAT 320", icone: ICONE_ESCAVADEIRA },
  { nome: "Retro JCB 3CX", icone: ICONE_RETRO },
  { nome: "Pá XCMG", icone: ICONE_PA },
  { nome: "Basculante", icone: ICONE_ESCAVADEIRA },
  { nome: "Trator D6", icone: ICONE_RETRO },
];

const OBRAS_POOL = [
  "Terraplenagem — lote industrial",
  "Abertura de acesso e drenagem",
  "Nivelamento de pátio",
  "Fundação de galpão — estacas",
  "Corte e aterro — loteamento",
];

const CLIENTES_POOL = [
  "Essavado Ltda.",
  "Construtora Sul",
  "Agro Vale Verde",
  "Metalúrgica Boa Vista",
  "Rodobens Engenharia",
];

const BASES_POOL = ["Santo Ângelo — RS", "Frederico Westphalen — RS", "Palmeira das Missões — RS"];
const DISPOSITIVOS_POOL = ["Android · Moto G", "Android · Galaxy A15", "Android · Redmi 12"];
const CNH_CATS = ["D", "E", "AD", "AE"];

function hashString(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function showcaseDoOperador(id: string): OperadorShowcase {
  const rand = mulberry32(hashString(id));
  const intBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[intBetween(0, arr.length - 1)];

  // Equipamentos habilitados (2..4 estáveis).
  const qtdEquip = intBetween(2, 4);
  const equipamentos = EQUIPAMENTOS_POOL.slice(0, qtdEquip);

  // KPIs.
  const horas = intBetween(120, 220);
  const horasTrend = intBetween(-8, 18);
  const osAtivas = intBetween(1, 4);
  const osEmAndamento = Math.max(1, osAtivas - intBetween(0, 1));
  const osConcluidas = intBetween(8, 24);
  const spark = () => Array.from({ length: 8 }, () => intBetween(20, 95));

  const kpis: ShowcaseKpis = {
    horasApontadas: {
      rotulo: "Horas apontadas",
      valor: String(horas),
      icone: "lucide:clock",
      rodape: "vs. mês anterior",
      trendPct: Math.abs(horasTrend),
      trendDir: horasTrend >= 0 ? "up" : "down",
      spark: spark(),
    },
    osAtivas: {
      rotulo: "OS ativas",
      valor: String(osAtivas),
      icone: "lucide:clipboard-list",
      rodape: `${osEmAndamento} em andamento · ${osAtivas - osEmAndamento} aberta(s)`,
      trendPct: null,
      trendDir: null,
      spark: spark(),
    },
    osConcluidas: {
      rotulo: "OS concluídas",
      valor: String(osConcluidas),
      icone: "lucide:circle-check-big",
      rodape: "no mês",
      trendPct: intBetween(1, 5),
      trendDir: "up",
      spark: spark(),
    },
    equipamentos: {
      rotulo: "Equipamentos",
      valor: String(qtdEquip),
      icone: "lucide:truck",
      rodape: "operados no período",
      trendPct: null,
      trendDir: null,
      spark: spark(),
    },
  };

  // Apontamentos recentes (5).
  let horimetro = intBetween(900, 4200);
  const apontamentos: ShowcaseApontamento[] = Array.from({ length: 5 }, (_, i) => {
    const equip = pick(equipamentos);
    const inicial = horimetro;
    const trabalhadas = intBetween(6, 9);
    const final = inicial + trabalhadas;
    horimetro = final;
    const dia = String(9 - i).padStart(2, "0");
    return {
      id: `${id}-ap-${i}`,
      data: `${dia}/07`,
      equipamentoNome: equip.nome,
      equipamentoIcone: equip.icone,
      horimetroInicial: inicial.toLocaleString("pt-BR"),
      horimetroFinal: final.toLocaleString("pt-BR"),
      horas: `${trabalhadas},0 h`,
      osNumero: `OS-0${intBetween(15, 25)}`,
    };
  });

  // Ordens vinculadas (4): 2 em andamento, 1 aberta, 1 fechada.
  const statuses: ShowcaseOrdem["status"][] = ["em_andamento", "em_andamento", "aberta", "fechada"];
  const ordens: ShowcaseOrdem[] = statuses.map((status, i) => ({
    id: `${id}-os-${i}`,
    numero: `OS-0${intBetween(10, 25)}`,
    titulo: pick(OBRAS_POOL),
    clienteNome: pick(CLIENTES_POOL),
    horas: `${intBetween(8, 62)} h`,
    desde: `desde ${String(intBetween(1, 28)).padStart(2, "0")}/0${intBetween(6, 7)}`,
    status,
  }));

  // Horas por semana (8 barras).
  const barras = Array.from({ length: 8 }, (_, i) => ({
    label: `S${i + 1}`,
    pct: intBetween(52, 92),
  }));
  const picoIdx = barras.reduce((maxI, b, i, arr) => (b.pct > arr[maxI].pct ? i : maxI), 0);
  const horasSemana: ShowcaseSemana = {
    barras,
    mediaHoras: `${intBetween(38, 44)} h`,
    picoHoras: `${intBetween(45, 48)} h`,
    picoLabel: barras[picoIdx].label,
  };

  // Cadastrais.
  const anoNasc = intBetween(1975, 1995);
  const cadastrais: ShowcaseCadastrais = {
    cnhCategoria: pick(CNH_CATS),
    cnhValidade: `${String(intBetween(1, 12)).padStart(2, "0")}/${intBetween(2026, 2031)}`,
    nascimento: `${String(intBetween(1, 28)).padStart(2, "0")}/${String(intBetween(1, 12)).padStart(2, "0")}/${anoNasc}`,
    idade: `${2026 - anoNasc} anos`,
    vinculo: "CLT",
    admissao: `mar/${intBetween(2018, 2023)}`,
    base: pick(BASES_POOL),
  };

  // Acesso ao app.
  const acessoApp: ShowcaseAcessoApp = {
    liberado: true,
    ultimoAcesso: `Hoje, 0${intBetween(6, 9)}:${String(intBetween(0, 59)).padStart(2, "0")}`,
    dispositivo: pick(DISPOSITIVOS_POOL),
    versao: "v0.1 · fundação",
    apontaVia: "App de campo",
  };

  return { kpis, apontamentos, ordens, horasSemana, equipamentos, cadastrais, acessoApp };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/operadores/operador-showcase-data.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/features/operadores/operador-showcase-data.ts src/features/operadores/operador-showcase-data.test.ts
git commit -m "feat: add deterministic showcase data for operador detail"
```

---

### Task 2: Componente `Sparkline` reutilizável

SVG puro (polyline), como no mock. Reutilizado pelos KPIs.

**Files:**
- Create: `src/shared/components/sparkline.tsx`
- Test: `src/shared/components/sparkline.test.tsx`

**Interfaces:**
- Consumes: nada.
- Produces: `export function Sparkline(props: { pontos: number[]; className?: string }): JSX.Element`
  - Renderiza um `<svg>` com uma `<polyline>`; `stroke="currentColor"` (cor herda do container, default `text-primary`). `pontos` são valores 0..100.

- [ ] **Step 1: Write the failing test**

Create `src/shared/components/sparkline.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  it("renderiza uma polyline com o número certo de pontos", () => {
    const { container } = render(<Sparkline pontos={[10, 40, 20, 80]} />);
    const poly = container.querySelector("polyline");
    expect(poly).not.toBeNull();
    const pts = poly?.getAttribute("points") ?? "";
    // 4 pares "x,y" separados por espaço.
    expect(pts.trim().split(/\s+/)).toHaveLength(4);
  });

  it("não quebra com lista vazia", () => {
    const { container } = render(<Sparkline pontos={[]} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/components/sparkline.test.tsx`
Expected: FAIL — não resolve `./sparkline`.

- [ ] **Step 3: Write the implementation**

Create `src/shared/components/sparkline.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface SparklineProps {
  pontos: number[];
  className?: string;
}

const W = 64;
const H = 26;

// Sparkline em SVG puro (fiel ao mock). Valores em 0..100; mapeados para a
// altura do viewBox. Cor via `currentColor` — o container define text-primary.
export function Sparkline({ pontos, className }: SparklineProps) {
  const coords =
    pontos.length > 1
      ? pontos
          .map((v, i) => {
            const x = (i / (pontos.length - 1)) * W;
            const y = H - (Math.max(0, Math.min(100, v)) / 100) * H;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : pontos.length === 1
        ? `0,${(H - (pontos[0] / 100) * H).toFixed(1)} ${W},${(H - (pontos[0] / 100) * H).toFixed(1)}`
        : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden
      className={cn("text-primary/90", className)}
    >
      {coords ? (
        <polyline
          points={coords}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/components/sparkline.test.tsx`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/sparkline.tsx src/shared/components/sparkline.test.tsx
git commit -m "feat: add reusable Sparkline component"
```

---

### Task 3: Hero + nova casca do `operador-detalhe.tsx`

Substitui o `PageHeader` por um hero rico e estabelece a nova estrutura vertical (back link → hero → placeholders das próximas seções). Preserva loading/error/not-found e a edição inline (`OperadorForm`) e o `ConfirmDialog` de inativar.

**Files:**
- Create: `src/features/operadores/components/operador-hero.tsx`
- Modify: `src/features/operadores/components/operador-detalhe.tsx` (reescrita da árvore de render; mantém hooks/handlers)

**Interfaces:**
- Consumes: `Operador` (`@/shared/types`); `formatDocumento`, `formatTelefone`, `formatDataHora` (`@/shared/lib/format`); `showcaseDoOperador` (Task 1).
- Produces:
  - `export function OperadorHero(props: OperadorHeroProps): JSX.Element`
  - `export interface OperadorHeroProps { operador: Operador; ultimaAtividade: string; onEditar: () => void; onInativar: () => void; onReativar: () => void }`
  - Helper local `iniciais(nome: string): string` (dentro do hero).

- [ ] **Step 1: Create the hero component**

Create `src/features/operadores/components/operador-hero.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { formatDataHora, formatDocumento, formatTelefone } from "@/shared/lib/format";
import type { Operador } from "@/shared/types";

export interface OperadorHeroProps {
  operador: Operador;
  ultimaAtividade: string;
  onEditar: () => void;
  onInativar: () => void;
  onReativar: () => void;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "?";
}

function whatsappHref(telefone: string | null): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/55${digitos}`;
}

export function OperadorHero({
  operador,
  ultimaAtividade,
  onEditar,
  onInativar,
  onReativar,
}: OperadorHeroProps) {
  const wa = whatsappHref(operador.telefone);

  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-card to-surface p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          aria-hidden
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover font-display text-3xl font-extrabold text-primary-foreground shadow-lg"
        >
          {iniciais(operador.nome)}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-foreground sm:text-3xl">
            {operador.nome}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={
                operador.ativo
                  ? "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground"
                  : "inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground-faint"
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {operador.ativo ? "Ativo" : "Inativo"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Icon icon="lucide:hard-hat" className="h-3.5 w-3.5" />
              Operador
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-steel/40 bg-steel/15 px-2.5 py-1 text-xs font-semibold text-foreground">
              <Icon icon="lucide:smartphone" className="h-3.5 w-3.5" />
              Acesso ao app
            </span>
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <Quickfact rotulo="CPF" valor={formatDocumento(operador.cpf)} mono />
            <Quickfact rotulo="Telefone" valor={formatTelefone(operador.telefone)} mono />
            <Quickfact rotulo="Operador desde" valor={formatDataHora(operador.created_at)} />
            <Quickfact rotulo="Última atividade" valor={ultimaAtividade} />
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={onEditar} className="gap-1.5">
            <Icon icon="lucide:pencil" className="h-4 w-4" />
            Editar
          </Button>
          {wa ? (
            <Button asChild variant="outline" className="gap-1.5">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <Icon icon="lucide:message-circle" className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          ) : null}
          {operador.ativo ? (
            <Button
              variant="outline"
              onClick={onInativar}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Icon icon="lucide:ban" className="h-4 w-4" />
              Inativar
            </Button>
          ) : (
            <Button variant="outline" onClick={onReativar} className="gap-1.5">
              <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
              Reativar
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Quickfact({ rotulo, valor, mono }: { rotulo: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </dt>
      <dd className={mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
        {valor}
      </dd>
    </div>
  );
}
```

- [ ] **Step 2: Verify Button `asChild` exists (guard against wrong assumption)**

Run: `grep -n "asChild" src/components/ui/button.tsx`
Expected: uma linha com `asChild` (shadcn Button suporta `asChild` via Slot). Se NÃO aparecer, trocar o bloco `<Button asChild>...<a>...</a></Button>` por um `<a>` estilizado com as mesmas classes do botão outline; mas o padrão shadcn inclui `asChild`.

- [ ] **Step 3: Rewrite `operador-detalhe.tsx` to use the hero + section placeholders**

Replace the entire content of `src/features/operadores/components/operador-detalhe.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import { OperadorHero } from "@/features/operadores/components/operador-hero";
import { showcaseDoOperador } from "@/features/operadores/operador-showcase-data";

export function OperadorDetalhe({ operadorId }: { operadorId: string }) {
  const operador = operadoresStore.useOperador(operadorId);
  const { isLoading, error } = operadoresStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  const showcase = useMemo(() => showcaseDoOperador(operadorId), [operadorId]);

  const voltar = (
    <Link
      to="/admin/operadores"
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Operadores
    </Link>
  );

  if (isLoading) {
    return (
      <div>
        {voltar}
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {voltar}
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
        >
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={operadoresStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!operador) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">Operador não encontrado</h2>
        <Link
          to="/admin/operadores"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Voltar para Operadores
        </Link>
      </div>
    );
  }

  const reativar = async () => {
    try {
      await operadoresStore.setAtivo(operador.id, true);
      toast.success("Operador reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const confirmarInativar = async () => {
    try {
      await operadoresStore.setAtivo(operador.id, false);
      toast.success("Operador inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(false);
  };

  return (
    <div>
      {voltar}

      {editando ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Editar dados básicos
          </h3>
          <OperadorForm
            inicial={operador}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </section>
      ) : (
        <div className="space-y-4">
          <OperadorHero
            operador={operador}
            ultimaAtividade={showcase.acessoApp.ultimoAcesso}
            onEditar={() => setEditando(true)}
            onInativar={() => setInativando(true)}
            onReativar={reativar}
          />
          {/* Seções seguintes entram nas próximas tasks:
              KPIs, grid (apontamentos/OS + cadastrais/horas/equipamentos/app), nota rodapé. */}
        </div>
      )}

      <ConfirmDialog
        open={inativando}
        onOpenChange={setInativando}
        titulo="Inativar operador?"
        descricao={`"${operador.nome}" não poderá ser atribuído a novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros. (O import antigo de `PageHeader`/`StatusAtivo`/`ordensStore`/`StatusOSBadge`/`formatDataHora` foi removido; se `tsc` reclamar de import não usado em outro arquivo, corrigir só ali.)

- [ ] **Step 5: Commit**

```bash
git add src/features/operadores/components/operador-hero.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: replace operador detail header with rich hero"
```

---

### Task 4: Faixa de KPIs

**Files:**
- Create: `src/features/operadores/components/operador-kpis.tsx`
- Modify: `src/features/operadores/components/operador-detalhe.tsx` (inserir `<OperadorKpis>` após o hero)

**Interfaces:**
- Consumes: `ShowcaseKpis`, `ShowcaseKpiItem` (Task 1); `Sparkline` (Task 2).
- Produces: `export function OperadorKpis(props: { kpis: ShowcaseKpis }): JSX.Element`

Nota de arquitetura: KPI card é **local desta página** (valor grande em Archivo + sparkline posicionado), para não acoplar o `KpiCard` do dashboard (mono, sem sparkline) a este visual distinto. Mesma família visual, responsabilidades separadas.

- [ ] **Step 1: Create the component**

Create `src/features/operadores/components/operador-kpis.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import type { ShowcaseKpiItem, ShowcaseKpis } from "@/features/operadores/operador-showcase-data";

export function OperadorKpis({ kpis }: { kpis: ShowcaseKpis }) {
  const itens: ShowcaseKpiItem[] = [
    kpis.horasApontadas,
    kpis.osAtivas,
    kpis.osConcluidas,
    kpis.equipamentos,
  ];
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {itens.map((kpi) => (
        <KpiCard key={kpi.rotulo} kpi={kpi} />
      ))}
    </section>
  );
}

function KpiCard({ kpi }: { kpi: ShowcaseKpiItem }) {
  const ehHoras = kpi.rotulo === "Horas apontadas";
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {kpi.rotulo}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary">
          <Icon icon={kpi.icone} className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 font-display text-3xl font-bold text-foreground">
        {kpi.valor}
        {ehHoras ? <span className="ml-0.5 text-base font-semibold text-muted-foreground">h</span> : null}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {kpi.trendDir ? (
          <span
            className={
              kpi.trendDir === "up"
                ? "inline-flex items-center gap-0.5 font-semibold text-primary"
                : "inline-flex items-center gap-0.5 font-semibold text-destructive"
            }
          >
            <Icon
              icon={kpi.trendDir === "up" ? "lucide:trending-up" : "lucide:trending-down"}
              className="h-3 w-3"
            />
            {kpi.trendPct}%
          </span>
        ) : null}
        <span>{kpi.rodape}</span>
      </div>

      <Sparkline pontos={kpi.spark} className="absolute bottom-3.5 right-3.5 h-6 w-16" />
    </div>
  );
}
```

- [ ] **Step 2: Wire into `operador-detalhe.tsx`**

In `src/features/operadores/components/operador-detalhe.tsx`, add the import near the other feature imports:

```tsx
import { OperadorKpis } from "@/features/operadores/components/operador-kpis";
```

Replace the comment block `{/* Seções seguintes entram nas próximas tasks: ... */}` with:

```tsx
          <OperadorKpis kpis={showcase.kpis} />
          {/* Grid (apontamentos/OS + cadastrais/horas/equipamentos/app) e nota — próximas tasks. */}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/features/operadores/components/operador-kpis.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add KPI strip to operador detail"
```

---

### Task 5: Card "Apontamentos recentes" (tabela)

**Files:**
- Create: `src/features/operadores/components/apontamentos-recentes-card.tsx`
- Modify: `operador-detalhe.tsx` (montar o grid de 2 colunas e inserir este card na coluna esquerda)

**Interfaces:**
- Consumes: `ShowcaseApontamento[]` (Task 1); shadcn `Table*` (`@/components/ui/table`).
- Produces: `export function ApontamentosRecentesCard(props: { apontamentos: ShowcaseApontamento[] }): JSX.Element`
- Produces (compartilhado): helpers de casca de card. Para evitar duplicação, criar também `card-secao.tsx` (abaixo) e reusá-lo nas Tasks 5–10.

- [ ] **Step 1: Create a shared section-card shell**

Create `src/features/operadores/components/card-secao.tsx`:

```tsx
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface CardSecaoProps {
  titulo: string;
  icone: string;
  acessorio?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

// Casca padrão dos cards de atividade do detalhe do operador (header com ícone
// + título + acessório à direita). Mantém o ritmo visual consistente entre cards.
export function CardSecao({
  titulo,
  icone,
  acessorio,
  children,
  className,
  bodyClassName,
}: CardSecaoProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-primary">
          <Icon icon={icone} className="h-4 w-4" />
        </span>
        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider text-foreground">
          {titulo}
        </h3>
        {acessorio ? <div className="ml-auto">{acessorio}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function CardPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Create the apontamentos card**

Create `src/features/operadores/components/apontamentos-recentes-card.tsx`:

```tsx
import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseApontamento } from "@/features/operadores/operador-showcase-data";

export function ApontamentosRecentesCard({
  apontamentos,
}: {
  apontamentos: ShowcaseApontamento[];
}) {
  return (
    <CardSecao titulo="Apontamentos recentes" icone="lucide:timer">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Equipamento</TableHead>
            <TableHead>Horímetro</TableHead>
            <TableHead className="text-right">Horas</TableHead>
            <TableHead className="text-right">OS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apontamentos.map((ap) => (
            <TableRow key={ap.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{ap.data}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-primary">
                    <Icon icon={ap.equipamentoIcone} className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-foreground">{ap.equipamentoNome}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <b className="text-foreground">{ap.horimetroInicial}</b> →{" "}
                <b className="text-foreground">{ap.horimetroFinal}</b>
              </TableCell>
              <TableCell className="text-right font-semibold">{ap.horas}</TableCell>
              <TableCell className="text-right">
                <span className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
                  {ap.osNumero}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardSecao>
  );
}
```

- [ ] **Step 3: Build the grid in `operador-detalhe.tsx` and place the card**

In `src/features/operadores/components/operador-detalhe.tsx`, add imports:

```tsx
import { ApontamentosRecentesCard } from "@/features/operadores/components/apontamentos-recentes-card";
```

Replace the comment `{/* Grid (apontamentos/OS + cadastrais/horas/equipamentos/app) e nota — próximas tasks. */}` with:

```tsx
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <ApontamentosRecentesCard apontamentos={showcase.apontamentos} />
              {/* OS vinculadas — próxima task */}
            </div>
            <div className="space-y-4">
              {/* Cadastrais, horas/semana, equipamentos, app — próximas tasks */}
            </div>
          </div>
          {/* Nota rodapé — task final */}
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/features/operadores/components/card-secao.tsx src/features/operadores/components/apontamentos-recentes-card.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add recent apontamentos table to operador detail"
```

---

### Task 6: Card "Ordens de Serviço" (lista)

**Files:**
- Create: `src/features/operadores/components/ordens-vinculadas-card.tsx`
- Modify: `operador-detalhe.tsx` (coluna esquerda, abaixo dos apontamentos)

**Interfaces:**
- Consumes: `ShowcaseOrdem[]` (Task 1); `CardSecao`, `CardPill` (Task 5); `StatusOSBadge` (`@/features/ordem-servico/labels`).
- Produces: `export function OrdensVinculadasCard(props: { ordens: ShowcaseOrdem[] }): JSX.Element`

- [ ] **Step 1: Create the component**

Create `src/features/operadores/components/ordens-vinculadas-card.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { CardPill, CardSecao } from "@/features/operadores/components/card-secao";
import { StatusOSBadge } from "@/features/ordem-servico/labels";
import type { ShowcaseOrdem } from "@/features/operadores/operador-showcase-data";

export function OrdensVinculadasCard({ ordens }: { ordens: ShowcaseOrdem[] }) {
  return (
    <CardSecao
      titulo="Ordens de Serviço"
      icone="lucide:clipboard-list"
      acessorio={<CardPill>{ordens.length} vinculadas</CardPill>}
      bodyClassName="p-2"
    >
      <ul>
        {ordens.map((os) => (
          <li
            key={os.id}
            className="flex items-center gap-3.5 rounded-lg px-3 py-3 not-first:border-t not-first:border-border-soft hover:bg-surface/50"
          >
            <span className="w-16 shrink-0 font-mono text-[13px] font-bold text-foreground">
              {os.numero}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{os.titulo}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground-faint">
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:user" className="h-3 w-3" />
                  {os.clienteNome}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:clock" className="h-3 w-3" />
                  {os.horas}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:calendar" className="h-3 w-3" />
                  {os.desde}
                </span>
              </div>
            </div>
            <StatusOSBadge status={os.status} className="shrink-0" />
          </li>
        ))}
      </ul>
    </CardSecao>
  );
}
```

- [ ] **Step 2: Verify the `not-first`/`border-border-soft` utilities resolve (guard)**

Run: `grep -nE "border-soft|not-first" src/styles.css`
Expected: se `--color-border-soft` NÃO existir, trocar `not-first:border-border-soft` por `not-first:border-border`. Se a variante `not-first:` não estiver disponível na config do Tailwind v4 do projeto, usar `[&:not(:first-child)]:border-t [&:not(:first-child)]:border-border`. Ajustar a classe no componente conforme o que existir.

- [ ] **Step 3: Wire into `operador-detalhe.tsx`**

Add import:

```tsx
import { OrdensVinculadasCard } from "@/features/operadores/components/ordens-vinculadas-card";
```

Replace `{/* OS vinculadas — próxima task */}` with:

```tsx
              <OrdensVinculadasCard ordens={showcase.ordens} />
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/features/operadores/components/ordens-vinculadas-card.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add linked service orders list to operador detail"
```

---

### Task 7: Card "Dados cadastrais"

**Files:**
- Create: `src/features/operadores/components/dados-cadastrais-card.tsx`
- Modify: `operador-detalhe.tsx` (coluna direita, topo)

**Interfaces:**
- Consumes: `ShowcaseCadastrais` (Task 1); `Operador` (para telefone real); `formatTelefone`; `CardSecao` (Task 5).
- Produces: `export function DadosCadastraisCard(props: { cadastrais: ShowcaseCadastrais; telefone: string | null }): JSX.Element`

- [ ] **Step 1: Create the component**

Create `src/features/operadores/components/dados-cadastrais-card.tsx`:

```tsx
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseCadastrais } from "@/features/operadores/operador-showcase-data";

export function DadosCadastraisCard({
  cadastrais,
  telefone,
}: {
  cadastrais: ShowcaseCadastrais;
  telefone: string | null;
}) {
  return (
    <CardSecao titulo="Dados cadastrais" icone="lucide:contact" bodyClassName="px-4 py-1.5">
      <Drow icone="lucide:id-card" rotulo="CNH">
        Categoria {cadastrais.cnhCategoria} · <small className="text-muted-foreground">válida até {cadastrais.cnhValidade}</small>
      </Drow>
      <Drow icone="lucide:cake" rotulo="Nascimento">
        <span className="font-mono">{cadastrais.nascimento}</span> ·{" "}
        <small className="text-muted-foreground">{cadastrais.idade}</small>
      </Drow>
      <Drow icone="lucide:briefcase" rotulo="Vínculo">
        {cadastrais.vinculo} · <small className="text-muted-foreground">admissão {cadastrais.admissao}</small>
      </Drow>
      <Drow icone="lucide:phone" rotulo="Telefone">
        <span className="font-mono">{formatTelefone(telefone)}</span>
      </Drow>
      <Drow icone="lucide:map-pin" rotulo="Base">
        {cadastrais.base}
      </Drow>
    </CardSecao>
  );
}

function Drow({ icone, rotulo, children }: { icone: string; rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-soft py-3 last:border-b-0">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon icon={icone} className="h-4 w-4" />
      </span>
      <div>
        <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </div>
        <div className="mt-0.5 text-[13.5px] font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Guard `border-border-soft`**

Run: `grep -nE "color-border-soft" src/styles.css`
Expected: se não existir, substituir `border-border-soft` por `border-border` neste arquivo (2 ocorrências).

- [ ] **Step 3: Wire into `operador-detalhe.tsx`**

Add import:

```tsx
import { DadosCadastraisCard } from "@/features/operadores/components/dados-cadastrais-card";
```

Replace `{/* Cadastrais, horas/semana, equipamentos, app — próximas tasks */}` with:

```tsx
              <DadosCadastraisCard cadastrais={showcase.cadastrais} telefone={operador.telefone} />
              {/* Horas/semana, equipamentos, app — próximas tasks */}
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/features/operadores/components/dados-cadastrais-card.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add registration data card to operador detail"
```

---

### Task 8: Card "Horas por semana" (barras CSS)

**Files:**
- Create: `src/features/operadores/components/horas-semana-card.tsx`
- Modify: `operador-detalhe.tsx` (coluna direita)

**Interfaces:**
- Consumes: `ShowcaseSemana` (Task 1); `CardSecao` (Task 5).
- Produces: `export function HorasSemanaCard(props: { semana: ShowcaseSemana }): JSX.Element`

Nota: barras em CSS/flex (fiel ao mock), sem Recharts — série fixa de 8 pontos de exemplo não justifica a lib (YAGNI).

- [ ] **Step 1: Create the component**

Create `src/features/operadores/components/horas-semana-card.tsx`:

```tsx
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseSemana } from "@/features/operadores/operador-showcase-data";

export function HorasSemanaCard({ semana }: { semana: ShowcaseSemana }) {
  const picoPct = Math.max(...semana.barras.map((b) => b.pct));
  return (
    <CardSecao titulo="Horas por semana" icone="lucide:bar-chart-3" bodyClassName="p-4">
      <div className="flex h-24 items-end gap-2">
        {semana.barras.map((b) => (
          <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className={
                b.pct === picoPct
                  ? "w-full max-w-[26px] rounded-t bg-primary"
                  : "w-full max-w-[26px] rounded-t bg-primary/60"
              }
              style={{ height: `${b.pct}%` }}
            />
            <span className="font-mono text-[10px] text-foreground-faint">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex justify-between border-t border-border-soft pt-3 text-xs text-muted-foreground">
        <span>
          Média <b className="text-foreground">{semana.mediaHoras}</b>/semana
        </span>
        <span>
          Pico <b className="text-foreground">{semana.picoHoras}</b> ({semana.picoLabel})
        </span>
      </div>
    </CardSecao>
  );
}
```

- [ ] **Step 2: Guard `border-border-soft`** (same rule as Task 7 — replace with `border-border` if the token is absent).

- [ ] **Step 3: Wire into `operador-detalhe.tsx`**

Add import:

```tsx
import { HorasSemanaCard } from "@/features/operadores/components/horas-semana-card";
```

Replace `{/* Horas/semana, equipamentos, app — próximas tasks */}` with:

```tsx
              <HorasSemanaCard semana={showcase.horasSemana} />
              {/* Equipamentos, app — próximas tasks */}
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/features/operadores/components/horas-semana-card.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add weekly hours bar chart to operador detail"
```

---

### Task 9: Card "Equipamentos habilitados" (chips)

**Files:**
- Create: `src/features/operadores/components/equipamentos-habilitados-card.tsx`
- Modify: `operador-detalhe.tsx` (coluna direita)

**Interfaces:**
- Consumes: `ShowcaseEquip[]` (Task 1); `CardSecao` (Task 5).
- Produces: `export function EquipamentosHabilitadosCard(props: { equipamentos: ShowcaseEquip[] }): JSX.Element`

- [ ] **Step 1: Create the component**

Create `src/features/operadores/components/equipamentos-habilitados-card.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseEquip } from "@/features/operadores/operador-showcase-data";

export function EquipamentosHabilitadosCard({ equipamentos }: { equipamentos: ShowcaseEquip[] }) {
  return (
    <CardSecao titulo="Equipamentos habilitados" icone="lucide:wrench" bodyClassName="flex flex-wrap gap-2 p-4">
      {equipamentos.map((eq) => (
        <span
          key={eq.nome}
          className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm font-medium text-foreground"
        >
          <Icon icon={eq.icone} className="h-4 w-4 text-primary" />
          {eq.nome}
        </span>
      ))}
    </CardSecao>
  );
}
```

- [ ] **Step 2: Wire into `operador-detalhe.tsx`**

Add import:

```tsx
import { EquipamentosHabilitadosCard } from "@/features/operadores/components/equipamentos-habilitados-card";
```

Replace `{/* Equipamentos, app — próximas tasks */}` with:

```tsx
              <EquipamentosHabilitadosCard equipamentos={showcase.equipamentos} />
              {/* App — próxima task */}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/features/operadores/components/equipamentos-habilitados-card.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add authorized equipment chips to operador detail"
```

---

### Task 10: Card "Acesso ao app"

**Files:**
- Create: `src/features/operadores/components/acesso-app-card.tsx`
- Modify: `operador-detalhe.tsx` (coluna direita, fim)

**Interfaces:**
- Consumes: `ShowcaseAcessoApp` (Task 1); `CardSecao` (Task 5).
- Produces: `export function AcessoAppCard(props: { acesso: ShowcaseAcessoApp }): JSX.Element`

- [ ] **Step 1: Create the component**

Create `src/features/operadores/components/acesso-app-card.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseAcessoApp } from "@/features/operadores/operador-showcase-data";

export function AcessoAppCard({ acesso }: { acesso: ShowcaseAcessoApp }) {
  return (
    <CardSecao titulo="Acesso ao app" icone="lucide:smartphone" bodyClassName="p-4">
      <div className="mb-3.5 flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
          <Icon icon="lucide:check" className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">
            {acesso.liberado ? "App liberado" : "App bloqueado"}
          </div>
          <div className="text-[11.5px] text-muted-foreground">Login ativo no dispositivo</div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <AppInfo rotulo="Último acesso" valor={acesso.ultimoAcesso} />
        <AppInfo rotulo="Dispositivo" valor={acesso.dispositivo} />
        <AppInfo rotulo="Versão" valor={acesso.versao} mono />
        <AppInfo rotulo="Aponta via" valor={acesso.apontaVia} />
      </dl>
    </CardSecao>
  );
}

function AppInfo({ rotulo, valor, mono }: { rotulo: string; valor: string; mono?: boolean }) {
  return (
    <div>
      <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </dt>
      <dd className={mono ? "mt-1 font-mono text-[13px] text-foreground" : "mt-1 text-[13px] text-foreground"}>
        {valor}
      </dd>
    </div>
  );
}
```

- [ ] **Step 2: Wire into `operador-detalhe.tsx`, then add the footer note**

Add import:

```tsx
import { AcessoAppCard } from "@/features/operadores/components/acesso-app-card";
```

Replace `{/* App — próxima task */}` with:

```tsx
              <AcessoAppCard acesso={showcase.acessoApp} />
```

Replace `{/* Nota rodapé — task final */}` with:

```tsx
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3 text-[12.5px] text-foreground-faint">
            <Icon icon="lucide:lock" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
            <span>
              Perfil operacional — sem dados financeiros. Custo-hora e valores ficam restritos às
              telas de <b>Custo da Hora</b>, <b>Financeiro</b> e <b>Rentabilidade</b>, conforme o
              particionamento de acesso.
            </span>
          </div>
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/features/operadores/components/acesso-app-card.tsx src/features/operadores/components/operador-detalhe.tsx
git commit -m "feat: add app-access card and footer note to operador detail"
```

---

### Task 11: Verificação final (suíte, typecheck, lint, a11y visual)

**Files:**
- Nenhum arquivo novo. Ajustes pontuais só se algo falhar.

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros.

- [ ] **Step 2: Run the full test suite**

Run: `npx vitest run`
Expected: PASS em todos os arquivos (baseline 481 + 5 novos testes das Tasks 1–2 = 486, salvo contagem exata). Zero falhas.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: sem erros. Se houver import não usado remanescente em `operador-detalhe.tsx` (ex.: algum removido na Task 3), corrigir aqui.

- [ ] **Step 4: Manual visual verification (usuário)**

O dev server já roda em `http://localhost:8081`. Abrir `http://localhost:8081/admin/operadores`, clicar num operador e conferir:
- Hero, KPIs, tabela de apontamentos, lista de OS, dados cadastrais, horas/semana, chips, acesso ao app e nota rodapé aparecem no estilo do mock.
- Alternar tema light/dark (toggle no header): tudo legível, sem hex quebrado, amarelo nunca como texto ilegível sobre claro.
- Larguras 375px / 768px / 1280px: grid colapsa para 1 coluna < 1080px; KPIs 2×2 no mobile; sem scroll horizontal.
- "Editar" abre o form inline e volta; "Inativar/Reativar" funcionam (toast).
- Foco por teclado (Tab) mostra anel visível nos botões e no botão WhatsApp.

> Observação: verificação visual é feita pelo usuário (não delegar a subagente/navegador automatizado).

- [ ] **Step 5: Final commit (se algum ajuste no Step 3)**

```bash
git add -A
git commit -m "chore: lint fixes and final polish for operador detail refactor"
```

---

## Self-Review (feita ao escrever o plano)

**1. Cobertura do spec:**
- Hero (identidade real) → Task 3 ✅
- KPI strip (exemplo, sparkline) → Task 4 ✅
- Apontamentos recentes (tabela) → Task 5 ✅
- Ordens de Serviço (exemplo, como decidido) → Task 6 ✅
- Dados cadastrais (exemplo + telefone real) → Task 7 ✅
- Horas por semana → Task 8 ✅
- Equipamentos habilitados → Task 9 ✅
- Acesso ao app + nota rodapé → Task 10 ✅
- Dados de exemplo isolados e determinísticos → Task 1 ✅
- Light+dark via tokens → embutido em todas (sem hex) ✅
- WhatsApp `wa.me` → Task 3 (hero) ✅
- a11y (status cor+ícone, foco, semântica de tabela, `aria-hidden`) → Tasks 3/5 + verificação Task 11 ✅
- Reuso (`OperadorForm`, `StatusOSBadge`, `ConfirmDialog`) → Tasks 3/6 ✅
- Testes (determinismo do showcase, suíte verde) → Tasks 1/2/11 ✅

**2. Placeholders:** nenhum passo "TBD/TODO"; todo passo de código traz o código completo. Guardas de token (`border-soft`, `not-first`, `asChild`) são passos verificáveis com fallback explícito, não placeholders.

**3. Consistência de tipos:** os nomes exportados por `operador-showcase-data.ts` (Task 1) — `showcaseDoOperador`, `OperadorShowcase`, `ShowcaseKpis`, `ShowcaseApontamento`, `ShowcaseOrdem`, `ShowcaseSemana`, `ShowcaseEquip`, `ShowcaseCadastrais`, `ShowcaseAcessoApp`, `ShowcaseKpiItem` — batem exatamente com os consumidos nas Tasks 4–10. `CardSecao`/`CardPill` (Task 5) reusados nas Tasks 6–10. `Sparkline` (Task 2) consumido na Task 4.

**Decisões de refino documentadas** (desvios conscientes do texto do spec, mesma intenção visual):
- KPI card é local da página (não estende o `KpiCard` do dashboard) para não acoplar o componente compartilhado a um visual distinto.
- Sparkline e barras semanais em SVG/CSS puro (não Recharts) — séries fixas de exemplo, mais simples e fiel ao mock.
