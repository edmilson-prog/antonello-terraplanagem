# Listas de Cadastro da Retaguarda (Clientes/Operadores/Equipamentos) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-vestir as 3 páginas de lista de cadastro (`/admin/clientes`, `/admin/operadores`, `/admin/equipamentos`) com o visual do design system "Antonello Terraplanagem — Design System", seguindo o mesmo padrão híbrido real+exemplo das duas rodadas anteriores (Operador; depois Cliente+Equipamento), sem quebrar nenhum comportamento existente.

**Architecture:** Dois componentes compartilhados novos (`FiltroChips`, `LinhaEntidadeCell`) + extensão dos módulos de showcase por entidade já existentes + uma nova derivação real de manutenção reaproveitada entre o card de detalhe e a lista + reescrita das 3 páginas para um modelo de "view" pré-computado por linha (evita recomputar a mesma derivação em várias colunas/no card mobile).

**Tech Stack:** React 19 + TypeScript + Tailwind v4 (tokens) + shadcn/ui + Iconify (`lucide:`) + Vitest + @testing-library/react.

## Global Constraints

- Tema: só tokens (`bg-card`, `text-foreground`, `bg-primary`, `text-destructive`, `text-steel`, `text-muted-foreground`, `text-foreground-faint` etc.) — **nunca hex**.
- Ícones via `@iconify/react`, sempre prefixo `lucide:`.
- **`src/shared/components/status-ativo.tsx` NÃO é modificado.** Achado da fase de planejamento: já implementa o padrão "chip com LED" que a spec pedia (`bg-primary/20`/`border-primary/50` quando ativo + dot `bg-current`), no mesmo estilo já usado por `EquipamentoStatusBadge`. Mudar geraria inconsistência com os badges irmãos, não uma melhoria. Nenhuma tarefa deste plano toca nesse arquivo.
- **`src/shared/components/data-list.tsx` também NÃO é modificado.** Mesmo achado: a tabela já usa `rounded-xl border bg-card shadow-sm`, cabeçalho `font-mono uppercase tracking-wide`, hover `hover:bg-surface/50` — já bate com o visual do design system. As tarefas deste plano usam `DataList` como está (só mudam `columns`/`renderCard` de cada página).
- `FiltroChips` (novo) é usado **só** no filtro de Status do Equipamento. O `Select` de Tipo do Equipamento continua dropdown (6 valores). Clientes/Operadores não ganham `FiltroChips`.
- Sem paginação nova em Operadores/Equipamentos — só Clientes pagina, como hoje.
- Sem botão "Exportar" em nenhuma das 3 páginas.
- Toda coluna "exemplo" vem de `showcaseDoCliente`/`showcaseDoOperador`/`showcaseDoEquipamento` (módulos já existentes, estendidos aqui) — nunca gerar número aleatório direto numa página.
- `FiltroChips`/`LinhaEntidadeCell` têm API compatível (mesmos nomes de prop: `itens`, `ativo`, `onChange`, `counts`; shape de item `{id, label, tone?}`) com o `status-filter-chips.tsx` de uma branch irmã (`feat/telas-area-retaguarda`, ainda não mergeada) — não reaproveitar esse arquivo agora (ainda não existe em `main`), mas manter os nomes alinhados para facilitar a reconciliação futura.
- `tsc --noEmit`, `eslint` e a suíte `vitest` completa devem passar limpos ao final de cada tarefa.

---

### Task 1: `FiltroChips` (componente compartilhado)

**Files:**
- Create: `src/shared/components/filtro-chips.tsx`
- Test: `src/shared/components/filtro-chips.test.tsx`

**Interfaces:**
- Produces: `FiltroChipItem { id: string; label: string; tone?: "info" | "success" | "warn" | "neutral" }`, `FiltroChipsProps { itens: FiltroChipItem[]; ativo: string; onChange: (id: string) => void; counts: Record<string, number> }`, `function FiltroChips(props: FiltroChipsProps): JSX.Element`.

- [ ] **Step 1: Escrever o teste (deve falhar — arquivo ainda não existe)**

```tsx
// src/shared/components/filtro-chips.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FiltroChips } from "./filtro-chips";

describe("FiltroChips", () => {
  const itens = [
    { id: "todos", label: "Todos" },
    { id: "disponivel", label: "Disponível", tone: "neutral" as const },
    { id: "em_uso", label: "Em uso", tone: "success" as const },
  ];

  it("renderiza cada item com seu contador e aria-pressed no ativo", () => {
    render(
      <FiltroChips
        itens={itens}
        ativo="em_uso"
        onChange={() => {}}
        counts={{ todos: 5, disponivel: 2, em_uso: 3 }}
      />,
    );
    expect(screen.getByText("· 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Em uso/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Disponível/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("chama onChange com o id do item clicado", () => {
    const onChange = vi.fn();
    render(
      <FiltroChips
        itens={itens}
        ativo="todos"
        onChange={onChange}
        counts={{ todos: 5, disponivel: 2, em_uso: 3 }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Em uso/ }));
    expect(onChange).toHaveBeenCalledWith("em_uso");
  });

  it("item sem tone não renderiza o dot de led", () => {
    render(
      <FiltroChips
        itens={[{ id: "todos", label: "Todos" }]}
        ativo="todos"
        onChange={() => {}}
        counts={{ todos: 5 }}
      />,
    );
    const btn = screen.getByRole("button", { name: /Todos/ });
    expect(btn.querySelector("span.rounded-full.bg-current")).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/shared/components/filtro-chips.test.tsx`
Expected: FAIL — `Cannot find module './filtro-chips'`.

- [ ] **Step 3: Implementar o componente**

```tsx
// src/shared/components/filtro-chips.tsx
import { cn } from "@/lib/utils";

export interface FiltroChipItem {
  id: string;
  label: string;
  tone?: "info" | "success" | "warn" | "neutral";
}

export interface FiltroChipsProps {
  itens: FiltroChipItem[];
  ativo: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}

const TONE_LED_CLASSE: Record<NonNullable<FiltroChipItem["tone"]>, string> = {
  success: "text-primary",
  warn: "text-destructive",
  info: "text-steel",
  neutral: "text-muted-foreground",
};

export function FiltroChips({ itens, ativo, onChange, counts }: FiltroChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group">
      {itens.map((item) => {
        const selecionado = item.id === ativo;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selecionado}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              selecionado
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40",
            )}
          >
            {item.tone ? (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-current",
                  TONE_LED_CLASSE[item.tone],
                )}
              />
            ) : null}
            {item.label}
            <span className={selecionado ? "text-primary-foreground/80" : "text-foreground-faint"}>
              · {counts[item.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/shared/components/filtro-chips.test.tsx`
