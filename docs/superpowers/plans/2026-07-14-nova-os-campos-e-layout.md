# Nova OS — novos campos e layout dedicado Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar 3 campos novos (`tipo_servico`, `equipamento_previsto_id`, `inicio_previsto`) à Ordem de Serviço, reaproveitar o vínculo já existente `orcamentos.os_id`/`valor_total` para "orçamento vinculado"/"valor previsto", e mover a criação de OS de um modal para uma página dedicada em `/admin/ordens/nova` com layout de 2 colunas (formulário + resumo ao vivo), baseado no mockup importado do claude.ai/design.

**Architecture:** Mudança em 4 camadas: (1) schema do banco + tipos TypeScript + labels; (2) validação (zod); (3) `OrdemForm` (novos campos + submissão + layout 2 colunas quando criação) e um novo componente `ResumoNovaOrdem` que lê o formulário ao vivo via `useWatch`; (4) rota dedicada substituindo o modal de criação. A edição de OS existente continua exatamente como está (mesmo modal, `OrdemForm inicial={ordem}`).

**Tech Stack:** React + TypeScript + Tailwind + shadcn/ui, react-hook-form + zod, Supabase (Postgres/RLS), TanStack Router (rotas por arquivo).

## Global Constraints

- `tipo_servico`: enum fixo com exatamente estes 6 valores (mesma ordem do mockup):
  `terraplenagem`, `drenagem`, `nivelamento`, `fundacao_estacas`, `cascalhamento`, `limpeza_terreno`.
  Nullable no banco; obrigatório só na validação de **criação** (não na edição).
- `equipamento_previsto_id`: FK nullable para `equipamentos`, **informativo apenas** — não
  restringe nem é lido por `apontamentos` (ADR-001: equipamento é propriedade do apontamento,
  não do cabeçalho da OS).
- `inicio_previsto`: `date` nullable, sem relação com `aberta_em`.
- **Sem coluna nova para orçamento ou valor previsto.** Reaproveita `orcamentos.os_id` (via
  `orcamentosStore.vincularOS`, já existente em `orcamentos-store.ts:200`) e
  `orcamentos.valor_total` (já calculado, `calculo.ts:97-99`).
- Select de "Orçamento vinculado" só lista orçamentos com `status === "aprovado" && !os_id`
  (mesma regra de `orcamento-detalhe.tsx:386`) e só aparece na **criação** (não na edição).
- Nenhuma mudança no fluxo de edição de OS além dos 3 campos novos — mesmo modal
  (`FormDialog` + `OrdemForm inicial={ordem}`) em `ordem-detalhe-retaguarda.tsx:288-299`.
- Nenhuma mudança em `SugestaoAlocacaoPainel`, `apontamentos`, faturamento ou rentabilidade.
- Spec completa em `docs/superpowers/specs/2026-07-14-nova-os-campos-e-layout-design.md`.

---

### Task 1: Migration, tipos, labels e mocks

**Files:**
- Create: `supabase/migrations/20260714120000_ordens_servico_campos_planejamento.sql`
- Modify: `src/shared/types/index.ts` (interface `OrdemServico`, ~linha 141-160)
- Modify: `src/features/ordem-servico/labels.tsx`
- Modify: `src/mocks/ordens-servico.ts` (26 registros — via `sed`, não edição manual)

**Interfaces:**
- Produces: `TipoServico` (type export de `shared/types`), `TIPO_SERVICO_LABEL: Record<TipoServico, string>`,
  `TIPOS_SERVICO: TipoServico[]`, `SEM_RESPONSAVEL`/`SEM_EQUIPAMENTO`/`SEM_ORCAMENTO` (constantes
  string, movidas/criadas em `labels.tsx` para serem reaproveitadas por `OrdemForm` E pelo painel
  de resumo da Task 3 sem criar import circular entre os dois componentes).

- [ ] **Step 1: Escrever a migration**

Crie `supabase/migrations/20260714120000_ordens_servico_campos_planejamento.sql`:

