# Telas de área da retaguarda — Faturamento, Ordens, Orçamentos, Comprovantes

**Data:** 2026-07-12
**Áreas:**
- `src/features/faturamento/components/faturamento-page.tsx` (+ novo)
- `src/features/ordem-servico/components/ordens-retaguarda-page.tsx`
- `src/features/orcamentos/components/orcamentos-page.tsx`
- `src/features/comprovantes/components/comprovantes-page.tsx`
- Novo compartilhado: `src/shared/components/status-filter-chips.tsx`

**Mocks alvo (UI kit, fonte de verdade de design):**
`docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/{Faturamento,OSList,OrcamentosList,ComprovantesList}.jsx`

## Correção de rumo

Uma rodada anterior (branch `feat/detalhe-documentos-visual`, não mergeada) reconstruiu as
páginas de **detalhe** (`/admin/{ordens,orcamentos,faturamento,comprovantes}/:id`) inventando
um layout hero+KPI, sem checar que existia um UI kit com mock **por tela de área** (não de
detalhe) em `docs/html/.../ui_kits/retaguarda/`. Aquele trabalho fica arquivado na branch
antiga (não descartado, não mergeado). Esta spec mira o alvo certo: as **telas de lista/área**
que têm mock explícito e ainda não batem com ele.

## Objetivo

Re-vestir as 4 telas de área para bater visualmente com os mocks do UI kit — KPIs com
sparkline (só Faturamento), filtros em chip com contador, tabela em `DataList` já existente,
cards auxiliares — usando **100% dado real** das stores (sem showcase inventado), preservando
toda a lógica de busca/filtro/navegação/criação já implementada.

## Decisões de design (resolvendo mock × domínio real)

1. **Comprovantes: dado real + visual do mock (decisão do cliente).** O mock mostra recibos de
   **pagamento** (PIX/TED/Boleto, com valor) mas a entidade real `Comprovante` é o recibo de
   **serviço assinado** (sem valor, LGPD). Mantém-se a entidade real (`numero`, OS, cliente,
   `status` pendente/assinado/recusado) com o tratamento visual do mock (ícone em tile, Pill de
   cabeçalho, filtros em chip). A coluna "Valor"/"NF" do mock não existe no domínio — trocada
   por "OS" (já existente hoje) + `StatusComprovanteBadge`. O Pill de cabeçalho do mock
   ("R$ 55.800 no período") vira uma contagem real: "N pendentes de assinatura" (ou o total,
   se não houver pendentes). O botão primário "Anexar comprovante" do mock não corresponde a
   nenhum fluxo real (comprovante só nasce da tela de detalhe da OS fechada) — mantém-se o CTA
   real já existente, "Ver Ordens de Serviço".
2. **Sem invenção de "Exportar".** Só o Faturamento tem uma função de exportação real
   (`exportarFaturamentoPdf`, já usada na aba Análise) — o botão "Exportar" do mock é ligado a
   ela nessa tela. Nas outras 3 (OS, Orçamentos, Comprovantes) não existe função de exportação
   real hoje; o botão do mock é **omitido** ali (não criar um botão sem ação real, por
   `CLAUDE.md` "nunca half-finished").
3. **Faturamento: página única, sem abas — bate com o mock.** Hoje `FaturamentoPage` tem duas
   abas (Faturas / Análise). O mock é uma página só. A tela nova substitui as abas por: 4 KPIs
   (reais) + tabela "Notas fiscais emitidas" + card "A faturar" + gráfico "Faturamento por mês"
   — tudo com dado real das stores (`faturamentosStore`, `contasReceberStore`, `ordensStore`).
   A aba "Análise" (`AnaliseTab`, com breakdown por equipamento/cliente e período customizável)
   **não tem equivalente no mock** e sai de escopo desta spec — fica como ponto em aberto
   (ver "Fora de escopo").