Expected: PASS (3/3).

- [ ] **Step 5: Checar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/shared/components/filtro-chips.tsx src/shared/components/filtro-chips.test.tsx`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/filtro-chips.tsx src/shared/components/filtro-chips.test.tsx
git commit -m "feat: add FiltroChips shared filter component"
```

---

### Task 2: `LinhaEntidadeCell` (componente compartilhado)

**Files:**
- Create: `src/shared/components/linha-entidade-cell.tsx`
- Test: `src/shared/components/linha-entidade-cell.test.tsx`

**Interfaces:**
- Produces: `LinhaEntidadeCellProps { variante: "icone" | "avatar"; icone?: string; iniciais?: string; titulo: React.ReactNode; subtitulo?: React.ReactNode }`, `function LinhaEntidadeCell(props: LinhaEntidadeCellProps): JSX.Element`.

- [ ] **Step 1: Escrever o teste (deve falhar — arquivo ainda não existe)**

```tsx
// src/shared/components/linha-entidade-cell.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinhaEntidadeCell } from "./linha-entidade-cell";

describe("LinhaEntidadeCell", () => {
  it("renderiza variante ícone com título e subtítulo", () => {
    render(
      <LinhaEntidadeCell
        variante="icone"
        icone="lucide:building-2"
        titulo="Construtora Vale Verde"
        subtitulo="Santo Ângelo — RS"
      />,
    );
    expect(screen.getByText("Construtora Vale Verde")).toBeInTheDocument();
    expect(screen.getByText("Santo Ângelo — RS")).toBeInTheDocument();
  });

  it("renderiza variante avatar com iniciais, sem subtítulo quando omitido", () => {
    render(<LinhaEntidadeCell variante="avatar" iniciais="JV" titulo="João Vitor" />);
    expect(screen.getByText("JV")).toBeInTheDocument();
    expect(screen.getByText("João Vitor")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/shared/components/linha-entidade-cell.test.tsx`
Expected: FAIL — `Cannot find module './linha-entidade-cell'`.

- [ ] **Step 3: Implementar o componente**

```tsx
// src/shared/components/linha-entidade-cell.tsx
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface LinhaEntidadeCellProps {
  variante: "icone" | "avatar";
  icone?: string;
  iniciais?: string;
  titulo: ReactNode;
  subtitulo?: ReactNode;
}

export function LinhaEntidadeCell({
  variante,
  icone,
  iniciais,
  titulo,
  subtitulo,
}: LinhaEntidadeCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center bg-primary/15 text-primary",
          variante === "avatar" ? "rounded-full font-display text-xs font-bold" : "rounded-lg",
        )}
      >
        {variante === "avatar" ? (
          iniciais
        ) : (
          <Icon icon={icone ?? "lucide:circle"} className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{titulo}</div>
        {subtitulo ? (
          <div className="truncate text-xs text-foreground-faint">{subtitulo}</div>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/shared/components/linha-entidade-cell.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 5: Checar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/shared/components/linha-entidade-cell.tsx src/shared/components/linha-entidade-cell.test.tsx`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/linha-entidade-cell.tsx src/shared/components/linha-entidade-cell.test.tsx
git commit -m "feat: add LinhaEntidadeCell shared list-row component"
```

---

### Task 3: Estender `cliente-showcase-data.ts` com `cadastrais.cidade`

**Files:**
- Modify: `src/features/clientes/cliente-showcase-data.ts`
- Test: `src/features/clientes/cliente-showcase-data.test.ts`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: `ClienteCadastrais` ganha o campo `cidade: string`. `showcaseDoCliente(id).cadastrais.cidade` passa a existir.

- [ ] **Step 1: Escrever a asserção (deve falhar — campo ainda não existe)**

Abrir `src/features/clientes/cliente-showcase-data.test.ts` e adicionar a linha marcada abaixo dentro do teste `"produz o formato esperado"` (arquivo completo após a mudança):

```ts
// src/features/clientes/cliente-showcase-data.test.ts
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
    expect(typeof s.cadastrais.cidade).toBe("string"); // NOVO
    expect(s.cadastrais.cidade.length).toBeGreaterThan(0); // NOVO
    expect(typeof s.origemMigracao).toBe("string");
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/clientes/cliente-showcase-data.test.ts`
Expected: FAIL — `s.cadastrais.cidade` é `undefined`, `typeof undefined !== "string"`.

- [ ] **Step 3: Adicionar o campo**

Em `src/features/clientes/cliente-showcase-data.ts`:

1. No `interface ClienteCadastrais` (linhas 34-41 atuais), adicionar `cidade: string;` logo após `fantasia: string;`:

```ts
export interface ClienteCadastrais {
  fantasia: string;
  cidade: string; // NOVO — usado pela coluna "Cliente" da lista (subtítulo)
  segmento: string;
  email: string;
  endereco: string;
  contatoNome: string;
  contatoPapel: string;
}
```

2. Dentro de `showcaseDoCliente`, na construção de `cadastrais` (bloco atual em torno da linha 149), adicionar `cidade: pick(CIDADES_POOL),` logo após `fantasia`:

```ts
  const cadastrais: ClienteCadastrais = {
    fantasia: pick(FANTASIA_POOL),
    cidade: pick(CIDADES_POOL),
    segmento: pick(SEGMENTO_POOL),
    email: "contato@exemplo.com.br",
    endereco: `${pick(RUAS_POOL)} · ${pick(CIDADES_POOL)}`,
    contatoNome: pick(CONTATO_NOME_POOL),
    contatoPapel: pick(CONTATO_PAPEL_POOL),
  };