```sql
alter table public.ordens_servico
  add column tipo_servico text check (tipo_servico in (
    'terraplenagem', 'drenagem', 'nivelamento',
    'fundacao_estacas', 'cascalhamento', 'limpeza_terreno'
  )),
  add column equipamento_previsto_id uuid references public.equipamentos (id),
  add column inicio_previsto date;
```

- [ ] **Step 2: Aplicar a migration no projeto Supabase**

Use a ferramenta MCP `mcp__supabase__apply_migration` com `name: "ordens_servico_campos_planejamento"`
e o SQL acima (ou `supabase db push` se estiver rodando localmente). Confirme com
`mcp__supabase__list_tables` (schema `public`, `verbose: true`) que `ordens_servico` agora tem as
3 colunas novas, todas nullable.

- [ ] **Step 3: Atualizar o tipo `OrdemServico`**

Em `src/shared/types/index.ts`, localize (linha 141-160):

```ts
export type ModeloCobranca = "hora_maquina" | "por_metro";
export type StatusOS = "aberta" | "em_andamento" | "fechada";

export interface OrdemServico {
  id: string;
  numero: string; // "OS-2026-0042"
  cliente_id: string; // FK → Cliente
  obra_nome: string;
  endereco: string | null;
  modelo_cobranca: ModeloCobranca;
  status: StatusOS;
  responsavel_id: string | null; // FK → Operador
  observacao: string | null;
  diametro_broca_mm: number | null; // por_metro
  aberta_em: string; // ISO 8601
  fechada_em: string | null;
  pendente_sync: boolean;
  created_at: string;
  updated_at: string;
}
```

Troque para:

```ts
export type ModeloCobranca = "hora_maquina" | "por_metro";
export type StatusOS = "aberta" | "em_andamento" | "fechada";
export type TipoServico =
  | "terraplenagem"
  | "drenagem"
  | "nivelamento"
  | "fundacao_estacas"
  | "cascalhamento"
  | "limpeza_terreno";

export interface OrdemServico {
  id: string;
  numero: string; // "OS-2026-0042"
  cliente_id: string; // FK → Cliente
  obra_nome: string;
  endereco: string | null;
  modelo_cobranca: ModeloCobranca;
  status: StatusOS;
  responsavel_id: string | null; // FK → Operador
  observacao: string | null;
  diametro_broca_mm: number | null; // por_metro
  tipo_servico: TipoServico | null;
  equipamento_previsto_id: string | null; // FK → Equipamento; informativo, ver ADR-001
  inicio_previsto: string | null; // "YYYY-MM-DD"
  aberta_em: string; // ISO 8601
  fechada_em: string | null;
  pendente_sync: boolean;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 4: Atualizar `labels.tsx` da feature**

Em `src/features/ordem-servico/labels.tsx`, o arquivo inteiro fica assim:

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { ModeloCobranca, StatusOS, TipoServico } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_OS_LABEL: Record<StatusOS, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  fechada: "Fechada",
};

export const STATUS_OS: StatusOS[] = ["aberta", "em_andamento", "fechada"];

export const MODELO_LABEL: Record<ModeloCobranca, string> = {
  hora_maquina: "Hora-máquina",
  por_metro: "Por metro",
};

export const TIPO_SERVICO_LABEL: Record<TipoServico, string> = {
  terraplenagem: "Terraplenagem",
  drenagem: "Drenagem",
  nivelamento: "Nivelamento",
  fundacao_estacas: "Fundação — estacas",
  cascalhamento: "Cascalhamento",
  limpeza_terreno: "Limpeza de terreno",
};

export const TIPOS_SERVICO: TipoServico[] = [
  "terraplenagem",
  "drenagem",
  "nivelamento",
  "fundacao_estacas",
  "cascalhamento",
  "limpeza_terreno",
];

// Sentinelas dos selects opcionais do formulário de OS — <Select> não aceita
// value="" num item, então "nada selecionado" precisa de um valor próprio.
// Vivem aqui (não em ordem-form.tsx) para serem reaproveitadas por
// ResumoNovaOrdem sem criar import circular entre os dois componentes.
export const SEM_RESPONSAVEL = "sem-responsavel";
export const SEM_EQUIPAMENTO = "sem-equipamento";
export const SEM_ORCAMENTO = "sem-orcamento";

const STATUS_CLASSE: Record<StatusOS, string> = {
  aberta: "bg-steel/20 text-foreground border-steel/40",
  em_andamento: "bg-primary/20 text-foreground border-primary/50",
  fechada: "bg-secondary-soft/25 text-foreground border-secondary/40",
};

export function StatusOSBadge({ status, className }: { status: StatusOS; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_OS_LABEL[status]}
    </span>
  );
}
```

