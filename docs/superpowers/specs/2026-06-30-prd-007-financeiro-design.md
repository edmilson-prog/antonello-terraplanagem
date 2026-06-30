# Spec de Design — PRD-007: Contas a Pagar e Receber

> **Data:** 2026-06-30
> **PRD:** `docs/prds/PRD-007-ret-contas-pagar-receber.md`
> **Branch:** `feat/prd-007-financeiro`
> **Versão alvo:** 0.7.0 "Cashflow"

---

## 1. Decisões de Design (autônomas, modo auto)

| Decisão | Escolha | Razão |
|---------|---------|-------|
| **Vencimento padrão da conta a receber** | `faturado_em + 30 dias` | Consistente com PRD-006 (+30d); campo calculado no mock |
| **Recebimento parcial** | Não (MVP) | PRD-008 cuida de automação; complexidade não justificada aqui |
| **Categorias de despesa** | `diesel`, `manutencao`, `folha`, `fornecedor`, `outro` | Conforme PRD; inclui folha (já listada no PRD) |
| **Prefixo de interfaces** | Sem `I` (`ContaReceber`, `ContaPagar`) | Consistência: todos os tipos existentes (`Faturamento`, `Orcamento`, `OrdemServico`) não têm prefixo |
| **`StatusFaturamento` inalterado** | `"rascunho" \| "faturado"` permanece | "Recebido" é estado **derivado** da ContaReceber (liquidada), não um novo valor do enum; evita quebrar tipos existentes |
| **Contas a receber auto-geradas** | No mock: criadas manualmente para cada faturamento "faturado"; no backend futuro: trigger/edge function | Frontend First: mock espelha o estado "após processamento" |

---

## 2. Contrato de Tipos

Adicionados em `src/shared/types/index.ts` (ao final, com comentário de seção):

```typescript
// Financeiro (PRD-007) — contas a pagar e a receber. Só retaguarda;
// NUNCA importado/renderizado em /app/*.

export type StatusConta = "aberta" | "liquidada";
export type FormaRecebimento =
  | "dinheiro"
  | "pix"
  | "transferencia"
  | "boleto"
  | "cheque"
  | "outro";
export type CategoriaDespesa =
  | "diesel"
  | "manutencao"
  | "folha"
  | "fornecedor"
  | "outro";

export interface ContaReceber {
  id: string;
  faturamento_id: string;       // FK → Faturamento (PRD-004)
  cliente_id: string;           // FK → Cliente (PRD-001)
  valor: number;                // espelha Faturamento.valor_total
  vencimento: string;           // "YYYY-MM-DD" = faturado_em + 30d
  status: StatusConta;
  recebido_em: string | null;   // ISO date (YYYY-MM-DD)
  forma_recebimento: FormaRecebimento | null;
  created_at: string;
  updated_at: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;                // centavos com round2
  vencimento: string;           // "YYYY-MM-DD"
  status: StatusConta;
  pago_em: string | null;       // ISO date (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}
```

---

## 3. Mocks

### 3.1 `src/mocks/contas-receber.ts`

Faturamentos "faturado" disponíveis: fat-001 (cl-003, R$ 5220, faturado 2026-06-24) e fat-004 (cl-004, R$ 2700, faturado 2026-06-17). Os demais (fat-002 e fat-003) são rascunho — não geram conta a receber.

5 registros (fat-005..007 são referências futuras, aceitáveis no mock):

| id | faturamento_id | cliente_id | valor | vencimento | status | Edge case |
|----|---------------|-----------|-------|------------|--------|-----------|
| cr-001 | fat-001 | cl-003 | 5220 | 2026-07-24 | aberta | a vencer |
| cr-002 | fat-004 | cl-004 | 2700 | 2026-07-17 | aberta | a vencer |
| cr-003 | fat-005 | cl-001 | 12000 | 2026-06-10 | aberta | **vencida em aberto** |
| cr-004 | fat-006 | cl-002 | 3500 | 2026-06-20 | liquidada | recebida (forma: pix, 2026-06-25) |
| cr-005 | fat-007 | cl-003 | 7800 | 2026-08-05 | aberta | a vencer (prazo maior) |

