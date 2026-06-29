# PRD-006 Orçamentos — Design (Frontend First, mockado)

> Spec derivada do `docs/prds/PRD-006-ret-orcamentos.md`. Resolve as 4 decisões pendentes do PRD
> e fixa o desenho técnico. Convenções do repositório em `CLAUDE.md` (não repetidas aqui).
> Codinome alvo: **Quote** · Versão alvo: **0.6.0**.

## Objetivo

Entregar a UI mockada onde o proprietário monta orçamentos a partir das tabelas de preço (PRD-005),
antes da execução. Orçamento tem ciclo `rascunho → enviado → aprovado/recusado`, validade, desconto, e
um handoff opcional para virar OS (PRD-003). **Só retaguarda — nenhum dado de orçamento toca `/app/*`.**

## Princípio arquitetural

O orçamento é o **espelho pré-venda do Faturamento (PRD-004)**. Reaproveita os helpers puros já
existentes onde o contrato é idêntico; escreve código próprio onde a semântica difere:

| Dimensão | Faturamento (PRD-004) | Orçamento (PRD-006) |
|----------|----------------------|---------------------|
| Origem dos itens | **Derivados** de uma OS fechada (`gerarItens`) | **Montados do zero** a partir das tabelas de preço |
| Status | `rascunho → faturado` (2) | `rascunho → enviado → aprovado/recusado` (4) |
| Validade | — | data limite (default +30 dias) |
| Handoff | OS → fatura | orçamento aprovado → OS (opcional) |
| Quantidade | `quantidade` (realizada) | `quantidade_estimada` (pré-venda) |

**Reuso direto** (import de `@/features/faturamento/calculo`): `round2`, `valorItem`,
`precoHoraDoEquipamento`, `precoFundacaoDoDiametro`. Ambas as features são retaguarda; nenhuma é
importada em `/app/*`, então o cross-import é seguro.

## Decisões resolvidas (eram pendentes no PRD)

1. **Validade padrão:** ao criar, `validade = hoje + 30 dias` (editável; pode ficar nula).
2. **Handoff → OS:** botão **"Gerar OS"** disponível quando `status === "aprovado"` e `os_id === null`.
   Cria a OS pré-preenchida (cliente, obra=`descricao_obra`, `modelo_cobranca` inferido, +
   diâmetro/metragem se por metro), grava `os_id`, navega para a nova OS. **Itens não migram** — a OS
   deriva horas dos apontamentos (modelo do PRD-003). Se já houver `os_id`, mostra link para a OS.
3. **Desconto:** incluído, espelhando o Faturamento. `valor_total = soma(itens) − desconto` (desconto ≥ 0).
4. **Override de preço:** o valor unitário nasce da tabela (PRD-005) mas é **editável por item**
   (negociação). Zerar/limpar marca o item como `sem_preco` (pendência, não bloqueia).
5. **Numeração** (resolvida por padrão do codebase): `ORC-AAAA-NNNN`, sequencial por ano
   (espelha `proximoNumeroFAT` / `proximoNumeroOS`).
6. **Tipo de item:** `TipoItemOrcamento = "hora_maquina" | "por_metro" | "mobilizacao"` — idêntico a
   `TipoItemFaturamento`, cobrindo mobilização (RF-003).
7. **Sem prefixo `I`** nos types (consistência com o codebase, apesar do contrato ilustrativo do PRD).

## Contrato de dados (`src/shared/types/index.ts`, append)

```typescript
// Orçamentos (PRD-006) — pré-venda; montados a partir das tabelas de preço. Só retaguarda;
// NUNCA importado/renderizado em /app/*. Item espelha FaturamentoItem (quantidade_estimada).
export type StatusOrcamento = "rascunho" | "enviado" | "aprovado" | "recusado";
export type TipoItemOrcamento = "hora_maquina" | "por_metro" | "mobilizacao";

export interface OrcamentoItem {
  id: string;
  tipo: TipoItemOrcamento;
  descricao: string;                  // "Escavadeira 10t — 40 h operada (estimado)"
  origem_id: string | null;           // equipamento_id (hora) / preco_mobilizacao_id (mob.) / null (metro)
  hora_tipo: "seca" | "operada" | null; // só hora_maquina
  quantidade_estimada: number;        // horas, metros ou 1
  valor_unitario: number | null;      // null = SEM PREÇO ativo (pendência)
  valor_total: number;                // round2(quantidade_estimada × valor_unitario); 0 se sem preço
  sem_preco: boolean;
}

export interface Orcamento {
  id: string;
  numero: string;                     // "ORC-2026-0001"
  cliente_id: string;                 // FK → Cliente (PRD-001)
  descricao_obra: string;
  itens: OrcamentoItem[];
  desconto: number;                   // R$ subtraído do subtotal (≥ 0)
  valor_total: number;                // soma(itens) − desconto
  validade: string | null;            // ISO date (limite); default hoje+30d na criação
  observacao: string | null;
  status: StatusOrcamento;
  os_id: string | null;               // preenchido quando vira OS (PRD-003)
  enviado_em: string | null;          // ISO — quando marcado enviado
  decidido_em: string | null;         // ISO — quando aprovado/recusado
  created_at: string;
  updated_at: string;
}
```