- [ ] **Step 5: Atualizar os 26 registros do mock `ordens-servico.ts`**

Todo registro do mock precisa dos 3 campos novos (todos `null` — os mocks representam OS já
existentes antes desta feature). Em vez de editar as 26 ocorrências manualmente, rode (a partir
da raiz do repo):

```bash
sed -i -E '/^    diametro_broca_mm: .*,$/a\    tipo_servico: null,\n    equipamento_previsto_id: null,\n    inicio_previsto: null,' src/mocks/ordens-servico.ts
```

Confirme que inseriu exatamente 26 vezes:

```bash
grep -c "tipo_servico: null" src/mocks/ordens-servico.ts
```

Expected: `26`.

- [ ] **Step 6: Rodar a checagem de tipos e a suíte completa**

Run: `npx tsc --noEmit`
Expected: sem erros (o mock agora satisfaz o tipo `OrdemServico[]` atualizado).

Run: `npm run test`
Expected: os testes existentes de `src/mocks/ordens-servico.test.ts` continuam passando (nenhuma
asserção lá depende dos campos novos).

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260714120000_ordens_servico_campos_planejamento.sql \
  src/shared/types/index.ts src/features/ordem-servico/labels.tsx src/mocks/ordens-servico.ts
git commit -m "feat: add tipo_servico, equipamento_previsto_id e inicio_previsto a ordens_servico"
```

---

### Task 2: Validação (zod) dos campos novos

**Files:**
- Modify: `src/features/ordem-servico/ordem-schema.ts`
- Test: `src/features/ordem-servico/ordem-schema.test.ts`

**Interfaces:**
- Consumes: nenhum símbolo novo da Task 1 (usa só os literais dos 6 valores de `tipo_servico`,
  que já são o mesmo texto de `TIPO_SERVICO_LABEL`/`TIPOS_SERVICO`, mas o zod usa sua própria
  lista literal inline — mesmo padrão já usado para `modelo_cobranca` nesse arquivo).
- Produces: `ordemSchema` (estendido com `tipo_servico`, `equipamento_previsto_id`,
  `inicio_previsto`, `orcamento_id` — todos opcionais); `ordemCriacaoSchema` (mesmo schema +
  `tipo_servico` obrigatório); `OrdemFormValues` (tipo inferido, ganha os 4 campos novos).

- [ ] **Step 1: Escrever os testes que falham**

Em `src/features/ordem-servico/ordem-schema.test.ts`, adicione estes testes **depois** do teste
"por_metro exige diâmetro" (depois da linha 29, antes do `});` final do `describe`):

```ts
  it("ordemSchema aceita tipo_servico ausente (edição não exige)", () => {
    expect(ordemSchema.safeParse(base).success).toBe(true);
  });

  it("ordemCriacaoSchema exige tipo_servico", () => {
    const semTipo = ordemCriacaoSchema.safeParse(base);
    expect(semTipo.success).toBe(false);
    const comTipo = ordemCriacaoSchema.safeParse({ ...base, tipo_servico: "terraplenagem" });
    expect(comTipo.success).toBe(true);
  });

  it("ordemCriacaoSchema ainda exige diâmetro em por_metro", () => {
    const r = ordemCriacaoSchema.safeParse({
      ...base,
      tipo_servico: "drenagem",
      modelo_cobranca: "por_metro",
    });
    expect(r.success).toBe(false);
  });

  it("aceita equipamento_previsto_id e inicio_previsto opcionais", () => {
    const r = ordemSchema.safeParse({
      ...base,
      equipamento_previsto_id: "eq-001",
      inicio_previsto: "2026-08-01",
    });
    expect(r.success).toBe(true);
  });