### 3.2 `src/mocks/contas-pagar.ts`

5 registros:

| id | descricao | fornecedor | categoria | valor | vencimento | status | Edge case |
|----|-----------|-----------|----------|-------|------------|--------|-----------|
| cp-001 | Abastecimento Junho | Posto Ipiranga | diesel | 1800 | 2026-07-05 | aberta | a vencer |
| cp-002 | Revisão escavadeira 10t | Mecânica Silva | manutencao | 3200 | 2026-06-15 | aberta | **vencida em aberto** |
| cp-003 | Folha de pagamento Junho | null | folha | 8500 | 2026-07-05 | aberta | sem fornecedor |
| cp-004 | Borrachas e câmaras | Borracharia Rápida | fornecedor | 450 | 2026-06-28 | liquidada | pago em 2026-06-27 |
| cp-005 | Material de escritório | null | outro | 280 | 2026-07-15 | aberta | sem fornecedor |

---

## 4. Arquitetura de Stores

Dois stores independentes, padrão `criarMockStore` (igual a faturamentos e orçamentos):

### `src/features/financeiro/contas-receber-store.ts`

```typescript
criarContasReceberStore(seed: ContaReceber[])
// Singleton: contasReceberStore
// Ações públicas:
//   darBaixaReceber(id, { recebido_em, forma_recebimento }) → ResultadoContaReceber
//   listar() → ContaReceber[]
//   obter(id) → ContaReceber | null
//   useTodas() → ContaReceber[]
//   useContaReceber(id) → ContaReceber | null
```

### `src/features/financeiro/contas-pagar-store.ts`

```typescript
criarContasPagarStore(seed: ContaPagar[])
// Singleton: contasPagarStore
// Ações públicas:
//   criar(nova: NovaContaPagar) → ContaPagar
//   darBaixaPagar(id, { pago_em }) → ResultadoContaPagar
//   listar() → ContaPagar[]
//   obter(id) → ContaPagar | null
//   useTodas() → ContaPagar[]
```

`NovaContaPagar` = `Omit<ContaPagar, "id" | "status" | "pago_em" | "created_at" | "updated_at">`.

**ResultadoTransicao** (discriminated union, padrão orçamentos):
```typescript
type ResultadoContaReceber =
  | { ok: true; conta: ContaReceber }
  | { ok: false; erro: string }
```

---

## 5. Derivações Puras (`src/features/financeiro/derivacoes.ts`)

```typescript
// Vencida = em aberto E vencimento < agoraISO
contaVencida(conta: ContaReceber | ContaPagar, agoraISO: string): boolean

// Resumo de caixa
resumoCaixa(receber: ContaReceber[], pagar: ContaPagar[]): {
  totalReceber: number;   // sum(aberta) — valores em aberto
  totalPagar: number;     // sum(aberta) — valores em aberto
  saldoPrevisto: number;  // totalReceber - totalPagar
}

// Pipeline: atualiza resumoPipeline para incluir recebido real
// (em derivacoes.ts do faturamento — ver §8)
```

---

## 6. Labels (`src/features/financeiro/labels.tsx`)

```tsx
StatusContaBadge: ({ status }: { status: StatusConta }) => JSX.Element
  aberta    → badge "steel" (cinza aço)
  liquidada → badge "secondary" (terra, igual "aprovado" dos orçamentos)

CategoriaDespesaLabel: ({ categoria }: { categoria: CategoriaDespesa }) => string
  diesel      → "Diesel"
  manutencao  → "Manutenção"
  folha       → "Folha"
  fornecedor  → "Fornecedor"
  outro       → "Outro"

FormaRecebimentoLabel: ({ forma }: { forma: FormaRecebimento }) => string
  dinheiro    → "Dinheiro"
  pix         → "PIX"
  transferencia → "Transferência"
  boleto      → "Boleto"
  cheque      → "Cheque"
  outro       → "Outro"
```

---

## 7. Estrutura de Arquivos

