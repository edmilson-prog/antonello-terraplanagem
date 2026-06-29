# PRD-005 — Tabela de Preços · Design

> Spec de implementação (Frontend First / mockado). O **PRD-005** diz *o quê*; este
> documento fecha o *como*, registrando as decisões de brainstorming e os desvios
> conscientes em relação ao texto do PRD. Convenções gerais: `CLAUDE.md` do repositório.

| Campo | Valor |
|-------|-------|
| PRD | `docs/prds/PRD-005-ret-tabela-precos.md` |
| Ambiente | Retaguarda (`/admin/precos`) — **dado financeiro** |
| Versão alvo | 0.2.0 → **0.3.0** · codinome **"Tariff"** |
| Depende de | PRD-001 (equipamentos) — ✅ implementado |
| Consumido por (futuro) | PRD-004 (faturamento), PRD-006 (orçamentos) |

---

## 1. Decisões (brainstorming)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Vínculo do preço hora-máquina | **Ambos** — o form permite vincular a um **equipamento específico** OU a um **tipo/porte**. O contrato modela `equipamento_id`/`tipo_equipamento` (um preenchido). |
| 2 | Escopo das abas | **As 3** — Hora-Máquina, Por Metro (fundação) e Mobilização (RF-009 "Could"). |
| 3 | Diferença de preço além de seca×operada (turno, hora extra, faixa) | **Fora de escopo** (YAGNI) — só seca/operada, conforme o contrato. |
| 4 | Mobilização: fixo / por km / por equipamento | **Valor fixo** (`descricao` + `valor`), conforme o contrato. |
| 5 | Histórico/versionamento de preços (reajuste) | **Excluído** pelo próprio PRD — escopo futuro. |

## 2. Desvios conscientes em relação ao PRD

1. **Types sem prefixo `I`.** O PRD nomeia `IPrecoHoraMaquina` etc., mas é "trecho
   ilustrativo". O arquivo `src/shared/types/index.ts` já estabeleceu `Equipamento`,
   `Apontamento`, `OrdemServicoOperador` **sem** prefixo. Consistência do codebase
   prevalece (e PRD-004/006 ainda não travam o contrato). Usaremos
   `PrecoHoraMaquina`, `PrecoFundacao`, `PrecoMobilizacao`.
2. **Vínculo derivado, sem campo extra.** Não adicionamos um campo `vinculo` ao type.
   O vínculo é derivado de qual FK está preenchida (`equipamento_id` → "equipamento";
   senão "tipo"). Mantém o contrato fiel ao PRD; o `vinculo` vive apenas como estado
   local do formulário.
3. **`brlExato` na retaguarda.** O formatador BRL de 2 casas mora em
   `src/features/retaguarda/format.ts` (arquivo já existente e nunca importado pelo
   operador). O `brl` atual (0 casas, usado pelo faturamento mockado) fica **intacto**.
4. **`CurrencyInput` dentro de `features/precos`.** O widget de entrada monetária vive
   na própria feature de preços (não em `shared/`), reforçando a barreira financeira.
   Promovê-lo a `shared/` fica para quando PRD-004/006 precisarem (YAGNI).

## 3. Arquitetura

Feature isolada `src/features/precos/`. Três entidades CRUD independentes numa única
rota com abas. Reuso máximo dos primitivos já existentes (PRD-001):
`createMockStore`, `DataList`, `FormDialog`, `ConfirmDialog`, `PageHeader`,
`useMockResource`, `Switch`, `Tabs`.

```
/admin/precos  (RetaguardaShell > Outlet)
└── PrecosPage
    ├── PageHeader
    └── Tabs (defaultValue="hora-maquina")
        ├── PrecoHoraMaquinaList   → DataList + FormDialog(PrecoHoraMaquinaForm) + ConfirmDialog
        ├── PrecoFundacaoList      → DataList + FormDialog(PrecoFundacaoForm)    + ConfirmDialog
        └── PrecoMobilizacaoList   → DataList + FormDialog(PrecoMobilizacaoForm) + ConfirmDialog
```