```

E troque o import no topo do arquivo:

```ts
import { ordemSchema } from "@/features/ordem-servico/ordem-schema";
```

para:

```ts
import { ordemSchema, ordemCriacaoSchema } from "@/features/ordem-servico/ordem-schema";
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/features/ordem-servico/ordem-schema.test.ts`
Expected: FAIL — `ordemCriacaoSchema` não existe ainda (erro de import/TS), os testes novos falham.

- [ ] **Step 3: Atualizar `ordem-schema.ts`**

Substitua o conteúdo inteiro de `src/features/ordem-servico/ordem-schema.ts` por:

```ts
import { z } from "zod";

const numeroOpcionalPositivo = z
  .number({ invalid_type_error: "Informe um número válido" })
  .positive("Informe um valor maior que zero")
  .optional();

export const ordemSchema = z
  .object({
    cliente_id: z.string().min(1, "Selecione o cliente"),
    obra_nome: z.string().trim().min(2, "Informe a obra"),
    endereco: z.string().trim().optional(),
    modelo_cobranca: z.enum(["hora_maquina", "por_metro"]),
    responsavel_id: z.string().optional(),
    observacao: z.string().trim().max(500).optional(),
    diametro_broca_mm: numeroOpcionalPositivo,
    tipo_servico: z
      .enum([
        "terraplenagem",
        "drenagem",
        "nivelamento",
        "fundacao_estacas",
        "cascalhamento",
        "limpeza_terreno",
      ])
      .optional(),
    equipamento_previsto_id: z.string().optional(),
    inicio_previsto: z.string().optional(),
    orcamento_id: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.modelo_cobranca === "por_metro" && !val.diametro_broca_mm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diametro_broca_mm"],
        message: "Informe o diâmetro da broca",
      });
    }
  });

// Só a criação exige tipo_servico — na edição o campo pode ficar em branco
// (OS antigas nunca tiveram esse dado).
export const ordemCriacaoSchema = ordemSchema.superRefine((val, ctx) => {
  if (!val.tipo_servico) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tipo_servico"],
      message: "Selecione o tipo de serviço",
    });
  }
});

export type OrdemFormValues = z.infer<typeof ordemSchema>;
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `npx vitest run src/features/ordem-servico/ordem-schema.test.ts`
Expected: PASS — todos os testes (4 originais + 4 novos).

- [ ] **Step 5: Commit**

```bash
git add src/features/ordem-servico/ordem-schema.ts src/features/ordem-servico/ordem-schema.test.ts
git commit -m "feat: validar tipo_servico obrigatório na criação de OS"
```

---

### Task 3: Formulário — campos novos, vínculo de orçamento e resumo ao vivo

**Files:**
- Modify: `src/features/ordem-servico/components/ordem-form.tsx`
- Create: `src/features/ordem-servico/components/resumo-nova-ordem.tsx`

**Interfaces:**
- Consumes: `ordemCriacaoSchema`/`OrdemFormValues` (Task 2); `TIPO_SERVICO_LABEL`, `TIPOS_SERVICO`,
  `SEM_RESPONSAVEL`, `SEM_EQUIPAMENTO`, `SEM_ORCAMENTO` (Task 1, `labels.tsx`);
  `orcamentosStore.vincularOS(id: string, osId: string): Promise<void>` (já existe,
  `orcamentos-store.ts:200`); `orcamentosStore.useTodos()`, `orcamentosStore.obter(id)`;
  `TIPO_ICONE: Record<TipoEquipamento, string>` (já existe, `equipamentos/labels.tsx:23`).
- Produces: `OrdemForm` continua com a mesma API pública (`inicial`, `onSuccess`, `onCancel`) —
  quando `inicial` é `null`, agora renderiza formulário + `ResumoNovaOrdem` lado a lado.
  `ResumoNovaOrdem({ control }: { control: Control<OrdemFormValues> })` — novo componente,
  consumido só por `OrdemForm`.

- [ ] **Step 1: Criar `resumo-nova-ordem.tsx`**

Crie `src/features/ordem-servico/components/resumo-nova-ordem.tsx`:

```tsx
import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { clientesStore } from "@/features/clientes/clientes-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import {
  TIPO_SERVICO_LABEL,
  SEM_RESPONSAVEL,
  SEM_EQUIPAMENTO,
  SEM_ORCAMENTO,
} from "@/features/ordem-servico/labels";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData } from "@/shared/lib/format";
import type { OrdemFormValues } from "@/features/ordem-servico/ordem-schema";

function Linha({ rotulo, valor, vazio }: { rotulo: string; valor: string; vazio?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className={vazio ? "text-foreground-faint" : "font-medium text-foreground"}>
        {valor}
      </span>
    </div>
  );
}

// Painel de resumo ao vivo da criação de OS — lê o formulário via useWatch
// (mesmo `control` do OrdemForm) e não persiste nada por conta própria.
export function ResumoNovaOrdem({ control }: { control: Control<OrdemFormValues> }) {
  const valores = useWatch({ control });
  const cliente = valores.cliente_id ? clientesStore.getById(valores.cliente_id) : undefined;
  const responsavel =
    valores.responsavel_id && valores.responsavel_id !== SEM_RESPONSAVEL
      ? operadoresStore.getById(valores.responsavel_id)
      : undefined;
  const equipamento =
    valores.equipamento_previsto_id && valores.equipamento_previsto_id !== SEM_EQUIPAMENTO
      ? equipamentosStore.getById(valores.equipamento_previsto_id)
      : undefined;
  const orcamento =
    valores.orcamento_id && valores.orcamento_id !== SEM_ORCAMENTO
      ? orcamentosStore.obter(valores.orcamento_id)
      : undefined;
  const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon
              icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:clipboard-list"}
              className="h-6 w-6"
            />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold text-primary">{numero}</div>
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.obra_nome?.trim() || "Nova ordem de serviço"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha rotulo="Cliente" valor={cliente?.nome ?? "a definir"} vazio={!cliente} />
          <Linha
            rotulo="Tipo"
            valor={valores.tipo_servico ? TIPO_SERVICO_LABEL[valores.tipo_servico] : "a definir"}
            vazio={!valores.tipo_servico}
          />
          <Linha rotulo="Equipamento" valor={equipamento?.nome ?? "a definir"} vazio={!equipamento} />
          <Linha
            rotulo="Responsável"
            valor={responsavel?.nome ?? "a definir"}
            vazio={!responsavel}
          />
          <Linha
            rotulo="Início"
            valor={valores.inicio_previsto ? formatData(valores.inicio_previsto) : "a definir"}
            vazio={!valores.inicio_previsto}
          />
          <Linha rotulo="Orçamento" valor={orcamento?.numero ?? "nenhum"} vazio={!orcamento} />
          <Linha
            rotulo="Valor previsto"
            valor={orcamento ? formatBRL(orcamento.valor_total) : "a definir"}
            vazio={!orcamento}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:smartphone" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Ao abrir a OS, ela aparece no <strong className="text-foreground">app de campo</strong>{" "}
          do operador — os apontamentos por horímetro passam a chegar em tempo real.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Atualizar os imports e o `useForm` de `ordem-form.tsx`**

Em `src/features/ordem-servico/components/ordem-form.tsx`, troque o bloco de imports (linhas
1-29) por:

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import {
  ordemSchema,
  ordemCriacaoSchema,
  type OrdemFormValues,
} from "@/features/ordem-servico/ordem-schema";
import {
  MODELO_LABEL,
  TIPO_SERVICO_LABEL,
  TIPOS_SERVICO,
  SEM_RESPONSAVEL,
  SEM_EQUIPAMENTO,
  SEM_ORCAMENTO,
} from "@/features/ordem-servico/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { GerarTextoBotao } from "@/features/ia/components/gerar-texto-botao";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SugestaoAlocacaoPainel } from "@/features/ia/components/sugestao-alocacao-painel";
import { ResumoNovaOrdem } from "@/features/ordem-servico/components/resumo-nova-ordem";
import type { ModeloCobranca, OrdemServico } from "@/shared/types";

const MODELOS: ModeloCobranca[] = ["hora_maquina", "por_metro"];
```