```
src/
├── features/financeiro/
│   ├── contas-receber-store.ts
│   ├── contas-receber-store.test.ts
│   ├── contas-pagar-store.ts
│   ├── contas-pagar-store.test.ts
│   ├── derivacoes.ts
│   ├── derivacoes.test.ts
│   ├── labels.tsx
│   ├── components/
│   │   ├── financeiro-page.tsx        # tabs: A Receber | A Pagar | Caixa
│   │   ├── contas-receber-tab.tsx     # lista + vencidas destacadas
│   │   ├── contas-pagar-tab.tsx       # lista + vencidas + botão Nova Conta
│   │   ├── caixa-tab.tsx             # cards resumo + saldo
│   │   ├── dar-baixa-receber-dialog.tsx  # data + forma
│   │   └── dar-baixa-pagar-dialog.tsx    # data
│   └── index.ts                      # barrel: FinanceiroPage
├── mocks/
│   ├── contas-receber.ts
│   ├── contas-receber.test.ts
│   ├── contas-pagar.ts
│   └── contas-pagar.test.ts
└── routes/
    └── admin.financeiro.index.tsx    # rota /admin/financeiro (noindex)
```

**Arquivos existentes modificados:**

| Arquivo | Mudança |
|---------|---------|
| `src/shared/types/index.ts` | Append: `StatusConta`, `FormaRecebimento`, `CategoriaDespesa`, `ContaReceber`, `ContaPagar` |
| `src/features/faturamento/derivacoes.ts` | `resumoPipeline` recebe `contasReceber?: ContaReceber[]`; computa `recebido.total` e `recebido.qtd` |
| `src/features/faturamento/components/faturamento-pipeline.tsx` | Props: `recebido: { qtd: number; total: number }` (antes era placeholder) |
| `src/features/faturamento/components/faturas-tab.tsx` | Passa `contasReceber` para `resumoPipeline` e `recebido` para `FaturamentoPipeline` |
| `src/features/retaguarda/retaguarda-shell.tsx` | Nav item "Financeiro" (ícone `lucide:wallet`) após "Faturamento" |

---

## 8. Update do Pipeline (RF-010)

### `derivacoes.ts` (faturamento) — nova assinatura:

```typescript
export function resumoPipeline(
  ordens: OrdemServico[],
  faturamentos: Faturamento[],
  contasReceber?: ContaReceber[],  // opcional para retrocompatibilidade
): {
  executado: number;
  faturado: { qtd: number; total: number };
  recebido: { qtd: number; total: number };  // antes era `recebido: 0`
}
```

Lógica: `recebido.qtd` = contas com `status === "liquidada"` vinculadas a faturamentos "faturado"; `recebido.total` = soma dos `valor` dessas contas.

### `faturamento-pipeline.tsx` — props atualizadas:

```tsx
interface FaturamentoPipelineProps {
  executado: number;
  faturado: { qtd: number; total: number };
  recebido: { qtd: number; total: number };  // real agora
}
```

A coluna "Recebido" mostra `formatBRL(recebido.total)` e `"X recebimentos"` (removendo o `esmaecido` e o placeholder "Em breve (PRD-007)").

---

## 9. Componentes UI

### `financeiro-page.tsx`
- Tabs: A Receber | A Pagar | Caixa
- Header: "Financeiro" + descrição
- Cada aba tem seu próprio componente

### `contas-receber-tab.tsx`
- Tabela: Cliente | Faturamento | Valor | Vencimento | Status | Ação
- Vencidas (aberta + vencimento < hoje): linha com `text-destructive` e badge "Vencida"
- Ação: botão "Dar Baixa" → `DarBaixaReceberDialog`
- Empty: "Nenhuma conta a receber cadastrada"

### `contas-pagar-tab.tsx`
- Tabela: Descrição | Fornecedor | Categoria | Valor | Vencimento | Status | Ação
- Vencidas destacadas igual A Receber
- Botão primário "Nova Conta a Pagar" → abre dialog inline
- Ação por linha: "Dar Baixa" → `DarBaixaPagarDialog`
- Empty: "Nenhuma conta a pagar" + CTA "Registrar primeira conta"