## Estrutura de arquivos

```
src/features/orcamentos/
├── calculo.ts                # builders de item + total + pendência (reusa faturamento/calculo)
├── calculo.test.ts
├── numero-orcamento.ts       # proximoNumeroORC
├── numero-orcamento.test.ts
├── derivacoes.ts             # validadeVencida, podeEnviar, podeDecidir (guards puros)
├── derivacoes.test.ts
├── orcamentos-store.ts       # criarOrcamentosStore + singleton
├── orcamentos-store.test.ts
├── orcamento-schema.ts       # zod do form "Novo orçamento"
├── labels.tsx                # StatusOrcamentoBadge + constantes
├── index.ts                  # barrel: OrcamentosPage, OrcamentoDetalhe
└── components/
    ├── orcamentos-page.tsx       # lista + filtros + CTA "Novo orçamento"
    ├── orcamento-form.tsx        # form de criação (cliente/obra/validade)
    ├── orcamento-detalhe.tsx     # editor/visualização + ciclo + handoff
    ├── orcamento-item-row.tsx    # linha de item (qtd. estimada/valor/seca-operada/remover)
    └── adicionar-item-orcamento.tsx  # seletor tipo → fonte de preço → qtd → "Adicionar"

src/mocks/orcamentos.ts        # ~5-6 orçamentos (edge cases), + orcamentos.test.ts

src/routes/
├── admin.orcamentos.index.tsx        # OrcamentosPage (noindex)
└── admin.orcamentos.$orcamentoId.tsx # OrcamentoDetalhe (noindex, notFound)

src/features/retaguarda/retaguarda-shell.tsx  # +1 item de nav "Orçamentos"
```

## Cálculo (`calculo.ts`)

Importa de `@/features/faturamento/calculo`: `round2`, `valorItem`, `precoHoraDoEquipamento`,
`precoFundacaoDoDiametro`. Expõe:

- `criarItemHora(equipamento, precosHM, horasEstimadas, horaTipo = "operada"): OrcamentoItem`
  — busca preço pelo equipamento; `valor_unitario = seca|operada`; `sem_preco` se sem tarifa ativa.
  `id = crypto.randomUUID()`. Descrição: `"{nome} — {horas} h {horaTipo} (estimado)"`.
- `criarItemMetro(diametroMm, precosFund, metrosEstimados): OrcamentoItem`
  — busca preço pelo diâmetro; descrição `"Estaca Ø{d}mm — {m}m (estimado)"`.
- `criarItemMobilizacao(precoMob): OrcamentoItem` — `quantidade_estimada = 1`, `valor_unitario = preco.valor`.
- `aplicarHoraTipo(item, equipamento, precosHM, tipo): OrcamentoItem` — troca seca↔operada, re-busca preço
  (espelha `faturamento/calculo.aplicarHoraTipo`, adaptado a `quantidade_estimada`).
- `calcularTotalOrcamento(itens, desconto): number` — `round2(soma(valor_total) − desconto)`.
- `temPendencia(orc: { itens: OrcamentoItem[] }): boolean` — algum item `sem_preco`.

## Número (`numero-orcamento.ts`)

`proximoNumeroORC(orcamentos: Pick<Orcamento, "numero">[], ano: number): string` →
`ORC-${ano}-${seq.padStart(4,"0")}`, maior sequencial existente do ano + 1. Espelha `proximoNumeroFAT`.

## Derivações puras (`derivacoes.ts`)