(Remove a linha antiga `const SEM_RESPONSAVEL = "sem-responsavel";` — ela vem de `labels.tsx`
agora.)

Troque o corpo do `useForm` (linhas 43-61 do arquivo original):

```tsx
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrdemFormValues>({
    resolver: zodResolver(inicial ? ordemSchema : ordemCriacaoSchema),
    defaultValues: {
      cliente_id: inicial?.cliente_id ?? "",
      obra_nome: inicial?.obra_nome ?? "",
      endereco: inicial?.endereco ?? "",
      modelo_cobranca: inicial?.modelo_cobranca ?? "hora_maquina",
      responsavel_id: inicial?.responsavel_id ?? undefined,
      observacao: inicial?.observacao ?? "",
      diametro_broca_mm: inicial?.diametro_broca_mm ?? undefined,
      tipo_servico: inicial?.tipo_servico ?? undefined,
      equipamento_previsto_id: inicial?.equipamento_previsto_id ?? undefined,
      inicio_previsto: inicial?.inicio_previsto ?? "",
      orcamento_id: undefined,
    },
  });
```

- [ ] **Step 3: Atualizar `onSubmit`**

Troque o corpo de `onSubmit` (linhas 65-95 do arquivo original) por:

```tsx
  const onSubmit = async (values: OrdemFormValues) => {
    const responsavel =
      values.responsavel_id && values.responsavel_id !== SEM_RESPONSAVEL
        ? values.responsavel_id
        : null;
    const equipamentoPrevisto =
      values.equipamento_previsto_id && values.equipamento_previsto_id !== SEM_EQUIPAMENTO
        ? values.equipamento_previsto_id
        : null;
    const orcamentoEscolhido =
      values.orcamento_id && values.orcamento_id !== SEM_ORCAMENTO ? values.orcamento_id : null;
    const ehPorMetro = values.modelo_cobranca === "por_metro";
    const dados = {
      cliente_id: values.cliente_id,
      obra_nome: values.obra_nome,
      endereco: values.endereco?.trim() ? values.endereco.trim() : null,
      modelo_cobranca: values.modelo_cobranca,
      responsavel_id: responsavel,
      observacao: values.observacao?.trim() ? values.observacao.trim() : null,
      diametro_broca_mm: ehPorMetro ? (values.diametro_broca_mm ?? null) : null,
      tipo_servico: values.tipo_servico ?? null,
      equipamento_previsto_id: equipamentoPrevisto,
      inicio_previsto: values.inicio_previsto?.trim() ? values.inicio_previsto.trim() : null,
    };

    try {
      if (inicial) {
        await ordensStore.atualizar(inicial.id, dados);
        toast.success("OS atualizada.");
      } else {
        const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
        const novaOrdem = await ordensStore.criar({ ...dados, numero });
        if (orcamentoEscolhido) {
          await orcamentosStore.vincularOS(orcamentoEscolhido, novaOrdem.id);
        }
        toast.success(`OS criada — ${numero}.`);
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error((inicial ? "Falha ao atualizar a OS" : "Falha ao criar a OS") + detalhe);
    }
  };
```

- [ ] **Step 4: Adicionar os campos novos no JSX do formulário**

Dentro da função `OrdemForm`, logo no início (antes de `const {`), adicione as listas reativas
que os novos selects precisam:

```tsx
  const equipamentosAtivos = equipamentosStore.useAll().filter((e) => e.ativo);
  const orcamentosVinculaveis = orcamentosStore
    .useTodos()
    .filter((o) => o.status === "aprovado" && !o.os_id);
```

(logo abaixo das linhas já existentes `const clientes = ...` / `const operadores = ...` /
`const apontamentos = ...` / `const equipamentos = ...` — não remova essas quatro, `equipamentos`
sem filtro continua sendo usado por `GerarTextoBotao`.)

No JSX, localize o bloco condicional do diâmetro da broca (`{modelo === "por_metro" ? (...) : null}`)
e insira **depois** dele, **antes** do bloco de "Observação":