### `caixa-tab.tsx`
- 3 cards: "Total a Receber" (aberto) | "Total a Pagar" (aberto) | "Saldo Previsto"
- Saldo Previsto = a receber − a pagar; negativo em `text-destructive`
- Valores em `font-mono`, tokens de cor (sem hardcode)
- Empty: "Sem movimentações financeiras em aberto"

### `dar-baixa-receber-dialog.tsx`
- Campos: Data de Recebimento (date, default hoje) + Forma de Recebimento (select)
- Confirmar → `contasReceberStore.darBaixaReceber(id, {...})` → toast sucesso / erro inline
- Botão: "Confirmar Recebimento"

### `dar-baixa-pagar-dialog.tsx`
- Campo: Data de Pagamento (date, default hoje)
- Confirmar → `contasPagarStore.darBaixaPagar(id, { pago_em })` → toast sucesso
- Botão: "Confirmar Pagamento"

---

## 10. Rota e Navegação

**Rota:** `src/routes/admin.financeiro.index.tsx`

```typescript
export const Route = createFileRoute("/admin/financeiro/")({
  component: FinanceiroPage,
  head: () => ({ meta: [{ title: "Financeiro — Antonello" }, { name: "robots", content: "noindex" }] }),
})
```

**Nav item** em `retaguarda-shell.tsx` (após "Faturamento"):
```typescript
{ to: "/admin/financeiro", label: "Financeiro", icone: Wallet }
// Wallet de lucide-react
```

---

## 11. Estados de Tela

| Componente | Loading | Empty | Error | Success |
|-----------|---------|-------|-------|---------|
| Contas a Receber | skeleton (3 linhas) | "Nenhuma conta a receber" | mensagem + retry | tabela; vencidas em vermelho |
| Contas a Pagar | skeleton | "Nenhuma conta a pagar" + CTA | mensagem + retry | tabela; vencidas em vermelho |
| Caixa | skeleton (3 cards) | "Sem movimentações" | mensagem + retry | cards com totais |

> Frontend First: loading/error são simulados via estado local (`useState`). Sem delay artificial.

---

## 12. Barreira Financeira (RF-011)

Padrão PRD-004/006: `src/features/financeiro/` **nunca** importado em `src/routes/app.*.tsx` ou `src/features/operador/**` ou `src/features/apontamento/**`.

Gate de barreira: `grep -r "financeiro" src/routes/app. src/features/operador src/features/apontamento` → deve retornar EXIT 1 (zero matches).

---

## 13. Valores Monetários

- Armazenados em **reais com 2 casas** (float, ex.: `5220`, `3200`)
- Exibição via `formatBRL` (de `src/features/retaguarda/format.ts`)
- Somatórios via `round2` (de `src/features/faturamento/calculo.ts`) para evitar float drift
- Nunca hardcodar formatação de moeda

---

## 14. Plano de Tasks (rascunho)

| Task | Escopo | Arquivos |
|------|--------|---------|
| T1 | Types + stub mocks (tsc verde) | `shared/types/index.ts`, stub `contas-receber.ts`, stub `contas-pagar.ts` |
| T2 | Mocks reais + testes | `contas-receber.ts`, `contas-pagar.ts`, `.test.ts` x2 |
| T3 | Stores + derivações + labels | `contas-receber-store.ts/test`, `contas-pagar-store.ts/test`, `derivacoes.ts/test`, `labels.tsx` |
| T4 | UI page + tabs (read-only) + rota + nav | `financeiro-page.tsx`, `contas-receber-tab.tsx`, `contas-pagar-tab.tsx`, `caixa-tab.tsx`, rota, shell |
| T5 | Dialogs de baixa + nova conta pagar | `dar-baixa-receber-dialog.tsx`, `dar-baixa-pagar-dialog.tsx`, `nova-conta-pagar-form` integrado |
| T6 | Pipeline update + barreira + release 0.7.0 Cashflow + docs | `faturamento-pipeline.tsx`, `derivacoes.ts` (fat), `faturas-tab.tsx`, barreira grep, versão, changelog, PRD rename, INDEX |