- `validadeVencida(orc, agoraISO): boolean` — `validade != null && validade < hoje` (compara datas).
- `podeEnviar(orc): { pode: boolean; motivo?: string }` — bloqueia se `status !== "rascunho"` ou
  `itens.length === 0` (motivo: "Orçamento vazio: adicione ao menos um item.").
- `podeDecidir(orc): { pode: boolean; motivo?: string }` — só a partir de `status === "enviado"`.

## Store (`orcamentos-store.ts`)

`criarOrcamentosStore(inicial)` + singleton `orcamentosStore`, padrão `useSyncExternalStore`
(igual a `faturamentos-store`). Resultados discriminados para transições.

```typescript
type ResultadoTransicao =
  | { ok: true; orcamento: Orcamento }
  | { ok: false; motivo: string };

type NovoOrcamento = { cliente_id: string; descricao_obra: string; validade: string | null };
type PatchOrcamento = Partial<Pick<Orcamento, "itens" | "desconto" | "observacao" | "descricao_obra" | "validade">>;
```

- `listar()`, `obter(id)`
- `criar(data: NovoOrcamento): Orcamento` — status `rascunho`, `numero` via `proximoNumeroORC`,
  `itens: []`, `desconto: 0`, `valor_total: 0`, `os_id/enviado_em/decidido_em: null`.
- `atualizar(id, patch: PatchOrcamento)` — recalcula `valor_total` via `calcularTotalOrcamento`.
- `enviar(id): ResultadoTransicao` — usa `podeEnviar`; seta `status: "enviado"`, `enviado_em`.
- `aprovar(id): ResultadoTransicao` — usa `podeDecidir`; seta `status: "aprovado"`, `decidido_em`.
- `recusar(id): ResultadoTransicao` — usa `podeDecidir`; seta `status: "recusado"`, `decidido_em`.
- `vincularOS(id, osId: string)` — seta `os_id` (chamado pelo handoff).
- `useTodos()`, `useOrcamento(id)`.

## UI

### `orcamentos-page.tsx` (lista)
`PageHeader "Orçamentos"` + CTA "Novo orçamento" (abre `FormDialog` com `OrcamentoForm`).
`DataList` + `useMockResource` com colunas **Número · Cliente · Valor · Validade · Status** e cards no
mobile. Toolbar: busca (número/cliente) + filtro de status (`StatusOrcamento | "todos"`). Validade
vencida sinalizada (texto destrutivo). Empty state com CTA "Novo orçamento".

### `orcamento-form.tsx` (criação)
`react-hook-form` + `zodResolver(orcamentoSchema)`. Campos: cliente (Select de ativos, obrigatório),
`descricao_obra` (Input, obrigatório, min 3), `validade` (Input `type="date"`, default hoje+30d).
Submit → `orcamentosStore.criar` → `navigate` para `/admin/orcamentos/$orcamentoId` (começar a montar itens).

### `orcamento-detalhe.tsx` (editor + ciclo + handoff)
- Header: `numero` (mono), cliente, `descricao_obra`, `StatusOrcamentoBadge`, validade (com aviso se vencida),
  trilha `enviado_em`/`decidido_em`.
- Seção Itens: lista `OrcamentoItemRow`; se `editavel` (status `rascunho`), mostra `AdicionarItemOrcamento`.
- Seção valores (editável só em rascunho): desconto (R$), observação, **Total** (`formatBRL`).
- Aviso de pendência se `temPendencia`.
- Ações por status:
  - `rascunho`: **Enviar** (usa `enviar`; toast de bloqueio se vazio).
  - `enviado`: **Aprovar** / **Recusar** (ConfirmDialog).
  - `aprovado` sem `os_id`: **Gerar OS** → infere `modelo_cobranca` (1º item não-mobilização; default
    `hora_maquina`), monta `NovaOrdem` (cliente, obra, modelo, +diâmetro/metragem estimada se por metro,
    `observacao: "Gerado do orçamento {numero}"`), `numero` via `proximoNumeroOS`, `ordensStore.criar`,
    `orcamentosStore.vincularOS`, toast, `navigate` → `/admin/ordens/$ordemId`.
  - `aprovado` com `os_id` / `recusado`: read-only; se `os_id`, link para a OS.

