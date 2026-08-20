# PRD-014: Rentabilidade por Equipamento e Obra — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the retaguarda-only analytical panel at `/admin/rentabilidade` that cruzes receita (PRD-004, Faturamento) com custo (PRD-013, `custoHoraEquipamento`) em dois recortes — **por equipamento** e **por obra/OS** — com margem em R$ e %, ranking, filtro por período e detalhe de composição.

**Architecture:** Tudo é **derivado** (nunca persistido — mirrors PRD-013's contract/derived separation). Um novo módulo `src/features/rentabilidade/derivacoes.ts` cruza os mocks já existentes (`equipamentos`, `apontamentos`, `faturamentos`, `ordensServico`, `componentesCusto`, `abastecimentos`, `registrosManutencao`, `precosHoraMaquina`) reaproveitando `custoHoraEquipamento` (PRD-013) para custo e os itens de `Faturamento` (PRD-004) para receita. Um pequeno refactor extrai o seletor de mês (hoje vivendo em `custo-hora`) para `src/shared/` porque agora duas features precisam dele. 4 novos registros mock (aditivos, não destrutivos) fecham os dois cenários de erro exigidos pelo PRD (equipamento com receita mas custo incompleto; obra com prejuízo) usando dados já reais sempre que possível.

**Tech Stack:** React + TypeScript + TanStack Router + Tailwind + shadcn/ui + recharts (já é dependência do projeto).

## Global Constraints

- **Retaguarda apenas** (RF-009/RNF-002): `src/features/rentabilidade/` **nunca** é importado por `src/features/operador/` nem por qualquer rota `/app/*`. Verificar com grep antes de fechar (Task 4).
- **Nomenclatura de interfaces sem prefixo `I`** (CLAUDE.md do repo): o PRD usa `IRentabilidadeEquipamento`/`IRentabilidadeObra` no trecho ilustrativo, mas o código usa `RentabilidadeEquipamento`/`RentabilidadeObra` (sem prefixo), seguindo a convenção já corrigida no repo (commit "fix: interface naming convention to drop stale I prefix").
- **Derivar, não duplicar**: reaproveitar `custoHoraEquipamento`/`custoHoraPorEquipamento` (`@/features/custo-hora/derivacoes`), `round2` (`@/features/faturamento/calculo`), `KpiCard` (`@/features/dashboard/components/kpi-card`), `EmptyState`/`PageHeader` (`@/shared/components`), `useMockResource` (`@/shared/hooks/use-mock-resource`), `formatBRL`/`formatHorimetro` (`@/features/retaguarda/format`, `@/shared/lib/format`). Não recalcular custo/hora do zero.
- **Nada é persistido**: `RentabilidadeEquipamento`/`RentabilidadeObra` moram em `src/features/rentabilidade/derivacoes.ts` (não em `src/shared/types/index.ts`) — mesma separação contrato-vs-derivado do PRD-013.
- **Regra de receita (resolve a "Decisão Pendente" de regime de caixa × competência)**: receita conta **qualquer** `Faturamento` existente para a OS (`status` "rascunho" **ou** "faturado") — o rascunho já reflete o valor calculado por `gerarItens` (PRD-004); só o "recebido" (PRD-007, `ContaReceber.status === "liquidada"`) fica de fora, pois PRD-014 depende de PRD-004, não de PRD-007. Cada `Faturamento` pertence ao mês (`"YYYY-MM"`) de seu campo `gerado_em` (sempre presente; `faturado_em` é `null` em rascunho, por isso não serve como chave de período).
- **Regra de atribuição de receita por equipamento (resolve a "Decisão Pendente" de rateio)**: usa a atribuição **exata** que já existe em `FaturamentoItem.origem_id` — cada item `tipo: "hora_maquina"` já nasce escopado a um único equipamento (`gerarItens` em PRD-004 já agrupa por equipamento+modalidade). Não há rateio proporcional a inventar. Itens `por_metro` e `mobilizacao` não têm `origem_id` de equipamento — por isso não contribuem para a receita **por equipamento** (só para a receita **por obra**, que soma `Faturamento.valor_total` inteiro). Isso é uma limitação estrutural conhecida e documentada, não um bug.
- **Regra de custo por obra**: para cada equipamento que trabalhou na OS (via `Apontamento.os_id`, `status === "finalizado"`, qualquer data — obras deste domínio são serviços curtos, tipicamente concluídos dentro do próprio mês), toma-se o `custo_por_hora` da COMPANHIA para aquele equipamento no período selecionado (via `custoHoraEquipamento`, mesma função do PRD-013 — não uma taxa "só daquela obra") × horas que aquele equipamento especificamente trabalhou **naquela OS**. Se `custo_por_hora` for `null` (sem horas no período) ou o equipamento estiver com `configuracao_incompleta`, a obra inteira é marcada `custo_incompleto: true` (margem não confiável) e a contribuição de custo daquele equipamento entra como `0`.
- **Mobilização não tem custo modelado**: `Faturamento.valor_total` (usado como receita da obra) inclui itens `mobilizacao`, mas PRD-013 não modela custo de mobilização/deslocamento — logo mobilização é margem "pura" neste MVP. Simplificação conhecida, dentro do escopo (PRD-014 só cruza com o que PRD-013 já modela).
- **Percentuais**: `margem_percentual` é `number | null` — `null` quando `receita === 0` (RNF: "evitar percentuais quebrados"). Nunca `NaN`/`Infinity`.
- **Arredondamento**: toda soma em R$ passa por `round2` (centavos). `margem_percentual` fica em fração crua (ex.: `0.707`), formatada como `%` só na UI.
- **Sem novo equipamento nos mocks**: o teste `custoHoraPorEquipamento` (PRD-013) trava `toHaveLength(7)` — não adicionar equipamentos. Os únicos dois "livres" para novas horas/preço sem quebrar teste existente são `eq-006` e `eq-007` (nenhum tem asserção exata de `custo_por_hora`/horas travada); `eq-001/002/003/004/005` têm valores exatos travados em `src/features/custo-hora/derivacoes.test.ts` e `src/features/faturamento/calculo.test.ts` — não tocar horas, preços ou componentes desses cinco.

---

### Task 1: Refactor do seletor de mês + contrato/mocks/cálculo de rentabilidade

**Files:**
- Move: `src/features/custo-hora/periodo-mensal.ts` → `src/shared/lib/periodo-mensal.ts`
- Move: `src/features/custo-hora/periodo-mensal.test.ts` → `src/shared/lib/periodo-mensal.test.ts`
- Move: `src/features/custo-hora/components/seletor-mes.tsx` → `src/shared/components/seletor-mes.tsx`
- Modify: `src/features/custo-hora/components/custo-hora-page.tsx` (atualizar 2 imports)
- Modify: `src/features/custo-hora/components/detalhamento-custo-dialog.tsx` (atualizar 1 import)
- Modify: `src/mocks/precos-hora-maquina.ts` (adicionar `phm-006`)
- Modify: `src/mocks/ordens-servico.ts` (adicionar `os-011`)
- Modify: `src/mocks/apontamentos.ts` (adicionar `ap-013`)
- Modify: `src/mocks/faturamentos.ts` (adicionar `fat-008`)
- Create: `src/features/rentabilidade/derivacoes.ts`
- Create: `src/features/rentabilidade/derivacoes.test.ts`
- Create: `src/features/rentabilidade/format.ts`

**Interfaces:**
- Consumes: `custoHoraEquipamento(equipamento, periodo, componentes, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina): CustoHoraEquipamento` e o tipo `DetalheItemCusto` (ambos de `@/features/custo-hora/derivacoes`); `round2(reais: number): number` de `@/features/faturamento/calculo`.
- Produces (para Tasks 2/3/4):
  - `RentabilidadeEquipamento`, `ComposicaoReceita`, `rentabilidadePorEquipamento(...)`, `rentabilidadePorTodosEquipamentos(...)` — de `@/features/rentabilidade/derivacoes`.
  - `RentabilidadeObra`, `ComposicaoCustoObra`, `rentabilidadePorObra(...)`, `rentabilidadePorTodasAsObras(...)` — de `@/features/rentabilidade/derivacoes`.
  - `formatPercentual(v: number | null): string` — de `@/features/rentabilidade/format`.
  - `SeletorMes` (mesma API: `{ periodo, onChange, maximo }`) — de `@/shared/components/seletor-mes`.
  - `mesReferencia, mesAnterior, proximoMes, rotuloMes` — de `@/shared/lib/periodo-mensal`.

#### Passo 1: Mover o seletor de mês para `shared/`

O componente `SeletorMes` e as funções de `periodo-mensal.ts` hoje moram em `src/features/custo-hora/`, mas a partir desta task **duas** features (`custo-hora` e `rentabilidade`) precisam do mesmo seletor de mês. Seguindo a convenção de pastas do repo (`src/shared/` para o que é usado por mais de uma feature), mova os arquivos.

- [ ] Mover o conteúdo de `src/features/custo-hora/periodo-mensal.ts` para um novo arquivo `src/shared/lib/periodo-mensal.ts` (conteúdo idêntico, só o caminho muda):

```typescript
// Mês de referência do painel de custo/hora e de rentabilidade — formato
// "YYYY-MM". Distinto do PeriodoDashboard (hoje/semana/mês relativo, PRD-015):
// custos fixos são mensais por natureza, então aqui o período é sempre um mês
// de competência.

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

- [ ] Deletar o arquivo antigo `src/features/custo-hora/periodo-mensal.ts`.

- [ ] Mover `src/features/custo-hora/periodo-mensal.test.ts` para `src/shared/lib/periodo-mensal.test.ts`, trocando só o import (o conteúdo dos testes é idêntico):

```typescript
import { describe, it, expect } from "vitest";
import {
  mesReferencia,
  mesAnterior,
  proximoMes,
  rotuloMes,
} from "@/shared/lib/periodo-mensal";

describe("shared/lib/periodo-mensal", () => {
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

- [ ] Deletar o arquivo antigo `src/features/custo-hora/periodo-mensal.test.ts`.

- [ ] Mover `src/features/custo-hora/components/seletor-mes.tsx` para `src/shared/components/seletor-mes.tsx`, trocando só o import interno (o resto é idêntico):

```typescript
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mesAnterior, proximoMes, rotuloMes } from "@/shared/lib/periodo-mensal";

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

- [ ] Deletar o arquivo antigo `src/features/custo-hora/components/seletor-mes.tsx`.

- [ ] Em `src/features/custo-hora/components/custo-hora-page.tsx`, trocar os dois imports que apontavam para os arquivos movidos:

```typescript
// Antes:
import { SeletorMes } from "@/features/custo-hora/components/seletor-mes";
// ...
import { mesReferencia, mesAnterior } from "@/features/custo-hora/periodo-mensal";

// Depois:
import { SeletorMes } from "@/shared/components/seletor-mes";
// ...
import { mesReferencia, mesAnterior } from "@/shared/lib/periodo-mensal";
```

O resto do arquivo (`CustoHoraPage`) fica **idêntico**.

- [ ] Em `src/features/custo-hora/components/detalhamento-custo-dialog.tsx`, trocar o import de `rotuloMes`:

```typescript
// Antes:
import { rotuloMes } from "@/features/custo-hora/periodo-mensal";

// Depois:
import { rotuloMes } from "@/shared/lib/periodo-mensal";
```

O resto do arquivo (`DetalhamentoCustoDialog`) fica **idêntico**.

- [ ] Rodar `npx vitest run src/shared/lib/periodo-mensal.test.ts src/features/custo-hora` — todos os testes de custo-hora (36 testes, conta exata pode variar levemente, verificar que continuam **todos passando**) e os 7 testes de `periodo-mensal.test.ts` (agora em `shared/lib/`) devem passar sem alteração de comportamento.

- [ ] Rodar `npx tsc --noEmit` — não deve haver nenhum import quebrado apontando para os caminhos antigos (`@/features/custo-hora/periodo-mensal` ou `@/features/custo-hora/components/seletor-mes`).

- [ ] Commit:

```bash
git add src/shared/lib/periodo-mensal.ts src/shared/lib/periodo-mensal.test.ts src/shared/components/seletor-mes.tsx src/features/custo-hora/components/custo-hora-page.tsx src/features/custo-hora/components/detalhamento-custo-dialog.tsx
git rm src/features/custo-hora/periodo-mensal.ts src/features/custo-hora/periodo-mensal.test.ts src/features/custo-hora/components/seletor-mes.tsx
git commit -m "refactor: move month-period selector to shared (reused by rentabilidade)"
```

#### Passo 2: Novos registros de mock (aditivos — não alterar nenhum registro existente)

O PRD exige dois cenários de erro obrigatórios: (a) "equipamento com receita mas sem custo configurado" e (b) "obra com prejuízo". O cenário (b) **já ocorre naturalmente** com os dados mock atuais (obra `os-008`, que usa o caminhão-caçamba `eq-005` sem preço ativo — ver Task 1 Passo 3). O cenário (a) não existe ainda: nenhum equipamento com "configuração de custo incompleta" (`eq-003`, `eq-004` e `eq-007` — nenhum tem `ComponenteCusto` ativo) tem receita atribuída via `FaturamentoItem` no período. `eq-003` e `eq-004` estão travados por testes exatos existentes (não podem ganhar novas horas/preço); `eq-007` está livre. Este passo dá a `eq-007` uma OS faturada, fechando o cenário (a) com dados 100% aditivos.

- [ ] Em `src/mocks/precos-hora-maquina.ts`, adicionar um novo preço específico para `eq-007` (Retroescavadeira — hoje sem nenhum preço, nem por equipamento nem por tipo) ao final do array `precosHoraMaquina`:

```typescript
  {
    id: "phm-006",
    equipamento_id: "eq-007",
    tipo_equipamento: null,
    valor_hora_seca: 210,
    valor_hora_operada: 260,
    ativo: true,
    created_at: "2026-06-28T12:00:00.000Z",
    updated_at: "2026-06-28T12:00:00.000Z",
  },
```

  Atualizar o comentário do topo do arquivo de `// ~5 preços...` para `// ~6 preços...` mencionando o novo registro (`phm-006`, eq-007, cobre um equipamento que antes não tinha preço nenhum — usado pelo PRD-014 para o cenário "receita com custo incompleto").

- [ ] Em `src/mocks/ordens-servico.ts`, adicionar uma nova OS fechada (hora_maquina) ao final do array `ordensServico`:

```typescript
  {
    id: "os-011",
    numero: "OS-2026-0049",
    cliente_id: "cl-003",
    obra_nome: "Escavação de vala — rede pluvial",
    endereco: "Rua Sete de Setembro, 450, centro",
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-002",
    observacao: "Serviço pontual com a retroescavadeira.",
    diametro_broca_mm: null,
    aberta_em: "2026-06-29T07:00:00.000Z",
    fechada_em: "2026-06-29T12:30:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-29T07:00:00.000Z",
    updated_at: "2026-06-29T12:30:00.000Z",
  },
```

  Atualizar o comentário do topo do arquivo mencionando `os-011` (fechada, usa eq-007, alimenta o PRD-014).

- [ ] Em `src/mocks/apontamentos.ts`, adicionar um novo apontamento finalizado ao final do array `apontamentos`:

```typescript
  {
    id: "ap-013",
    equipamento_id: "eq-007",
    operador_id: "op-002",
    os_id: "os-011",
    horimetro_inicial: 9890,
    horimetro_final: 9896,
    horas_trabalhadas: 6,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: "Escavação de vala para rede pluvial.",
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-29T07:00:00.000Z",
    finalizado_em: "2026-06-29T12:00:00.000Z",
    created_at: "2026-06-29T07:00:00.000Z",
    updated_at: "2026-06-29T12:00:00.000Z",
  },
```

  Atualizar o comentário do topo do arquivo mencionando `ap-013` (eq-007, os-011, para o PRD-014).

- [ ] Em `src/mocks/faturamentos.ts`, adicionar um novo faturamento confirmado ao final do array `faturamentos`. **Atenção:** os ids `fat-005`, `fat-006` e `fat-007` já são usados como referências "futuras" em `src/mocks/contas-receber.ts` (não existem em `faturamentos.ts`, mas estão reservados) — por isso este novo registro usa `fat-008`:

```typescript
  {
    id: "fat-008",
    numero: "FAT-2026-0005",
    os_id: "os-011",
    cliente_id: "cl-003",
    modelo_cobranca: "hora_maquina",
    itens: [
      {
        id: "fat-008:eq-007",
        tipo: "hora_maquina",
        descricao:
          "Retroescavadeira JCB 3CX para serviços de fundação, vala e nivelamento fino em terreno urbano — 6 h operada",
        origem_id: "eq-007",
        hora_tipo: "operada",
        quantidade: 6,
        valor_unitario: 260,
        valor_total: 1560,
        sem_preco: false,
      },
    ],
    desconto: 0,
    valor_total: 1560,
    observacao: null,
    status: "faturado",
    gerado_em: "2026-06-29T13:00:00.000Z",
    faturado_em: "2026-06-29T14:00:00.000Z",
    created_at: "2026-06-29T13:00:00.000Z",
    updated_at: "2026-06-29T14:00:00.000Z",
  },
```

  Atualizar o comentário do topo do arquivo mencionando `fat-008` (os-011, eq-007, edge case do PRD-014: equipamento com receita faturada mas configuração de custo incompleta). **Não usar `fat-005`, `fat-006` ou `fat-007`** — esses ids são reservados por `contas-receber.ts`.

- [ ] Rodar `npx vitest run src/mocks` — todos os testes de mock (`precos.test.ts`, `ordens-servico.test.ts`, `apontamentos.test.ts`, `faturamentos.test.ts`, `contas-receber.test.ts`, `componentes-custo.test.ts` etc.) devem continuar passando **sem nenhuma alteração** nesses arquivos de teste (os 4 novos registros são compatíveis com todas as invariantes existentes — FK válida, `valor_total` bate com `calcularValorTotal`, item `hora_maquina` bate com soma de horas dos apontamentos da OS, numeração única).

- [ ] Rodar `npx vitest run src/features/custo-hora src/features/faturamento` — confirmar que **nenhum** teste existente muda de resultado (em especial `src/features/custo-hora/derivacoes.test.ts`, que não referencia `eq-007` em nenhuma asserção exata, e `src/features/faturamento/calculo.test.ts`, que trava `eq-003`/`eq-005` mas não `eq-007`).

- [ ] Commit:

```bash
git add src/mocks/precos-hora-maquina.ts src/mocks/ordens-servico.ts src/mocks/apontamentos.ts src/mocks/faturamentos.ts
git commit -m "feat: add eq-007 priced OS/apontamento/faturamento for rentabilidade edge case"
```

#### Passo 3: Contrato e cálculo de rentabilidade

- [ ] Criar `src/features/rentabilidade/format.ts`:

```typescript
// Formata margem_percentual (fração crua, ex.: 0.707) como "70.7%". Retorna
// "—" quando null (receita zero — ver Global Constraints).
export function formatPercentual(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}
```

- [ ] Criar `src/features/rentabilidade/derivacoes.ts`:

```typescript
import { custoHoraEquipamento } from "@/features/custo-hora/derivacoes";
import type { DetalheItemCusto } from "@/features/custo-hora/derivacoes";
import { round2 } from "@/features/faturamento/calculo";
import type {
  Abastecimento,
  Apontamento,
  ComponenteCusto,
  Equipamento,
  Faturamento,
  OrdemServico,
  PrecoHoraMaquina,
  RegistroManutencao,
} from "@/shared/types";

// Rentabilidade cruza receita (PRD-004, Faturamento) com custo (PRD-013,
// custoHoraEquipamento) em dois recortes — equipamento e obra/OS. Topo da
// pirâmide analítica: nunca persistido, sempre recalculado (PRD-014).
//
// Receita conta QUALQUER Faturamento existente para a OS (rascunho ou
// faturado) — o rascunho já reflete o valor calculado por gerarItens
// (PRD-004); só o "recebido" (PRD-007) fica de fora, pois PRD-014 depende de
// PRD-004, não de PRD-007. O período de um Faturamento, para este recorte, é
// o mês de `gerado_em` (todo Faturamento tem essa data; `faturado_em` é null
// em rascunho, por isso não serve de chave de período).

export interface ComposicaoReceita {
  faturamento_id: string;
  faturamento_numero: string;
  os_id: string;
  valor: number;
}

export interface RentabilidadeEquipamento {
  equipamento_id: string;
  periodo: string; // "YYYY-MM"
  horas_trabalhadas: number;
  receita: number;
  custo: number;
  margem: number;
  margem_percentual: number | null; // null quando receita === 0 (evita percentual quebrado)
  custo_incompleto: boolean; // propagado de CustoHoraEquipamento.configuracao_incompleta
  composicao_receita: ComposicaoReceita[];
  detalhamento_custo: DetalheItemCusto[];
}

export interface ComposicaoCustoObra {
  equipamento_id: string;
  horas: number;
  custo_por_hora: number | null;
  custo: number;
}

export interface RentabilidadeObra {
  os_id: string;
  os_numero: string;
  cliente_id: string;
  periodo: string; // mês de gerado_em do(s) faturamento(s) desta obra
  receita: number;
  custo: number;
  margem: number;
  margem_percentual: number | null;
  custo_incompleto: boolean; // true se algum equipamento envolvido tiver configuração de custo incompleta (ou sem horas no período)
  composicao_receita: ComposicaoReceita[];
  composicao_custo: ComposicaoCustoObra[];
}

function periodoDoFaturamento(f: Faturamento): string {
  return f.gerado_em.slice(0, 7);
}

function horasDoEquipamentoNaOS(
  apontamentos: Apontamento[],
  equipamentoId: string,
  osId: string,
): number {
  const finalizados = apontamentos.filter(
    (a) =>
      a.os_id === osId &&
      a.equipamento_id === equipamentoId &&
      a.status === "finalizado" &&
      a.horas_trabalhadas != null,
  );
  return round2(finalizados.reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0));
}

export function rentabilidadePorEquipamento(
  equipamento: Equipamento,
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  faturamentos: Faturamento[],
): RentabilidadeEquipamento {
  const custo = custoHoraEquipamento(
    equipamento,
    periodo,
    componentes,
    abastecimentos,
    registrosManutencao,
    apontamentos,
    precosHoraMaquina,
  );

  const composicaoReceita: ComposicaoReceita[] = [];
  for (const f of faturamentos) {
    if (periodoDoFaturamento(f) !== periodo) continue;
    for (const item of f.itens) {
      if (item.tipo !== "hora_maquina" || item.origem_id !== equipamento.id) continue;
      composicaoReceita.push({
        faturamento_id: f.id,
        faturamento_numero: f.numero,
        os_id: f.os_id,
        valor: item.valor_total,
      });
    }
  }
  const receita = round2(composicaoReceita.reduce((soma, c) => soma + c.valor, 0));
  const margem = round2(receita - custo.custo_total);

  return {
    equipamento_id: equipamento.id,
    periodo,
    horas_trabalhadas: custo.horas_trabalhadas,
    receita,
    custo: custo.custo_total,
    margem,
    margem_percentual: receita > 0 ? margem / receita : null,
    custo_incompleto: custo.configuracao_incompleta,
    composicao_receita: composicaoReceita,
    detalhamento_custo: custo.detalhamento,
  };
}

export function rentabilidadePorTodosEquipamentos(
  equipamentos: Equipamento[],
  periodo: string,
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
  faturamentos: Faturamento[],
): RentabilidadeEquipamento[] {
  return equipamentos
    .filter((e) => e.ativo)
    .map((e) =>
      rentabilidadePorEquipamento(
        e,
        periodo,
        componentes,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ),
    );
}

function obrasComFaturamentoNoPeriodo(
  faturamentos: Faturamento[],
  periodo: string,
): Map<string, Faturamento[]> {
  const porOS = new Map<string, Faturamento[]>();
  for (const f of faturamentos) {
    if (periodoDoFaturamento(f) !== periodo) continue;
    const lista = porOS.get(f.os_id) ?? [];
    lista.push(f);
    porOS.set(f.os_id, lista);
  }
  return porOS;
}

export function rentabilidadePorObra(
  os: OrdemServico,
  faturamentosDaOS: Faturamento[],
  periodo: string,
  equipamentos: Equipamento[],
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): RentabilidadeObra {
  const receita = round2(faturamentosDaOS.reduce((soma, f) => soma + f.valor_total, 0));
  const composicaoReceita: ComposicaoReceita[] = faturamentosDaOS.map((f) => ({
    faturamento_id: f.id,
    faturamento_numero: f.numero,
    os_id: f.os_id,
    valor: f.valor_total,
  }));

  const equipamentoIds = Array.from(
    new Set(
      apontamentos
        .filter((a) => a.os_id === os.id && a.status === "finalizado")
        .map((a) => a.equipamento_id),
    ),
  );

  const composicaoCusto: ComposicaoCustoObra[] = [];
  let custoIncompleto = false;
  for (const equipamentoId of equipamentoIds) {
    const equipamento = equipamentos.find((e) => e.id === equipamentoId);
    if (!equipamento) continue;
    const horas = horasDoEquipamentoNaOS(apontamentos, equipamentoId, os.id);
    const resultado = custoHoraEquipamento(
      equipamento,
      periodo,
      componentes,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    );
    if (resultado.configuracao_incompleta || resultado.custo_por_hora == null) {
      custoIncompleto = true;
    }
    const custo = resultado.custo_por_hora != null ? round2(resultado.custo_por_hora * horas) : 0;
    composicaoCusto.push({
      equipamento_id: equipamentoId,
      horas,
      custo_por_hora: resultado.custo_por_hora,
      custo,
    });
  }

  const custoTotal = round2(composicaoCusto.reduce((soma, c) => soma + c.custo, 0));
  const margem = round2(receita - custoTotal);

  return {
    os_id: os.id,
    os_numero: os.numero,
    cliente_id: os.cliente_id,
    periodo,
    receita,
    custo: custoTotal,
    margem,
    margem_percentual: receita > 0 ? margem / receita : null,
    custo_incompleto: custoIncompleto,
    composicao_receita: composicaoReceita,
    composicao_custo: composicaoCusto,
  };
}

export function rentabilidadePorTodasAsObras(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
  periodo: string,
  equipamentos: Equipamento[],
  componentes: ComponenteCusto[],
  abastecimentos: Abastecimento[],
  registrosManutencao: RegistroManutencao[],
  apontamentos: Apontamento[],
  precosHoraMaquina: PrecoHoraMaquina[],
): RentabilidadeObra[] {
  const porOS = obrasComFaturamentoNoPeriodo(faturamentos, periodo);
  const resultado: RentabilidadeObra[] = [];
  for (const [osId, faturamentosDaOS] of porOS) {
    const os = ordens.find((o) => o.id === osId);
    if (!os) continue;
    resultado.push(
      rentabilidadePorObra(
        os,
        faturamentosDaOS,
        periodo,
        equipamentos,
        componentes,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ),
    );
  }
  return resultado;
}
```

- [ ] Criar `src/features/rentabilidade/derivacoes.test.ts`. **Todos os valores abaixo foram calculados à mão a partir dos mocks reais** (incluindo os registros novos do Passo 2) — não ajustar os números para "fazer o teste passar"; se algum valor não bater, o bug está na implementação, não no teste.

```typescript
import { describe, it, expect } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { apontamentos } from "@/mocks/apontamentos";
import { abastecimentos } from "@/mocks/abastecimentos";
import { registrosManutencao } from "@/mocks/registros-manutencao";
import { componentesCusto } from "@/mocks/componentes-custo";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { faturamentos } from "@/mocks/faturamentos";
import { ordensServico } from "@/mocks/ordens-servico";
import {
  rentabilidadePorEquipamento,
  rentabilidadePorTodosEquipamentos,
  rentabilidadePorObra,
  rentabilidadePorTodasAsObras,
} from "@/features/rentabilidade/derivacoes";

const PERIODO = "2026-06";

function eq(id: string) {
  const e = equipamentos.find((x) => x.id === id);
  if (!e) throw new Error(`equipamento ${id} ausente no mock`);
  return e;
}

const ARGS_EQUIPAMENTO = () =>
  [componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina, faturamentos] as const;

const ARGS_OBRA = () =>
  [equipamentos, componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina] as const;

describe("features/rentabilidade/derivacoes", () => {
  describe("rentabilidadePorEquipamento", () => {
    it("eq-001: receita só do faturamento rascunho (fat-002); margem negativa (custo real > preço)", () => {
      const r = rentabilidadePorEquipamento(eq("eq-001"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.horas_trabalhadas).toBe(12);
      expect(r.receita).toBe(4320);
      expect(r.custo).toBe(6201.6);
      expect(r.margem).toBe(-1881.6);
      expect(r.margem_percentual).toBeCloseTo(-0.4356, 3);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_receita).toHaveLength(1);
      expect(r.composicao_receita[0]).toMatchObject({ faturamento_id: "fat-002", valor: 4320 });
    });

    it("eq-002: receita soma faturado (fat-001) + rascunho (fat-002); margem positiva", () => {
      const r = rentabilidadePorEquipamento(eq("eq-002"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(8120);
      expect(r.custo).toBe(2378.8);
      expect(r.margem).toBe(5741.2);
      expect(r.margem_percentual).toBeCloseTo(0.707, 3);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_receita).toHaveLength(2);
    });

    it("eq-003: sem apontamento ligado a OS — receita zero, custo incompleto", () => {
      const r = rentabilidadePorEquipamento(eq("eq-003"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(0);
      expect(r.margem).toBe(0);
      expect(r.margem_percentual).toBeNull();
      expect(r.custo_incompleto).toBe(true);
    });

    it("eq-004: sem horas no período — receita zero, custo incompleto", () => {
      const r = rentabilidadePorEquipamento(eq("eq-004"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.horas_trabalhadas).toBe(0);
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(0);
      expect(r.custo_incompleto).toBe(true);
    });

    it("eq-005: item sem_preco (fat-003) — receita zero mas custo real; prejuízo, sem custo_incompleto", () => {
      const r = rentabilidadePorEquipamento(eq("eq-005"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(3976);
      expect(r.margem).toBe(-3976);
      expect(r.margem_percentual).toBeNull();
      expect(r.custo_incompleto).toBe(false); // tem componentes ativos — o problema é o preço, não o custo
    });

    it("eq-006: nenhuma OS que o usa foi faturada ainda — receita zero, prejuízo aparente", () => {
      const r = rentabilidadePorEquipamento(eq("eq-006"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(1465.1);
      expect(r.margem).toBe(-1465.1);
      expect(r.custo_incompleto).toBe(false);
    });

    it("eq-007: receita > 0 (fat-008) mas configuração de custo incompleta — margem calculada porém sinalizada", () => {
      const r = rentabilidadePorEquipamento(eq("eq-007"), PERIODO, ...ARGS_EQUIPAMENTO());
      expect(r.horas_trabalhadas).toBe(16);
      expect(r.receita).toBe(1560);
      expect(r.custo).toBe(700);
      expect(r.margem).toBe(860);
      expect(r.margem_percentual).toBeCloseTo(0.5513, 3);
      expect(r.custo_incompleto).toBe(true);
    });
  });

  describe("rentabilidadePorTodosEquipamentos", () => {
    it("retorna um resultado por equipamento ativo, excluindo inativos (eq-008)", () => {
      const resultados = rentabilidadePorTodosEquipamentos(equipamentos, PERIODO, ...ARGS_EQUIPAMENTO());
      expect(resultados).toHaveLength(7);
      expect(resultados.some((r) => r.equipamento_id === "eq-008")).toBe(false);
    });
  });

  describe("rentabilidadePorObra", () => {
    function osById(id: string) {
      const os = ordensServico.find((o) => o.id === id);
      if (!os) throw new Error(`OS ${id} ausente no mock`);
      return os;
    }
    function faturamentosDaOSNoPeriodo(osId: string) {
      return faturamentos.filter((f) => f.os_id === osId && f.gerado_em.slice(0, 7) === PERIODO);
    }

    it("os-003: um equipamento, faturado, margem positiva", () => {
      const r = rentabilidadePorObra(osById("os-003"), faturamentosDaOSNoPeriodo("os-003"), PERIODO, ...ARGS_OBRA());
      expect(r.receita).toBe(5220);
      expect(r.custo).toBe(1529.28);
      expect(r.margem).toBe(3690.72);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_custo).toHaveLength(1);
      expect(r.composicao_custo[0]).toMatchObject({ equipamento_id: "eq-002", horas: 18 });
    });

    it("os-007: multi-equipamento (rascunho), margem positiva porém estreita", () => {
      const r = rentabilidadePorObra(osById("os-007"), faturamentosDaOSNoPeriodo("os-007"), PERIODO, ...ARGS_OBRA());
      expect(r.receita).toBe(8070);
      expect(r.custo).toBe(7051.2);
      expect(r.margem).toBe(1018.8);
      expect(r.custo_incompleto).toBe(false);
      expect(r.composicao_custo).toHaveLength(2);
    });

    it("os-008: sem_preco no item — receita zero, prejuízo (obra com prejuízo, edge case exigido)", () => {
      const r = rentabilidadePorObra(osById("os-008"), faturamentosDaOSNoPeriodo("os-008"), PERIODO, ...ARGS_OBRA());
      expect(r.receita).toBe(0);
      expect(r.custo).toBe(3976);
      expect(r.margem).toBe(-3976);
      expect(r.margem_percentual).toBeNull();
      expect(r.custo_incompleto).toBe(false);
    });

    it("os-009: por_metro, usa eq-007 (custo incompleto) — margem positiva mas sinalizada", () => {
      const r = rentabilidadePorObra(osById("os-009"), faturamentosDaOSNoPeriodo("os-009"), PERIODO, ...ARGS_OBRA());
      expect(r.receita).toBe(2700);
      expect(r.custo).toBe(218.75);
      expect(r.margem).toBe(2481.25);
      expect(r.custo_incompleto).toBe(true);
    });

    it("os-011: nova OS (eq-007), margem positiva mas sinalizada", () => {
      const r = rentabilidadePorObra(osById("os-011"), faturamentosDaOSNoPeriodo("os-011"), PERIODO, ...ARGS_OBRA());
      expect(r.receita).toBe(1560);
      expect(r.custo).toBe(262.5);
      expect(r.margem).toBe(1297.5);
      expect(r.custo_incompleto).toBe(true);
    });
  });

  describe("rentabilidadePorTodasAsObras", () => {
    it("retorna só as obras com ao menos um faturamento gerado no período (5 obras)", () => {
      const resultados = rentabilidadePorTodasAsObras(
        ordensServico,
        faturamentos,
        PERIODO,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados).toHaveLength(5);
      const ids = resultados.map((r) => r.os_id).sort();
      expect(ids).toEqual(["os-003", "os-007", "os-008", "os-009", "os-011"].sort());
      // os-010 (fechada, SEM fatura) e os-001/002/004/005/006 (sem fatura confirmada) ficam de fora
      expect(resultados.some((r) => r.os_id === "os-010")).toBe(false);
    });

    it("inclui ao menos uma obra com margem negativa (prejuízo)", () => {
      const resultados = rentabilidadePorTodasAsObras(
        ordensServico,
        faturamentos,
        PERIODO,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados.some((r) => r.margem < 0)).toBe(true);
    });

    it("retorna vazio para um período sem nenhum faturamento", () => {
      const resultados = rentabilidadePorTodasAsObras(
        ordensServico,
        faturamentos,
        "2025-01",
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      );
      expect(resultados).toHaveLength(0);
    });
  });
});
```

- [ ] Rodar `npx vitest run src/features/rentabilidade` — todos os testes acima devem passar.

- [ ] Rodar `npx tsc --noEmit` — sem erros de tipo.

- [ ] Commit:

```bash
git add src/features/rentabilidade/derivacoes.ts src/features/rentabilidade/derivacoes.test.ts src/features/rentabilidade/format.ts
git commit -m "feat: add rentabilidade calculation (por equipamento e por obra)"
```

---

### Task 2: UI — Ranking por Equipamento

**Files:**
- Create: `src/features/rentabilidade/components/detalhe-equipamento-dialog.tsx`
- Create: `src/features/rentabilidade/components/ranking-equipamentos.tsx`

**Interfaces:**
- Consumes: tudo de `@/features/rentabilidade/derivacoes` e `@/features/rentabilidade/format` (Task 1); `KpiCard` de `@/features/dashboard/components/kpi-card`; `EmptyState` de `@/shared/components/empty-state`; `useMockResource` de `@/shared/hooks/use-mock-resource`; `formatBRL` de `@/features/retaguarda/format`; `formatHorimetro` de `@/shared/lib/format`; `rotuloMes` de `@/shared/lib/periodo-mensal`; stores: `equipamentosStore` (`@/features/equipamentos/equipamentos-store`, método `.useAll()`), `apontamentosStore` (`@/features/apontamento/apontamentos-store`, `.useTodos()`), `abastecimentosStore` (`@/features/diesel/abastecimentos-store`, `.useTodos()`), `registrosManutencaoStore` (`@/features/manutencao/registros-manutencao-store`, `.useTodos()`), `precoHoraMaquinaStore` (`@/features/precos/precos-hora-maquina-store`, `.useAll()`), `componentesCustoStore` (`@/features/custo-hora/componentes-custo-store`, `.useAll()`), `faturamentosStore` (`@/features/faturamento/faturamentos-store`, `.useTodos()`).
- Produces: `RankingEquipamentos` (props: `{ periodo: string }`) — usado por Task 4's `RentabilidadePage`.

#### Passo 1: Diálogo de detalhe por equipamento

- [ ] Criar `src/features/rentabilidade/components/detalhe-equipamento-dialog.tsx`:

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
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import { TipoComponenteCustoBadge } from "@/features/custo-hora/labels";
import { formatPercentual } from "@/features/rentabilidade/format";
import type { RentabilidadeEquipamento } from "@/features/rentabilidade/derivacoes";

interface Props {
  equipamentoNome: string | null;
  resultado: RentabilidadeEquipamento | null;
  numeroDaOS: (osId: string) => string;
  onOpenChange: (open: boolean) => void;
}

export function DetalheEquipamentoDialog({
  equipamentoNome,
  resultado,
  numeroDaOS,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={!!resultado} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{equipamentoNome ?? "Equipamento"}</DialogTitle>
          <DialogDescription>
            {resultado ? `Rentabilidade — ${rotuloMes(resultado.periodo)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Receita ({formatBRL(resultado.receita)})
              </h3>
              {resultado.composicao_receita.length > 0 ? (
                <ul className="divide-y divide-border rounded-lg border">
                  {resultado.composicao_receita.map((item) => (
                    <li
                      key={item.faturamento_id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5"
                    >
                      <span className="text-sm text-foreground">
                        {item.faturamento_numero} — {numeroDaOS(item.os_id)}
                      </span>
                      <span className="font-mono text-sm text-foreground">
                        {formatBRL(item.valor)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma receita faturada neste período.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Custo ({formatBRL(resultado.custo)})
              </h3>
              <ul className="divide-y divide-border rounded-lg border">
                {resultado.detalhamento_custo.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TipoComponenteCustoBadge tipo={item.tipo} />
                      <span className="text-sm text-foreground">{item.descricao}</span>
                    </div>
                    <span className="font-mono text-sm text-foreground">
                      {formatBRL(item.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-faint">Horas no período</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatHorimetro(resultado.horas_trabalhadas)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Margem %</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatPercentual(resultado.margem_percentual)}
                </dd>
              </div>
            </dl>

            <div
              className={
                resultado.margem < 0
                  ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  : "rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-foreground"
              }
            >
              Margem: <span className="font-mono font-bold">{formatBRL(resultado.margem)}</span>
              {resultado.margem < 0 ? " — prejuízo no período" : null}
            </div>

            {resultado.custo_incompleto ? (
              <p className="text-xs text-foreground-faint">
                Configuração de custo incompleta: a margem acima pode não ser confiável.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
```

#### Passo 2: Painel de ranking por equipamento

- [ ] Criar `src/features/rentabilidade/components/ranking-equipamentos.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import {
  rentabilidadePorTodosEquipamentos,
  type RentabilidadeEquipamento,
} from "@/features/rentabilidade/derivacoes";
import { formatPercentual } from "@/features/rentabilidade/format";
import { DetalheEquipamentoDialog } from "@/features/rentabilidade/components/detalhe-equipamento-dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function RankingEquipamentos({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();

  const [selecionado, setSelecionado] = useState<RentabilidadeEquipamento | null>(null);

  const resultados = useMemo(
    () =>
      rentabilidadePorTodosEquipamentos(
        equipamentos,
        periodo,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ).sort((a, b) => b.margem - a.margem),
    [equipamentos, periodo, componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina, faturamentos],
  );

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";
  const numeroDaOS = (osId: string) => ordens.find((o) => o.id === osId)?.numero ?? osId;

  const receitaTotal = resultados.reduce((s, r) => s + r.receita, 0);
  const custoTotal = resultados.reduce((s, r) => s + r.custo, 0);
  const margemTotal = receitaTotal - custoTotal;
  const comPrejuizo = resultados.filter((r) => r.margem < 0).length;

  const semFaturamentoNoPeriodo = !faturamentos.some((f) => f.gerado_em.slice(0, 7) === periodo);

  if (semFaturamentoNoPeriodo) {
    return (
      <EmptyState
        icon="lucide:trending-up"
        titulo="Sem faturamento no período"
        descricao="Nenhum faturamento foi gerado neste mês, então não há receita para calcular rentabilidade por equipamento."
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

  const dadosGrafico = resultados.map((r) => ({
    nome: nomeDoEquipamento(r.equipamento_id),
    margem: r.margem,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard rotulo="Receita no período" valor={formatBRL(receitaTotal)} icone="lucide:receipt" isLoading={isLoading} />
        <KpiCard rotulo="Custo no período" valor={formatBRL(custoTotal)} icone="lucide:wallet" isLoading={isLoading} />
        <KpiCard
          rotulo="Margem no período"
          valor={formatBRL(margemTotal)}
          icone="lucide:trending-up"
          variante={margemTotal < 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Equipamentos com prejuízo"
          valor={String(comPrejuizo)}
          icone="lucide:triangle-alert"
          variante={comPrejuizo > 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
      </div>

      {!isLoading ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-bold text-card-foreground">
            Margem por equipamento
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(220, dadosGrafico.length * 40)}>
            <BarChart data={dadosGrafico} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="nome" stroke="var(--color-muted-foreground)" fontSize={11} width={160} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-card-foreground)",
                }}
                formatter={(v: number) => formatBRL(v)}
              />
              <Bar dataKey="margem" radius={[0, 4, 4, 0]}>
                {dadosGrafico.map((d, i) => (
                  <Cell key={i} fill={d.margem < 0 ? "var(--color-destructive)" : "var(--color-primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

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
                <th className="px-4 py-3 font-medium">Receita</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium">Margem %</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.equipamento_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {nomeDoEquipamento(r.equipamento_id)}
                    {r.custo_incompleto ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Custo incompleto
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatHorimetro(r.horas_trabalhadas)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.receita)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.custo)}</td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      r.margem < 0 && "text-destructive",
                    )}
                  >
                    {formatBRL(r.margem)}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPercentual(r.margem_percentual)}</td>
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

      <DetalheEquipamentoDialog
        equipamentoNome={selecionado ? nomeDoEquipamento(selecionado.equipamento_id) : null}
        resultado={selecionado}
        numeroDaOS={numeroDaOS}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      />
    </div>
  );
}
```

- [ ] Rodar `npx tsc --noEmit` — sem erros de tipo (nenhum teste automatizado de componente existe neste repo — ver Task 4 para QA manual no navegador).

- [ ] Commit:

```bash
git add src/features/rentabilidade/components/detalhe-equipamento-dialog.tsx src/features/rentabilidade/components/ranking-equipamentos.tsx
git commit -m "feat: add rentabilidade por equipamento ranking panel"
```

---

### Task 3: UI — Ranking por Obra

**Files:**
- Create: `src/features/rentabilidade/components/detalhe-obra-dialog.tsx`
- Create: `src/features/rentabilidade/components/ranking-obras.tsx`

**Interfaces:**
- Consumes: mesma lista da Task 2, mais `ordensStore.useTodas()` (`@/features/ordem-servico/ordens-store`) e `clientesStore.useAll()` (`@/features/clientes/clientes-store`) para resolver `obra_nome`/`cliente_nome`.
- Produces: `RankingObras` (props: `{ periodo: string }`) — usado por Task 4's `RentabilidadePage`.

**Nota:** Task 2 e Task 3 tocam arquivos completamente distintos (`ranking-equipamentos.tsx`/`detalhe-equipamento-dialog.tsx` vs. `ranking-obras.tsx`/`detalhe-obra-dialog.tsx`) — podem ser implementadas em paralelo, ambas dependendo só da Task 1.

#### Passo 1: Diálogo de detalhe por obra

- [ ] Criar `src/features/rentabilidade/components/detalhe-obra-dialog.tsx`:

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
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import { formatPercentual } from "@/features/rentabilidade/format";
import type { RentabilidadeObra } from "@/features/rentabilidade/derivacoes";

interface Props {
  osNumero: string | null;
  obraNome: string | null;
  resultado: RentabilidadeObra | null;
  nomeDoEquipamento: (equipamentoId: string) => string;
  onOpenChange: (open: boolean) => void;
}

export function DetalheObraDialog({
  osNumero,
  obraNome,
  resultado,
  nomeDoEquipamento,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={!!resultado} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {osNumero ?? "Obra"} {obraNome ? `— ${obraNome}` : ""}
          </DialogTitle>
          <DialogDescription>
            {resultado ? `Rentabilidade — ${rotuloMes(resultado.periodo)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Receita ({formatBRL(resultado.receita)})
              </h3>
              <ul className="divide-y divide-border rounded-lg border">
                {resultado.composicao_receita.map((item) => (
                  <li
                    key={item.faturamento_id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <span className="text-sm text-foreground">{item.faturamento_numero}</span>
                    <span className="font-mono text-sm text-foreground">
                      {formatBRL(item.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Custo por equipamento ({formatBRL(resultado.custo)})
              </h3>
              <ul className="divide-y divide-border rounded-lg border">
                {resultado.composicao_custo.map((item) => (
                  <li
                    key={item.equipamento_id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <span className="text-sm text-foreground">
                      {nomeDoEquipamento(item.equipamento_id)} — {formatHorimetro(item.horas)}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {formatBRL(item.custo)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-1 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-faint">Margem %</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatPercentual(resultado.margem_percentual)}
                </dd>
              </div>
            </dl>

            <div
              className={
                resultado.margem < 0
                  ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  : "rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-foreground"
              }
            >
              Margem: <span className="font-mono font-bold">{formatBRL(resultado.margem)}</span>
              {resultado.margem < 0 ? " — obra com prejuízo" : null}
            </div>

            {resultado.custo_incompleto ? (
              <p className="text-xs text-foreground-faint">
                Um ou mais equipamentos usados nesta obra têm configuração de custo incompleta: a
                margem acima pode não ser confiável.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
```

#### Passo 2: Painel de ranking por obra

- [ ] Criar `src/features/rentabilidade/components/ranking-obras.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import {
  rentabilidadePorTodasAsObras,
  type RentabilidadeObra,
} from "@/features/rentabilidade/derivacoes";
import { formatPercentual } from "@/features/rentabilidade/format";
import { DetalheObraDialog } from "@/features/rentabilidade/components/detalhe-obra-dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function RankingObras({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const clientes = clientesStore.useAll();

  const [selecionado, setSelecionado] = useState<RentabilidadeObra | null>(null);

  const resultados = useMemo(
    () =>
      rentabilidadePorTodasAsObras(
        ordens,
        faturamentos,
        periodo,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ).sort((a, b) => b.margem - a.margem),
    [ordens, faturamentos, periodo, equipamentos, componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina],
  );

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";
  const obraNome = (osId: string) => ordens.find((o) => o.id === osId)?.obra_nome ?? null;
  const nomeDoCliente = (clienteId: string) =>
    clientes.find((c) => c.id === clienteId)?.nome ?? "Cliente";

  const receitaTotal = resultados.reduce((s, r) => s + r.receita, 0);
  const custoTotal = resultados.reduce((s, r) => s + r.custo, 0);
  const margemTotal = receitaTotal - custoTotal;
  const comPrejuizo = resultados.filter((r) => r.margem < 0).length;

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

  if (!isLoading && resultados.length === 0) {
    return (
      <EmptyState
        icon="lucide:building-2"
        titulo="Sem obras faturadas no período"
        descricao="Nenhuma obra teve faturamento gerado neste mês."
      />
    );
  }

  const dadosGrafico = resultados.map((r) => ({
    nome: r.os_numero,
    margem: r.margem,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard rotulo="Receita faturada" valor={formatBRL(receitaTotal)} icone="lucide:receipt" isLoading={isLoading} />
        <KpiCard rotulo="Custo total" valor={formatBRL(custoTotal)} icone="lucide:wallet" isLoading={isLoading} />
        <KpiCard
          rotulo="Margem total"
          valor={formatBRL(margemTotal)}
          icone="lucide:trending-up"
          variante={margemTotal < 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Obras com prejuízo"
          valor={String(comPrejuizo)}
          icone="lucide:triangle-alert"
          variante={comPrejuizo > 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
      </div>

      {!isLoading ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-bold text-card-foreground">
            Margem por obra
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(220, dadosGrafico.length * 40)}>
            <BarChart data={dadosGrafico} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="nome" stroke="var(--color-muted-foreground)" fontSize={11} width={120} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-card-foreground)",
                }}
                formatter={(v: number) => formatBRL(v)}
              />
              <Bar dataKey="margem" radius={[0, 4, 4, 0]}>
                {dadosGrafico.map((d, i) => (
                  <Cell key={i} fill={d.margem < 0 ? "var(--color-destructive)" : "var(--color-primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

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
                <th className="px-4 py-3 font-medium">Obra</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Receita</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium">Margem %</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.os_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {r.os_numero}
                    {obraNome(r.os_id) ? (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {obraNome(r.os_id)}
                      </span>
                    ) : null}
                    {r.custo_incompleto ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Custo incompleto
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground">{nomeDoCliente(r.cliente_id)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.receita)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(r.custo)}</td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      r.margem < 0 && "text-destructive",
                    )}
                  >
                    {formatBRL(r.margem)}
                    {r.margem < 0 ? (
                      <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-normal text-destructive">
                        Prejuízo
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPercentual(r.margem_percentual)}</td>
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

      <DetalheObraDialog
        osNumero={selecionado?.os_numero ?? null}
        obraNome={selecionado ? obraNome(selecionado.os_id) : null}
        resultado={selecionado}
        nomeDoEquipamento={nomeDoEquipamento}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      />
    </div>
  );
}
```

- [ ] Rodar `npx tsc --noEmit` — sem erros de tipo.

- [ ] Commit:

```bash
git add src/features/rentabilidade/components/detalhe-obra-dialog.tsx src/features/rentabilidade/components/ranking-obras.tsx
git commit -m "feat: add rentabilidade por obra ranking panel"
```

---

### Task 4: Montagem da página, rota, navegação e barreira financeira

**Files:**
- Create: `src/features/rentabilidade/components/rentabilidade-page.tsx`
- Create: `src/features/rentabilidade/index.ts`
- Create: `src/routes/admin.rentabilidade.tsx`
- Modify: `src/features/retaguarda/retaguarda-shell.tsx` (novo item de navegação)

**Interfaces:**
- Consumes: `RankingEquipamentos` (Task 2), `RankingObras` (Task 3), `mesReferencia`/`mesAnterior` (`@/shared/lib/periodo-mensal`), `SeletorMes` (`@/shared/components/seletor-mes`), `PageHeader` (`@/shared/components/page-header`), `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` (`@/components/ui/tabs`).
- Produces: rota `/admin/rentabilidade` navegável a partir da sidebar.

#### Passo 1: Página com abas

- [ ] Criar `src/features/rentabilidade/components/rentabilidade-page.tsx`:

```tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { SeletorMes } from "@/shared/components/seletor-mes";
import { mesReferencia, mesAnterior } from "@/shared/lib/periodo-mensal";
import { RankingEquipamentos } from "@/features/rentabilidade/components/ranking-equipamentos";
import { RankingObras } from "@/features/rentabilidade/components/ranking-obras";

const MES_ATUAL = mesReferencia(new Date());
const MES_PADRAO = mesAnterior(MES_ATUAL);

export function RentabilidadePage() {
  const [periodo, setPeriodo] = useState(MES_PADRAO);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Rentabilidade por Equipamento e Obra"
        descricao="Receita (faturamento) menos custo (custo/hora) no período — o painel de decisão do dono. Visível apenas na retaguarda."
      />

      <div className="flex justify-end">
        <SeletorMes periodo={periodo} onChange={setPeriodo} maximo={MES_ATUAL} />
      </div>

      <Tabs defaultValue="equipamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipamentos">Por Equipamento</TabsTrigger>
          <TabsTrigger value="obras">Por Obra</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos">
          <RankingEquipamentos periodo={periodo} />
        </TabsContent>
        <TabsContent value="obras">
          <RankingObras periodo={periodo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] Criar `src/features/rentabilidade/index.ts`:

```typescript
export { RentabilidadePage } from "@/features/rentabilidade/components/rentabilidade-page";
```

#### Passo 2: Rota

- [ ] Criar `src/routes/admin.rentabilidade.tsx`:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { RentabilidadePage } from "@/features/rentabilidade";

export const Route = createFileRoute("/admin/rentabilidade")({
  head: () => ({
    meta: [
      { title: "Rentabilidade · Antonello" },
      {
        name: "description",
        content: "Rentabilidade por equipamento e por obra — receita menos custo no período.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RentabilidadePage,
});
```

- [ ] Rodar `npm run dev` (ou confirmar que o servidor de dev já está de pé) e aguardar o plugin do TanStack Router regenerar `src/routeTree.gen.ts` automaticamente (adição puramente aditiva, mesmo padrão de PRDs anteriores — diesel, comprovantes, manutenção, custo-hora). Não editar `routeTree.gen.ts` manualmente.

#### Passo 3: Navegação

- [ ] Em `src/features/retaguarda/retaguarda-shell.tsx`, adicionar o import do ícone `TrendingUp` (lucide-react) à lista de imports existente:

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
  TrendingUp,
  Menu,
  ChevronRight,
} from "lucide-react";
```

- [ ] No array `itens`, adicionar uma nova entrada logo após `"/admin/custo-hora"` (último item da lista analítica):

```typescript
  { to: "/admin/custo-hora", label: "Custo da Hora", icone: Calculator },
  { to: "/admin/rentabilidade", label: "Rentabilidade", icone: TrendingUp },
```

#### Passo 4: Verificação manual (barreira financeira, responsividade, fluxo)

- [ ] Rodar `npx tsc --noEmit && npx vitest run` — 0 erros de tipo, todos os testes passando (contagem deve ser a anterior + os novos testes das Tasks 1-3).

- [ ] Rodar um grep de barreira financeira e confirmar **saída vazia** em ambos os comandos:

```bash
rg -l "features/rentabilidade" src/features/operador src/routes/app* 2>/dev/null
rg -l "from \"@/features/rentabilidade" src --type ts --type tsx | rg -v "src/features/rentabilidade|src/routes/admin.rentabilidade"
```

- [ ] Abrir `http://localhost:8083/admin/rentabilidade` no navegador (usar as ferramentas de devtools/Chrome disponíveis) e verificar:
  - Aba "Por Equipamento": 3 KPIs + gráfico de barras + tabela com 7 linhas; `eq-005`/`eq-006` (e `eq-001`, com o rascunho) aparecem com margem negativa em vermelho; `eq-007` aparece com o badge "Custo incompleto"; clicar em "Ver detalhamento" abre o diálogo com composição de receita e custo.
  - Aba "Por Obra": 3 KPIs + gráfico + tabela com 5 linhas; `os-008` aparece com badge "Prejuízo" e margem negativa; `os-009`/`os-011` aparecem com "Custo incompleto"; clicar em "Ver detalhamento" funciona.
  - Trocar o mês via `SeletorMes` para um mês sem faturamento (ex.: mês anterior a junho/2026) e confirmar o empty state em "Por Equipamento" ("Sem faturamento no período") e em "Por Obra" ("Sem obras faturadas no período").
  - Testar em 375px, 768px e 1280px (usar `mcp__plugin_chrome-devtools-mcp_chrome-devtools__resize_page` — `resize_window` do claude-in-chrome não emula viewport corretamente, ver ressalva conhecida de PRDs anteriores). Tabela pode rolar horizontalmente em 375px (RNF-004 "Desktop analítico" já aceita isso, mesmo padrão de PRD-013).
  - Alternar tema claro/escuro e confirmar contraste dos badges de alerta (destructive) e KPIs.

- [ ] Commit:

```bash
git add src/features/rentabilidade/components/rentabilidade-page.tsx src/features/rentabilidade/index.ts src/routes/admin.rentabilidade.tsx src/features/retaguarda/retaguarda-shell.tsx src/routeTree.gen.ts
git commit -m "feat: assemble rentabilidade page, route and sidebar navigation"
```

---

## Final Review & Closure

Após as 4 tasks (com suas revisões por task via Subagent-Driven Development):

1. Rodar `npx tsc --noEmit && npx vitest run` uma última vez no branch completo.
2. Dispatch da revisão final de branch inteiro (modelo mais capaz disponível — opus), cobrindo o range `merge-base(main, branch)..HEAD`, com a lista de Global Constraints acima como lente de atenção (em especial: barreira financeira, regra de atribuição de receita, regra de "qualquer status de faturamento conta como receita", arredondamento, e que os 4 novos registros de mock são puramente aditivos).
3. Aplicar findings Critical/Important; registrar Minor não bloqueantes.
4. Fechamento do PRD:
   - Versão: `0.13.0` → **`0.14.0`**, codinome **"Compass"** (sugerido pelo próprio PRD: "navega o negócio pela margem").
   - Atualizar `CHANGELOG.md` (Keep a Changelog) com uma entrada `## [0.14.0] - 2026-07-03 - Compass`, categoria **Added** (painel de rentabilidade por equipamento e por obra) e **Changed** (seletor de mês movido para `src/shared/`).
   - Renomear `docs/prds/PRD-014-ret-rentabilidade-equipamento-obra.md` → `..._DONE.md`, preenchendo "Status de Implementação" (Status ✅, Data, Versão 0.14.0, Implementado por, Observações — mencionar as decisões de "Decisões Pendentes" resolvidas: atribuição de receita via `FaturamentoItem.origem_id`, mobilização sem custo modelado, regime "qualquer faturamento gerado" em vez de caixa/confirmado, período mensal reaproveitado do PRD-013).
   - Atualizar `docs/prds/INDEX-PRDs-antonello.md`: badge de versão, contagem de implementados (13→14, agora **último PRD do roadmap numerado** — restam só 008/009, ambos Fase 4 provisórios), tabela de resumo de status, roadmap Onda 3 (PRD-014 ⏳→✅), mover do catálogo "aguardando implementação" para "✅ Implementados", nova linha no histórico de versões, nova linha em "Decisões Importantes", marcar a "Decisão em Aberto" de "Rentabilidade por competência (faturado) ou caixa (recebido)?" como resolvida (competência ampla — ver Global Constraints), atualizar "Última Atualização".
5. Seguir superpowers:finishing-a-development-branch para decidir o destino do branch (merge local, PR, manter, descartar).
