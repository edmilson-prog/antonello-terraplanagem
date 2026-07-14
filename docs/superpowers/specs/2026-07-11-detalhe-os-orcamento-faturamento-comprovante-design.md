# Refatoração visual — Detalhe de OS, Orçamento, Faturamento e Comprovante

**Data:** 2026-07-11
**Áreas:**

- `src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx`
- `src/features/orcamentos/components/orcamento-detalhe.tsx`
- `src/features/faturamento/components/faturamento-detalhe.tsx`
- `src/features/comprovantes/components/comprovante-detalhe.tsx`
- Novos compartilhados: `src/shared/components/documento-hero.tsx`, `src/shared/components/stat-strip.tsx`

**Precedente:** as páginas de Detalhe do Operador, Equipamento e Cliente (`/admin/*/:id`) já
foram refatoradas com o padrão visual "canteiro de obras" (PRs #2 e #3, mergeados). Esta spec
aplica a **mesma linguagem visual** às quatro páginas de detalhe restantes, num **único PR**,
na ordem OS → Orçamento → Faturamento → Comprovante.

## Objetivo

Elevar as quatro páginas de detalhe transacionais das versões atuais (back-link + `header`/`section`
simples) para a linguagem do design system: **hero rico** (tile de ícone em gradiente, número em
mono, subtítulo, badges de status, quickfacts, slot de ações) + **faixa de estatísticas reais** +
**seções `CardSecao`** — mantendo a estética já implantada nas três páginas de cadastro.

## Diferença essencial em relação ao precedente

As três páginas já feitas são **perfis de cadastro** (operador, equipamento, cliente): ricas em
atributos, pobres em números reais — por isso usaram KPIs com **sparkline showcase** (dado de
exemplo determinístico). As quatro desta spec são **documentos transacionais/de workflow** (uma OS,
um orçamento, uma fatura, um comprovante): têm poucos números, porém **todos reais**, e fluxos de
edição/aprovação/assinatura já funcionando.

## Decisões (aprovadas com o cliente)

1. **Stat strip só com dado real — sem sparkline, sem showcase.** A faixa de métricas mostra
   apenas números derivados do próprio documento (total, nº de itens, horas, desconto, status).
   **Nenhum módulo `*-showcase-data.ts` é criado.** Isto honra o princípio "real onde existe" e
   evita dado fictício em documento transacional. Consequência: **não há novos testes de showcase**.
2. **Comprovante não tem faixa de estatísticas.** Um comprovante é um recibo assinado, sem métrica
   (o `resumo_servico` é texto e **nunca contém valor**). Ganha hero + seções, sem `StatStrip`.
3. **Fluxos preservados 100% — apenas re-vestir.** Toda a lógica atual permanece idêntica: editar
   itens, enviar/aprovar/recusar orçamento, confirmar faturamento, fechar OS, gerar comprovante,
   gerar OS a partir do orçamento, assinar/recusar comprovante, todos os `ConfirmDialog`/`FormDialog`,
   toasts, guardas (`podeFecharOS`, `temPendencia`, `validadeVencida`), disparo de aviso WhatsApp e
   integração com IA (`GerarTextoBotao`, `SugestaoOrcamentoDialog`). Muda só o invólucro visual.
4. **Ações de fluxo não migram para o hero.** Como a opção escolhida foi "preservar 100%, sem
   melhorias de UX", as barras de ação de fluxo (enviar/aprovar/confirmar/assinar/gerar) continuam
   como seção própria re-estilizada, **não** movidas para o slot de ações do hero. O slot de ações
   do hero recebe apenas ações não-destrutivas de navegação/edição quando já existiam (ex.: "Editar"
   da OS; link "WhatsApp" quando há telefone do cliente).
5. **Light + dark só com tokens.** Nunca hex em componente. Reusar `bg-card`, `text-primary`,
   `border-border`, `text-foreground-faint`, `bg-surface`, etc.
6. **Estados de tela preservados.** `isLoading` (skeleton), `error` (alerta inline com retry) e
   "não encontrado" de cada store permanecem exatamente como hoje, apenas realocados para dentro
   dos componentes reescritos.

## Componentes compartilhados novos

As quatro heroes são estruturalmente idênticas (documento: número mono + subtítulo + badge de
status + quickfacts + slot de ações). Extrair evita 4× duplicação e segue a isolação do padrão.

### `src/shared/components/documento-hero.tsx`

Casca do hero para páginas de detalhe "documento". Mesma estética do `cliente-hero.tsx`
(card em gradiente `from-card to-surface`, blur decorativo `bg-primary/10`, tile de ícone
`rounded-2xl` gradiente `from-primary to-primary-hover`).

Interface (composição por slots — os pais controlam o conteúdo):

```ts
interface DocumentoHeroProps {
  icone: string;                 // Iconify (lucide:*)
  numero: string;                // ex.: "OS-2026-0042" — renderizado em font-mono
  titulo?: string;               // subtítulo (obra_nome / cliente.nome)
  badges?: ReactNode;            // slot: badges de status/flags (à direita do número)
  quickfacts: { rotulo: string; valor: string; mono?: boolean }[];
  acoes?: ReactNode;             // slot: botões do hero (opcional)
}
```

Reaproveita o subcomponente `Quickfact` (mesma marcação do `cliente-hero`).

### `src/shared/components/stat-strip.tsx`

Faixa de tiles de estatística **real** (sem sparkline). Reusa a estética do `KpiCard`
(`cliente-kpis.tsx`) sem o `Sparkline` nem `trend`.

```ts
interface StatItem {
  rotulo: string;
  valor: string;                 // já formatado; valores monetários em font-mono
  icone: string;                 // Iconify
  rodape?: string;
  alerta?: boolean;              // usa bg-destructive/15 + text-destructive (ex.: pendência)
  mono?: boolean;                // valor em font-mono (default true p/ números/R$)
}
function StatStrip({ itens }: { itens: StatItem[] }): JSX.Element; // grid-cols-2 lg:grid-cols-4
```

## Reuso (não reinventar)

- `src/shared/components/card-secao.tsx` — `CardSecao`/`CardPill`.
- `src/shared/components/hazard-stripe.tsx` — `HazardStripe` (assinatura pontual).
- Badges de status existentes: `StatusOrcamentoBadge`, `StatusFaturamentoBadge`,
  `StatusComprovanteBadge` (`features/*/labels`), `StatusAvisoBadge`
  (`features/aviso-whatsapp/labels`). Para a OS, o status **efetivo** vem de
  `statusEfetivoOS` (`features/ordem-servico/derivacoes`) — mapear para um badge com
  cor+label (aberta/em_andamento/fechada).
- Linhas de item: `OrcamentoItemRow`, `FaturamentoItemRow` (preservadas).
- Componentes de fluxo: `OrdemForm`, `AdicionarItemOrcamento`, `SugestaoOrcamentoDialog`,
  `GerarTextoBotao`, `SignaturePad`, `ApontamentosDaOS`, `OrdemResumoCard` (esta última pode
  ser absorvida/aposentada — ver Página 1), `ConfirmDialog`, `FormDialog`.
- Derivações: `apontamentosDaOS`, `podeFecharOS`, `statusEfetivoOS`
  (`features/ordem-servico/derivacoes`); `temPendencia`, `validadeVencida`, `aplicarHoraTipo`,
  `valorItem` (orçamento/faturamento); `avisoDaOS` (aviso-whatsapp);
  `montarResumoServico` (comprovantes).
- Stores (leem mock hoje, viram Supabase na Fase 4): `ordensStore`, `orcamentosStore`,
  `faturamentosStore`, `comprovantesStore`, `apontamentosStore`, `clientesStore`,
  `equipamentosStore`, `precoHoraMaquinaStore`, `precoMobilizacaoStore`, `precoFundacaoStore`,
  `avisosWhatsAppStore`.
- Formatadores: `formatBRL` (`features/retaguarda/format`), `formatData`, `formatDataHora`
  (`shared/lib/format`).

## Página 1 — Detalhe da OS (`/admin/ordens/:id`)

Componente: `ordem-detalhe-retaguarda.tsx` (reescrever o invólucro; preservar toda a lógica).

**Campos reais** (`OrdemServico`): `numero`, `obra_nome`, `endereco`, `modelo_cobranca`, `status`,
`observacao`, `aberta_em`, `fechada_em`, `pendente_sync`, `cliente_id`. Derivados:
`apontamentosDaOS(id)`, `statusEfetivoOS`, `podeFecharOS`, horas totais (soma das horas dos
apontamentos da OS), nº de operadores distintos.

- **Hero:** ícone `lucide:clipboard-list`; número = `numero`; subtítulo = `obra_nome`;
  badges = status efetivo (pipeline) + `CardPill` do modelo de cobrança (`Hora-máquina`/`Por metro`)
  + pill `pendente_sync` quando `true`; quickfacts = Cliente, Endereço (se houver), Aberta em
  (`formatDataHora(aberta_em)`), Fechada em (se houver); ações do hero = **Editar** (abre
  `FormDialog` com `OrdemForm`, só quando não fechada) + **WhatsApp** (link `wa.me` quando o cliente
  tem telefone).
- **Stat strip (real):** `Apontamentos` (nº) · `Horas totais` (soma, mono) · `Operadores` (nº
  distintos) · `Status` (label do status efetivo). Sem alerta salvo caso já exista semântica.
- **Seções (`CardSecao`):**
  - `Observação` (ícone `lucide:sticky-note`) — só quando `ordem.observacao`.
  - `Apontamentos (n)` (ícone `lucide:timer`) — corpo = `ApontamentosDaOS`. O `OrdemResumoCard`
    atual é substituído pelo hero + stat strip; sua informação (número, cliente, obra, status,
    contadores) passa a viver no hero/strip. Confirmar na implementação que nada exibido pelo
    `OrdemResumoCard` se perde; se algo específico faltar, manter um card dedicado.
  - `Comprovante` (ícone `lucide:file-check-2`) — quando fechada: link "Ver comprovante Nº" se já
    existe, senão botão "Gerar comprovante" (preserva `abrirRevisaoComprovante` + `FormDialog` com
    `GerarTextoBotao` + `Textarea`).
  - `Aviso ao cliente` (ícone `lucide:message-circle`) — quando fechada e há aviso: `StatusAvisoBadge`
    + provedor + preview/mensagem de erro (lógica atual preservada).
- **Barra de ações de fluxo** (re-estilizada, fora do hero): quando não fechada → **Fechar OS**
  (com `podeFechar.motivo` quando bloqueado). Preserva `ConfirmDialog` de fechar e o disparo de
  aviso WhatsApp pós-fechamento.

## Página 2 — Detalhe do Orçamento (`/admin/orcamentos/:id`)

Componente: `orcamento-detalhe.tsx` (reescrever invólucro; preservar toda a lógica de itens,
desconto, envio, decisão e geração de OS).

**Campos reais** (`Orcamento`): `numero`, `descricao_obra`, `itens`, `desconto`, `valor_total`,
`validade`, `observacao`, `status`, `os_id`, `enviado_em`, `decidido_em`, `cliente_id`.

- **Hero:** ícone `lucide:file-text`; número = `numero`; subtítulo = `descricao_obra`;
  badges = `StatusOrcamentoBadge` + pill "Vencido" (destaque destrutivo) quando `validadeVencida`;
  quickfacts = Cliente, Validade (dd/mm/aaaa; destaque destrutivo se vencida), Enviado em, Decidido
  em (quando houver). Sem ações no hero (as ações do orçamento são de fluxo).
- **Stat strip (real):** `Itens` (nº) · `Subtotal` (soma dos itens, mono R$) · `Desconto`
  (mono R$; alerta desligado) · `Total` (`valor_total`, mono R$). Rótulo "Total" em destaque.
- **Seções (`CardSecao`):**
  - `Itens (n)` (ícone `lucide:list`) — acessório: aviso "Há itens sem preço" (`temPendencia`);
    corpo = lista de `OrcamentoItemRow` (edição preservada) + `SugestaoOrcamentoDialog` +
    `AdicionarItemOrcamento` quando `editavel`; empty state quando vazio.
  - `Desconto e observação` (ícone `lucide:percent`) — inputs quando `editavel`, texto quando não;
    total ao pé (o total também aparece no stat strip — aqui fica o fechamento contábil da seção).
- **Barra de ações de fluxo** (re-estilizada): conforme `status` — Enviar (rascunho) /
  Recusar+Aprovar (enviado) / Gerar OS (aprovado sem `os_id`) / link "Ver OS vinculada" (aprovado
  com `os_id`). Preserva ambos `ConfirmDialog`.

## Página 3 — Detalhe do Faturamento (`/admin/faturamento/:id`)

Componente: `faturamento-detalhe.tsx` (reescrever invólucro; preservar lógica de itens,
mobilização, desconto e confirmação).

**Campos reais** (`Faturamento`): `numero`, `os_id`, `cliente_id`, `modelo_cobranca`, `itens`,
`desconto`, `valor_total`, `observacao`, `status`, `gerado_em`, `faturado_em`.

- **Hero:** ícone `lucide:receipt`; número = `numero`; subtítulo = `cliente.nome`;
  badges = `StatusFaturamentoBadge`; quickfacts = OS de origem (link para `/admin/ordens/:id` com
  `os.numero · obra_nome`, ou "OS de origem removida"), Gerado em, Faturado em (quando houver),
  Modelo de cobrança. Sem ações no hero.
- **Stat strip (real):** `Itens` (nº) · `Desconto` (mono R$) · `Total` (`valor_total`, mono R$) ·
  `Status` (label). Quando `temPendencia`, o tile `Total` recebe `alerta` (há item sem preço).
- **Seções (`CardSecao`):**
  - `Itens (n)` (ícone `lucide:list`) — corpo = `FaturamentoItemRow` (edição preservada) + `Select`
    de adicionar mobilização quando `editavel`; empty state quando vazio.
  - `Observação e total` (ícone `lucide:file-text`) — `Textarea` + `GerarTextoBotao` quando
    `editavel` e há OS; total ao pé. Banner de pendência (`temPendencia`) preservado.
- **Barra de ações de fluxo** (re-estilizada): **Confirmar faturamento** quando `editavel`.
  Preserva `ConfirmDialog` (com aviso de pendência).

## Página 4 — Detalhe do Comprovante (`/admin/comprovantes/:id`)

Componente: `comprovante-detalhe.tsx` (reescrever invólucro; preservar assinatura e recusa).

**Campos reais** (`Comprovante`): `numero`, `os_id`, `cliente_id`, `resumo_servico`,
`assinante_nome`, `assinatura_url`, `status`, `motivo_recusa`, `gerado_em`, `assinado_em`.

- **Hero:** ícone `lucide:file-signature`; número = `numero`; subtítulo = `cliente.nome`;
  badges = `StatusComprovanteBadge`; quickfacts = OS (link "Ver OS Nº" quando existe), Gerado em,
  Assinado em (quando houver). Sem ações no hero.
- **Sem stat strip** (decisão 2 — recibo sem métrica).
- **Seções (`CardSecao`):**
  - `Resumo do serviço` (ícone `lucide:file-text`) — `resumo_servico` em `pre`/`whitespace-pre-wrap`
    `font-sans` (snapshot textual, sem valores).
  - `Assinatura do cliente` (ícone `lucide:pen-line`) — quando `pendente`: `Input` nome +
    `SignaturePad` + botões Recusar/Confirmar assinatura (guarda `podeConfirmar` preservada).
  - `Assinatura registrada` (ícone `lucide:check`) — quando `assinado`: nome + imagem da assinatura.
  - `Recusado pelo cliente` — quando `recusado`: `motivo_recusa` em card destrutivo
    (`border-destructive/40 bg-destructive/5`).
- Preserva `FormDialog` de recusa (motivo opcional).

## Estados de tela

- `isLoading` → skeleton (mesma marcação atual). `error` → alerta inline com "Tentar novamente"
  (`store.retry`) onde a store expõe (`ordensStore`, `orcamentosStore`). "Não encontrado" → mensagem
  + voltar para a lista (marcação atual preservada). Faturamento/Comprovante seguem o loader
  `notFound()` da rota; o componente trata `!fat`/`!comprovante`.
- Empty states por seção com backing real (itens vazios, sem comprovante, sem aviso) preservados.

## Acessibilidade (checklist)

- Contraste ≥ 4.5:1 nos dois temas; amarelo só como texto sobre escuro ou como fundo (`primary/15`)
  com texto escuro — nunca amarelo puro como texto sobre claro.
- Status sempre cor + label (nunca cor só) — os badges existentes já cumprem.
- `focus-visible:ring-2 ring-primary` em clicáveis; links/botões semânticos.
- Tile de ícone do hero e blur decorativo `aria-hidden`; ícones-only com `aria-label`.
- `<pre>` do resumo permanece legível (`font-sans`, `whitespace-pre-wrap`).

## Testes

- `tsc --noEmit` limpo; suíte `vitest` existente permanece verde.
- **Sem novos módulos showcase → sem novos testes de determinismo.** Se `DocumentoHero`/`StatStrip`
  precisarem de teste, cobrir apenas renderização básica (labels/valores), sem lógica de negócio
  (eles são de apresentação pura).
- Verificação visual manual (usuário) em light e dark, 375/768/1280px.

## Fora de escopo (futuro)

- As demais telas (listas/index, dashboards, financeiro, preços, rentabilidade, IA, app do operador).
- Qualquer mudança de comportamento/fluxo (mover ações para o hero, novos estados, novos campos).
- Agregações reais que hoje não existem no contrato (nenhuma é necessária: o stat strip usa só
  números já deriváveis dos documentos).