### `orcamento-item-row.tsx`
Espelha `faturamento-item-row` com `quantidade_estimada` e rótulo "Qtd. estimada". Campos: descrição,
badge "Sem preço" se `sem_preco`, qtd. estimada (editável), valor unit. (editável), seca/operada (toggle,
só hora-máquina), total, remover. Não-editável quando `editavel === false`.

### `adicionar-item-orcamento.tsx`
Seletor de tipo (hora-máquina / por metro / mobilização) → fonte contextual:
- hora-máquina: Select de equipamentos ativos → cria item via `criarItemHora` (default operada, qtd 1).
- por metro: Select de diâmetros (preços fundação ativos) → `criarItemMetro` (qtd 1).
- mobilização: Select de mobilizações ativas → `criarItemMobilizacao`.
Adiciona ao `itens` via `orcamentosStore.atualizar`. Quantidade ajustada depois na linha.

### `labels.tsx`
`STATUS_ORCAMENTO_LABEL` (Rascunho/Enviado/Aprovado/Recusado), `STATUS_ORCAMENTO` (array),
`STATUS_CLASSE` (rascunho=steel, enviado=primary/amber, aprovado=verde via token, recusado=destructive),
`StatusOrcamentoBadge`. Header `eslint-disable react-refresh/only-export-components`.

### Sidebar (`retaguarda-shell.tsx`)
Novo item `{ to: "/admin/orcamentos", label: "Orçamentos", icone: ClipboardList }` (lucide, padrão do
arquivo) inserido **antes** de "Faturamento" (ordem do funil: Preços → Orçamentos → Faturamento).

### Rotas
`admin.orcamentos.index.tsx` (head noindex) e `admin.orcamentos.$orcamentoId.tsx` (head noindex +
`notFound` no loader quando o id não existe, igual a `admin.faturamento.$faturamentoId.tsx`).

## Mocks (`src/mocks/orcamentos.ts`)

~6 orçamentos derivados de `clientes.ts` + `precos-*.ts`, aritmética consistente (como `faturamentos.ts`):

| id | status | conteúdo / edge case |
|----|--------|----------------------|
| orc-001 | rascunho | **vazio** (itens `[]`, total 0) — edge "sem itens" |
| orc-002 | enviado | multi-item: hora-máquina operada (eq-001) + mobilização (pm-001); validade futura |
| orc-003 | aprovado | por metro (Ø300, pf-001); **`os_id` preenchido** (OS existente) |
| orc-004 | recusado | hora-máquina com **item sem preço** (eq-005, tarifa inativa) |
| orc-005 | enviado | **validade vencida** (data no passado) |
| orc-006 | rascunho | hora-máquina seca + mobilização longa (cobre seca + desconto > 0) |

Item ids determinísticos (`orc-002:eq-001`, `orc-002:mob`, `orc-003:metro`). `os_id` de orc-003 referencia
uma OS existente do `ordens-servico.ts`.

## Barreira financeira (RF-011 / RNF-002)

`src/features/orcamentos/**` e `src/mocks/orcamentos*` **nunca** importados sob `src/routes/app.*`,
`src/features/operador/**` ou `src/features/apontamento/**`. Verificação final por grep na última task.

## Estados de tela

| Tela | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| Lista | skeleton (DataList) | "Nenhum orçamento" + CTA | mensagem + retry | tabela/cards |
| Detalhe | — (dados em memória) | "Sem itens ainda" | `notFound` → não encontrado | itens + total + ações |

## Gate de qualidade

`npx tsc --noEmit` (EXIT 0, autoritativo) + `npx vitest run`. `npm run lint` = ruído CRLF, **não é gate**.
Rotas: smoke SSR `curl` em `:8082` (regenera `routeTree.gen.ts`; se diff só CRLF, `git checkout --`).
Sem `any`, sem `!` non-null. Dinheiro exato em R$ (2 casas) via `formatBRL`.

## Pós-implementação

Versão 0.5.0 → **0.6.0 "Quote"**; `CHANGELOG.md` (Added); `PRD-006-ret-orcamentos.md` → `_DONE` +
status IMPLEMENTADO; `INDEX-PRDs-antonello.md` (7/15 ≈ 47%, histórico 0.6.0 Quote).

## Fora de escopo (PRD)

Geração interna da OS além do pré-preenchimento; envio ao cliente (e-mail/WhatsApp → PRD-009); NF/impostos;
backend/Supabase/RLS; qualquer exibição financeira no operador.