```tsx
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tipo_servico">
            Tipo de serviço{!inicial ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Controller
            control={control}
            name="tipo_servico"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="tipo_servico" aria-invalid={!!errors.tipo_servico}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERVICO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_SERVICO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo_servico ? (
            <p className="text-xs text-destructive">{errors.tipo_servico.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inicio_previsto">Início previsto</Label>
          <Input
            id="inicio_previsto"
            type="date"
            className="font-mono"
            {...register("inicio_previsto")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="equipamento_previsto_id">Equipamento previsto</Label>
        <Controller
          control={control}
          name="equipamento_previsto_id"
          render={({ field }) => (
            <Select value={field.value ?? SEM_EQUIPAMENTO} onValueChange={field.onChange}>
              <SelectTrigger id="equipamento_previsto_id">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEM_EQUIPAMENTO}>Sem equipamento definido</SelectItem>
                {equipamentosAtivos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {!inicial ? (
        <div className="space-y-1.5">
          <Label htmlFor="orcamento_id">Orçamento vinculado</Label>
          <Controller
            control={control}
            name="orcamento_id"
            render={({ field }) => (
              <Select value={field.value ?? SEM_ORCAMENTO} onValueChange={field.onChange}>
                <SelectTrigger id="orcamento_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_ORCAMENTO}>Sem orçamento vinculado</SelectItem>
                  {orcamentosVinculaveis.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.numero} · {o.descricao_obra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}
```

- [ ] **Step 5: Trocar o layout final (formulário sozinho vs. 2 colunas)**

No final do componente, troque:

```tsx
  if (inicial) return formulario;

  return (
    <Tabs defaultValue="dados">
      <TabsList>
        <TabsTrigger value="dados">Dados da OS</TabsTrigger>
        <TabsTrigger value="sugestao">Sugestão de IA</TabsTrigger>
      </TabsList>
      <TabsContent value="dados" className="mt-4">
        {formulario}
      </TabsContent>
      <TabsContent value="sugestao" className="mt-4">
        <SugestaoAlocacaoPainel modeloCobranca={modelo} />
      </TabsContent>
    </Tabs>
  );
}
```

por:

```tsx
  if (inicial) return formulario;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados da OS</TabsTrigger>
          <TabsTrigger value="sugestao">Sugestão de IA</TabsTrigger>
        </TabsList>
        <TabsContent value="dados" className="mt-4">
          {formulario}
        </TabsContent>
        <TabsContent value="sugestao" className="mt-4">
          <SugestaoAlocacaoPainel modeloCobranca={modelo} />
        </TabsContent>
      </Tabs>
      <ResumoNovaOrdem control={control} />
    </div>
  );
}
```

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm run test`
Expected: PASS — todos os testes existentes (nenhum teste cobre `OrdemForm` diretamente hoje, então
não há regressão de asserções; a checagem real aqui é `ordem-schema.test.ts`, já verde na Task 2).

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add src/features/ordem-servico/components/ordem-form.tsx \
  src/features/ordem-servico/components/resumo-nova-ordem.tsx
git commit -m "feat: novos campos e resumo ao vivo no formulário de OS"
```

---

### Task 4: Rota dedicada `/admin/ordens/nova`

**Files:**
- Create: `src/features/ordem-servico/components/nova-ordem-page.tsx`
- Create: `src/routes/admin.ordens.nova.tsx`
- Modify: `src/features/ordem-servico/components/ordens-retaguarda-page.tsx`

**Interfaces:**
- Consumes: `OrdemForm` (Task 3, mesma API pública `inicial`/`onSuccess`/`onCancel`);
  `ordensStore.listar()`, `proximoNumeroOS` (já existentes).
- Produces: `NovaOrdemPage` — componente de página, consumido só pela rota
  `/admin/ordens/nova`.

- [ ] **Step 1: Criar a página**

Crie `src/features/ordem-servico/components/nova-ordem-page.tsx`:

```tsx
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";

export function NovaOrdemPage() {
  const navigate = useNavigate();
  const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
  const voltar = () => navigate({ to: "/admin/ordens" });

  return (
    <div className="space-y-6">
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Ordens de Serviço
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Nova OS
        </h1>
        <span className="rounded-full border bg-surface px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {numero} · rascunho
        </span>
      </div>

      <OrdemForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </div>
  );
}
```

