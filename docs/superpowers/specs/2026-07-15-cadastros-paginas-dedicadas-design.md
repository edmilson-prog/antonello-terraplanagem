# Cadastros — diálogos → páginas dedicadas (Onda 1: Cliente, Equipamento, Custo, Pagamento, Operador)

**Data:** 2026-07-15
**Áreas:** `src/features/clientes/`, `src/features/equipamentos/`, `src/features/custo-hora/`, `src/features/financeiro/`, `src/features/operadores/`, rotas `/admin/clientes/novo`, `/admin/equipamentos/novo`, `/admin/custo-hora/novo`, `/admin/financeiro/contas-pagar/novo`, `/admin/operadores/novo`

## Contexto

`docs/prds/ROADMAP-ui-kit-retaguarda.md` mapeou 8 telas de criação da retaguarda
("Novo Cliente", "Novo Equipamento", "Novo Operador", "Novo Orçamento", "Nova
Conta a Pagar", "Novo Componente de Custo", "Novo Abastecimento", "Nova
Manutenção") que hoje são diálogos genéricos (`FormDialog`), enquanto o mock
(`docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/`) mostra
cada uma como página dedicada com layout de 2 colunas + "Resumo ao vivo" — o
mesmo padrão que a Nova OS já adotou
(`docs/superpowers/specs/2026-07-14-nova-os-campos-e-layout-design.md`).

Um levantamento comparando os 8 mocks com os diálogos reais (campos, padrão de
validação, gap de schema) mostrou que os 8 não são igualmente simples de
converter — 3 deles (Orçamento, Abastecimento, Manutenção) exigem decisão de
produto/fluxo antes de qualquer UI (o mock modela um comportamento que não
tem equivalente real hoje, não é só uma questão de layout). Ficam de fora
desta spec, tratados numa onda separada.

Esta spec cobre as **5 restantes** ("Nível 1+2"): campos do mock batem com
campos reais (ou exigem só coluna nova simples, sem decisão de fluxo) —
Cliente, Equipamento, Custo da Hora (componente de custo), Financeiro (conta a
pagar), Operador.

## Decisões de design

### 1. Shell de layout compartilhado, conteúdo bespoke

Todo mock desta onda (e a Nova OS) segue o mesmo esqueleto: link "← Voltar",
título + tag, grid 2 colunas (`1.6fr` formulário / `1fr` resumo). Esse
esqueleto vira um componente novo, `src/shared/components/pagina-cadastro-dedicada.tsx`:

```tsx
interface PaginaCadastroDedicadaProps {
  backLabel: string;
  backTo: string;
  title: string;
  tag: string;
  children: ReactNode; // form card (coluna esquerda)
  resumo: ReactNode; // card de resumo (coluna direita)
}
```

Cada tela continua dona dos seus campos e do seu próprio componente de resumo
(`resumo-novo-cliente.tsx`, `resumo-novo-equipamento.tsx`, etc., mesmo padrão
de `resumo-nova-ordem.tsx`, com `useWatch`). Não é abstraído nada de domínio —
só o esqueleto que é literalmente idêntico nos 6 mocks (5 desta onda + Nova
OS).

### 2. Rotas novas, botões viram `<Link>`

Uma rota nova por tela, seguindo o padrão de `admin.ordens.nova.tsx`:

| Tela | Rota nova |
|---|---|
| Cliente | `/admin/clientes/novo` (`admin.clientes.novo.tsx`) |
| Equipamento | `/admin/equipamentos/novo` (`admin.equipamentos.novo.tsx`) |
| Custo | `/admin/custo-hora/novo` (`admin.custo-hora.novo.tsx`) |
| Pagamento | `/admin/financeiro/contas-pagar/novo` (`admin.financeiro.contas-pagar.novo.tsx`) |
| Operador | `/admin/operadores/novo` (`admin.operadores.novo.tsx`) |

Os botões "+ Novo X" nas 5 listagens (`clientes-page.tsx`,
`equipamentos-page.tsx`, `componente-custo-list.tsx`, `contas-pagar-tab.tsx`
ou equivalente, `operadores-page.tsx`) trocam de "abrir diálogo" para
`<Button asChild><Link to="...">`, igual à mudança já feita em
`ordens-retaguarda-page.tsx`.

### 3. Edição fica fora de escopo

Nenhuma tela de edição muda. `ClienteForm`/`EquipamentoForm`/`OperadorForm`/
`ComponenteCustoForm` continuam dual-purpose (create/edit) — só o modo
"create" sai do diálogo. O diálogo de Pagamento (`nova-conta-pagar-dialog.tsx`)
não tem edição hoje (contas a pagar só recebem baixa via
`dar-baixa-pagar-dialog.tsx`, que não muda).

### 4. Custo e Pagamento continuam em store mock — sem migration nessas duas

`componentes-custo-store.ts` e `contas-pagar-store.ts` são stores em memória
(`createMockStore`/`criarContasPagarStore(seed)`), não Supabase — a conexão
mock→real dessas duas features é um trabalho à parte (fora do escopo desta
spec, ver `docs/prds/INDEX-PRDs-antonello.md`, "conexão mock→real, por
onda"). Os campos novos destas duas telas entram só no `type`
(`src/shared/types/index.ts`) e no mock (`src/mocks/componentes-custo.ts`,
`src/mocks/contas-pagar.ts`) — **sem migration SQL**. Cliente, Equipamento e
Operador já são Supabase-backed hoje; campos novos neles (só em Operador,
ver decisão 7) exigem migration de verdade.

### 5. Cliente e Equipamento — reskin puro

Nenhum campo novo. `ClienteForm`/`EquipamentoForm` e os schemas zod
(`cliente-schema.ts`/`equipamento-schema.ts`) não mudam — só o layout ao redor
muda de modal para página.

### 6. Custo — 3 campos novos, sem "base anual"

`ComponenteCusto` ganha:

- `categoria: CategoriaComponenteCusto | null` — novo enum
  (`depreciacao | seguro | pneus | operador_folha | custo_indireto | outros`),
  nullable, só exibição/organização (não entra na fórmula de custo/hora).
- `competencia: string | null` — `"YYYY-MM"`, nullable.
- `observacao: string | null` — nullable.

"Base anual" (3ª opção de cálculo do mock, além de `fixo_mensal`/
`variavel_hora`) fica fora — YAGNI, sem caso de uso claro agora. O card de
resumo mostra o "impacto no custo/h" calculado ao vivo com a mesma fórmula de
`src/features/custo-hora/derivacoes.ts`, sem persistir nada novo pra isso.

### 7. Operador — 5 colunas + 1 tabela de junção; toggle de acesso fica fora

`Operador` ganha:

- `vinculo: "CLT" | "PJ" | null`
- `data_nascimento: string | null` (`"YYYY-MM-DD"`)
- `cnh_categoria: string | null`
- `cnh_validade: string | null` (`"YYYY-MM-DD"`)
- `base: string | null` (texto livre, ex. "Santo Ângelo — RS")

Tabela nova `operadores_equipamentos` (N:N, "equipamentos habilitados" —
puramente informativo, não restringe apontamento):

```sql
create table operadores_equipamentos (
  operador_id uuid not null references operadores(id) on delete cascade,
  equipamento_id uuid not null references equipamentos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (operador_id, equipamento_id)
);
```

RLS espelhando a política de `operadores` (leitura/escrita restrita a perfis
retaguarda). O toggle "liberar acesso ao app" do mock fica **fora** desta
onda — hoje todo operador cadastrado já recebe PIN automaticamente via RPC
`criar_operador`; transformar isso em algo opcional mexeria no modelo de
autenticação real (`login_operador`), decisão maior que uma onda visual.

`operadoresStore.create()` (hoje só chama a RPC `criar_operador`) passa a,
depois do RPC retornar o operador criado, inserir as linhas de
`operadores_equipamentos` para os equipamentos selecionados (insert direto,
sem RPC nova — não há geração de segredo envolvida aqui).

### 8. Pagamento — 3 campos novos, sem rascunho, categoria não muda

`ContaPagar` ganha:

- `documento: string | null`
- `forma_pagamento: FormaPagamento | null` — novo enum espelhando
  `FormaRecebimento` (`dinheiro | pix | transferencia | boleto | cheque |
  outro`), mas com nome próprio (é conceitualmente "como eu pago", distinto
  de "como eu recebo").
- `observacao: string | null`

Sem status "rascunho" (mock tem botão "Salvar rascunho"; real só tem
`aberta | liquidada` — mudar isso é mudança de modelo de estado, afeta
consultas/relatórios existentes). A página nova tem só o botão "Cadastrar
conta", que já nasce `status: "aberta"` — mesmo comportamento do diálogo
atual.

`CategoriaDespesa` não muda (mock usa "frota", real usa "fornecedor" —
mantido como está, é taxonomia interna, não elemento visual).

## Implementação (visão geral dos arquivos)

**Compartilhado:**
- Novo: `src/shared/components/pagina-cadastro-dedicada.tsx`

**Cliente:**
- Novo: `src/features/clientes/components/novo-cliente-page.tsx`,
  `src/features/clientes/components/resumo-novo-cliente.tsx`
- Novo: `src/routes/admin.clientes.novo.tsx`
- Modificado: `src/features/clientes/components/clientes-page.tsx` (botão vira
  `Link`, remove `FormDialog` de criação — `ClienteForm` continua para edição)

**Equipamento:** mesma estrutura, em `src/features/equipamentos/`.

**Custo:**
- Modificado: `src/shared/types/index.ts` (`ComponenteCusto` + novo enum
  `CategoriaComponenteCusto`), `src/mocks/componentes-custo.ts` (26 registros
  ganham os 3 campos como `null`), `src/features/custo-hora/custo-hora-schema.ts`
- Novo: `src/features/custo-hora/components/novo-custo-page.tsx`,
  `.../resumo-novo-custo.tsx`
- Novo: `src/routes/admin.custo-hora.novo.tsx`
- Modificado: `src/features/custo-hora/components/componente-custo-list.tsx`

**Pagamento:**
- Modificado: `src/shared/types/index.ts` (`ContaPagar` + novo enum
  `FormaPagamento`), `src/mocks/contas-pagar.ts`,
  `src/features/financeiro/contas-pagar-store.ts` (`NovaContaPagar` ganha os
  3 campos)
- Novo: `src/features/financeiro/components/nova-conta-pagar-page.tsx`,
  `.../resumo-novo-pagamento.tsx`
- Novo: `src/routes/admin.financeiro.contas-pagar.novo.tsx`
- Modificado: `src/features/financeiro/components/financeiro-page.tsx` (botão
  "Nova conta a pagar" vira `Link`); `nova-conta-pagar-dialog.tsx` é removido
  (form vira `nova-conta-pagar-page.tsx`, sem o wrapper `FormDialog`)

**Operador:**
- Nova migration em `supabase/migrations/`: 5 colunas em `operadores` +
  tabela `operadores_equipamentos` (SQL da decisão 7)
- Modificado: `src/shared/types/index.ts` (`Operador` + tabela de junção
  refletida como tipo auxiliar, se necessário), `src/shared/types/database.ts`
  (regenerar via `mcp__supabase__generate_typescript_types`, escopar só as
  mudanças de `operadores`/`operadores_equipamentos` — mesmo cuidado que a
  Task 1 da Nova OS teve com drift não relacionado),
  `src/features/operadores/operador-schema.ts`,
  `src/features/operadores/operadores-store.ts` (`create` grava
  `operadores_equipamentos` após o RPC)
- Novo: `src/features/operadores/components/novo-operador-page.tsx`,
  `.../resumo-novo-operador.tsx`
- Novo: `src/routes/admin.operadores.novo.tsx`
- Modificado: `src/features/operadores/components/operadores-page.tsx`

## Testes

- Cada uma das 5 páginas novas: teste de componente (RTL, padrão
  `ordem-form.test.tsx`) — campos obrigatórios bloqueiam submit, resumo
  lateral atualiza ao digitar/selecionar, submit chama a store certa e
  navega de volta pra listagem.
- `custo-hora-schema.test.ts` / equivalente: valida os 3 campos novos
  (opcionais, não quebram criação sem eles).
- `operador-schema.test.ts` / equivalente: valida os 5 campos novos
  (opcionais) e o novo campo de seleção de equipamentos.
- `operadores-store.test.ts`: `create` grava as linhas de
  `operadores_equipamentos` corretamente quando equipamentos são
  selecionados; não grava nada quando nenhum é selecionado.
- Testes existentes das 5 listagens: botão "Novo X" agora navega em vez de
  abrir modal — ajustar asserções afetadas.
- `npx tsc --noEmit` limpo ao final de cada tela (mesmo padrão de verificação
  independente usado na Nova OS — não confiar em self-report do
  implementador).

## Fora de escopo

- Orçamento, Abastecimento, Manutenção — ficam de fora desta onda; precisam
  de decisão de produto/fluxo antes de qualquer página dedicada (ver
  `docs/prds/ROADMAP-ui-kit-retaguarda.md`).
- Edição de Cliente/Equipamento/Operador/Componente de Custo — comportamento
  atual não muda.
- Toggle "liberar acesso ao app" (Operador) — decisão de produto separada,
  mexe no modelo de autenticação real.
- Status "rascunho" em Conta a Pagar — mudança de modelo de estado, não
  entra nesta onda.
- Reconciliação do enum `CategoriaDespesa` (mock "frota" vs. real
  "fornecedor") — mantido como está.
- Conexão mock→real de Custo da Hora e Financeiro (contas a pagar) — os
  stores continuam em memória; só os campos novos são adicionados ao tipo e
  ao mock.
- "Base anual" em Componente de Custo — YAGNI, não modelado.
