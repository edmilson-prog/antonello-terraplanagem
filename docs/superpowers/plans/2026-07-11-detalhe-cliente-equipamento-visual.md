# Refatoração visual — Detalhe do Equipamento e do Cliente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Elevar `/admin/equipamentos/:id` e `/admin/clientes/:id` das versões simples atuais (header + `<dl>`) para o layout rico dos mocks (tema canteiro: hero, faixa de 4 KPIs, grid de cards de atividade), no mesmo padrão já mergeado do Detalhe do Operador, com abordagem híbrida **real onde existe + exemplo nas lacunas**.

**Architecture:** Cada página tem um componente orquestrador (`equipamento-detalhe.tsx` / `cliente-detalhe.tsx`, reescritos) que compõe subcomponentes de apresentação pequenos e focados. Identidade e campos reais vêm dos stores reais (`equipamentosStore`, `clientesStore`) e de stores de outras features (`precoHoraMaquinaStore`, `planosManutencaoStore`, `registrosManutencaoStore`, `ordensStore`, `orcamentosStore`); o enriquecimento de lacunas vem de um único módulo isolado por página (`equipamento-showcase-data.ts` / `cliente-showcase-data.ts`), determinístico por `id`. `CardSecao`/`CardPill` são promovidos para `src/shared/components/` e reusados pelas três páginas. Estilização 100% via tokens Tailwind (light+dark automáticos).

**Tech Stack:** React 19 + Vite + TS + Tailwind v4 (tokens) + shadcn/ui + Iconify + Vitest.

## Global Constraints

- Apenas tokens Tailwind (`bg-card`, `bg-surface`, `text-primary`, `text-foreground`, `text-foreground-faint`, `border-border`, `text-destructive`, `text-steel`/`border-steel`, `font-display`, `font-mono`…); NUNCA hex hardcoded. Light+dark funcionam automaticamente.
- Sem `any` (usar tipo específico ou `unknown`); optional chaining (`os?.cliente?.nome`), nunca `!`.
- Ícones via Iconify (`@iconify/react`), padrão `lucide:*`.
- Nomenclatura: arquivos de componente kebab-case; componentes PascalCase; funções camelCase (verbos); interfaces PascalCase sem prefixo `I`.
- Status nunca por cor só: sempre cor + ícone/label/led.
- Híbrido real+exemplo: seções com campo/store real consomem o real; showcase só nas lacunas. NUNCA rebaixar dado já real (em especial a banda Farolti `legado_*` do cliente — preservar a condicional de render existente).
- Estados vazios obrigatórios nos cards ligados a store real (equip.: custo-hora sem preço, manutenção sem plano/registro, próxima-manutenção sem plano; cliente: OS/orçamentos/contas a receber vazios; Farolti oculto sem `legado_*`). Cards 100% showcase sempre renderizam.
- **Contas a receber = REAL** via `contasReceberStore` (`src/features/financeiro/contas-receber-store.ts`, hook `.useTodas()`), cruzando o cliente por `idMockDoCliente` (mesmo padrão de OS/orçamentos). Recebíveis derivam das faturas — NÃO rebaixar para showcase. O KPI "Saldo a receber" usa a MESMA fonte (soma das abertas), para não divergir do card.
- Card "Recebimentos" do cliente = financeiro de EXEMPLO (não usa a entidade `Comprovante`) — é o único card financeiro showcase do cliente.
- Financeiro visível a toda a retaguarda; sem guarda nova por sub-perfil.
- Ações primárias do hero: equip. "Registrar manutenção" → `Link` para `/admin/manutencao`; cliente "Novo orçamento" → `Link` para `/admin/orcamentos`. WhatsApp = `wa.me` (só cliente; equipamento não tem telefone → sem WhatsApp).
- Promover `CardSecao`/`CardPill` para `src/shared/components/card-secao.tsx` e atualizar o import do operador (Task 1).
- Módulos showcase determinísticos por `id` (`hashString` FNV-1a + `mulberry32`), com comentário no topo marcando dado de exemplo temporário. Cabeçalho de arquivo `.ts` (não `.tsx`) → generics `<T>` sem vírgula (`const pick = <T>(arr: T[]): T => …`).
- LGPD: nunca logar dado pessoal; CPF fora de qualquer log.
- Preservar estados loading/erro/not-found + edição inline (form) + inativar/reativar (ConfirmDialog + toast) exatamente como no operador/nas versões atuais.
- **Seam mock→real dos equipamentos:** `equipamentosStore` é Supabase (ids UUID); `precos`/`planos`/`registros` de manutenção ainda são mock e referenciam ids mock (`eq-001`). Não há `idMockDoEquipamento` (fora de escopo). Logo, `precoHoraDoEquipamento`/`planosParaEquipamento` casam na prática por `tipo_equipamento`; quando não houver match, os empty states cobrem (comportamento esperado).
- **Comando de tipos:** `npx tsc --noEmit` (o projeto não tem script `typecheck`; `tsconfig.json` já tem `noEmit: true`). Testes: `npx vitest run <arquivo>`.

---

### Task 1: Promover `CardSecao`/`CardPill` para `src/shared/components/`

Move a casca padrão dos cards de atividade para `shared` (as três páginas passam a usar) e atualiza os imports do operador. Comportamento idêntico — sem mudança de API.

**Files:**
- Create: `src/shared/components/card-secao.tsx`
- Delete: `src/features/operadores/components/card-secao.tsx`
- Modify (trocar import `@/features/operadores/components/card-secao` → `@/shared/components/card-secao`):
  - `src/features/operadores/components/apontamentos-recentes-card.tsx`
  - `src/features/operadores/components/ordens-vinculadas-card.tsx`
  - `src/features/operadores/components/dados-cadastrais-card.tsx`
  - `src/features/operadores/components/horas-semana-card.tsx`
  - `src/features/operadores/components/acesso-app-card.tsx`
  - `src/features/operadores/components/equipamentos-habilitados-card.tsx`

**Interfaces:**
- Consumes: nada.
- Produces (idênticas às atuais):
  - `export function CardSecao(props: { titulo: string; icone: string; acessorio?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }): JSX.Element`
  - `export function CardPill(props: { children: ReactNode }): JSX.Element`

- [ ] **Step 1: Criar o arquivo shared com o conteúdo atual**

Crie `src/shared/components/card-secao.tsx` com exatamente o conteúdo hoje em `src/features/operadores/components/card-secao.tsx` (import `cn` de `@/lib/utils`; componentes `CardSecao` e `CardPill`; comentário de topo preservado).

- [ ] **Step 2: Atualizar os 6 imports do operador**

Em cada um dos 6 arquivos listados, troque `from "@/features/operadores/components/card-secao"` por `from "@/shared/components/card-secao"` (mantendo os mesmos símbolos importados: `CardSecao`, `CardPill`).

- [ ] **Step 3: Remover o arquivo antigo**

Delete `src/features/operadores/components/card-secao.tsx`.

- [ ] **Step 4: Verificar tipos e suíte existente**

Run: `npx tsc --noEmit`
Expected: sem erros.
Run: `npx vitest run src/features/operadores`
Expected: PASS (suíte do operador verde — nenhum import quebrado).

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/card-secao.tsx src/features/operadores/components
git commit -m "refactor: promote CardSecao/CardPill to shared components"
```

---

### Task 2: Módulo showcase do equipamento (`equipamento-showcase-data.ts`)

Núcleo lógico do lado do equipamento: gera dados de exemplo determinísticos por `id`. Única peça com lógica real → tem teste de verdade (determinismo + variação + formato). **Não** inclui custo-hora nem manutenções (esses vêm reais).

**Files:**
- Create: `src/features/equipamentos/equipamento-showcase-data.ts`
- Test: `src/features/equipamentos/equipamento-showcase-data.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export interface EquipamentoKpiItem { rotulo: string; valor: string; icone: string; rodape: string; trendPct: number | null; trendDir: "up" | "down" | null; spark: number[] | null }` (`spark: null` → KPI sem sparkline, caso da Receita)
  - `export interface EquipamentoShowcaseKpis { horimetro: EquipamentoKpiItem; horasMes: EquipamentoKpiItem; disponibilidade: EquipamentoKpiItem; receitaMes: EquipamentoKpiItem }`
  - `export interface EquipamentoLeitura { id: string; data: string; operadorNome: string; osNumero: string; horimetroInicial: string; horimetroFinal: string; horas: string }`
  - `export interface EquipamentoFichaTecnica { marcaModelo: string; ano: string; aquisicao: string; descricao: string }`
  - `export interface EquipamentoSemana { barras: { label: string; pct: number }[]; mediaHoras: string; picoHoras: string; picoLabel: string }`
  - `export interface EquipamentoShowcase { kpis: EquipamentoShowcaseKpis; leiturasHorimetro: EquipamentoLeitura[]; fichaTecnica: EquipamentoFichaTecnica; utilizacaoSemana: EquipamentoSemana }`
  - `export function showcaseDoEquipamento(id: string): EquipamentoShowcase`

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/features/equipamentos/equipamento-showcase-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { showcaseDoEquipamento } from "./equipamento-showcase-data";

describe("showcaseDoEquipamento", () => {
  it("é determinístico: mesmo id → mesmo resultado", () => {
    expect(showcaseDoEquipamento("eq-123")).toEqual(showcaseDoEquipamento("eq-123"));
  });

  it("varia entre ids diferentes", () => {
    const a = showcaseDoEquipamento("eq-aaa");
    const b = showcaseDoEquipamento("eq-bbb");
    expect(a.kpis.horasMes.valor).not.toEqual(b.kpis.horasMes.valor);
  });

  it("produz o formato esperado", () => {
    const s = showcaseDoEquipamento("eq-xyz");
    expect(s.leiturasHorimetro.length).toBeGreaterThanOrEqual(3);
    expect(s.utilizacaoSemana.barras).toHaveLength(8);
    expect(s.kpis.receitaMes.spark).toBeNull();
    expect(["up", "down", null]).toContain(s.kpis.horasMes.trendDir);
    expect(typeof s.fichaTecnica.marcaModelo).toBe("string");
    expect(typeof s.fichaTecnica.ano).toBe("string");
    for (const barra of s.utilizacaoSemana.barras) {
      expect(barra.pct).toBeGreaterThanOrEqual(0);
      expect(barra.pct).toBeLessThanOrEqual(100);
    }
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/features/equipamentos/equipamento-showcase-data.test.ts`
Expected: FAIL ("showcaseDoEquipamento is not a function" / módulo inexistente).

