# Nova OS — novos campos e layout de página dedicada

**Data:** 2026-07-14
**Áreas:** `ordens_servico` (schema), `src/features/ordem-servico/`, `src/features/orcamentos/` (vínculo), rota `/admin/ordens/nova`

## Contexto

A tela "Nova OS" foi importada do projeto de design claude.ai/design
(`2ede574c-b344-4984-8c24-88e1130720be`, arquivo
`ui_kits/retaguarda/screen-nova-os.html` / `NovaOS.jsx`, salvo em
`docs/html/Antonello Terraplanagem — Design System (2)/ui_kits/retaguarda/`).
O mockup tem campos e um layout que não existem hoje no formulário real de
criação de OS (`OrdemForm`, em modal, já gravando no Supabase).

Comparação:

| Mockup | Formulário real hoje |
|---|---|
| Cliente, Tipo de serviço, Início previsto, Descrição do serviço, Equipamento, Operador, Local da obra, Orçamento vinculado, Valor previsto, Observações | Cliente, Obra, Endereço, Modelo de cobrança, Responsável, Diâmetro da broca (condicional), Observação |

"Operador" do mockup já corresponde a `responsavel_id`, existente. Os demais
campos do mockup sem equivalente real: **Tipo de serviço**, **Equipamento**,
**Início previsto**, **Orçamento vinculado**, **Valor previsto**.

O dono do projeto decidiu adicionar esses campos de verdade (schema + tipos +
formulário + store), não só replicar o visual por cima do formulário atual.

## Decisões de design

### 1. Equipamento — campo informativo, sem vínculo com apontamentos