- [ ] **Step 2: Criar a rota**

Crie `src/routes/admin.ordens.nova.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { NovaOrdemPage } from "@/features/ordem-servico/components/nova-ordem-page";

export const Route = createFileRoute("/admin/ordens/nova")({
  head: () => ({
    meta: [
      { title: "Nova OS · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaOrdemPage,
});
```

O servidor de desenvolvimento (já rodando) regenera `src/routeTree.gen.ts` automaticamente ao
detectar o arquivo novo — não edite esse arquivo manualmente.

- [ ] **Step 3: Trocar o botão "Nova OS" por navegação**

Em `src/features/ordem-servico/components/ordens-retaguarda-page.tsx`:

Remova o import de `FormDialog` (linha 8) e de `OrdemForm` (linha 23) — não são mais usados
nesse arquivo. Remova a linha `const [formAberto, setFormAberto] = useState(false);` (linha 58).

Troque o botão da toolbar (linhas 256-264):

```tsx
          <Button
            onClick={() => setFormAberto(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Nova OS
          </Button>
```

por:

```tsx
          <Button
            asChild
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link to="/admin/ordens/nova">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Nova OS
            </Link>
          </Button>
```

Troque o botão do empty state (linhas 284-291):

```tsx
            todas.length === 0 ? (
              <Button
                onClick={() => setFormAberto(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Abrir primeira OS
              </Button>
            ) : undefined,
```

por:

```tsx
            todas.length === 0 ? (
              <Button
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Link to="/admin/ordens/nova">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Abrir primeira OS
                </Link>
              </Button>
            ) : undefined,
```

Remova o bloco `<FormDialog>...</FormDialog>` de criação no final do JSX (logo antes do
`</div>` de fechamento do componente):

```tsx
      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Nova OS"
        descricao="Os campos com * são obrigatórios."
      >
        <OrdemForm
          inicial={null}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>
```

(remova esse bloco inteiro — sobra só o `</div>` final).

- [ ] **Step 4: Rodar a suíte completa e checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros (a rota `/admin/ordens/nova` já existe no `routeTree.gen.ts` regenerado, então
`<Link to="/admin/ordens/nova">` tipa corretamente).

Run: `npm run test`
Expected: PASS — 550+ testes (mais os 8 novos das Tasks 2), nenhuma regressão.

- [ ] **Step 5: Commit**

```bash
git add src/features/ordem-servico/components/nova-ordem-page.tsx \
  src/routes/admin.ordens.nova.tsx \
  src/features/ordem-servico/components/ordens-retaguarda-page.tsx
git commit -m "feat: mover criação de OS para página dedicada /admin/ordens/nova"
```

---

## Self-Review Notes

- **Spec coverage:** as 6 decisões da spec estão cobertas — equipamento informativo (Task 1
  `equipamento_previsto_id` sem FK em `apontamentos`; Task 3 sem qualquer leitura por
  `apontamentosStore`), orçamento reaproveitando `vincularOS` (Task 3 Step 3), valor previsto só
  exibido via `orcamento.valor_total` (Task 3 `ResumoNovaOrdem`, nunca persistido), tipo_servico
  enum fixo nullable (Task 1 + Task 2), início previsto `date` opcional (Task 1 + Task 3), rota
  dedicada com 2 colunas (Task 3 Step 5 + Task 4).
- **Placeholder scan:** nenhum "TBD"/similar — todo código e comando é literal e completo.
- **Type consistency:** `TipoServico` (Task 1) → usado literalmente (mesmos 6 valores) em
  `z.enum(...)` (Task 2) e em `TIPO_SERVICO_LABEL`/`TIPOS_SERVICO` (Task 1) → consumidos por
  `ordem-form.tsx` e `resumo-nova-ordem.tsx` (Task 3) com nomes idênticos.
  `SEM_RESPONSAVEL`/`SEM_EQUIPAMENTO`/`SEM_ORCAMENTO` definidos uma única vez em `labels.tsx`
  (Task 1) e importados (não redeclarados) em ambos os componentes da Task 3 — evita o import
  circular que existiria se vivessem em `ordem-form.tsx`.