Cada `*List` é autocontido (estado de form/confirm/toolbar próprio), espelhando
`EquipamentosPage`. `PrecosPage` só compõe o header + as abas.

## 4. Estrutura de arquivos

```
src/shared/types/index.ts                 (append: 3 types)
src/features/retaguarda/format.ts         (append: brlExato + formatBRL)
src/features/precos/
├── money.ts                              (puro: parseValorInput / formatValorInput / somenteDigitos)
├── money.test.ts
├── precos-schema.ts                      (3 zod schemas + refine do vínculo)
├── precos-schema.test.ts
├── labels.ts                             (VINCULO_LABEL, descreverVinculo helper)
├── precos-hora-maquina-store.ts
├── precos-fundacao-store.ts
├── precos-mobilizacao-store.ts
├── components/
│   ├── currency-input.tsx                (input mascarado, controlado)
│   ├── precos-page.tsx                   (Tabs)
│   ├── preco-hora-maquina-list.tsx
│   ├── preco-hora-maquina-form.tsx
│   ├── preco-fundacao-list.tsx
│   ├── preco-fundacao-form.tsx
│   ├── preco-mobilizacao-list.tsx
│   └── preco-mobilizacao-form.tsx
└── index.ts                              (barrel: PrecosPage + 3 stores)
src/mocks/precos-hora-maquina.ts
src/mocks/precos-fundacao.ts
src/mocks/precos-mobilizacao.ts
src/routes/admin.precos.tsx               (createFileRoute "/admin/precos")
src/features/retaguarda/retaguarda-shell.tsx  (modify: +1 nav item "Preços")
```

## 5. Contrato de dados (final)