- [ ] **Step 3: Implementar o módulo**

Crie `src/features/equipamentos/equipamento-showcase-data.ts`. Reaproveite os helpers `hashString` (FNV-1a) e `mulberry32` idênticos aos de `operador-showcase-data.ts` (copiar as duas funções). Comentário de topo marcando dado de exemplo temporário. Implementação:

```ts
// DADOS DE EXEMPLO — TEMPORÁRIO.
// Enquanto leituras de horímetro, KPIs de horas/disponibilidade/receita e ficha
// técnica (marca/modelo/ano/aquisição) do equipamento não têm backing real
// (schema + migração pendentes), esta é a ÚNICA fonte de exemplo da tela de
// detalhe do equipamento. Determinístico por `id`. NÃO inclui custo-hora nem
// manutenções — esses vêm reais (precoHoraMaquinaStore / stores de manutenção).
// Quando os dados reais existirem, trocar por queries SEM mexer nos componentes.

export interface EquipamentoKpiItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[] | null;
}

export interface EquipamentoShowcaseKpis {
  horimetro: EquipamentoKpiItem;
  horasMes: EquipamentoKpiItem;
  disponibilidade: EquipamentoKpiItem;
  receitaMes: EquipamentoKpiItem;
}

export interface EquipamentoLeitura {
  id: string;
  data: string;
  operadorNome: string;
  osNumero: string;
  horimetroInicial: string;
  horimetroFinal: string;
  horas: string;
}

export interface EquipamentoFichaTecnica {
  marcaModelo: string;
  ano: string;
  aquisicao: string;
  descricao: string;
}

export interface EquipamentoSemana {
  barras: { label: string; pct: number }[];
  mediaHoras: string;
  picoHoras: string;
  picoLabel: string;
}

export interface EquipamentoShowcase {
  kpis: EquipamentoShowcaseKpis;
  leiturasHorimetro: EquipamentoLeitura[];
  fichaTecnica: EquipamentoFichaTecnica;
  utilizacaoSemana: EquipamentoSemana;
}

const OPERADORES_POOL = ["João Vitor", "Marcos Silva", "Anderson Reis", "Cleiton Souza"];
const MARCAS_POOL = [
  "Caterpillar 320D",
  "Komatsu PC200",
  "Volvo EC210",
  "JCB 3CX",
  "New Holland D150",
];
const AQUISICAO_POOL = [
  "FINAME/BNDES · 48x",
  "FINAME/BNDES · 60x",
  "Recursos próprios",
  "Leasing · 36x",
];

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

export function showcaseDoEquipamento(id: string): EquipamentoShowcase {
  const rand = mulberry32(hashString(id));
  const intBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[intBetween(0, arr.length - 1)];
  const spark = () => Array.from({ length: 8 }, () => intBetween(20, 95));

  const horasMes = intBetween(120, 220);
  const horasTrend = intBetween(-6, 14);
  const disponibilidade = intBetween(85, 98);
  const receita = intBetween(22, 52) * 1000;

  const kpis: EquipamentoShowcaseKpis = {
    horimetro: {
      rotulo: "Horímetro atual",
      valor: "", // sobrescrito no orquestrador com formatHorimetro(equipamento.horimetro_atual)
      icone: "lucide:gauge",
      rodape: `+${intBetween(120, 210)} h no mês`,
      trendPct: null,
      trendDir: null,
      spark: spark(),
    },
    horasMes: {
      rotulo: "Horas no mês",
      valor: `${horasMes} h`,
      icone: "lucide:clock",
      rodape: "vs. mês anterior",
      trendPct: Math.abs(horasTrend),
      trendDir: horasTrend >= 0 ? "up" : "down",
      spark: spark(),
    },
    disponibilidade: {
      rotulo: "Disponibilidade",
      valor: `${disponibilidade}%`,
      icone: "lucide:activity",
      rodape: "no período",
      trendPct: intBetween(1, 4),
      trendDir: "up",
      spark: spark(),
    },
    receitaMes: {
      rotulo: "Receita no mês",
      valor: receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
      icone: "lucide:banknote",
      rodape: "faturamento estimado",
      trendPct: intBetween(3, 12),
      trendDir: "up",
      spark: null,
    },
  };

  let horimetro = intBetween(900, 8000);
  const leiturasHorimetro: EquipamentoLeitura[] = Array.from({ length: 5 }, (_, i) => {
    const inicial = horimetro;
    const trabalhadas = intBetween(6, 9);
    const final = inicial + trabalhadas;
    horimetro = final;
    return {
      id: `${id}-lh-${i}`,
      data: `${String(9 - i).padStart(2, "0")}/07`,
      operadorNome: pick(OPERADORES_POOL),
      osNumero: `OS-0${intBetween(15, 25)}`,
      horimetroInicial: inicial.toLocaleString("pt-BR"),
      horimetroFinal: final.toLocaleString("pt-BR"),
      horas: `${trabalhadas},0 h`,
    };
  });

  const fichaTecnica: EquipamentoFichaTecnica = {
    marcaModelo: pick(MARCAS_POOL),
    ano: String(intBetween(2015, 2023)),
    aquisicao: pick(AQUISICAO_POOL),
    descricao: "Uso geral em terraplenagem",
  };

  const barras = Array.from({ length: 8 }, (_, i) => ({ label: `S${i + 1}`, pct: intBetween(50, 92) }));
  const picoIdx = barras.reduce((maxI, b, i, arr) => (b.pct > arr[maxI].pct ? i : maxI), 0);
  const utilizacaoSemana: EquipamentoSemana = {
    barras,
    mediaHoras: `${intBetween(36, 44)} h`,
    picoHoras: `${intBetween(45, 50)} h`,
    picoLabel: barras[picoIdx].label,
  };

  return { kpis, leiturasHorimetro, fichaTecnica, utilizacaoSemana };
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/features/equipamentos/equipamento-showcase-data.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/features/equipamentos/equipamento-showcase-data.ts src/features/equipamentos/equipamento-showcase-data.test.ts
git commit -m "feat: add deterministic showcase data for equipment detail"
```

---

### Task 3: `equipamento-hero.tsx`

Espelha `src/features/operadores/components/operador-hero.tsx` (mesma casca: `<section>` com blur decorativo, avatar, h1, badges, `<dl>` de quickfacts, coluna de ações), adaptado ao equipamento. **Sem WhatsApp.**

**Files:**
- Create: `src/features/equipamentos/components/equipamento-hero.tsx`

**Interfaces:**
- Consumes: `Equipamento` de `@/shared/types`; `EquipamentoStatusBadge`, `InativoBadge`, `TIPO_LABEL` de `@/features/equipamentos/labels`; `formatHorimetro`, `formatDataHora` de `@/shared/lib/format`; `Button` de `@/components/ui/button`; `Link` de `@tanstack/react-router`; `Icon` de `@iconify/react`.
- Produces: `export function EquipamentoHero(props: EquipamentoHeroProps): JSX.Element` com
  `export interface EquipamentoHeroProps { equipamento: Equipamento; marcaModelo: string; ano: string; onEditar: () => void; onInativar: () => void; onReativar: () => void }`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie a estrutura do `operador-hero.tsx` e aplique estas adaptações precisas:
- **Props:** trocar `operador`/`ultimaAtividade` por `equipamento`, `marcaModelo`, `ano` (drop `whatsappHref` inteiro — equipamento não tem telefone).
- **Avatar:** manter o mesmo box `h-[72px] w-[72px]` gradiente, mas em vez de iniciais renderizar `<Icon icon="lucide:truck" className="h-9 w-9" aria-hidden />`.
- **h1:** `{equipamento.nome}`.
- **Badges (3), na ordem:** (1) se `equipamento.ativo` → `<EquipamentoStatusBadge status={equipamento.status} />`, senão `<InativoBadge />`; (2) badge tipo: `<span class="…border bg-surface…"><Icon icon="lucide:tag" …/> {TIPO_LABEL[equipamento.tipo]}</span>`; (3) badge capacidade: `<span class="…border border-steel/40 bg-steel/15…"><Icon icon="lucide:weight" …/> {equipamento.capacidade}</span>`. Reutilizar as classes de badge do operador-hero.
- **Quickfacts (`<dl>`, 4), reusando o subcomponente `Quickfact` copiado do operador-hero:**
  - `Quickfact rotulo="Horímetro atual" valor={formatHorimetro(equipamento.horimetro_atual)} mono`
  - `Quickfact rotulo="Marca/Modelo" valor={marcaModelo}`
  - `Quickfact rotulo="Ano" valor={ano} mono`
  - `Quickfact rotulo="Na frota desde" valor={formatDataHora(equipamento.created_at)}`
  - Abaixo do `identificador` (placa): se `equipamento.identificador`, mostrar como sub-id mono logo abaixo do h1: `<p className="mt-1 font-mono text-xs text-foreground-faint">{equipamento.identificador}</p>`.
- **Ações (coluna à direita), na ordem:**
  - Editar: `<Button variant="outline" onClick={onEditar} className="gap-1.5"><Icon icon="lucide:pencil" …/>Editar</Button>`
  - Registrar manutenção (primária, navega): `<Button asChild className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"><Link to="/admin/manutencao"><Icon icon="lucide:wrench" …/>Registrar manutenção</Link></Button>`
  - Inativar/Reativar: idêntico ao operador-hero (`onInativar` destrutivo quando `ativo`; senão `onReativar`).
- **Sem** bloco WhatsApp.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/equipamento-hero.tsx
git commit -m "feat: add equipment detail hero"
```

---

### Task 4: `equipamento-kpis.tsx`

Espelha `operador-kpis.tsx` (strip grid 2/4 + `KpiCard` interno com sparkline no canto). Adaptações: 4 KPIs do equipamento; o card de **Receita não tem sparkline** (`spark: null`); sem lógica de sufixo "h" (os valores já vêm formatados).

**Files:**
- Create: `src/features/equipamentos/components/equipamento-kpis.tsx`

**Interfaces:**
- Consumes: `EquipamentoShowcaseKpis`, `EquipamentoKpiItem` de `@/features/equipamentos/equipamento-showcase-data`; `Sparkline` de `@/shared/components/sparkline`; `Icon` de `@iconify/react`.
- Produces: `export function EquipamentoKpis(props: { kpis: EquipamentoShowcaseKpis }): JSX.Element`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie a estrutura do `operador-kpis.tsx`. Adaptações:
- `itens = [kpis.horimetro, kpis.horasMes, kpis.disponibilidade, kpis.receitaMes]` (tipo `EquipamentoKpiItem[]`).
- No `KpiCard` interno: remover o `ehHoras`/sufixo "h" — renderizar `{kpi.valor}` direto (mono grande, `font-display text-3xl font-bold`).
- Bloco de trend/rodapé idêntico ao operador (up = `text-primary`, down = `text-destructive`).
- Sparkline condicional: `{kpi.spark ? <Sparkline pontos={kpi.spark} className="absolute bottom-3.5 right-3.5 h-6 w-16" /> : null}`.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/equipamento-kpis.tsx
git commit -m "feat: add equipment detail KPI strip"
```

---

### Task 5: `leituras-horimetro-card.tsx`

Espelha `apontamentos-recentes-card.tsx` (tabela shadcn dentro de `CardSecao`). Showcase puro → sempre renderiza (5 linhas).

**Files:**
- Create: `src/features/equipamentos/components/leituras-horimetro-card.tsx`

**Interfaces:**
- Consumes: `EquipamentoLeitura` de `@/features/equipamentos/equipamento-showcase-data`; `CardSecao` de `@/shared/components/card-secao`; `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` de `@/components/ui/table`; `Icon` de `@iconify/react`.
- Produces: `export function LeiturasHorimetroCard(props: { leituras: EquipamentoLeitura[] }): JSX.Element`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie a estrutura de `apontamentos-recentes-card.tsx`. Adaptações:
- `CardSecao titulo="Leituras de horímetro" icone="lucide:gauge"`.
- Colunas do `<thead>`: `Data` / `Operador` / `OS` / `Horímetro` / `Horas` (a última `text-right`).
- Cada linha (`leituras.map`): Data mono (`l.data`); Operador com mini-avatar de iniciais (span `h-6 w-6 rounded-md bg-surface text-primary` com `<Icon icon="lucide:user" className="h-3.5 w-3.5" />`) + `l.operadorNome`; OS como chip mono `border-primary/25 bg-primary/10 text-primary` com `l.osNumero`; Horímetro mono `{l.horimetroInicial} → {l.horimetroFinal}`; Horas `text-right font-semibold {l.horas}`.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/leituras-horimetro-card.tsx
git commit -m "feat: add equipment horimeter readings card"
```

---

### Task 6: `custo-hora-card.tsx` (REAL — `precoHoraMaquinaStore`)

Card financeiro real. Resolve o `PrecoHoraMaquina` aplicável ao equipamento via `precoHoraDoEquipamento` (ativo por `equipamento_id`, senão por `tipo_equipamento`). Empty state quando não há preço.

**Files:**
- Create: `src/features/equipamentos/components/custo-hora-card.tsx`

**Interfaces:**
- Consumes: `Equipamento` de `@/shared/types`; `precoHoraMaquinaStore` de `@/features/precos/precos-hora-maquina-store` (hook `.useAll(): PrecoHoraMaquina[]`); `precoHoraDoEquipamento(equipamento: Equipamento, precos: PrecoHoraMaquina[]): PrecoHoraMaquina | null` de `@/features/faturamento/calculo`; `formatBRL(reais: number): string` de `@/features/retaguarda/format`; `CardSecao` de `@/shared/components/card-secao`.
- Produces: `export function CustoHoraCard(props: { equipamento: Equipamento }): JSX.Element`

- [ ] **Step 1: Implementar o componente**

```tsx
import { Icon } from "@iconify/react";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoHoraDoEquipamento } from "@/features/faturamento/calculo";
import { formatBRL } from "@/features/retaguarda/format";
import { CardSecao } from "@/shared/components/card-secao";
import type { Equipamento } from "@/shared/types";

export function CustoHoraCard({ equipamento }: { equipamento: Equipamento }) {
  const precos = precoHoraMaquinaStore.useAll();
  const preco = precoHoraDoEquipamento(equipamento, precos);

  return (
    <CardSecao titulo="Custo-hora" icone="lucide:coins" bodyClassName="p-4">
      {preco ? (
        <div className="grid grid-cols-2 gap-3">
          <Celula
            rotulo="Máquina seca"
            valor={formatBRL(preco.valor_hora_seca)}
            legenda="depreciação + manutenção"
          />
          <Celula
            rotulo="Máquina operada"
            valor={formatBRL(preco.valor_hora_operada)}
            legenda="+ operador + diesel"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:tag" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Preço-hora não configurado</p>
        </div>
      )}
    </CardSecao>
  );
}