```

`CIDADES_POOL` já existe no topo do arquivo (usado por `endereco`) — não precisa criar nada novo, só reaproveitar.

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/clientes/cliente-showcase-data.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Checar tipos, lint e a suíte inteira (o tipo `ClienteShowcase` é consumido pelo `cliente-detalhe.tsx` já existente — confirmar que nada quebra)**

Run: `npx tsc --noEmit && npx eslint src/features/clientes/cliente-showcase-data.ts && npx vitest run src/features/clientes`
Expected: sem erros; toda a suíte de `clientes` verde.

- [ ] **Step 6: Commit**

```bash
git add src/features/clientes/cliente-showcase-data.ts src/features/clientes/cliente-showcase-data.test.ts
git commit -m "feat: add cidade field to cliente showcase data"
```

---

### Task 4: Estender `equipamento-showcase-data.ts` com `dieselMedioLh`

**Files:**
- Modify: `src/features/equipamentos/equipamento-showcase-data.ts`
- Test: `src/features/equipamentos/equipamento-showcase-data.test.ts`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: `EquipamentoShowcase` ganha o campo `dieselMedioLh: string` (formato `"N,N L/h"`).

- [ ] **Step 1: Escrever a asserção (deve falhar — campo ainda não existe)**

```ts
// src/features/equipamentos/equipamento-showcase-data.test.ts
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
    expect(s.dieselMedioLh).toMatch(/^\d+,\d L\/h$/); // NOVO
    for (const barra of s.utilizacaoSemana.barras) {
      expect(barra.pct).toBeGreaterThanOrEqual(0);
      expect(barra.pct).toBeLessThanOrEqual(100);
    }
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/equipamentos/equipamento-showcase-data.test.ts`
Expected: FAIL — `s.dieselMedioLh` é `undefined`.

- [ ] **Step 3: Adicionar o campo**

Em `src/features/equipamentos/equipamento-showcase-data.ts`:

1. No `interface EquipamentoShowcase` (linhas 50-55 atuais), adicionar `dieselMedioLh: string;`:

```ts
export interface EquipamentoShowcase {
  kpis: EquipamentoShowcaseKpis;
  leiturasHorimetro: EquipamentoLeitura[];
  fichaTecnica: EquipamentoFichaTecnica;
  utilizacaoSemana: EquipamentoSemana;
  dieselMedioLh: string; // NOVO — usado pela coluna "Diesel médio" da lista
}
```

2. Dentro de `showcaseDoEquipamento`, logo antes do `return` final, calcular e incluir o campo:

```ts
  const dieselMedioLh = `${(intBetween(80, 190) / 10).toFixed(1).replace(".", ",")} L/h`;

  return { kpis, leiturasHorimetro, fichaTecnica, utilizacaoSemana, dieselMedioLh };
```

(`intBetween` já está em escopo dentro da função — mesmo helper usado pelos outros campos.)

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/equipamentos/equipamento-showcase-data.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Checar tipos, lint e a suíte de equipamentos**

Run: `npx tsc --noEmit && npx eslint src/features/equipamentos/equipamento-showcase-data.ts && npx vitest run src/features/equipamentos`
Expected: sem erros; suíte verde.

- [ ] **Step 6: Commit**

```bash
git add src/features/equipamentos/equipamento-showcase-data.ts src/features/equipamentos/equipamento-showcase-data.test.ts
git commit -m "feat: add dieselMedioLh field to equipamento showcase data"
```

---

### Task 5: `resumoProximaManutencao` real + refatorar `ProximaManutencaoCard`

**Files:**
- Modify: `src/features/manutencao/derivacoes.ts`
- Modify: `src/features/equipamentos/components/proxima-manutencao-card.tsx`
- Test: `src/features/manutencao/derivacoes.test.ts`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: `ResumoProximaManutencao { descricao: string; intervalo: number; previsto: number; restantes: number; status: StatusManutencao }`, `function resumoProximaManutencao(equipamento: Equipamento, planos: PlanoManutencao[], registros: RegistroManutencao[]): ResumoProximaManutencao | null` — usada pela Task 8 (Equipamentos page).

- [ ] **Step 1: Escrever os testes (devem falhar — função ainda não existe)**

Trocar o bloco de import no topo de `src/features/manutencao/derivacoes.test.ts` (o arquivo já define `equipamento()`, `plano()`, `registro()` mais abaixo — reaproveitar, não recriar):

```ts
import { describe, it, expect } from "vitest";
import {
  calcularStatusManutencao,
  planosParaEquipamento,
  statusPlano,
  statusEquipamento,
  alertasManutencao,
  resumoProximaManutencao,
} from "./derivacoes";
import type { Equipamento, PlanoManutencao, RegistroManutencao } from "@/shared/types";
```

Depois, adicionar ao final do arquivo (após o último `describe` existente):

```ts
describe("resumoProximaManutencao", () => {
  it("retorna null quando não há plano aplicável", () => {
    const e = equipamento({ id: "eq-1" });
    expect(resumoProximaManutencao(e, [], [])).toBeNull();
  });

  it("retorna null quando há plano mas sem registro 'prevista'", () => {
    const e = equipamento({ id: "eq-1" });
    const p = plano({ id: "pm-1", equipamento_id: "eq-1" });
    expect(resumoProximaManutencao(e, [p], [])).toBeNull();
  });

  it("retorna o plano mais urgente (menor horas restantes) entre vários aplicáveis", () => {
    const e = equipamento({ id: "eq-1", horimetro_atual: 1000 });
    const p1 = plano({
      id: "pm-1",
      equipamento_id: "eq-1",
      intervalo_horas: 250,
      descricao: "Troca de óleo",
    });
    const p2 = plano({
      id: "pm-2",
      equipamento_id: "eq-1",
      intervalo_horas: 500,
      descricao: "Revisão geral",
    });
    const r1 = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 1100,
    }); // faltam 100
    const r2 = registro({
      id: "rm-2",
      plano_id: "pm-2",
      equipamento_id: "eq-1",
      horimetro_previsto: 1050,
    }); // faltam 50 — mais urgente
    const resumo = resumoProximaManutencao(e, [p1, p2], [r1, r2]);
    expect(resumo?.descricao).toBe("Revisão geral");
    expect(resumo?.intervalo).toBe(500);
    expect(resumo?.previsto).toBe(1050);
    expect(resumo?.restantes).toBe(50);
    expect(resumo?.status).toBe("proxima");
  });

  it("status 'vencida' quando as horas restantes são <= 0", () => {
    const e = equipamento({ id: "eq-1", horimetro_atual: 1300 });
    const p = plano({ id: "pm-1", equipamento_id: "eq-1" });
    const r = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 1250,
    });
    const resumo = resumoProximaManutencao(e, [p], [r]);
    expect(resumo?.status).toBe("vencida");
    expect(resumo?.restantes).toBe(-50);
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/features/manutencao/derivacoes.test.ts`
Expected: FAIL — `resumoProximaManutencao is not a function`.

- [ ] **Step 3: Implementar a função em `derivacoes.ts`**

Adicionar ao final de `src/features/manutencao/derivacoes.ts`:

```ts
export interface ResumoProximaManutencao {
  descricao: string;
  intervalo: number;
  previsto: number;
  restantes: number;
  status: StatusManutencao;
}