```typescript
// src/shared/types/index.ts (append)

export interface PrecoHoraMaquina {
  id: string;
  equipamento_id: string | null;              // preenchido p/ vínculo por equipamento
  tipo_equipamento: TipoEquipamento | null;   // preenchido p/ vínculo por tipo
  valor_hora_seca: number;                     // R$/h sem operador (reais, 2 casas)
  valor_hora_operada: number;                  // R$/h com operador
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrecoFundacao {
  id: string;
  diametro_broca_mm: number;                   // ex.: 300, 400, 500
  valor_metro: number;                         // R$/m
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrecoMobilizacao {
  id: string;
  descricao: string;                           // ex.: "Mobilização escavadeira até 50km"
  valor: number;                               // R$
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

> Invariante "exatamente uma FK preenchida" em `PrecoHoraMaquina` é garantida pelo
> formulário (refine do zod + payload que anula a FK não escolhida). Os mocks
> respeitam a invariante.

## 6. Dinheiro

**Exibição** (`src/features/retaguarda/format.ts`, append):
```typescript
export const brlExato = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function formatBRL(reais: number): string {
  return brlExato.format(reais);
}
```

**Entrada** (`src/features/precos/money.ts`, puro e testável):
- `somenteDigitos(raw: string): string` — remove tudo que não é dígito.
- `parseValorInput(raw: string): number` — dígitos interpretados como centavos →
  reais. Ex.: `"123456"` → `1234.56`; `""` → `0`; `"R$ 9,90"` → `9.9`.
- `formatValorInput(reais: number): string` — reais → `"1.234,56"` (sem "R$", para o
  campo). Usa `Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })`.

`CurrencyInput` (controlado): `{ id?, value: number, onChange: (reais: number) => void,
error?: boolean, placeholder? }`. Mantém o valor em **reais** (number) no form;
exibe a string mascarada montando da direita; `inputMode="decimal"`; prefixo "R$"
visual. Usado via `Controller` do react-hook-form.

## 7. Validação (zod — `precos-schema.ts`)

- **Hora-Máquina:** `vinculo: z.enum(["equipamento","tipo"])`,
  `equipamento_id: z.string().optional()`, `tipo_equipamento: z.enum([...TIPOS]).optional()`,
  `valor_hora_seca/operada: z.number().positive("Informe um valor maior que zero")`,
  `ativo: z.boolean()`. `.superRefine`: se `vinculo==="equipamento"` exige
  `equipamento_id`; se `"tipo"` exige `tipo_equipamento` (erro inline no campo certo).
- **Fundação:** `diametro_broca_mm: z.number().positive("Informe o diâmetro")`,
  `valor_metro: z.number().positive(...)`, `descricao: z.string().trim().optional()`,
  `ativo: z.boolean()`.
- **Mobilização:** `descricao: z.string().trim().min(2, "Informe a descrição")`,
  `valor: z.number().positive(...)`, `ativo: z.boolean()`.

zod `.positive()` rejeita `0` e negativos (RF-010) e `NaN` nativamente (campo vazio no
CurrencyInput vira `0` → rejeitado). A regra de vínculo é validação de **formulário**
(refine no schema), não invariante de store.

## 8. Estados de tela

Cada `*List` usa `useMockResource(lista)` → `DataList` cobre **loading** (skeleton),
**error** (mensagem + retry) e **empty** (CTA "Cadastrar primeiro…"). **Success** =
tabela (desktop) / cards (mobile). Toolbar: busca textual (onde fizer sentido) +
toggle "Inativos". Form: `isSubmitting` desabilita o botão; `toast.success` ao salvar
e fecha o dialog. Inativar via `ConfirmDialog` (destrutivo) + reativar direto.

## 9. Barreira financeira (RF-011 / RNF-001)

- Tudo de preço isolado em `src/features/precos/` + `src/mocks/precos-*.ts` +
  `brlExato/formatBRL` (retaguarda).
- A rota é só `/admin/precos`. Nada em `/app/*`.
- **Verificação na fase final:** grep garante que nenhum arquivo de
  `src/routes/app.*`, `src/features/operador/`, `src/features/apontamento/` importa
  `@/features/precos`, `@/mocks/precos-*` ou `brlExato/formatBRL`.

## 10. Mocks (edge cases)

| Arquivo | Qtde | Edge cases |
|---------|------|------------|
| `precos-hora-maquina.ts` | ~5 | mix equipamento/tipo; 1 inativo; 1 com `seca === operada`; ≥1 por tipo (sem equipamento) |
| `precos-fundacao.ts` | 3 | diâmetros 300/400/500mm com valores distintos; 1 inativo |
| `precos-mobilizacao.ts` | 2 | 1 com descrição longa |

IDs de equipamento referenciam `eq-001…eq-007` reais. Datas ISO plausíveis.

## 11. Testes (vitest, pura lógica)

- `money.test.ts` — `parseValorInput` (centavos, vazio, com máscara, decimais),
  `formatValorInput` (separador de milhar, 2 casas), round-trip.
- `precos-schema.test.ts` — positividade (0/negativo bloqueados), refine do vínculo
  (equipamento sem id → erro; tipo sem tipo → erro), campos válidos passam.

Componentes React não têm teste unitário (consistente com PRD-001/002); a verificação
é `tsc --noEmit` (gate) + smoke SSR na :8082.

## 12. Pós-implementação (bookkeeping)

- `package.json`: 0.2.0 → **0.3.0**.
- `CHANGELOG.md`: `## [0.3.0] - 2026-06-28 - Tariff` (Added: tabela de preços).
- Renomear PRD para `PRD-005-ret-tabela-precos_DONE.md`; preencher "Status de
  Implementação".
- `INDEX-PRDs-antonello.md`: corrigir "Implementados" (defasado em 0) → **3**
  (PRD-001, 002, 005); mover PRD-005 para Implementados; recalcular tabela de status;
  atualizar histórico de versões (0.3.0 Tariff).

## 13. Fora de escopo

Cálculo de faturamento (PRD-004), montagem de orçamento (PRD-006), backend/RLS,
histórico/versionamento de preços, qualquer exibição de valor no app do operador.

## 14. Gate de verificação

`npx tsc --noEmit` (EXIT 0, autoritativo) + `npm test` (vitest). `npm run lint` gera
milhares de erros `prettier/prettier` (CRLF do Windows) que são ruído pré-existente —
não é gate.