function Celula({ rotulo, valor, legenda }: { rotulo: string; valor: string; legenda: string }) {
  return (
    <div className="rounded-lg border bg-surface/50 p-3.5">
      <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </div>
      <div className="mt-1 font-mono text-xl font-bold text-foreground">
        {valor}
        <span className="ml-0.5 text-xs font-semibold text-muted-foreground">/h</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{legenda}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/custo-hora-card.tsx
git commit -m "feat: add equipment hourly-cost card with empty state"
```

---

### Task 7: `manutencoes-card.tsx` (REAL — planos + registros + `derivacoes`)

Banner "próxima" + lista de manutenções realizadas, derivadas dos stores reais de manutenção. Empty state quando o equipamento não tem plano aplicável.

**Files:**
- Create: `src/features/equipamentos/components/manutencoes-card.tsx`

**Interfaces:**
- Consumes: `Equipamento` de `@/shared/types`; `planosManutencaoStore` de `@/features/manutencao/planos-manutencao-store` (hook `.useAll(): PlanoManutencao[]`); `registrosManutencaoStore` de `@/features/manutencao/registros-manutencao-store` (hook `.useTodos(): RegistroManutencao[]`); `planosParaEquipamento(equipamento, planos): PlanoManutencao[]`, `statusPlano(plano, equipamento, registros): { status: StatusManutencao; registro: RegistroManutencao } | null` de `@/features/manutencao/derivacoes`; `formatBRL` de `@/features/retaguarda/format`; `formatHorimetro`, `formatData` de `@/shared/lib/format`; `CardSecao`, `CardPill` de `@/shared/components/card-secao`.
- Produces: `export function ManutencoesCard(props: { equipamento: Equipamento }): JSX.Element`

- [ ] **Step 1: Implementar o componente**

Lógica-chave concreta:
- `const planos = planosManutencaoStore.useAll(); const registros = registrosManutencaoStore.useTodos();`
- `const doEquip = planosParaEquipamento(equipamento, planos);`
- Se `doEquip.length === 0` → renderizar `CardSecao titulo="Manutenções" icone="lucide:wrench"` com empty state (`border-dashed`, ícone `lucide:calendar-off`, texto "Sem plano de manutenção").
- Banner "próxima": para cada plano em `doEquip` compute `statusPlano(plano, equipamento, registros)`; filtre os não-nulos; escolha o de menor `registro.horimetro_previsto - equipamento.horimetro_atual` (mais urgente). Se existir, renderize um banner destacado (`rounded-lg border border-primary/25 bg-primary/10 p-3.5`) com: descrição do plano, `Prevista em {formatHorimetro(registro.horimetro_previsto)}`, e um chip de status derivado — mapa `{ em_dia: "Em dia", proxima: "Agendada", vencida: "Vencida" }` com classes: em_dia `border-steel/40 bg-steel/15`, proxima `border-primary/50 bg-primary/20`, vencida `border-destructive/40 bg-destructive/15 text-destructive`.
- `acessorio` do `CardSecao`: `<CardPill>{doEquip.length} plano(s)</CardPill>`.
- Lista de realizadas: `const realizadas = registros.filter((r) => r.equipamento_id === equipamento.id && r.status === "realizada").sort((a, b) => (b.realizada_em ?? "").localeCompare(a.realizada_em ?? ""));`. Para cada, uma linha `<li>` com: descrição do plano (buscar `planos.find((p) => p.id === r.plano_id)?.descricao ?? "Manutenção"`), `formatHorimetro(r.horimetro_realizado ?? 0)`, `formatData(r.realizada_em)`, custo `{r.custo != null ? formatBRL(r.custo) : "—"}` (mono, `text-foreground`), e chip "Concluída" (`border-steel/40 bg-steel/15`). Se `realizadas.length === 0`, mostrar linha discreta "Nenhuma manutenção concluída registrada.".
- Reutilizar o padrão de lista `<ul>` com `not-first:border-t not-first:border-border` como em `ordens-vinculadas-card.tsx`.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/manutencoes-card.tsx
git commit -m "feat: add equipment maintenance card with next-banner and history"
```

---

### Task 8: `proxima-manutencao-card.tsx` (REAL — `derivacoes`)

Health badge + barra de progresso do intervalo do plano mais urgente. Empty quando não há plano.

**Files:**
- Create: `src/features/equipamentos/components/proxima-manutencao-card.tsx`

**Interfaces:**
- Consumes: `Equipamento` de `@/shared/types`; `planosManutencaoStore` (`.useAll()`), `registrosManutencaoStore` (`.useTodos()`); `planosParaEquipamento`, `statusPlano` de `@/features/manutencao/derivacoes`; `formatHorimetro` de `@/shared/lib/format`; `CardSecao` de `@/shared/components/card-secao`.
- Produces: `export function ProximaManutencaoCard(props: { equipamento: Equipamento }): JSX.Element`

- [ ] **Step 1: Implementar o componente**

Lógica-chave concreta:
- Resolver o plano/registro mais urgente igual à Task 7 (menor `horimetro_previsto - horimetro_atual` entre `statusPlano` não-nulos).
- Se nenhum → `CardSecao titulo="Próxima manutenção" icone="lucide:calendar-clock"` com empty state ("Sem plano de manutenção").
- Com plano: seja `previsto = registro.horimetro_previsto`, `intervalo = plano.intervalo_horas`, `atual = equipamento.horimetro_atual`, `base = previsto - intervalo`.
  - `restantes = previsto - atual;`
  - `progressoPct = Math.max(0, Math.min(100, ((atual - base) / intervalo) * 100));`
  - Health badge por `status`: em_dia → label "Saudável" (`border-steel/40 bg-steel/15`), proxima → "Atenção" (`border-primary/50 bg-primary/20`), vencida → "Vencida" (`border-destructive/40 bg-destructive/15 text-destructive`). Sempre led + texto.
  - Regra: `A cada {intervalo} h` (mono).
  - Barra de progresso: trilho `h-2 rounded-full bg-surface`, preenchimento `bg-primary` (ou `bg-destructive` quando vencida) com `style={{ width: `${progressoPct}%` }}`.
  - Texto sob a barra: `faltam {formatHorimetro(Math.max(0, restantes))}` (ou "vencida há …" quando `restantes < 0`).
  - Meta: `Última {formatHorimetro(base)}` / `Prevista {formatHorimetro(previsto)}` (mono, `justify-between`).

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/proxima-manutencao-card.tsx
git commit -m "feat: add equipment next-maintenance health card"
```

---

### Task 9: `ficha-tecnica-card.tsx`

Datalist (mesma linha `Drow` de `dados-cadastrais-card.tsx`): capacidade/placa REAIS + marca-modelo/ano/aquisição/descrição EXEMPLO. Showcase parcial → sempre renderiza.

**Files:**
- Create: `src/features/equipamentos/components/ficha-tecnica-card.tsx`

**Interfaces:**
- Consumes: `Equipamento` de `@/shared/types`; `EquipamentoFichaTecnica` de `@/features/equipamentos/equipamento-showcase-data`; `CardSecao` de `@/shared/components/card-secao`; `Icon` de `@iconify/react`.
- Produces: `export function FichaTecnicaCard(props: { equipamento: Equipamento; ficha: EquipamentoFichaTecnica }): JSX.Element`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie o subcomponente `Drow` de `dados-cadastrais-card.tsx` (linha com ícone quadrado + rótulo + valor). `CardSecao titulo="Ficha técnica" icone="lucide:clipboard-list" bodyClassName="px-4 py-1.5"`. Linhas (ordem):
- `Drow icone="lucide:factory" rotulo="Marca/Modelo"` → `{ficha.marcaModelo}`
- `Drow icone="lucide:calendar" rotulo="Ano"` → `<span className="font-mono">{ficha.ano}</span>`
- `Drow icone="lucide:weight" rotulo="Capacidade"` → `{equipamento.capacidade} · <small className="text-muted-foreground">{ficha.descricao}</small>` (capacidade REAL)
- `Drow icone="lucide:hash" rotulo="Placa / patrimônio"` → `<span className="font-mono">{equipamento.identificador ?? "—"}</span>` (REAL)
- `Drow icone="lucide:landmark" rotulo="Aquisição"` → `{ficha.aquisicao}`

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/ficha-tecnica-card.tsx
git commit -m "feat: add equipment technical-sheet card"
```

---

### Task 10: `utilizacao-semana-card.tsx`

Espelha `horas-semana-card.tsx` (barras CSS/flex + média/pico). Showcase puro → sempre renderiza.

**Files:**
- Create: `src/features/equipamentos/components/utilizacao-semana-card.tsx`

**Interfaces:**
- Consumes: `EquipamentoSemana` de `@/features/equipamentos/equipamento-showcase-data`; `CardSecao` de `@/shared/components/card-secao`.
- Produces: `export function UtilizacaoSemanaCard(props: { semana: EquipamentoSemana }): JSX.Element`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie `horas-semana-card.tsx` 1:1, trocando: prop `semana: EquipamentoSemana`; `CardSecao titulo="Utilização por semana" icone="lucide:bar-chart-3"`. Barras, cálculo de `picoPct`, e rodapé (`Média … / Pico …`) idênticos.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/utilizacao-semana-card.tsx
git commit -m "feat: add equipment weekly-utilization card"
```

---

### Task 11: Reescrever `equipamento-detalhe.tsx` (orquestrador)

Substitui o header + `<dl>` atuais pela composição hero → kpis → grid `[1.6fr_1fr]` → banda-nota. Preserva loading/erro/not-found + edição inline (`EquipamentoForm`) + inativar/reativar (`ConfirmDialog` + toast). Injeta o horímetro real no KPI de horímetro.

**Files:**
- Modify (reescrever): `src/features/equipamentos/components/equipamento-detalhe.tsx`

**Interfaces:**
- Consumes: `equipamentosStore` (`.useEquipamento(id)`, `.useEstado()`, `.setAtivo`, `.retry`); `showcaseDoEquipamento` de `@/features/equipamentos/equipamento-showcase-data`; `formatHorimetro` de `@/shared/lib/format`; todos os componentes das Tasks 3–10; `EquipamentoForm`; `Button`, `Skeleton`, `ConfirmDialog`, `Link`, `Icon`, `toast`.
- Produces: `export function EquipamentoDetalhe(props: { equipamentoId: string }): JSX.Element` (assinatura inalterada — a rota `admin.equipamentos.$equipamentoId.tsx` continua funcionando; o barrel `src/features/equipamentos/index.ts` já exporta).

- [ ] **Step 1: Reescrever o orquestrador**

Estrutura (espelhar `operador-detalhe.tsx`):
- `const equipamento = equipamentosStore.useEquipamento(equipamentoId); const { isLoading, error } = equipamentosStore.useEstado();` + `const [editando, setEditando] = useState(false); const [inativando, setInativando] = useState(false);`
- `const showcase = useMemo(() => showcaseDoEquipamento(equipamentoId), [equipamentoId]);`
- Back-link "Equipamentos" (`Link to="/admin/equipamentos"`), blocos `isLoading` (Skeletons), `error` (alerta + `equipamentosStore.retry`) e `!equipamento` (não encontrado) — copiar do atual `equipamento-detalhe.tsx` (já existem e estão corretos), removendo o `PageHeader`.
- `reativar`/`confirmarInativar` via `equipamentosStore.setAtivo` + toasts (já existem no arquivo atual — preservar).
- Bloco `editando ?` → `<section>` com `<EquipamentoForm inicial={equipamento} onSuccess={() => setEditando(false)} onCancel={() => setEditando(false)} />` (preservar).
- Bloco principal (não editando):
  ```tsx
  const kpis = {
    ...showcase.kpis,
    horimetro: { ...showcase.kpis.horimetro, valor: formatHorimetro(equipamento.horimetro_atual) },
  };
  ```
  ```tsx
  <div className="space-y-4">
    <EquipamentoHero
      equipamento={equipamento}
      marcaModelo={showcase.fichaTecnica.marcaModelo}
      ano={showcase.fichaTecnica.ano}
      onEditar={() => setEditando(true)}
      onInativar={() => setInativando(true)}
      onReativar={reativar}
    />
    <EquipamentoKpis kpis={kpis} />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <LeiturasHorimetroCard leituras={showcase.leiturasHorimetro} />
        <ManutencoesCard equipamento={equipamento} />
      </div>
      <div className="space-y-4">
        <FichaTecnicaCard equipamento={equipamento} ficha={showcase.fichaTecnica} />
        <CustoHoraCard equipamento={equipamento} />
        <ProximaManutencaoCard equipamento={equipamento} />
        <UtilizacaoSemanaCard semana={showcase.utilizacaoSemana} />
      </div>
    </div>
    {/* banda-nota rodapé (INVERTIDA vs operador: justifica o financeiro) */}
    <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3 text-[12.5px] text-foreground-faint">
      <Icon icon="lucide:building-2" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
      <span>
        Custo-hora, receita e custos de manutenção aparecem por ser a <b>retaguarda</b>. No app
        de campo o equipamento nunca exibe valores.
      </span>
    </div>
  </div>
  ```
- `ConfirmDialog` de inativar (preservar do atual).

- [ ] **Step 2: Verificar tipos e suíte**

Run: `npx tsc --noEmit`
Expected: sem erros.
Run: `npx vitest run src/features/equipamentos`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/components/equipamento-detalhe.tsx
git commit -m "feat: rebuild equipment detail page with hero, KPIs and activity grid"
```

---

### Task 12: Módulo showcase do cliente (`cliente-showcase-data.ts`)

Núcleo lógico do lado do cliente: dados de exemplo determinísticos por `id`. **Não** inclui `legado_*` (vêm reais do `cliente`). Único teste de verdade do lado cliente.

**Files:**
- Create: `src/features/clientes/cliente-showcase-data.ts`
- Test: `src/features/clientes/cliente-showcase-data.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export interface ClienteKpiItem { rotulo: string; valor: string; icone: string; rodape: string; trendPct: number | null; trendDir: "up" | "down" | null; spark: number[] | null; alerta?: boolean }`
  - `export interface ClienteShowcaseKpis { faturado: ClienteKpiItem; saldoReceber: ClienteKpiItem; osAtivasSpark: number[]; orcamentosSpark: number[]; orcamentosValor: string }` (o `saldoReceber.valor`/`.rodape` são placeholders — o orquestrador sobrescreve com os dados REAIS de `contasReceberStore`; `.spark` e `.alerta` permanecem showcase)
  - `export interface ClienteOrdemFinanceiro { horas: string; valor: string }`
  - `export interface ClienteCadastrais { fantasia: string; segmento: string; email: string; endereco: string; contatoNome: string; contatoPapel: string }`
  - `export interface ClienteRecebimento { id: string; titulo: string; quando: string; valor: string; icone: string }`
  - `export interface ClienteShowcase { kpis: ClienteShowcaseKpis; porOS: ClienteOrdemFinanceiro[]; cadastrais: ClienteCadastrais; recebimentos: ClienteRecebimento[]; recorrente: boolean; ultimaOS: string; origemMigracao: string }` (SEM `contasReceber` — agora é real via `contasReceberStore`)
  - `export function showcaseDoCliente(id: string): ClienteShowcase`

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/features/clientes/cliente-showcase-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { showcaseDoCliente } from "./cliente-showcase-data";

describe("showcaseDoCliente", () => {
  it("é determinístico: mesmo id → mesmo resultado", () => {
    expect(showcaseDoCliente("cl-123")).toEqual(showcaseDoCliente("cl-123"));
  });

  it("varia entre ids diferentes", () => {
    const a = showcaseDoCliente("cl-aaa");
    const b = showcaseDoCliente("cl-bbb");
    expect(a.kpis.faturado.valor).not.toEqual(b.kpis.faturado.valor);
  });

  it("produz o formato esperado", () => {
    const s = showcaseDoCliente("cl-xyz");
    expect(s.porOS.length).toBeGreaterThanOrEqual(4);
    expect(s.recebimentos.length).toBeGreaterThanOrEqual(3);
    expect(s.kpis.saldoReceber.alerta).toBe(true);
    expect(s.kpis.saldoReceber.spark).not.toBeNull();
    expect(typeof s.cadastrais.email).toBe("string");
    expect(typeof s.origemMigracao).toBe("string");
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/features/clientes/cliente-showcase-data.test.ts`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar o módulo**

Crie `src/features/clientes/cliente-showcase-data.ts`. Copie `hashString`/`mulberry32` (idênticos). Comentário de topo marcando exemplo temporário e ressaltando que **não** inclui `legado_*`. Formatar valores BRL com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })` (helper local `brl`). Gere:
- `kpis.faturado`: rótulo "Faturado em 2025", valor `brl(intBetween(80, 220) * 1000)`, icone `lucide:wallet`, rodapé "vs. 2024", trend up `intBetween(6, 24)`, spark de 8 pontos `intBetween(20,95)`.
- `kpis.saldoReceber`: rótulo "Saldo a receber", `valor: ""` e `rodape: ""` (placeholders — o orquestrador da Task 21 sobrescreve com a soma real das contas abertas e o rótulo `N título(s) · M vencido(s)`), icone `lucide:alert-circle`, `trendPct: null`, `trendDir: null`, `spark` de 8 pontos `intBetween(20,95)` (showcase — mantém o sparkline do saldo), **`alerta: true`**.
- `osAtivasSpark`/`orcamentosSpark`: arrays de 8 pontos.
- `orcamentosValor`: `${brl(intBetween(40, 140) * 1000)} em propostas`.
- (Contas a receber NÃO são geradas aqui — vêm reais de `contasReceberStore`.)
- `porOS`: 6 pares `{ horas: `${intBetween(8, 62)} h`, valor: brl(intBetween(6, 40) * 1000) }`.
- `cadastrais`: `fantasia` (pool ex.: "Vale Verde", "Serra Azul"), `segmento` (pool: "Construção civil", "Loteamentos", "Agroindústria"), `email` (`contato@exemplo.com.br`), `endereco` (pool de ruas + cidade RS), `contatoNome` (pool), `contatoPapel` (pool: "Engenheiro responsável", "Comprador", "Sócio").
- `recebimentos`: 4 linhas; `titulo` (ex.: `"PIX recebido — NF 1029"`), `quando` (ex.: `"12/06 · 14:32"`), `valor: brl(...)`, `icone` sorteado de `["lucide:smartphone-nfc", "lucide:arrow-left-right", "lucide:barcode"]` (PIX/TED/boleto).
- `recorrente`: `rand() > 0.4`.
- `ultimaOS`: `${String(intBetween(1,28)).padStart(2,"0")}/0${intBetween(1,9)}/2025`.
- `origemMigracao`: `"Migração jun/2024"`.

Use `const pick = <T>(arr: T[]): T => arr[intBetween(0, arr.length - 1)];`.

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/features/clientes/cliente-showcase-data.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/features/clientes/cliente-showcase-data.ts src/features/clientes/cliente-showcase-data.test.ts
git commit -m "feat: add deterministic showcase data for client detail"
```

---

### Task 13: `cliente-hero.tsx`

Espelha `operador-hero.tsx`. Avatar ícone prédio; badges Ativo/PJ-PF/recorrente(ex); quickfacts documento/telefone/cliente-desde/última-OS; ações Editar / WhatsApp(`wa.me`) / Novo orçamento(`Link` /admin/orcamentos) / Inativar-Reativar.

**Files:**
- Create: `src/features/clientes/components/cliente-hero.tsx`

**Interfaces:**
- Consumes: `Cliente` de `@/shared/types`; `StatusAtivo` de `@/shared/components/status-ativo`; `formatDocumento`, `formatTelefone`, `formatDataHora` de `@/shared/lib/format`; `Button`, `Link`, `Icon`.
- Produces: `export function ClienteHero(props: ClienteHeroProps): JSX.Element` com
  `export interface ClienteHeroProps { cliente: Cliente; recorrente: boolean; ultimaOS: string; onEditar: () => void; onInativar: () => void; onReativar: () => void }`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie `operador-hero.tsx` (incluindo `whatsappHref` e o subcomponente `Quickfact`). Adaptações:
- **Props:** `cliente`, `recorrente`, `ultimaOS`.
- **Avatar:** ícone `<Icon icon="lucide:building-2" className="h-9 w-9" aria-hidden />` no mesmo box gradiente.
- **h1:** `{cliente.nome}`.
- **Badges (3):** (1) `<StatusAtivo ativo={cliente.ativo} />`; (2) tipo pessoa: `<span …border bg-surface…><Icon icon="lucide:building" …/>{cliente.tipo_pessoa === "PF" ? "Pessoa física" : "Pessoa jurídica"}</span>` (se `tipo_pessoa` nulo, mostrar "Pessoa jurídica" como padrão — nunca crashar); (3) recorrente (exemplo) — só quando `recorrente`: `<span …border border-primary/40 bg-primary/15…><Icon icon="lucide:repeat" …/>Cliente recorrente</span>`.
- **Quickfacts (4):**
  - `Quickfact rotulo="Documento" valor={formatDocumento(cliente.documento)} mono`
  - `Quickfact rotulo="Telefone" valor={formatTelefone(cliente.telefone)} mono`
  - `Quickfact rotulo="Cliente desde" valor={formatDataHora(cliente.created_at)}`
  - `Quickfact rotulo="Última OS" valor={ultimaOS}`
- **Ações (ordem):** Editar (`onEditar`); WhatsApp — `const wa = whatsappHref(cliente.telefone)` e renderizar o botão `asChild` com `href={wa}` só quando `wa` (idêntico ao operador-hero); Novo orçamento (primária): `<Button asChild className="…bg-primary…"><Link to="/admin/orcamentos"><Icon icon="lucide:file-plus" …/>Novo orçamento</Link></Button>`; Inativar/Reativar (idêntico ao operador-hero).

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/cliente-hero.tsx
git commit -m "feat: add client detail hero"
```

---

### Task 14: `cliente-kpis.tsx` (contagens REAIS + KPIs de EXEMPLO, com variante alerta)

Espelha `operador-kpis.tsx`. 4 KPIs: Faturado + Saldo a receber (EXEMPLO; saldo tem variante **alerta**), OS ativas + Orçamentos abertos (contagens REAIS passadas pelo orquestrador).

**Files:**
- Create: `src/features/clientes/components/cliente-kpis.tsx`

**Interfaces:**
- Consumes: `ClienteShowcaseKpis`, `ClienteKpiItem` de `@/features/clientes/cliente-showcase-data`; `formatBRL` de `@/features/retaguarda/format`; `Sparkline`; `Icon`.
- Produces: `export function ClienteKpis(props: { kpis: ClienteShowcaseKpis; osAtivas: number; orcamentosAbertos: number; saldoReceber: number; saldoRodape: string }): JSX.Element`
  - `osAtivas`, `orcamentosAbertos` = contagens REAIS (Task 21); `saldoReceber` = soma REAL das contas abertas (R$, `contasReceberStore`); `saldoRodape` = `N título(s) · M vencido(s)` REAL. Só "Faturado" fica 100% showcase.

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie a casca do `operador-kpis.tsx`. Monte os 4 itens localmente (o card de Saldo usa VALOR/rótulo reais, mantendo `spark`/`alerta` do showcase):
```tsx
const itens: ClienteKpiItem[] = [
  kpis.faturado,
  { ...kpis.saldoReceber, valor: formatBRL(saldoReceber), rodape: saldoRodape },
  { rotulo: "OS ativas", valor: String(osAtivas), icone: "lucide:clipboard-list", rodape: "em andamento", trendPct: null, trendDir: null, spark: kpis.osAtivasSpark },
  { rotulo: "Orçamentos abertos", valor: String(orcamentosAbertos), icone: "lucide:file-text", rodape: kpis.orcamentosValor, trendPct: null, trendDir: null, spark: kpis.orcamentosSpark },
];
```
No `KpiCard` interno, adicionar suporte a `alerta`:
- caixa do ícone: `kpi.alerta ? "bg-destructive/15 text-destructive" : "bg-surface text-primary"`.
- valor: `kpi.alerta ? "text-destructive" : "text-foreground"`.
- Renderizar `{kpi.valor}` direto (sem sufixo). Trend/rodapé como no operador. Sparkline condicional (`{kpi.spark ? <Sparkline …/> : null}`).

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/cliente-kpis.tsx
git commit -m "feat: add client detail KPI strip with real counts and alert variant"
```

---

### Task 15: `ordens-cliente-card.tsx` (REAL — ordens cruzando o cliente)

Lista de OS reais (número/obra/status via `ordensStore`) + horas/valor de EXEMPLO por linha. Empty state quando o cliente não tem OS.

**Files:**
- Create: `src/features/clientes/components/ordens-cliente-card.tsx`

**Interfaces:**
- Consumes: `StatusOS` de `@/shared/types`; `StatusOSBadge` de `@/features/ordem-servico/labels`; `CardSecao`, `CardPill` de `@/shared/components/card-secao`; `Link`, `Icon`.
- Produces:
  - `export interface OrdemClienteView { id: string; numero: string; obraNome: string; status: StatusOS; horas: string; valor: string }`
  - `export function OrdensClienteCard(props: { ordens: OrdemClienteView[] }): JSX.Element`

- [ ] **Step 1: Implementar o componente (clone adaptado de `ordens-vinculadas-card.tsx`)**

`CardSecao titulo="Ordens de Serviço" icone="lucide:clipboard-list" acessorio={<CardPill>{ordens.length} vinculadas</CardPill>} bodyClassName="p-2"`. Se `ordens.length === 0` → empty state (`border-dashed`, ícone `lucide:clipboard-x`, "Nenhuma OS registrada para este cliente."). Senão `<ul>` de linhas (padrão `not-first:border-t`): cada `<li>` é um `<Link to="/admin/ordens/$ordemId" params={{ ordemId: os.id }}>` com: número mono à esquerda; obra (`os.obraNome`, truncate) + meta (`horas` com `lucide:clock`, `valor` com `lucide:banknote`); `<StatusOSBadge status={os.status} className="shrink-0" />` à direita. Aplicar `focus-visible:ring-2 focus-visible:ring-primary rounded-lg` no Link.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/ordens-cliente-card.tsx
git commit -m "feat: add client orders card with empty state"
```

---

### Task 16: `contas-receber-card.tsx` (REAL — `contasReceberStore`)

Tabela shadcn com dados REAIS de `ContaReceber` (recebíveis derivados das faturas). Recebe as contas já cruzadas pelo cliente (Task 21). Documento resolvido via `faturamentosStore`. Situação usa o chip real `StatusContaBadge` + realce "Vencida" (padrão de `contas-receber-tab.tsx`). Empty state quando o cliente não tem contas.

**Files:**
- Create: `src/features/clientes/components/contas-receber-card.tsx`

**Interfaces:**
- Consumes: `ContaReceber` de `@/shared/types`; `faturamentosStore` de `@/features/faturamento/faturamentos-store` (lookup read-only `.obter(id)`); `StatusContaBadge` de `@/features/financeiro/labels`; `contaVencida(conta: Pick<ContaReceber, "status" | "vencimento">, agoraISO: string): boolean` de `@/features/financeiro/derivacoes`; `formatBRL` de `@/features/retaguarda/format`; `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`; `CardSecao`, `CardPill`; `Icon`; `cn`.
- Produces: `export function ContasReceberCard(props: { contas: ContaReceber[] }): JSX.Element`

- [ ] **Step 1: Implementar o componente**

```tsx
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { StatusContaBadge } from "@/features/financeiro/labels";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ContaReceber } from "@/shared/types";

export function ContasReceberCard({ contas }: { contas: ContaReceber[] }) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const emAberto = contas
    .filter((c) => c.status === "aberta")
    .reduce((s, c) => s + c.valor, 0);

  return (
    <CardSecao
      titulo="Contas a receber"
      icone="lucide:receipt"
      acessorio={<CardPill>{formatBRL(emAberto)} em aberto</CardPill>}
    >
      {contas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <Icon icon="lucide:inbox" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Nenhuma conta a receber</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((c) => {
              const fat = faturamentosStore.obter(c.faturamento_id);
              const vencida = contaVencida(c, agoraISO);
              const [ano, mes, dia] = c.vencimento.split("-");
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {fat?.numero ?? c.faturamento_id}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono text-xs",
                      vencida ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {`${dia}/${mes}/${ano}`}
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatBRL(c.valor)}</TableCell>
                  <TableCell className="text-right">
                    {vencida ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Vencida
                      </span>
                    ) : (
                      <StatusContaBadge status={c.status} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </CardSecao>
  );
}
```

Notas: `faturamentosStore.obter` é lookup síncrono read-only (mesmo uso do `contas-receber-tab.tsx`); "Vencida" só aparece para contas `aberta` com vencimento passado (via `contaVencida`); `StatusContaBadge` cobre "Em Aberto"/"Liquidada". Não criar chip novo.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/contas-receber-card.tsx
git commit -m "feat: add client accounts-receivable card from real store"
```

---

### Task 17: `dados-cadastrais-cliente-card.tsx`

Datalist (linha `Drow` de `dados-cadastrais-card.tsx`): razão(nome)/telefone/tipo REAIS + fantasia/segmento/email/endereço/contato EXEMPLO. Showcase parcial → sempre renderiza.

**Files:**
- Create: `src/features/clientes/components/dados-cadastrais-cliente-card.tsx`

**Interfaces:**
- Consumes: `Cliente` de `@/shared/types`; `ClienteCadastrais` de `@/features/clientes/cliente-showcase-data`; `formatTelefone` de `@/shared/lib/format`; `CardSecao`; `Icon`.
- Produces: `export function DadosCadastraisClienteCard(props: { cliente: Cliente; cadastrais: ClienteCadastrais }): JSX.Element`

- [ ] **Step 1: Implementar o componente (clone adaptado)**

Copie o `Drow` de `dados-cadastrais-card.tsx`. `CardSecao titulo="Dados cadastrais" icone="lucide:contact" bodyClassName="px-4 py-1.5"`. Linhas (ordem):
- `Drow icone="lucide:building" rotulo="Razão social"` → `{cliente.nome}` (REAL)
- `Drow icone="lucide:badge" rotulo="Nome fantasia"` → `{cadastrais.fantasia}`
- `Drow icone="lucide:layers" rotulo="Segmento"` → `{cadastrais.segmento}`
- `Drow icone="lucide:mail" rotulo="E-mail"` → `{cadastrais.email}`
- `Drow icone="lucide:phone" rotulo="Telefone"` → `<span className="font-mono">{formatTelefone(cliente.telefone)}</span>` (REAL)
- `Drow icone="lucide:map-pin" rotulo="Endereço"` → `{cadastrais.endereco}`
- `Drow icone="lucide:user" rotulo="Contato"` → `{cadastrais.contatoNome} · <small className="text-muted-foreground">{cadastrais.contatoPapel}</small>`

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/dados-cadastrais-cliente-card.tsx
git commit -m "feat: add client registration-data card"
```

---

### Task 18: `orcamentos-cliente-card.tsx` (REAL — orçamentos do cliente)

Lista de orçamentos reais (número/obra/valor/status via `orcamentosStore`), `StatusOrcamentoBadge`, `formatBRL`. Empty state quando vazio.

**Files:**
- Create: `src/features/clientes/components/orcamentos-cliente-card.tsx`

**Interfaces:**
- Consumes: `Orcamento` de `@/shared/types`; `StatusOrcamentoBadge` de `@/features/orcamentos/labels`; `formatBRL` de `@/features/retaguarda/format`; `CardSecao`, `CardPill`; `Link`, `Icon`.
- Produces: `export function OrcamentosClienteCard(props: { orcamentos: Orcamento[] }): JSX.Element`

- [ ] **Step 1: Implementar o componente**

`CardSecao titulo="Orçamentos" icone="lucide:file-spreadsheet" acessorio={<CardPill>{orcamentos.length} no total</CardPill>} bodyClassName="p-2"`. Se vazio → empty state (`border-dashed`, ícone `lucide:file-x`, "Nenhum orçamento registrado para este cliente."). Senão `<ul>` (padrão `not-first:border-t`): cada `<li>` é `<Link to="/admin/orcamentos/$orcamentoId" params={{ orcamentoId: o.id }}>` com número mono, `o.descricao_obra` (truncate), `formatBRL(o.valor_total)` (mono), `<StatusOrcamentoBadge status={o.status} className="shrink-0" />`. `focus-visible:ring-2 ring-primary`.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/orcamentos-cliente-card.tsx
git commit -m "feat: add client quotes card with empty state"
```

---

### Task 19: `recebimentos-cliente-card.tsx`

Lista showcase de PIX/TED/boleto com valor. Sempre renderiza. (Decisão: financeiro de exemplo, NÃO usa `Comprovante`.)

**Files:**
- Create: `src/features/clientes/components/recebimentos-cliente-card.tsx`

**Interfaces:**
- Consumes: `ClienteRecebimento` de `@/features/clientes/cliente-showcase-data`; `CardSecao`; `Icon`.
- Produces: `export function RecebimentosClienteCard(props: { recebimentos: ClienteRecebimento[] }): JSX.Element`

- [ ] **Step 1: Implementar o componente**

`CardSecao titulo="Recebimentos" icone="lucide:banknote" bodyClassName="p-2"`. `<ul>` (padrão `not-first:border-t`): cada `<li>` uma linha (`flex items-center gap-3.5 px-3 py-3`) com: ícone quadrado `bg-surface text-primary` renderizando `r.icone`; bloco central com `r.titulo` (`text-sm font-semibold text-foreground`) + `r.quando` (`text-[11px] text-foreground-faint`); valor à direita mono `text-foreground font-semibold` `{r.valor}`.

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/recebimentos-cliente-card.tsx
git commit -m "feat: add client payments-received showcase card"
```

---

### Task 20: `farolti-snapshot-card.tsx` (REAL — `legado_*`)

Extrai o bloco Farolti hoje em `cliente-detalhe.tsx` (~linhas 322-381) para um componente próprio, com a banda tracejada "aço" + badge congelado. **Preserva a condicional de render** (só aparece com histórico legado). Origem/migração = exemplo.

**Files:**
- Create: `src/features/clientes/components/farolti-snapshot-card.tsx`

**Interfaces:**
- Consumes: `Cliente` de `@/shared/types`; `formatBRL` de `@/features/retaguarda/format`; `formatData` de `@/shared/lib/format`; `Icon`.
- Produces: `export function FaroltiSnapshotCard(props: { cliente: Cliente; origemMigracao: string }): JSX.Element | null`

- [ ] **Step 1: Implementar o componente**

- **Condicional preservada:** `if (cliente.cli_codigo_legado == null) return null;` (mesma semântica de `temHistoricoLegado` do arquivo atual — o card se auto-oculta).
- Banda full-width com sotaque aço tracejado: `<section className="rounded-xl border border-dashed border-steel/40 bg-surface/40 p-5">`.
- Header: título `<h3 className="font-display …uppercase…">Histórico no ERP legado (FarolTI)</h3>`, subtítulo `<p className="text-xs text-muted-foreground">Snapshot importado no cadastro (código {cliente.cli_codigo_legado}) — não é recalculado ao vivo pelo sistema.</p>`, e um badge à direita `<span className="…border border-steel/40 bg-steel/15 …"><Icon icon="lucide:snowflake" …/>Importado · congelado</span>`.
- Grid de stats `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` — reproduzir os mesmos campos hoje renderizados via `KpiCard` no `cliente-detalhe.tsx`, agora como células simples (rótulo mono uppercase + valor `font-mono`), mapeando 1:1 os `legado_*` (preservar os fallbacks `!= null ? … : "—"`):
  - Faturado (LTV) → `cliente.legado_ltv != null ? formatBRL(cliente.legado_ltv) : "—"`
  - Ticket médio → `cliente.legado_ticket_medio != null ? formatBRL(cliente.legado_ticket_medio) : "—"`
  - OS realizadas → `cliente.legado_frequencia_os != null ? String(cliente.legado_frequencia_os) : "—"`
  - Curva ABC → `cliente.legado_curva_abc ?? "—"` — destaque dourado no valor `A` (`text-primary` quando `curva === "A"`)
  - Primeira OS → `formatData(cliente.legado_primeira_os ?? null)`
  - Última OS → `formatData(cliente.legado_ultima_os ?? null)`
  - Recência → `cliente.legado_recencia_dias != null ? `${cliente.legado_recencia_dias} dias` : "—"` (campo em DIAS — manter dias, é o dado real)
  - Origem → `{origemMigracao}` (EXEMPLO)

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/farolti-snapshot-card.tsx
git commit -m "feat: extract Farolti legacy snapshot into steel-banded card"
```

---

### Task 21: Reescrever `cliente-detalhe.tsx` (orquestrador)

Compõe hero → kpis → grid `[1.6fr_1fr]` → banda Farolti (full-width) → nota. Preserva loading/erro/not-found + edição inline + inativar/reativar + o cruzamento real com `ordensStore`/`orcamentosStore` via `idMockDoCliente`. As listas antigas de Faturamento/Comprovantes do arquivo atual são substituídas pelo novo conjunto de cards (KPIs + showcase de recebimentos), conforme a spec.

**Files:**
- Modify (reescrever): `src/features/clientes/components/cliente-detalhe.tsx`

**Interfaces:**
- Consumes: `clientesStore` (`.useCliente`, `.useEstado`, `.setAtivo`, `.retry`); `showcaseDoCliente` de `@/features/clientes/cliente-showcase-data`; `idMockDoCliente` de `@/shared/lib/cliente-mock-id`; `ordensStore` (`.useTodas()`), `orcamentosStore` (`.useTodos()`), `contasReceberStore` (`.useTodas()`) de `@/features/financeiro/contas-receber-store`; `contaVencida` de `@/features/financeiro/derivacoes`; componentes das Tasks 13–20; `ClienteForm`; `Button`, `Skeleton`, `ConfirmDialog`, `Link`, `Icon`, `toast`; `formatDataHora` de `@/shared/lib/format`.
- Produces: `export function ClienteDetalhe(props: { clienteId: string }): JSX.Element` (assinatura inalterada — barrel `src/features/clientes/index.ts` e rota `admin.clientes.$clienteId.tsx` já ok).

- [ ] **Step 1: Reescrever o orquestrador**

- Hooks (sempre chamados, ordem estável): `const cliente = clientesStore.useCliente(clienteId); const { isLoading, error } = clientesStore.useEstado();` + estados `editando`/`inativando`; `const showcase = useMemo(() => showcaseDoCliente(clienteId), [clienteId]);`
- Cruzamento real (preservar o padrão atual): `const idMock = idMockDoCliente(clienteId); const osDoCliente = ordensStore.useTodas().filter((o) => o.cliente_id === idMock); const orcamentosDoCliente = orcamentosStore.useTodos().filter((o) => o.cliente_id === idMock); const contasDoCliente = contasReceberStore.useTodas().filter((c) => c.cliente_id === idMock);` (quando `idMock` é `undefined`, os filtros retornam `[]` → empty states).
- Contagens reais para KPIs: `const osAtivas = osDoCliente.filter((o) => o.status !== "fechada").length; const orcamentosAbertos = orcamentosDoCliente.filter((o) => o.status !== "aprovado" && o.status !== "recusado").length;`
- Saldo a receber REAL (mesma fonte do card da Task 16 — não pode divergir): `const agoraISO = new Date().toISOString().slice(0, 10); const abertas = contasDoCliente.filter((c) => c.status === "aberta"); const saldoReceber = abertas.reduce((s, c) => s + c.valor, 0); const vencidas = abertas.filter((c) => contaVencida(c, agoraISO)).length; const saldoRodape = `${abertas.length} título(s) · ${vencidas} vencido(s)`;`
- View de OS (real + showcase por índice): `const ordensView = osDoCliente.map((o, i) => ({ id: o.id, numero: o.numero, obraNome: o.obra_nome, status: o.status, ...showcase.porOS[i % showcase.porOS.length] }));`
- Última OS: `const ultimaOS = osDoCliente.length ? formatDataHora([...osDoCliente].sort((a, b) => b.aberta_em.localeCompare(a.aberta_em))[0].aberta_em) : showcase.ultimaOS;`
- Blocos `voltar`/`isLoading`/`error`/`!cliente` — preservar do arquivo atual (removendo `PageHeader`, `KpiCard`, `StatusAtivo` do topo e imports de faturamento/comprovantes agora sem uso). `reativar`/`confirmarInativar` via `clientesStore.setAtivo` (preservar).
- Bloco `editando ?` → `<ClienteForm inicial={cliente} … />` (preservar).
- Bloco principal:
  ```tsx
  <div className="space-y-4">
    <ClienteHero
      cliente={cliente}
      recorrente={showcase.recorrente}
      ultimaOS={ultimaOS}
      onEditar={() => setEditando(true)}
      onInativar={() => setInativando(true)}
      onReativar={reativar}
    />
    <ClienteKpis
      kpis={showcase.kpis}
      osAtivas={osAtivas}
      orcamentosAbertos={orcamentosAbertos}
      saldoReceber={saldoReceber}
      saldoRodape={saldoRodape}
    />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <OrdensClienteCard ordens={ordensView} />
        <ContasReceberCard contas={contasDoCliente} />
      </div>
      <div className="space-y-4">
        <DadosCadastraisClienteCard cliente={cliente} cadastrais={showcase.cadastrais} />
        <OrcamentosClienteCard orcamentos={orcamentosDoCliente} />
        <RecebimentosClienteCard recebimentos={showcase.recebimentos} />
      </div>
    </div>
    <FaroltiSnapshotCard cliente={cliente} origemMigracao={showcase.origemMigracao} />
    <div className="mt-2 flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3 text-[12.5px] text-foreground-faint">
      <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
      <span>
        O snapshot do ERP legado (FarolTI) é <b>congelado</b> na importação; o restante da página
        é ao vivo. Recebimentos são dados de exemplo nesta fase.
      </span>
    </div>
  </div>
  ```
- `ConfirmDialog` de inativar (preservar).

- [ ] **Step 2: Verificar tipos e suíte**

Run: `npx tsc --noEmit`
Expected: sem erros (nenhum import órfão de faturamento/comprovantes/KpiCard/StatusAtivo/PageHeader remanescente).
Run: `npx vitest run src/features/clientes`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/clientes/components/cliente-detalhe.tsx
git commit -m "feat: rebuild client detail page with hero, KPIs, activity grid and Farolti band"
```

---

### Task 22: Higiene final (tsc + vitest do escopo + eslint --fix)

Fechamento espelhando o plano do operador: garantir tipos limpos, suíte verde e lint dos arquivos tocados.

**Files:**
- Modify (se o `eslint --fix` ajustar): arquivos criados/alterados nas Tasks 1–21.

**Interfaces:**
- Consumes: nada. Produces: nada.

- [ ] **Step 1: Type check global**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 2: Suíte do escopo**

Run: `npx vitest run src/features/equipamentos src/features/clientes src/features/operadores`
Expected: PASS (inclui os 2 novos `*-showcase-data.test.ts` + suíte do operador intacta).

- [ ] **Step 3: Lint dos arquivos tocados**

Run: `npx eslint --fix src/shared/components/card-secao.tsx src/features/equipamentos src/features/clientes/components src/features/clientes/cliente-showcase-data.ts src/features/clientes/cliente-showcase-data.test.ts`
Expected: sem violações restantes (só auto-fixes aplicados, se houver).

- [ ] **Step 4: Re-verificar após o fix**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Commit (se houve auto-fix)**

```bash
git add -A
git commit -m "chore: lint and type-check pass for equipment/client detail refactor"
```

---

## Self-Review

**Cobertura da spec:**
- Decisão 1 (híbrido real+exemplo): Tasks 6/7/8 (equip. real), 15/16/18/20 (cliente real — inclui Contas a receber via `contasReceberStore`), 2/12 (showcase só nas lacunas). ✅
- Decisão 2 (estados vazios): custo-hora (T6), manutenções (T7), próxima manutenção (T8), OS (T15), contas a receber (T16), orçamentos (T18), Farolti oculto (T20). ✅
- Decisão 3 (Recebimentos = exemplo, não `Comprovante`): T19 (único card financeiro showcase do cliente). ✅
- Decisão 4 (financeiro p/ toda retaguarda, sem guarda nova): nenhuma guarda adicionada. ✅
- Decisão 5 (só tokens, light+dark): Global Constraints; nenhum hex. ✅
- Decisão 6 (ações de hero navegam): T3 (Registrar manutenção → /admin/manutencao), T13 (Novo orçamento → /admin/orcamentos; WhatsApp wa.me). ✅
- Decisão 7 (promover CardSecao/CardPill): T1. ✅
- Estrutura Equipamento (hero/4 KPIs/grid/nota) e todas as 8 seções: T3–T11. ✅
- Estrutura Cliente (hero/4 KPIs/grid/banda Farolti/nota) e todas as seções: T13–T21. ✅
- Testes: só os 2 módulos showcase têm teste unitário (T2, T12); componentes por `tsc` + visual. ✅
- LGPD (não logar CPF/PII): nenhum `console.log` de dado pessoal introduzido; nota em Global Constraints. ✅

**Consistência de tipos:** `EquipamentoShowcaseKpis`/`EquipamentoKpiItem`/`EquipamentoLeitura`/`EquipamentoFichaTecnica`/`EquipamentoSemana` (T2) consumidos por T4/T5/T9/T10/T11. `ClienteShowcaseKpis`/`ClienteKpiItem`/`ClienteOrdemFinanceiro`/`ClienteCadastrais`/`ClienteRecebimento` (T12) consumidos por T14/T17/T19/T21 (T12 já NÃO expõe `contasReceber` — agora real). `OrdemClienteView` definido em T15 e montado em T21 com os mesmos campos (`id/numero/obraNome/status/horas/valor`). T16 consome `ContaReceber` real. Hooks reais confirmados: `precoHoraMaquinaStore.useAll`, `planosManutencaoStore.useAll`, `registrosManutencaoStore.useTodos`, `ordensStore.useTodas`, `orcamentosStore.useTodos`, `contasReceberStore.useTodas`. Helpers reais: `precoHoraDoEquipamento` (`@/features/faturamento/calculo`), `contaVencida` (`@/features/financeiro/derivacoes`), chip `StatusContaBadge` (`@/features/financeiro/labels`). Saldo a receber do KPI (T14) e card (T16) partilham a MESMA fonte (`contasDoCliente`, filtradas no orquestrador T21) → não divergem. ✅

**Sem placeholders:** código concreto nos módulos showcase e nos cards de lógica real (T6/T7/T8/T16/T20); clones referenciam arquivo-template real + adaptações precisas. ✅