// Extrai o plano mais urgente (menor "horas restantes") entre os aplicáveis ao
// equipamento — mesma seleção usada pelo card de detalhe (ProximaManutencaoCard)
// e pela coluna "Próx. manutenção" da lista de equipamentos, para as duas telas
// nunca divergirem para o mesmo equipamento.
export function resumoProximaManutencao(
  equipamento: Equipamento,
  planos: PlanoManutencao[],
  registros: RegistroManutencao[],
): ResumoProximaManutencao | null {
  const candidatos = planosParaEquipamento(equipamento, planos).reduce<
    { plano: PlanoManutencao; resultado: StatusPlanoResultado }[]
  >((acc, plano) => {
    const resultado = statusPlano(plano, equipamento, registros);
    if (resultado) acc.push({ plano, resultado });
    return acc;
  }, []);

  const maisUrgente = candidatos.reduce<
    { plano: PlanoManutencao; resultado: StatusPlanoResultado } | null
  >((urgente, atual) => {
    if (!urgente) return atual;
    const restantesAtual =
      atual.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    const restantesUrgente =
      urgente.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    return restantesAtual < restantesUrgente ? atual : urgente;
  }, null);

  if (!maisUrgente) return null;

  const { plano, resultado } = maisUrgente;
  return {
    descricao: plano.descricao,
    intervalo: plano.intervalo_horas,
    previsto: resultado.registro.horimetro_previsto,
    restantes: resultado.registro.horimetro_previsto - equipamento.horimetro_atual,
    status: resultado.status,
  };
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `npx vitest run src/features/manutencao/derivacoes.test.ts`
Expected: PASS (todos, incluindo os 4 novos de `resumoProximaManutencao`).

- [ ] **Step 5: Refatorar `ProximaManutencaoCard` para usar a função (mesmo output visual, sem duplicar a lógica de "mais urgente")**

Substituir o conteúdo inteiro de `src/features/equipamentos/components/proxima-manutencao-card.tsx` por:

```tsx
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { resumoProximaManutencao } from "@/features/manutencao/derivacoes";
import { formatHorimetro } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import type { Equipamento, StatusManutencao } from "@/shared/types";

const HEALTH_LABEL: Record<StatusManutencao, string> = {
  em_dia: "Saudável",
  proxima: "Atenção",
  vencida: "Vencida",
};

const HEALTH_CLASSE: Record<StatusManutencao, string> = {
  em_dia: "border-steel/40 bg-steel/15",
  proxima: "border-primary/50 bg-primary/20",
  vencida: "border-destructive/40 bg-destructive/15 text-destructive",
};

// Health badge + barra de progresso do intervalo do plano de manutenção mais
// urgente (menor "horas restantes" entre os planos aplicáveis ao equipamento).
export function ProximaManutencaoCard({ equipamento }: { equipamento: Equipamento }) {
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const resumo = resumoProximaManutencao(equipamento, planos, registros);

  if (!resumo) {
    return (
      <CardSecao titulo="Próxima manutenção" icone="lucide:calendar-clock">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:calendar-off" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Sem plano de manutenção</p>
        </div>
      </CardSecao>
    );
  }

  const { descricao, intervalo, previsto, restantes, status } = resumo;
  const atual = equipamento.horimetro_atual;
  const base = previsto - intervalo;
  const progressoPct = Math.max(0, Math.min(100, ((atual - base) / intervalo) * 100));
  const vencida = status === "vencida";

  return (
    <CardSecao
      titulo="Próxima manutenção"
      icone="lucide:calendar-clock"
      bodyClassName="space-y-3 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{descricao}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">A cada {intervalo} h</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            HEALTH_CLASSE[status],
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {HEALTH_LABEL[status]}
        </span>
      </div>

      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={cn("h-full rounded-full", vencida ? "bg-destructive" : "bg-primary")}
            style={{ width: `${progressoPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {restantes < 0
            ? `vencida há ${formatHorimetro(Math.abs(restantes))}`
            : `faltam ${formatHorimetro(Math.max(0, restantes))}`}
        </p>
      </div>

      <div className="flex justify-between font-mono text-xs text-foreground-faint">
        <span>Última {formatHorimetro(base)}</span>
        <span>Prevista {formatHorimetro(previsto)}</span>
      </div>
    </CardSecao>
  );
}
```

Este arquivo produz exatamente o mesmo HTML/visual de antes — só move o cálculo de "plano mais urgente" para `resumoProximaManutencao`. Não há teste de snapshot para este card (nunca existiu); a verificação é via `tsc`/`eslint` + o smoke test manual do usuário na tela `/admin/equipamentos/:id` (que já existe e não muda de layout).

- [ ] **Step 6: Checar tipos, lint e a suíte de manutenção + equipamentos**

Run: `npx tsc --noEmit && npx eslint src/features/manutencao/derivacoes.ts src/features/equipamentos/components/proxima-manutencao-card.tsx && npx vitest run src/features/manutencao src/features/equipamentos`
Expected: sem erros; suítes verdes.

- [ ] **Step 7: Commit**

```bash
git add src/features/manutencao/derivacoes.ts src/features/manutencao/derivacoes.test.ts src/features/equipamentos/components/proxima-manutencao-card.tsx
git commit -m "refactor: extract resumoProximaManutencao, reuse in ProximaManutencaoCard"
```

---

### Task 6: Exportar `iniciais()` de `operador-hero.tsx`

**Files:**
- Modify: `src/features/operadores/components/operador-hero.tsx`

**Interfaces:**
- Produces: `export function iniciais(nome: string): string` (era função local não exportada) — usada pela Task 9 (Operadores page).

- [ ] **Step 1: Adicionar `export` à função existente**

Em `src/features/operadores/components/operador-hero.tsx`, trocar:

```ts
function iniciais(nome: string): string {
```

por:

```ts
export function iniciais(nome: string): string {
```

Nenhuma outra linha muda — é uma mudança de uma palavra. O corpo da função continua:

```ts
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "?";
}
```

- [ ] **Step 2: Checar tipos e lint (garantir que exportar a função não gera warning de export não usado em outro lugar, e que `operador-hero.tsx` continua importando/usando `iniciais` normalmente)**

Run: `npx tsc --noEmit && npx eslint src/features/operadores/components/operador-hero.tsx`
Expected: sem erros.

- [ ] **Step 3: Rodar a suíte de operadores (nenhum teste deve quebrar — mudança é só visibilidade de export)**

Run: `npx vitest run src/features/operadores`
Expected: PASS (suíte inalterada).

- [ ] **Step 4: Commit**

```bash
git add src/features/operadores/components/operador-hero.tsx
git commit -m "refactor: export iniciais helper for reuse in OperadoresPage"
```

---

### Task 7: Adicionar `TIPO_ICONE` em `equipamentos/labels.tsx`

**Files:**
- Modify: `src/features/equipamentos/labels.tsx`

**Interfaces:**
- Produces: `export const TIPO_ICONE: Record<TipoEquipamento, string>` — usada pela Task 10 (Equipamentos page).

- [ ] **Step 1: Adicionar o mapeamento**

Em `src/features/equipamentos/labels.tsx`, logo após o array `TIPOS` (linha 21 atual), adicionar:

```ts
export const TIPO_ICONE: Record<TipoEquipamento, string> = {
  escavadeira: "lucide:truck",
  carregadeira: "lucide:forklift",
  caminhao_cacamba: "lucide:truck",
  trator_esteira: "lucide:tractor",
  retroescavadeira: "lucide:tractor",
  outro: "lucide:truck",
};
```

- [ ] **Step 2: Checar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/equipamentos/labels.tsx`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/equipamentos/labels.tsx
git commit -m "feat: add TIPO_ICONE mapping for equipamento list icons"
```

---

### Task 8: Reescrever `clientes-page.tsx`

**Files:**
- Modify: `src/features/clientes/components/clientes-page.tsx`

**Interfaces:**
- Consumes: `LinhaEntidadeCell` (Task 2), `showcaseDoCliente` com `cadastrais.cidade` (Task 3), `idMockDoCliente` (`@/shared/lib/cliente-mock-id`, já existe), `ordensStore` (`@/features/ordem-servico/ordens-store`, já existe), `contasReceberStore` (`@/features/financeiro/contas-receber-store`, já existe), `formatBRL` (`@/features/retaguarda/format`, já existe), `Badge` (`@/components/ui/badge`, já existe).
- Produces: nada consumido por outras tarefas deste plano.

Este arquivo é uma reescrita completa que preserva 100% do comportamento atual (busca por nome/documento, toggle "Mostrar inativos", paginação, `FormDialog` de criar/editar, `ConfirmDialog` de inativar, estados loading/erro/vazio) e adiciona: coluna "Tipo" (real), coluna "OS ativas" (real), coluna "Saldo" (real), célula "Cliente" com `LinhaEntidadeCell` (ícone por `tipo_pessoa`, subtítulo = cidade de exemplo).

- [ ] **Step 1: Substituir o conteúdo inteiro do arquivo**

```tsx
// src/features/clientes/components/clientes-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { StatusAtivo } from "@/shared/components/status-ativo";
import { LinhaEntidadeCell } from "@/shared/components/linha-entidade-cell";
import { formatDocumento, formatTelefone } from "@/shared/lib/format";
import { formatBRL } from "@/features/retaguarda/format";
import { idMockDoCliente } from "@/shared/lib/cliente-mock-id";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import { showcaseDoCliente } from "@/features/clientes/cliente-showcase-data";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import type { Cliente } from "@/shared/types";
import { cn } from "@/lib/utils";

const OPCOES_POR_PAGINA = [20, 50, 100] as const;

interface ClienteListView {
  cliente: Cliente;
  cidade: string;
  osAtivas: number;
  saldo: number;
}

export function ClientesPage() {
  const todos = clientesStore.useAll();
  const { isLoading, error } = clientesStore.useEstado();
  const retry = clientesStore.retry;
  const ordens = ordensStore.useTodas();
  const contas = contasReceberStore.useTodas();

  const [q, setQ] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [inativando, setInativando] = useState<Cliente | null>(null);
  const [itensPorPagina, setItensPorPagina] = useState<number>(OPCOES_POR_PAGINA[0]);
  const [pagina, setPagina] = useState(1);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    const soDigitos = termo.replace(/\D/g, "");
    return todos.filter((c) => {
      if (!mostrarInativos && !c.ativo) return false;
      if (!termo) return true;
      const nomeMatch = c.nome.toLowerCase().includes(termo);
      const docMatch = soDigitos.length > 0 && (c.documento?.includes(soDigitos) ?? false);
      return nomeMatch || docMatch;
    });
  }, [todos, q, mostrarInativos]);

  useEffect(() => {
    setPagina(1);
  }, [q, mostrarInativos, itensPorPagina]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const listaPaginada = useMemo(
    () => lista.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina),
    [lista, paginaAtual, itensPorPagina],
  );
  const inicioIntervalo = lista.length === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fimIntervalo = Math.min(paginaAtual * itensPorPagina, lista.length);

  const viewsPaginados: ClienteListView[] = useMemo(
    () =>
      listaPaginada.map((cliente) => {
        const idMock = idMockDoCliente(cliente.id);
        const osDoCliente = ordens.filter((o) => o.cliente_id === idMock);
        const contasDoCliente = contas.filter((c) => c.cliente_id === idMock);
        const osAtivas = osDoCliente.filter((o) => o.status !== "fechada").length;
        const saldo = contasDoCliente
          .filter((c) => c.status === "aberta")
          .reduce((s, c) => s + c.valor, 0);
        return {
          cliente,
          cidade: showcaseDoCliente(cliente.id).cadastrais.cidade,
          osAtivas,
          saldo,
        };
      }),
    [listaPaginada, ordens, contas],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (c: Cliente) => {
    setEditando(c);
    setFormAberto(true);
  };
  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await clientesStore.setAtivo(inativando.id, false);
      toast.success("Cliente inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o cliente${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(null);
  };
  const reativar = async (c: Cliente) => {
    try {
      await clientesStore.setAtivo(c.id, true);
      toast.success("Cliente reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o cliente${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const columns: Column<ClienteListView>[] = [
    {
      header: "Cliente",
      cell: ({ cliente, cidade }) => (
        <LinhaEntidadeCell
          variante="icone"
          icone={cliente.tipo_pessoa === "PJ" ? "lucide:building-2" : "lucide:user"}
          titulo={
            <Link
              to="/admin/clientes/$clienteId"
              params={{ clienteId: cliente.id }}
              className={cn(
                "hover:text-primary hover:underline",
                !cliente.ativo && "opacity-60",
              )}
            >
              {cliente.nome}
            </Link>
          }
          subtitulo={cidade}
        />
      ),
    },
    {
      header: "Tipo",
      cell: ({ cliente }) =>
        cliente.tipo_pessoa ? (
          <Badge variant="secondary">{cliente.tipo_pessoa}</Badge>
        ) : (
          <span className="text-foreground-faint">—</span>
        ),
    },
    {
      header: "Documento",
      className: "font-mono",
      cell: ({ cliente }) => formatDocumento(cliente.documento),
    },
    {
      header: "Telefone",
      className: "font-mono",
      cell: ({ cliente }) => formatTelefone(cliente.telefone),
    },
    {
      header: "OS ativas",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ osAtivas }) => osAtivas,
    },
    {
      header: "Saldo",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ saldo }) =>
        saldo > 0 ? (
          <span className="font-semibold text-destructive">{formatBRL(saldo)}</span>
        ) : (
          formatBRL(saldo)
        ),
    },
    { header: "Status", cell: ({ cliente }) => <StatusAtivo ativo={cliente.ativo} /> },
  ];

  const rowActions = ({ cliente }: ClienteListView) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(cliente)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {cliente.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(cliente)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(cliente)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (view: ClienteListView) => {
    const { cliente, cidade, osAtivas, saldo } = view;
    return (
      <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !cliente.ativo && "opacity-70")}>
        <div className="flex items-start justify-between gap-2">
          <LinhaEntidadeCell
            variante="icone"
            icone={cliente.tipo_pessoa === "PJ" ? "lucide:building-2" : "lucide:user"}
            titulo={
              <Link
                to="/admin/clientes/$clienteId"
                params={{ clienteId: cliente.id }}
                className="hover:text-primary hover:underline"
              >
                {cliente.nome}
              </Link>
            }
            subtitulo={cidade}
          />
          <StatusAtivo ativo={cliente.ativo} />
        </div>
        <dl className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Documento</dt>
            <dd className="font-mono text-foreground">{formatDocumento(cliente.documento)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Telefone</dt>
            <dd className="font-mono text-foreground">{formatTelefone(cliente.telefone)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">OS ativas</dt>
            <dd className="font-mono text-foreground">{osAtivas}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Saldo</dt>
            <dd
              className={cn(
                "font-mono",
                saldo > 0 ? "font-semibold text-destructive" : "text-foreground",
              )}
            >
              {formatBRL(saldo)}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-end">{rowActions(view)}</div>
      </div>
    );
  };

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
        data={viewsPaginados}
        columns={columns}
        getRowKey={(v) => v.cliente.id}
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

      {!isLoading && !error && lista.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Itens por página</span>
            <Select
              value={String(itensPorPagina)}
              onValueChange={(v) => setItensPorPagina(Number(v))}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCOES_POR_PAGINA.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>
              {inicioIntervalo}–{fimIntervalo} de {lista.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="gap-1.5"
            >
              <Icon icon="lucide:chevron-left" className="h-4 w-4" />
              Anterior
            </Button>
            <span className="font-mono text-xs">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="gap-1.5"
            >
              Próxima
              <Icon icon="lucide:chevron-right" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

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

- [ ] **Step 2: Checar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/clientes/components/clientes-page.tsx`
Expected: sem erros.

- [ ] **Step 3: Rodar a suíte de clientes (nenhum teste de página existia antes; confirmar que os testes de showcase/store/form da feature continuam verdes)**

Run: `npx vitest run src/features/clientes`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/clientes/components/clientes-page.tsx
git commit -m "feat: apply design system visual to ClientesPage with real OS ativas/Saldo columns"
```

---

### Task 9: Reescrever `operadores-page.tsx`

**Files:**
- Modify: `src/features/operadores/components/operadores-page.tsx`

**Interfaces:**
- Consumes: `LinhaEntidadeCell` (Task 2), `iniciais` exportada (Task 6), `showcaseDoOperador` (já existe, sem mudança de shape necessária para esta tarefa).
- Produces: nada consumido por outras tarefas deste plano.

Reescrita completa preservando 100% do comportamento atual (busca por nome, toggle "Mostrar inativos", `FormDialog`, `ConfirmDialog`, estados loading/erro/vazio — **sem paginação**, como hoje) e adicionando: célula "Operador" com `LinhaEntidadeCell` variante avatar + subtítulo "N OS ativas" (exemplo), colunas "Vínculo"/"Base"/"Horas (mês)"/"Acesso ao app" (exemplo, mesma fonte que a página de detalhe do mesmo operador).

- [ ] **Step 1: Substituir o conteúdo inteiro do arquivo**

```tsx
// src/features/operadores/components/operadores-page.tsx
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { LinhaEntidadeCell } from "@/shared/components/linha-entidade-cell";
import { formatDocumento, formatTelefone } from "@/shared/lib/format";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import { iniciais } from "@/features/operadores/components/operador-hero";
import { showcaseDoOperador } from "@/features/operadores/operador-showcase-data";
import type { Operador } from "@/shared/types";
import { cn } from "@/lib/utils";

interface OperadorListView {
  operador: Operador;
  iniciais: string;
  osAtivasLabel: string;
  vinculo: string;
  base: string;
  horasMes: string;
  acessoLiberado: boolean;
}

export function OperadoresPage() {
  const todos = operadoresStore.useAll();
  const { isLoading, error } = operadoresStore.useEstado();
  const retry = operadoresStore.retry;

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

  const views: OperadorListView[] = useMemo(
    () =>
      lista.map((operador) => {
        const showcase = showcaseDoOperador(operador.id);
        return {
          operador,
          iniciais: iniciais(operador.nome),
          osAtivasLabel: `${showcase.kpis.osAtivas.valor} OS ativas`,
          vinculo: showcase.cadastrais.vinculo,
          base: showcase.cadastrais.base,
          horasMes: showcase.kpis.horasApontadas.valor,
          acessoLiberado: showcase.acessoApp.liberado,
        };
      }),
    [lista],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (o: Operador) => {
    setEditando(o);
    setFormAberto(true);
  };
  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await operadoresStore.setAtivo(inativando.id, false);
      toast.success("Operador inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(null);
  };
  const reativar = async (o: Operador) => {
    try {
      await operadoresStore.setAtivo(o.id, true);
      toast.success("Operador reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const columns: Column<OperadorListView>[] = [
    {
      header: "Operador",
      cell: ({ operador, iniciais: init, osAtivasLabel }) => (
        <LinhaEntidadeCell
          variante="avatar"
          iniciais={init}
          titulo={
            <Link
              to="/admin/operadores/$operadorId"
              params={{ operadorId: operador.id }}
              className={cn(
                "hover:text-primary hover:underline",
                !operador.ativo && "opacity-60",
              )}
            >
              {operador.nome}
            </Link>
          }
          subtitulo={osAtivasLabel}
        />
      ),
    },
    { header: "Vínculo", cell: ({ vinculo }) => <Badge variant="secondary">{vinculo}</Badge> },
    { header: "Base", cell: ({ base }) => base },
    {
      header: "Horas (mês)",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ horasMes }) => horasMes,
    },
    {
      header: "Acesso ao app",
      cell: ({ acessoLiberado }) => (
        <Badge variant={acessoLiberado ? "default" : "secondary"}>
          {acessoLiberado ? "Liberado" : "Sem acesso"}
        </Badge>
      ),
    },
    { header: "Status", cell: ({ operador }) => <StatusAtivo ativo={operador.ativo} /> },
  ];

  const rowActions = ({ operador }: OperadorListView) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(operador)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {operador.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(operador)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(operador)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (view: OperadorListView) => {
    const { operador, iniciais: init, osAtivasLabel, vinculo, base, horasMes, acessoLiberado } = view;
    return (
      <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !operador.ativo && "opacity-70")}>
        <div className="flex items-start justify-between gap-2">
          <LinhaEntidadeCell
            variante="avatar"
            iniciais={init}
            titulo={
              <Link
                to="/admin/operadores/$operadorId"
                params={{ operadorId: operador.id }}
                className="hover:text-primary hover:underline"
              >
                {operador.nome}
              </Link>
            }
            subtitulo={osAtivasLabel}
          />
          <StatusAtivo ativo={operador.ativo} />
        </div>
        <dl className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">CPF</dt>
            <dd className="font-mono text-foreground">{formatDocumento(operador.cpf)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Telefone</dt>
            <dd className="font-mono text-foreground">{formatTelefone(operador.telefone)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Vínculo</dt>
            <dd className="text-foreground">{vinculo}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Base</dt>
            <dd className="text-foreground">{base}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Horas (mês)</dt>
            <dd className="font-mono text-foreground">{horasMes}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Acesso ao app</dt>
            <dd className="text-foreground">{acessoLiberado ? "Liberado" : "Sem acesso"}</dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-end">{rowActions(view)}</div>
      </div>
    );
  };

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
        data={views}
        columns={columns}
        getRowKey={(v) => v.operador.id}
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

- [ ] **Step 2: Checar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/operadores/components/operadores-page.tsx`
Expected: sem erros.

- [ ] **Step 3: Rodar a suíte de operadores**

Run: `npx vitest run src/features/operadores`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/operadores/components/operadores-page.tsx
git commit -m "feat: apply design system visual to OperadoresPage with showcase columns"
```

---

### Task 10: Reescrever `equipamentos-page.tsx`

**Files:**
- Modify: `src/features/equipamentos/components/equipamentos-page.tsx`

**Interfaces:**
- Consumes: `FiltroChips`/`FiltroChipItem` (Task 1), `LinhaEntidadeCell` (Task 2), `showcaseDoEquipamento` com `dieselMedioLh` (Task 4), `resumoProximaManutencao` (Task 5), `TIPO_ICONE` (Task 7).
- Produces: nada consumido por outras tarefas deste plano.

Reescrita completa preservando 100% do comportamento atual (busca, `Select` de Tipo, toggle "Mostrar inativos", `FormDialog`, `ConfirmDialog`, estados loading/erro/vazio, **sem paginação**) e trocando o `Select` de Status por `FiltroChips`, adicionando colunas "Horas (mês)"/"Diesel médio" (exemplo) e "Próx. manutenção" (real).

- [ ] **Step 1: Substituir o conteúdo inteiro do arquivo**

```tsx
// src/features/equipamentos/components/equipamentos-page.tsx
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { LinhaEntidadeCell } from "@/shared/components/linha-entidade-cell";
import { FiltroChips, type FiltroChipItem } from "@/shared/components/filtro-chips";
import { formatHorimetro } from "@/shared/lib/format";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import {
  EquipamentoStatusBadge,
  InativoBadge,
  TIPOS,
  TIPO_LABEL,
  TIPO_ICONE,
  STATUS,
  STATUS_LABEL,
} from "@/features/equipamentos/labels";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";
import { showcaseDoEquipamento } from "@/features/equipamentos/equipamento-showcase-data";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { resumoProximaManutencao } from "@/features/manutencao/derivacoes";
import type { Equipamento, EquipamentoStatus, TipoEquipamento } from "@/shared/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<EquipamentoStatus, "neutral" | "success" | "warn"> = {
  disponivel: "neutral",
  em_uso: "success",
  manutencao: "warn",
};

const STATUS_FILTRO_ITENS: FiltroChipItem[] = [
  { id: "todos", label: "Todos" },
  ...STATUS.map((s) => ({ id: s, label: STATUS_LABEL[s], tone: STATUS_TONE[s] })),
];

interface EquipamentoListView {
  equipamento: Equipamento;
  horasMes: string;
  dieselMedio: string;
  manutencaoTexto: string;
  manutencaoVencida: boolean;
}

export function EquipamentosPage() {
  const todos = equipamentosStore.useAll();
  const { isLoading, error } = equipamentosStore.useEstado();
  const retry = equipamentosStore.retry;
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();

  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<EquipamentoStatus | "todos">("todos");
  const [mostrarInativos, setMostrarInativos] = useState(true);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Equipamento | null>(null);
  const [inativando, setInativando] = useState<Equipamento | null>(null);

  // Filtro sem o Status ainda aplicado — usado para as contagens dos chips,
  // assim trocar de chip não muda a contagem dos outros chips.
  const listaAntesDoStatus = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((e) => {
      if (!mostrarInativos && !e.ativo) return false;
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        (e.identificador?.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroTipo, mostrarInativos]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: listaAntesDoStatus.length };
    for (const s of STATUS) counts[s] = 0;
    for (const e of listaAntesDoStatus) {
      if (e.ativo) counts[e.status] = (counts[e.status] ?? 0) + 1;
    }
    return counts;
  }, [listaAntesDoStatus]);

  const lista = useMemo(() => {
    // Status operacional só se aplica a equipamentos ativos (inativos exibem
    // o badge "Inativo", não o status), então um filtro de status específico
    // implica ativo + status correspondente.
    if (filtroStatus === "todos") return listaAntesDoStatus;
    return listaAntesDoStatus.filter((e) => e.ativo && e.status === filtroStatus);
  }, [listaAntesDoStatus, filtroStatus]);

  const views: EquipamentoListView[] = useMemo(
    () =>
      lista.map((equipamento) => {
        const showcase = showcaseDoEquipamento(equipamento.id);
        const resumo = resumoProximaManutencao(equipamento, planos, registros);
        const manutencaoVencida = resumo?.status === "vencida";
        const manutencaoTexto = !resumo
          ? "—"
          : manutencaoVencida
            ? "vencida"
            : `em ${formatHorimetro(resumo.restantes)}`;
        return {
          equipamento,
          horasMes: showcase.kpis.horasMes.valor,
          dieselMedio: showcase.dieselMedioLh,
          manutencaoTexto,
          manutencaoVencida,
        };
      }),
    [lista, planos, registros],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (e: Equipamento) => {
    setEditando(e);
    setFormAberto(true);
  };

  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await equipamentosStore.setAtivo(inativando.id, false);
      toast.success("Equipamento inativado.");
    } catch (err) {
      toast.error(
        `Falha ao inativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
    setInativando(null);
  };
  const reativar = async (e: Equipamento) => {
    try {
      await equipamentosStore.setAtivo(e.id, true);
      toast.success("Equipamento reativado.");
    } catch (err) {
      toast.error(
        `Falha ao reativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
  };

  const columns: Column<EquipamentoListView>[] = [
    {
      header: "Equipamento",
      cell: ({ equipamento }) => (
        <LinhaEntidadeCell
          variante="icone"
          icone={TIPO_ICONE[equipamento.tipo]}
          titulo={
            <Link
              to="/admin/equipamentos/$equipamentoId"
              params={{ equipamentoId: equipamento.id }}
              className={cn(
                "hover:text-primary hover:underline",
                !equipamento.ativo && "opacity-60",
              )}
            >
              {equipamento.nome}
            </Link>
          }
          subtitulo={equipamento.identificador ?? "sem identificador"}
        />
      ),
    },
    { header: "Tipo", cell: ({ equipamento }) => TIPO_LABEL[equipamento.tipo] },
    { header: "Capacidade", cell: ({ equipamento }) => equipamento.capacidade },
    {
      header: "Horímetro",
      className: "font-mono",
      cell: ({ equipamento }) => formatHorimetro(equipamento.horimetro_atual),
    },
    {
      header: "Horas (mês)",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ horasMes }) => horasMes,
    },
    {
      header: "Diesel médio",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ dieselMedio }) => dieselMedio,
    },
    {
      header: "Próx. manutenção",
      cell: ({ manutencaoTexto, manutencaoVencida }) => (
        <span className={manutencaoVencida ? "font-semibold text-destructive" : "text-foreground"}>
          {manutencaoTexto}
        </span>
      ),
    },
    {
      header: "Status",
      cell: ({ equipamento }) =>
        equipamento.ativo ? (
          <EquipamentoStatusBadge status={equipamento.status} />
        ) : (
          <InativoBadge />
        ),
    },
  ];

  const rowActions = ({ equipamento }: EquipamentoListView) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(equipamento)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {equipamento.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(equipamento)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(equipamento)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (view: EquipamentoListView) => {
    const { equipamento, horasMes, dieselMedio, manutencaoTexto, manutencaoVencida } = view;
    return (
      <div
        className={cn("rounded-xl border bg-card p-4 shadow-sm", !equipamento.ativo && "opacity-70")}
      >
        <div className="flex items-start justify-between gap-2">
          <LinhaEntidadeCell
            variante="icone"
            icone={TIPO_ICONE[equipamento.tipo]}
            titulo={
              <Link
                to="/admin/equipamentos/$equipamentoId"
                params={{ equipamentoId: equipamento.id }}
                className="hover:text-primary hover:underline"
              >
                {equipamento.nome}
              </Link>
            }
            subtitulo={equipamento.identificador ?? "sem identificador"}
          />
          {equipamento.ativo ? (
            <EquipamentoStatusBadge status={equipamento.status} />
          ) : (
            <InativoBadge />
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-foreground-faint">Tipo</dt>
            <dd className="text-foreground">{TIPO_LABEL[equipamento.tipo]}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Capacidade</dt>
            <dd className="text-foreground">{equipamento.capacidade}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Horímetro</dt>
            <dd className="font-mono text-foreground">
              {formatHorimetro(equipamento.horimetro_atual)}
            </dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Horas (mês)</dt>
            <dd className="font-mono text-foreground">{horasMes}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Diesel médio</dt>
            <dd className="font-mono text-foreground">{dieselMedio}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Próx. manutenção</dt>
            <dd className={cn("font-mono", manutencaoVencida ? "font-semibold text-destructive" : "text-foreground")}>
              {manutencaoTexto}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-end">{rowActions(view)}</div>
      </div>
    );
  };

  const toolbar = (
    <div className="flex flex-col gap-2.5">
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
        <Select
          value={filtroTipo}
          onValueChange={(v) => setFiltroTipo(v as TipoEquipamento | "todos")}
        >
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
        <Button
          variant={mostrarInativos ? "secondary" : "outline"}
          onClick={() => setMostrarInativos((v) => !v)}
          className="gap-1.5"
        >
          <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
          Inativos
        </Button>
      </div>
      <FiltroChips
        itens={STATUS_FILTRO_ITENS}
        ativo={filtroStatus}
        onChange={(id) => setFiltroStatus(id as EquipamentoStatus | "todos")}
        counts={statusCounts}
      />
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
        data={views}
        columns={columns}
        getRowKey={(v) => v.equipamento.id}
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

- [ ] **Step 2: Checar tipos e lint**

Run: `npx tsc --noEmit && npx eslint src/features/equipamentos/components/equipamentos-page.tsx`
Expected: sem erros.

- [ ] **Step 3: Rodar a suíte de equipamentos e manutenção**

Run: `npx vitest run src/features/equipamentos src/features/manutencao`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/equipamentos/components/equipamentos-page.tsx
git commit -m "feat: apply design system visual to EquipamentosPage with FiltroChips and real Próx. manutenção column"
```

---

### Task 11: Higiene final

**Files:** nenhum (só verificação).

- [ ] **Step 1: Type-check completo**

Run: `npx tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 2: Lint completo com auto-fix**

Run: `npx eslint . --fix`
Expected: 0 erros restantes (avisos de formatação são corrigidos pelo `--fix`).

- [ ] **Step 3: Suíte de testes completa**

Run: `npx vitest run`
Expected: 100% dos testes passando (suíte pré-existente + os novos desta rodada).

- [ ] **Step 4: Descartar `package-lock.json` se `npx` o modificou (efeito colateral conhecido, não faz parte da mudança)**

Run: `git status --short`
Se `package-lock.json` aparecer modificado sem relação com dependências novas, descartar: `git checkout -- package-lock.json`.

- [ ] **Step 5: Commit final (se `eslint --fix` mudou algo)**

```bash
git add -A
git commit -m "chore: lint and type-check pass for cadastros list visual refactor"
```

(Se `eslint --fix` não alterou nada, pular este commit — não criar commit vazio.)

- [ ] **Step 6: Nota para o usuário**

Verificação visual manual (light/dark, 375/768/1280px) em `/admin/clientes`, `/admin/operadores`, `/admin/equipamentos` é responsabilidade do usuário — não delegar a um subagent.