O ADR-001 (`docs/adr/ADR-001-sync-offline-os-colaborativa.md`) trata
equipamento como propriedade de cada **apontamento** (append-only, uma OS
pode ter vários operadores/equipamentos ao longo do tempo) — não do
cabeçalho da OS (LWW). `apontamentos.equipamento_id` é `not null` e
independente. Para não conflitar com esse modelo colaborativo, a OS ganha
`equipamento_previsto_id` como indicação de planejamento ("qual máquina a
gente pretende usar"), exibido só no resumo — não restringe nem é lido pelos
apontamentos reais.

### 2. Orçamento vinculado — reaproveita o vínculo existente, sem coluna nova

Já existe `orcamentos.os_id` (nullable), preenchido hoje quando um orçamento
aprovado é convertido em OS pela tela de orçamentos
(`orcamento-detalhe.tsx:386-398`). Em vez de duplicar essa informação em
`ordens_servico`, o formulário de criação de OS ganha um select de
"Orçamento vinculado" que lista orçamentos com
`status === "aprovado" && !os_id` (mesma regra já usada em
`orcamento-detalhe.tsx:386`). Ao criar a OS com um orçamento selecionado, o
fluxo grava `orcamentos.os_id = <id da nova OS>` — o mesmo update que a tela
de orçamentos já faz, só disparado do lado da OS também.

### 3. Valor previsto — só exibição, não persistido

Sem coluna nova em `ordens_servico`. Quando há orçamento vinculado, o resumo
mostra `orcamentos.valor_total` (já calculado por `calcularTotalOrcamento`).
Sem orçamento vinculado, o resumo não mostra valor previsto. Evita guardar um
número que fica desatualizado assim que o orçamento for editado.

### 4. Tipo de serviço — enum fixo, nullable no banco

Campo novo, sem precedente em nenhum lugar do sistema (só existe como texto
livre em `obra_nome` e como texto de marketing na landing page). Modelado
como `text check (in (...))` com os 6 valores do mockup, seguindo o mesmo
padrão já usado em `modelo_cobranca` e `status`:

```
terraplenagem, drenagem, nivelamento, fundacao_estacas, cascalhamento, limpeza_terreno
```

Nullable no banco (linhas existentes ficam `null`, sem backfill necessário),
obrigatório só na validação do formulário para OS novas — mesmo padrão já
usado em `diametro_broca_mm` (nullable no banco, condicionalmente obrigatório
via zod).

### 5. Início previsto — data opcional, distinta de `aberta_em`

Campo novo `inicio_previsto date`, opcional, sem relação com `aberta_em`
(timestamp real de abertura da OS, que continua existindo e sendo definido
automaticamente na criação).

### 6. Layout — rota dedicada, não mais modal

O formulário de criação sai do modal (`FormDialog`) e vira uma página própria
em `/admin/ordens/nova`, seguindo o layout do mockup (2 colunas) em vez da
convenção de modal usada em outras criações do sistema (Novo Cliente, Novo
Orçamento etc. continuam como modal — só Nova OS muda). A edição de uma OS
existente continua como está hoje (fora de escopo).

Layout da nova página:

- **Coluna esquerda:** `Tabs` com "Dados da OS" (formulário) e "Sugestão de
  IA" (`SugestaoAlocacaoPainel`, já existente) — mesma estrutura de abas que
  o modal atual usa só na criação.
- **Coluna direita:** card "Resumo" fixo (não some ao trocar de aba),
  atualizado ao vivo via `watch()` do react-hook-form: número da próxima OS
  (`proximoNumeroOS`), ícone do equipamento previsto
  (`TIPO_ICONE[equipamento.tipo]`, de `src/features/equipamentos/labels.tsx`
  — reaproveitado, sem mapeamento novo), cliente, tipo de serviço,
  equipamento previsto, responsável, início previsto, orçamento vinculado,
  valor previsto (do orçamento, ver decisão 3).
- **Topo:** link "← Ordens de Serviço" voltando para `/admin/ordens`, como no
  mockup.

## Implementação (visão geral dos arquivos)

- **Migration nova** em `supabase/migrations/`: adiciona `tipo_servico`,
  `equipamento_previsto_id`, `inicio_previsto` em `ordens_servico` (ver SQL na
  seção de decisões acima).
- **`src/shared/types/index.ts`**: `OrdemServico` ganha os 3 campos novos
  (nullable); novo type union `TipoServico`.
- **`src/features/ordem-servico/labels.tsx`** (ou arquivo equivalente já
  existente): `TIPO_SERVICO_LABEL` e lista `TIPOS_SERVICO` para popular o
  select, mesmo padrão de `MODELO_LABEL`.
- **`src/features/ordem-servico/ordem-schema.ts`**: adiciona `tipo_servico`
  (obrigatório só na criação), `equipamento_previsto_id` (opcional),
  `inicio_previsto` (opcional), `orcamento_id` (campo só de formulário, não
  mapeia pra coluna).
- **`src/features/ordem-servico/ordens-store.ts`**: `criar` passa a aceitar
  `orcamento_id` opcional; ao criar com sucesso, se houver `orcamento_id`,
  chama `orcamentosStore.vincularOS(orcamento_id, novaOrdem.id)` — método
  público já existente (`orcamentos-store.ts:200`), o mesmo usado por
  `orcamento-detalhe.tsx:109` no fluxo inverso (converter orçamento em OS).
- **`src/features/ordem-servico/components/ordem-form.tsx`**: novos campos no
  formulário (select de tipo de serviço, select de equipamento previsto —
  filtrado por `equipamentosStore.useAll()`, input de início previsto, select
  de orçamento — só na criação).
- **Novo:** `src/features/ordem-servico/components/nova-ordem-page.tsx` —
  componente de página com o layout de 2 colunas descrito acima, usando
  `OrdemForm` para a coluna esquerda e um novo componente de resumo
  (`resumo-nova-ordem.tsx` ou similar) para a direita.
- **`src/routes/admin.ordens.nova.tsx`** (novo): rota seguindo o padrão de
  `admin.ordens.$ordemId.tsx`.
- **`src/features/ordem-servico/components/ordens-retaguarda-page.tsx`**: o
  botão "Nova OS" (duas ocorrências: toolbar e empty state) troca
  `setFormAberto(true)` por `<Link to="/admin/ordens/nova">`; remove o
  `FormDialog` de criação (o componente `OrdemForm` continua sendo usado para
  edição, se aplicável em outro lugar).

## Testes

- `ordem-schema.test.ts` (se existir) ou novo: valida que `tipo_servico` é
  obrigatório na criação e opcional na edição; que `diametro_broca_mm`
  continua funcionando como antes (regressão).
- `ordens-store.test.ts`: `criar` com `orcamento_id` atualiza
  `orcamentos.os_id` no fixture de teste.
- `ordem-form.test.tsx` (se existir) ou novo: renderiza os campos novos;
  formulário de edição não mostra o select de orçamento.
- Novo teste de rota/página: `/admin/ordens/nova` renderiza o formulário e o
  resumo; resumo atualiza ao digitar/selecionar campos.
- Testes existentes de `ordens-retaguarda-page.test.tsx`: botão "Nova OS"
  agora navega em vez de abrir modal — ajustar asserções afetadas.

## Fora de escopo

- Edição do "Tipo de serviço" e "Equipamento previsto" em OS já existentes
  não muda o comportamento de apontamentos, faturamento ou rentabilidade —
  são campos puramente informativos.
- Não altera o formulário/fluxo de edição de OS além de adicionar os 3 campos
  novos (mesmo modal de hoje).
- Não cria nenhuma tela nova de cadastro de "tipos de serviço" — a lista é
  fixa no código, não configurável pelo usuário.
- Não muda a convenção de modal usada em Novo Cliente, Novo Orçamento, Novo
  Equipamento etc. — só Nova OS vira página dedicada.