4. **"A faturar" = rascunhos de Faturamento (dado real com valor conhecido).** O mock mostra
   itens com valor R$ já definido — isso só existe para `Faturamento` com `status: "rascunho"`
   (gerado via `gerarDeOS`, já tem `itens`/`valor_total`), não para `OrdemServico` fechada sem
   Faturamento nenhum (que não tem valor). O card "A faturar" lista os rascunhos reais; o botão
   "Emitir" de cada linha navega para `/admin/faturamento/:id` (onde já existe "Confirmar
   faturamento", fluxo preservado). O estágio anterior — OS fechada **sem nenhum** Faturamento
   ainda — continua existindo (`AguardandoFaturamento`, real, com o botão "Gerar" que já
   funciona) e é mantido como uma seção própria abaixo do "A faturar", não removido.
5. **Botão de cabeçalho "Emitir NF" do mock não tem uma ação atômica real** (não existe "criar
   NF do zero" sem uma OS de origem). **Omitido.** O cabeçalho leva só "Exportar" (decisão 2).
6. **Orçamentos: rótulos reais, não os do mock.** O mock usa "Aberto/Aprovado/Perdido"; o domínio
   real é `rascunho|enviado|aprovado|recusado` (`StatusOrcamento`). Mantêm-se os **rótulos e
   badges reais** (`StatusOrcamentoBadge`, `STATUS_ORCAMENTO_LABEL`) — só a **forma visual**
   (chips com contador, Pill de cabeçalho) segue o mock. O Pill "R$ X em aberto" soma
   `valor_total` de orçamentos com status `rascunho` ou `enviado` (ainda sem decisão do
   cliente) — mapeamento defensável do "em aberto" do mock.
7. **Ordens de Serviço: colunas Equipamento/Operador/Valor/Período são novas, com dado real
   derivado.**
   - **Equipamento:** equipamentos distintos dos apontamentos da OS
     (`apontamentosDaOS` → `equipamento_id`s únicos); 1 → nome+ícone do tipo; 2+ → primeiro +
     pill "+N".
   - **Operador:** `ordem.responsavel_id` quando definido; senão o operador do primeiro
     apontamento; 2+ operadores distintos nos apontamentos → primeiro + pill "+N".
   - **Valor:** `valor_total` do `Faturamento` vinculado à OS (rascunho ou faturado), quando
     existir; senão "—" (nenhuma OS sem Faturamento tem valor no domínio atual).
   - **Período:** `aberta_em` formatada ("desde DD/MM") quando não fechada;
     "`aberta_em`–`fechada_em`" quando fechada.
8. **Filtros em chip (substituem os `Select` de status) em OS, Orçamentos e Comprovantes** —
   mesmo padrão visual do mock, reaproveitado nas 3 telas via um componente compartilhado novo
   (decisão 9). A busca por texto livre (já real, funcional) **permanece** — o mock não tem
   busca porque é estático; a busca é um ganho funcional aditivo, não um conflito visual, e fica
   inline com os chips (lado direito da linha de filtros).
9. **Novo componente compartilhado: `StatusFilterChips`.** Usado por 3 telas (regra dos três).
   Renderiza uma lista de chips com contador (`{label} · {count}`), destaca o ativo, dispara
   `onChange`. Não depende de um enum específico — recebe `{ id, label, tone? }[]` e `counts`
   já calculados pelo chamador (cada domínio calcula suas próprias contagens/tons a partir do
   seu enum de status).
10. **Faturamento — nenhum showcase.** Diferente da rodada anterior (branch antiga), aqui **toda**
    métrica é derivável das stores reais: `Faturado no mês` (soma `valor_total` dos faturamentos
    com `faturado_em` no mês corrente), `NFs emitidas` (contagem no mês), `A faturar` (soma dos
    rascunhos), `Ticket médio` (Faturado no mês ÷ NFs emitidas, 0 se não houver). O gráfico
    "Faturamento por mês" e o `spark` do KPI "Faturado no mês" usam a **mesma série real**:
    agregação mensal de `faturamentosStore` dos últimos 6 meses (mês de `faturado_em`). O KPI
    "NFs emitidas" usa a mesma série (contagem) para seu próprio `spark`. Sem `trend`/`spark`
    inventado nos KPIs "A faturar" e "Ticket médio" (mock também os omite nesses dois).
11. **Light + dark só com tokens**, nunca hex. Ícones `@iconify/react` `lucide:`. Badges de
    status usam os componentes de domínio já existentes
    (`StatusOSBadge`, `StatusOrcamentoBadge`, `StatusFaturamentoBadge`, `StatusComprovanteBadge`)
    — não um `StatusChip` genérico do mock (o app já tem uma convenção por domínio, mais
    integrada aos tokens do que replicar o componente do mock).

## Reuso (não reinventar)

- `src/shared/components/data-list.tsx` — `DataList`/`Column` já fornece a tabela
  (`rounded-xl border bg-card shadow-sm`) + estado mobile em cards + loading/error/empty.
  As 4 telas continuam usando `DataList`; não se recria a tabela do zero.
- `src/shared/components/card-secao.tsx` — `CardSecao`/`CardPill` (já em `main`, promovido no
  PR #3) para os cards "Notas fiscais emitidas", "A faturar", "Faturamento por mês".
- `src/shared/components/sparkline.tsx` — `Sparkline` (pontos 0..100) para os KPIs de
  Faturamento.
- `src/shared/components/empty-state.tsx`, `src/shared/components/page-header.tsx`,
  `src/shared/components/form-dialog.tsx` — já usados, preservados.
- Badges/labels de domínio: `StatusOSBadge`+`STATUS_OS`+`STATUS_OS_LABEL`,
  `StatusOrcamentoBadge`+`STATUS_ORCAMENTO`+`STATUS_ORCAMENTO_LABEL`,
  `StatusFaturamentoBadge`+`STATUS_FATURAMENTO`+`STATUS_FATURAMENTO_LABEL`,
  `StatusComprovanteBadge`+`STATUS_COMPROVANTE`+`STATUS_COMPROVANTE_LABEL`.
- Derivações: `statusEfetivoOS`, `totalHorasOS`, `totalMetragemOS`, `apontamentosDaOS`
  (`features/ordem-servico/derivacoes`); `resumoPipeline`, `osFechadasSemFaturamento`,
  `faturamentoDaOS` (`features/faturamento/derivacoes`); `validadeVencida`
  (`features/orcamentos/derivacoes`).
- Componentes de fluxo preservados: `OrdemForm`+`FormDialog` (Nova OS), `OrcamentoForm`+
  `FormDialog` (Novo orçamento), `AguardandoFaturamento` (ação "Gerar"), `exportarFaturamentoPdf`.
- Formatadores: `formatBRL`/`brl`/`numero` (`features/retaguarda/format`), `formatHorimetro`,
  `formatDataHora` (`shared/lib/format`).
- Stores: `faturamentosStore`, `contasReceberStore`, `ordensStore`, `apontamentosStore`,
  `orcamentosStore`, `comprovantesStore`, `clientesStore`, `equipamentosStore`, `operadoresStore`
  (para nome do operador, se existir um store dedicado — confirmar na implementação).

## Componente compartilhado novo

### `src/shared/components/status-filter-chips.tsx`

```ts
interface StatusFilterChipItem {
  id: string;         // valor do filtro ("todos" | status real)
  label: string;
  tone?: "info" | "success" | "warn" | "neutral"; // cor do led; omitido = sem led (ex.: "Todos")
}
interface StatusFilterChipsProps {
  itens: StatusFilterChipItem[];
  ativo: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}
function StatusFilterChips(props: StatusFilterChipsProps): JSX.Element;
```
Visual: linha de botões `rounded-full border px-3 py-1.5 text-xs`, ativo com
`border-primary bg-primary text-primary-foreground`, led colorido por `tone` (token semântico,
ex. `text-primary`/`text-secondary`/`text-destructive`/`text-muted-foreground` — nunca hex),
contador `· {count}` ao final do label. Baseado no padrão já usado inline em
`AnaliseTab`'s period-preset buttons (mesma classe base), generalizado para os 3 domínios.

## Página 1 — Faturamento (`/admin/faturamento`)

Substituir as abas por uma página única. Estrutura: `PageHeader` (Faturamento · Pill mês atual
· Exportar) → 4 KPIs → grid `[1.6fr_1fr]` (Notas fiscais emitidas | A faturar + Faturamento por
mês) → Aguardando faturamento (seção real já existente, abaixo do grid).

**Cálculos (todos reais, `src/features/faturamento/derivacoes.ts` — adicionar funções):**
- `agregadoMensal(faturamentos: Faturamento[], meses = 6): { mes: string; rotulo: string; valor: number; qtd: number }[]`
  — agrupa por mês de `faturado_em` (só `status: "faturado"`), últimos N meses até o mês atual,
  meses sem fatura entram com `valor:0, qtd:0`.
- KPIs do mês corrente derivados do último item de `agregadoMensal` (ou filtro direto por mês
  igual ao mês corrente).
- `rascunhos = faturamentos.filter(f => f.status === "rascunho")`; "A faturar" = `rascunhos`
  (card) com `sum(valor_total)` no Pill do card.
- Ticket médio = `faturadoNoMes / nfsNoMes || 0`, formatado `formatBRL`.
- `spark` dos KPIs "Faturado no mês"/"NFs emitidas": mapear os últimos 6 valores de
  `agregadoMensal` para escala 0..100 (`v / max(...) * 100`, com guarda para `max === 0`).

**KPIs:** Faturado no mês (mono, ícone `lucide:credit-card`, spark real) · NFs emitidas (ícone
`lucide:file-check`, spark real) · A faturar (mono, ícone `lucide:clipboard-list`, variante
alerta se > 0, rodapé "N OS/rascunhos sem confirmar") · Ticket médio (mono, ícone
`lucide:dollar-sign`).

**Card "Notas fiscais emitidas"** (`CardSecao`, ícone `lucide:file-check`, acessório
`CardPill` com contagem do mês): `DataList` dos faturamentos com `status: "faturado"`, colunas
NF(`numero`, link para detalhe)/Cliente/OS(link)/Emissão(`faturado_em`)/Valor/Situação. Situação
= status da `ContaReceber` vinculada (via `faturamento_id`): "a vencer" (aberta, `vencimento`
futuro) / "vencida" (aberta, `vencimento` passado) / "paga" (liquidada) — sem conta vinculada,
"—".

**Card "A faturar"** (`CardSecao`, ícone `lucide:clipboard-list`, acessório `CardPill` com
`formatBRL(soma)`): lista de `rascunhos`, cada linha com OS vinculada + `descricao`/`obra_nome`
+ cliente + valor + botão "Emitir" (`Link` para `/admin/faturamento/:id`). Empty state quando
vazio.

**Card "Faturamento por mês"** (`CardSecao`, ícone `lucide:bar-chart`): barras (mesma marcação
de barra usada no operador/equipamento — `HazardStripe`-adjacent, ou barras simples com altura
`%` do máximo) sobre `agregadoMensal`; rodapé "Média R$X/mês" e "Pico R$Y (mês)" calculados do
mesmo array.

**Seção "Aguardando faturamento":** `AguardandoFaturamento` já existente, sem alteração de
lógica — só reposicionada abaixo do grid principal (era a primeira seção da aba Faturas; passa
a ser complementar ao card "A faturar", que cobre os rascunhos já gerados).

## Página 2 — Ordens de Serviço (`/admin/ordens`)

Mantém `PageHeader` (Ordens de Serviço · Nova OS) e `DataList` com busca. Troca:
- `Select` de status → `StatusFilterChips` (`Todas`+`STATUS_OS` com `tone`: aberta→info,
  em_andamento→warn, fechada→success), contagem por `lista` antes do filtro de status (conta
  sobre a busca já aplicada, ou sobre `todas`? — usar `todas` filtradas só por busca, para os
  contadores não mudarem ao trocar de aba, igual ao mock).
- Colunas novas: Equipamento, Operador, Valor, Período (decisão 7) inseridas entre Cliente/Obra
  existentes e Horas/Status atuais. `renderCard` (mobile) ganha as mesmas informações de forma
  compacta (equipamento · operador · valor · período), sem quebrar o card atual.

## Página 3 — Orçamentos (`/admin/orcamentos`)

Mantém `PageHeader` (Orçamentos · Novo orçamento) e `DataList` com busca. Troca:
- `Select` de status → `StatusFilterChips` (`Todos`+`STATUS_ORCAMENTO`, rótulos e tons reais:
  rascunho→neutral, enviado→info, aprovado→success, recusado→destructive/neutral).
- `PageHeader` ganha um `Pill`/badge com o total em aberto (decisão 6), ao lado do título.
- Colunas mantidas como já estão (Número/Cliente/Obra/Valor/Validade/Status) — o mock não pede
  coluna nova aqui além do que já existe.

## Página 4 — Comprovantes (`/admin/comprovantes`)

Mantém `PageHeader` e `DataList` com busca. Troca:
- `Select` de status → `StatusFilterChips` (`Todos`+`STATUS_COMPROVANTE`: pendente→warn,
  assinado→success, recusado→destructive).
- `PageHeader` ganha um `Pill` com contagem real (decisão 1): "N pendentes de assinatura" se
  `> 0`, senão "N comprovantes".
- Coluna "Número" ganha o tratamento visual em tile (ícone `lucide:file-signature` num
  quadrado `bg-primary/15 text-primary`), mantendo os dados reais (numero/OS/cliente/gerado
  em/status) — sem inventar coluna de valor/NF.
- CTA mantido: "Ver Ordens de Serviço" (real, já existe) — sem "Anexar comprovante" fake.

## Estados de tela

- `isLoading`/`error`/empty de cada `DataList` preservados exatamente como hoje (cada store já
  expõe `useEstado()`/`retry` quando assíncrona; `comprovantesStore` usa `useMockResource`,
  mantém).
- Faturamento: sem `isLoading` de página hoje (a store não expõe — confirmar na implementação;
  se `faturamentosStore` ganhar loading assíncrono futuramente, tratar como as demais).

## Acessibilidade (checklist)

- Chips de filtro são `<button type="button">`, com `aria-pressed` no ativo.
- Led de tom nos chips/badges sempre acompanhado de label (nunca cor só).
- Contraste ≥ 4.5:1; `focus-visible:ring-2 ring-primary` em chips/links/botões.
- Tabelas mantêm `<thead>`/`<tbody>` semânticos (já garantido pelo `DataList`).

## Testes

- `tsc --noEmit` limpo; suíte `vitest` existente permanece verde.
- Testes unitários novos: `agregadoMensal` (determinismo de agrupamento por mês, meses vazios
  presentes, ordenação) em `src/features/faturamento/derivacoes.test.ts` (arquivo já existe,
  estender). `StatusFilterChips` — teste de render básico (labels/contadores/aria-pressed).
- Verificação visual manual (usuário) em light/dark, 375/768/1280px, comparando lado a lado com
  os 4 mocks (`docs/html/.../ui_kits/retaguarda/{Faturamento,OSList,OrcamentosList,
  ComprovantesList}.jsx` — abrir via `index.html` do UI kit ou os `.jsx` isolados).

## Fora de escopo (futuro)

- Aba "Análise" do Faturamento (breakdown por equipamento/cliente, período customizável) — sem
  mock equivalente; decidir com o cliente se vira uma tela própria ou se é descartada.
- Export real para OS/Orçamentos/Comprovantes (hoje não existe, não é criado aqui).
- Estágio "aguardando faturamento" (OS fechada sem nenhum Faturamento) não ganha valor estimado
  — continua exibido sem valor, como hoje.
- A branch antiga `feat/detalhe-documentos-visual` (páginas `/:id`) não é tocada nem mergeada
  por esta spec; fica disponível para decisão futura do cliente.
