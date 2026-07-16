# Onda Comercial — Preços + Financeiro (refatoração visual) — Design Spec

> Sub-onda "Comercial" da frente **🔧 Páginas de área ainda sem refatoração** do
> `docs/prds/ROADMAP-ui-kit-retaguarda.md`. Segue a Onda 1 (cadastros — diálogos
> viraram páginas dedicadas, PR #9 mergeado). Ao contrário da Onda 1, aqui não
> há telas novas — são páginas de área já funcionais com dado real; o trabalho é
> re-vestir visualmente para bater com `docs/html/.../ui_kits/retaguarda/` e,
> onde o mock pressupõe algo que ainda não existe, implementar o mínimo viável
> pra fechar a lacuna (fidelidade ao design é pré-autorizada, ver CLAUDE.md /
> memória do projeto).

## Escopo

Duas telas:
1. **Preços** (`admin.precos.tsx` / `PrecosList.jsx`)
2. **Financeiro** (`admin.financeiro.index.tsx` / `Financeiro.jsx`)

Fora de escopo desta sub-onda (ficam no roadmap): Manutenção, Diesel, Custo da
Hora, Rentabilidade, Painel Gerencial, Dashboard/Operacional — próximas
sub-ondas ("Frota" e "Analítico").

## Arquitetura geral

Mesmo padrão já validado em Faturamento (Onda 5, `faturamento-page.tsx`):

```
PageHeader
  ↓
<Feature>Kpis  — grid-cols-4, componente local `Tile` (rótulo + valor mono + ícone + rodapé + sparkline opcional)
  ↓
grid lg:grid-cols-[1.6fr_1fr]
  esquerda: CardSecao(s) com o conteúdo principal
  direita:  CardSecao(s) com conteúdo secundário
  ↓
Seções extra full-width (quando aplicável)
```

Reaproveita sem alteração: `PageHeader`, `CardSecao`, `Sparkline`, `formatBRL`
(`@/features/retaguarda/format`), `DataList`/`Column<T>` (listas de preço).
Nenhum primitivo visual novo é necessário.

---

## Preços

### Estrutura

Mantém as **3 abas** (`Hora-Máquina`, `Por Metro`, `Mobilização`) — o mock
mostra uma tabela única, mas colapsar as 3 estruturas de preço reais (campos
diferentes: hora seca/operada; diâmetro de broca; valor por km) perderia
informação. Cada aba já usa `DataList` (`PrecoHoraMaquinaList`,
`PrecoFundacaoList`, `PrecoMobilizacaoList`) — a mudança é revestir as colunas
existentes com os tokens do design system (sem trocar `DataList` por markup
próprio) e, na aba Hora-Máquina, adicionar duas colunas novas.

O botão único "Editar preços" do mock não é portado — cada aba já tem seu
próprio botão "Novo preço" + ação de linha "Editar" (`FormDialog`), que
continuam como estão. O botão "Tabelas anteriores" vai no cabeçalho da
`PrecosPage` (acima das abas), não dentro de uma aba específica, porque
histórico abrange os 3 tipos de preço.

### Custo ref. / Margem (só aba Hora-Máquina)

Problema: a função de custo/hora que já existe
(`custoHoraEquipamento` em `src/features/custo-hora/derivacoes.ts`) calcula em
cima do **uso real do mês corrente** (via `apontamentos`) — se o equipamento
não trabalhou no mês, o custo fica `null`. Isso deixaria a coluna vazia na
maioria das linhas na prática.

**Decisão:** nova função `custoEstimadoHoraEquipamento`, que reaproveita a
mesma fórmula já usada no "impacto no custo/h" do formulário de Componente de
Custo (Onda 1), generalizada para somar todos os componentes ativos do
equipamento em vez de um só:

```ts
// src/features/custo-hora/derivacoes.ts (nova função, ao lado de custoHoraEquipamento)
export function custoEstimadoHoraEquipamento(
  equipamentoId: string,
  componentes: ComponenteCusto[],
  horasReferencia = 160,
): number | null {
  const ativos = componentesAtivosDoEquipamento(componentes, equipamentoId);
  if (ativos.length === 0) return null;
  const fixos = ativos.filter((c) => c.tipo === "fixo_mensal");
  const variaveis = ativos.filter((c) => c.tipo === "variavel_hora");
  const custoFixoRateado = horasReferencia > 0
    ? round2(fixos.reduce((soma, c) => soma + c.valor, 0) / horasReferencia)
    : 0;
  const custoVariavel = round2(variaveis.reduce((soma, c) => soma + c.valor, 0));
  return round2(custoFixoRateado + custoVariavel);
}
```

Não inclui diesel/manutenção (dependem de uso real do período, sem
equivalente "de referência" razoável) — só os componentes de custo cadastrados,
igual ao "impacto no custo/h" já existente.

Uso na coluna, só para linhas de `PrecoHoraMaquina` com `equipamento_id`
preenchido (linhas por `tipo_equipamento` mostram "—" nas duas colunas, sem
tentar estimar uma média — não há `ComponenteCusto` vinculado a um tipo, só a
um equipamento específico):

- **Custo ref.**: `custoEstimadoHoraEquipamento(...)`, `formatBRL`, "—" se
  `null` (equipamento sem nenhum componente ativo).
- **Margem**: `(valor_hora_operada − custoRef) / valor_hora_operada`, em %.
  Laranja (`text-destructive`, mesma classe usada em outras badges de alerta
  do projeto) quando < 30% — **limiar fixo no código** (constante
  `MARGEM_MINIMA_PADRAO = 0.3` em `src/features/precos/labels.ts`), não lido
  de Parâmetros (que não existe — fica registrado no roadmap).
  `valor_hora_operada` usa `valorPositivo()` no schema (`precos-schema.ts`),
  então é sempre > 0 — a divisão nunca zera o denominador.

### Histórico de preços ("Tabelas anteriores")

Novo, mínimo:

- Migration `supabase/migrations/<timestamp>_historico_precos.sql`:
  ```sql
  create table public.historico_precos (
    id uuid primary key default gen_random_uuid(),
    tipo text not null check (tipo in ('hora_maquina', 'fundacao', 'mobilizacao')),
    preco_id uuid not null,
    snapshot jsonb not null, -- linha completa da tabela de origem, antes da alteração
    alterado_em timestamptz not null default now(),
    created_at timestamptz not null default now()
  );
  alter table public.historico_precos enable row level security;
  create policy "retaguarda le historico_precos" on public.historico_precos
    for select to authenticated using (is_retaguarda());
  create policy "retaguarda insere historico_precos" on public.historico_precos
    for insert to authenticated with check (is_retaguarda());
  create index idx_historico_precos_tipo_preco on public.historico_precos (tipo, preco_id);
  ```
- Cada store de preço (`precos-hora-maquina-store.ts`,
  `precos-fundacao-store.ts`, `precos-mobilizacao-store.ts`) ganha: antes de
  aplicar `update`/`setAtivo`, insere uma linha em `historico_precos` com o
  snapshot do estado **anterior** à alteração (não é trigger de banco — é
  aplicado no código do store, mesmo padrão mock→seed do projeto).
- Novo `src/features/precos/components/tabelas-anteriores-dialog.tsx`:
  `Dialog` somente leitura, lista os snapshots (3 tipos juntos, ordenados por
  `alterado_em` desc), cada linha mostra tipo + descrição do item (via
  `descreverVinculo`/`descricao` do snapshot) + `alterado_em` formatado. Sem
  paginação (mock de dados é pequeno; se crescer, é ajuste futuro).
- Botão "Tabelas anteriores" (`variant="ghost"`, ícone `lucide:history`) no
  cabeçalho de `PrecosPage`, abre o diálogo.

---

## Financeiro

### Estrutura

Sai do modelo 3-abas (Receber / Pagar / Caixa) — vira:

```
PageHeader "Financeiro"
FinanceiroKpis (4 tiles)
grid lg:grid-cols-[1.6fr_1fr]
  esquerda: CardSecao "Contas a receber" (ContasReceberTab, sem alteração de lógica)
            CardSecao "Contas a pagar" (ContasPagarTab, sem alteração de lógica)
  direita:  CardSecao "Recebimentos por forma" (novo)
            CardSecao "Comprovantes recentes" (novo)
PrevisaoCaixaCard (IA — sem alteração, só reposicionado)
CardSecao "Caixa" (conteúdo hoje em CaixaTab, sem alteração de lógica)
```

`DarBaixaReceberDialog`, `DarBaixaPagarDialog`, `EmitirCobrancaDialog`
continuam disparados pelas mesmas ações de linha dentro de
`ContasReceberTab`/`ContasPagarTab` — nenhuma mudança de fluxo, só de onde a
tabela é renderizada (dentro de `CardSecao` em vez de `TabsContent`).

### `FinanceiroKpis` (novo componente, mesmo padrão `Tile` de `FaturamentoKpis`)

| Tile | Cálculo | Rodapé |
|------|---------|--------|
| A receber | soma `valor` de `ContaReceber` com `status !== "recebido"` | "N títulos · M vencidos" (vencido = `vencimento < hoje`, mesma `contaVencida` já usada) |
| A pagar | soma `valor` de `ContaPagar` com `status !== "pago"` | "N títulos até {vencimento mais próximo, DD/MM}" |
| Recebido no mês | soma `valor` de `ContaReceber` com `status === "recebido"` e `recebido_em` no mês corrente | trend vs. mês anterior + sparkline 6 meses (reaproveita o padrão de `agregadoMensal`, adaptado pra somar por `recebido_em` em vez de `faturado_em`) |
| Saldo do mês | (Recebido no mês) − (soma `ContaPagar.valor` com `pago_em` no mês corrente) | sparkline 6 meses |

Nova função `agregadoMensalFinanceiro` em `src/features/financeiro/derivacoes.ts`
(mesma forma de `agregadoMensal` de faturamento: recebe lista + campo de data +
quantidade de meses, devolve `{ mes, valor, qtd }[]`).

### `RecebimentosPorFormaCard` (novo)

Agrupa `ContaReceber` com `status === "recebido"` por `forma_recebimento`,
soma `valor` + conta ocorrências. Nova função `recebimentosPorForma` em
`derivacoes.ts`. Ícone por forma (mapa já existe parcialmente em
`ContaPagar`/`ContaReceber` — se não existir, adicionar em
`src/features/financeiro/labels.tsx`): `pix→credit-card`,
`transferencia→landmark`, `boleto→link`, `dinheiro→banknote`,
`cheque→file-text`, `outro→circle`. Linhas ordenadas por valor desc.

### `ComprovantesRecentesCard` (novo)

Últimas 5 `ContaReceber` com `status === "recebido"`, ordenadas por
`recebido_em` desc. Cada linha: ícone da forma (mesmo mapa acima) + texto
`"{FORMA_RECEBIMENTO_LABEL} recebido — {faturamento.numero}"` (join via
`faturamentosStore.obter(conta.faturamento_id)`, formato real
`"FAT-2026-0042"` — o mock usa `"NF 1042"` como exemplo ilustrativo, não é um
formato real do sistema) + valor formatado + `recebido_em` relativo/formatado.
Nome deliberadamente igual ao mock ("Comprovantes recentes"), mesmo não tendo
relação com a entidade `Comprovante` (assinatura de serviço) do domínio — são
conceitos homônimos não relacionados; evitar confundir ao implementar (este
card não toca a tabela `comprovantes`).

### `ContaPagar` — ícone por categoria

Mock mostra um `IconTile` por linha de conta a pagar, baseado no fornecedor.
Real só tem `categoria` (`CategoriaDespesa`), sem campo de ícone. Mapear em
`labels.tsx`: `diesel→fuel`, `manutencao→wrench`, `folha→hard-hat`,
`fornecedor→truck`, `outro→circle`. Adicionar no cabeçalho da célula
"Fornecedor" de `ContasPagarTab`, sem mudar a coluna em si.

---

## Fora de escopo (fica registrado no roadmap)

- Limiar de margem mínima configurável / lido de Parâmetros (Parâmetros não
  existe ainda).
- Margem/custo de referência para preços por `tipo_equipamento` (fica "—").
- Diesel e manutenção no cálculo de "Custo ref." de Preços (só componentes de
  custo cadastrados).
- Paginação/filtro no diálogo de Tabelas Anteriores.
- Qualquer alteração de fluxo em dar-baixa, emissão de cobrança ou geração de
  contas a receber/pagar — só reposicionamento visual.

## Testes

- `custoEstimadoHoraEquipamento`: testes unitários em
  `src/features/custo-hora/derivacoes.test.ts` — equipamento sem componente
  (`null`), só fixo, só variável, fixo+variável, `horasReferencia` custom.
- `agregadoMensalFinanceiro`, `recebimentosPorForma`: testes unitários em
  `src/features/financeiro/derivacoes.test.ts` — lista vazia, um mês, múltiplos
  meses/formas.
- Stores de preço: teste cobrindo que `update`/`setAtivo` grava snapshot em
  `historico_precos` antes de alterar (usar o mock de Supabase já existente em
  `vitest.setup.ts`).
- `TabelasAnterioresDialog`: teste de render com histórico vazio e com itens
  dos 3 tipos.
- `PrecoHoraMaquinaList`: teste garantindo que a coluna Margem aplica a classe
  de alerta quando < 30%, e mostra "—" para preço por `tipo_equipamento`.
- `FinanceiroKpis`, `RecebimentosPorFormaCard`, `ComprovantesRecentesCard`:
  testes de render com dados vazios e com dados (snapshot dos valores
  formatados).

## Migrations Supabase

Uma migration nova: `historico_precos` (criação de tabela + RLS). Nenhuma
alteração em tabelas existentes é necessária para esta sub-onda — todos os
outros dados novos (Recebimentos por Forma, Comprovantes Recentes, ícones por
categoria) são 100% derivados de colunas já existentes.
