# Refatoração visual — Detalhe do Equipamento e do Cliente

**Data:** 2026-07-11
**Áreas:**
- `src/features/equipamentos/components/equipamento-detalhe.tsx` (+ novos subcomponentes)
- `src/features/clientes/components/cliente-detalhe.tsx` (+ novos subcomponentes)

**Mocks alvo:**
- `docs/html/mock-detalhe-equipamento.html`
- `docs/html/mock-detalhe-cliente.html`

**Precedente:** a página de Detalhe do Operador (`/admin/operadores/:id`) já foi refatorada
com esse padrão (PR #2, mergeado). Esta spec aplica o **mesmo padrão visual** às duas
páginas restantes, num **único PR**, com o equipamento implementado antes do cliente.

## Objetivo

Elevar as páginas de detalhe de equipamento e cliente das versões simples atuais
(header + `<dl>`) para o layout rico dos mocks (tema "canteiro de obras": fundo asfalto,
amarelo-máquina, faixa de sinalização, fontes Archivo/IBM Plex): hero, faixa de 4 KPIs e
grid de cards de atividade — reproduzindo os mocks com fidelidade visual.

## Decisões (aprovadas com o cliente)

1. **Híbrido "real onde existe + exemplo nas lacunas".** Diferente do operador (onde tudo
   era exemplo), aqui há backing real disponível. Regra: **toda seção que já tem campo real
   ou store real consome o dado real**; apenas o que não tem campo recebe **dado de exemplo
   plausível** (módulo showcase determinístico). **Nunca rebaixar dado que já é real** — em
   especial o snapshot Farolti do cliente, que o `cliente-detalhe.tsx` atual já renderiza.
2. **Estados vazios obrigatórios** nas seções ligadas a dado real (um equipamento pode não
   ter preço/plano/manutenção; um cliente pode não ter OS/orçamentos/legado). Cada card com
   backing real trata loading/empty. As seções 100% showcase sempre renderizam (não têm
   estado vazio), como no operador.
3. **Card "Recebimentos" do cliente = financeiro de exemplo.** O card que no mock lista
   PIX/TED/boleto com R$ vira um card **"Recebimentos"** alimentado por showcase — **não**
   usa a entidade real `Comprovante` (que é recibo assinado, sem valores; semântica diferente).
4. **Financeiro visível a toda a retaguarda.** As duas páginas são `/admin` (a rota já
   exclui o operador). Segue o padrão da página de Preços: sem guarda nova por sub-perfil.
   Custo-hora, receita e custos de manutenção (equip.) e todo o financeiro/comercial (cliente)
   aparecem para recepção e proprietário/admin.
5. **Light + dark só com tokens.** Mocks são dark-only; implementação usa apenas tokens
   (`bg-card`, `text-primary`, `border-border`, `text-foreground-faint`…), nunca hex. Os
   tokens já coincidem 1:1 com os mocks no dark.
6. **Ações primárias do hero navegam para telas existentes** (sem fluxo novo):
   - Equipamento: **"Registrar manutenção"** → `Link` para `/admin/manutencao`.
   - Cliente: **"Novo orçamento"** → `Link` para `/admin/orcamentos`.
   - WhatsApp (ambos, quando houver telefone): link `wa.me` simples, como no operador.
7. **Refactor de reuso:** promover `CardSecao` + `CardPill` de
   `src/features/operadores/components/card-secao.tsx` para `src/shared/components/card-secao.tsx`
   (as três páginas passam a usar). Atualizar o import do operador. Comportamento idêntico.

## Reuso (não reinventar)

Já existem e serão reaproveitados:

- `src/shared/components/status-ativo.tsx` — `StatusAtivo` (badge ativo/inativo do hero).
- `src/shared/components/sparkline.tsx` — `Sparkline` (KPIs; pontos 0..100, `currentColor`).
- `src/shared/components/hazard-stripe.tsx` — `HazardStripe`.
- `src/shared/components/card-secao.tsx` — `CardSecao`/`CardPill` (após a promoção, decisão 7).
- `src/features/equipamentos/labels.tsx` — `EquipamentoStatusBadge`, `InativoBadge`, `TIPO_LABEL`, `STATUS_LABEL`.
- Chips de status do cliente: `StatusOSBadge`, `StatusOrcamentoBadge` (em `features/*/labels`).
- Forms inline: `EquipamentoForm`, `ClienteForm` (edição preservada como hoje).
- `ConfirmDialog` (inativar/reativar). `Table`/`TableRow`/… (`components/ui/table`).
- Formatadores: `formatHorimetro`, `formatDocumento`, `formatTelefone`, `formatData`,
  `formatDataHora` (`shared/lib/format`) e o helper de moeda já usado no projeto
  (`formatBRL`/`money`) — usar o mesmo que as features financeiras já usam.
- Stores reais (leem mock hoje, viram Supabase na Fase 4): `precoHoraMaquinaStore`,
  `planosManutencaoStore`, `registrosManutencaoStore`, `derivacoes.ts` (manutenção);
  `ordensStore`, `orcamentosStore` (cliente).

## Página 1 — Detalhe do Equipamento (`/admin/equipamentos/:id`)

Estrutura (área de conteúdo; o shell já é global): back-link → hero → 4 KPIs →
grid `[1.6fr_1fr]` (colapsa < 1080px) → banda-nota rodapé.

**Campos reais** (tipo `Equipamento`): `nome`, `tipo`, `capacidade`, `horimetro_atual`,
`identificador`, `status`, `ativo`, `created_at`.

**Seções e recorte real × exemplo:**

| Seção | Tipo UI | Real | Exemplo (showcase) |
|-------|---------|------|--------------------|
| Hero | avatar-ícone + badges + quickfacts + ações | nome, status, tipo, capacidade, horímetro atual, identificador (sub-id/placa), "na frota desde" (`created_at`), ativo | marca/modelo, ano, aquisição (nos quickfacts que não têm campo) |
| KPIs (4) | strip c/ sparkline | Horímetro atual (`horimetro_atual`) | Horas no mês, Disponibilidade, Receita no mês; todos os trends/sparklines |
| Leituras de horímetro | tabela | — | tabela inteira (data, operador, OS, ini→fim, horas) |
| Manutenções | banner "próxima" + lista | `PlanoManutencao` + `RegistroManutencao` (descrição, horímetro previsto/realizado, status, **custo**, data) + status derivado (`calcularStatusManutencao`) | chip "Preventiva/Corretiva" (sem campo real → rótulo de exemplo ou omitir) |
| Ficha técnica | datalist | capacidade, identificador (placa) | marca/modelo, ano, aquisição FINAME/BNDES, descrição |
| Custo-hora | grid 2 células (financeiro) | `PrecoHoraMaquina` (`valor_hora_seca`, `valor_hora_operada`) vinculado por `equipamento_id` ou `tipo_equipamento` | — |
| Próxima manutenção | health + progress | intervalo/meta derivados do plano real | rótulos auxiliares se plano ausente |
| Utilização por semana | barras | — | 8 barras + média/pico |

**Estados vazios:** custo-hora sem `PrecoHoraMaquina` → "Preço-hora não configurado";
manutenções sem plano/registro → card com empty state ("Sem plano de manutenção");
próxima manutenção sem plano → oculta ou empty.

**Banda rodapé:** nota explicando que custo-hora/receita/custos aparecem por ser retaguarda;
no app de campo o equipamento nunca exibe valores.

**Componentes** (em `src/features/equipamentos/components/`):
- `equipamento-hero.tsx`, `equipamento-kpis.tsx`, `leituras-horimetro-card.tsx`,
  `manutencoes-card.tsx`, `ficha-tecnica-card.tsx`, `custo-hora-card.tsx`,
  `proxima-manutencao-card.tsx`, `utilizacao-semana-card.tsx`.
- `equipamento-detalhe.tsx` — **reescrever** para orquestrar (loading/erro/not-found +
  edição inline + inativar/reativar preservados) e compor.
- Módulo de exemplo: `src/features/equipamentos/equipamento-showcase-data.ts` —
  determinístico por `id` (`hashString` + `mulberry32`, mesmo padrão do operador). Expõe só
  o que é EXEMPLO (marca/modelo, ano, aquisição, KPIs horas/disponibilidade/receita +
  sparklines/trends, leituras de horímetro, utilização/semana). Comentário no topo: dado de
  exemplo temporário. **Não** inclui custo-hora nem manutenções (esses vêm reais).

## Página 2 — Detalhe do Cliente (`/admin/clientes/:id`)

Estrutura: back-link → hero → 4 KPIs → grid `[1.6fr_1fr]` → **banda Farolti** (full-width) →
banda-nota rodapé.

**Campos reais** (tipo `Cliente`): `nome`, `documento`, `telefone`, `created_at`, `ativo`,
`tipo_pessoa`, e todos os `legado_*` (`legado_ltv`, `legado_ticket_medio`,
`legado_frequencia_os`, `legado_curva_abc`, `legado_primeira_os`, `legado_ultima_os`,
`legado_recencia_dias`, `cli_codigo_legado`).

**Seções e recorte real × exemplo:**

| Seção | Tipo UI | Real | Exemplo (showcase) |
|-------|---------|------|--------------------|
| Hero | avatar-ícone + badges + quickfacts + ações | nome, documento (CNPJ/CPF), telefone, "cliente desde" (`created_at`), ativo, tipo_pessoa (PJ/PF) | badge "Cliente recorrente"; última OS (se não derivável de `ordensStore`) |
| KPIs (4) | strip c/ sparkline | contagem OS ativas (`ordensStore`), orçamentos abertos (`orcamentosStore`) | Faturado 2025 + trend, Saldo a receber (variante **alerta**), sparklines/trends |
| Ordens de Serviço | lista (`CardSecao`) | `numero`, `obra_nome`, `status` (`ordensStore`, cruzando o cliente como o `cliente-detalhe.tsx` já faz) | horas e valor R$ por OS (sem campo no contrato) |
| Contas a receber | tabela | contrato `ContaReceber` existe, mas sem store alimentada hoje | linhas (documento NF, emissão, vencimento, valor, situação A vencer/Vencido/Pago) |
| Dados cadastrais | datalist | razão social (`nome`), telefone, tipo_pessoa | nome fantasia, segmento, e-mail, endereço, contato (nome · papel) |
| Orçamentos | lista (`CardSecao`) | `numero`, `descricao_obra`, `valor_total`, `status` (`orcamentosStore`) | — |
| Recebimentos | lista (`CardSecao`) | — | PIX/TED/boleto (título, data·hora, valor) — decisão 3 |
| Banda Farolti | banda tracejada aço + grid de stats | **todos os `legado_*`** + `cli_codigo_legado` (preservar o render atual, extraindo em componente) | "origem: migração jun/2024" (sem campo de data) |

**Estados vazios:** OS sem vínculo → card empty; orçamentos vazios → empty; **banda Farolti
oculta quando o cliente não tem `legado_*`** (preservar a condicional atual do
`cliente-detalhe.tsx`). Contas a receber e Recebimentos são showcase → sempre renderizam.

**Sensibilidade/LGPD:** `documento` é CNPJ (PJ) ou **CPF (PF, sensível)**; contato/e-mail/
endereço/telefone são PII. Como hoje esses extras são apenas exemplo (sem persistência),
não há novo tratamento de dado — apenas **não logar** e manter o CPF fora de qualquer log.

**Componentes** (em `src/features/clientes/components/`):
- `cliente-hero.tsx`, `cliente-kpis.tsx` (suporta variante alerta no "Saldo a receber"),
  `ordens-cliente-card.tsx`, `contas-receber-card.tsx`, `dados-cadastrais-cliente-card.tsx`,
  `orcamentos-cliente-card.tsx`, `recebimentos-cliente-card.tsx`, `farolti-snapshot-card.tsx`.
- `cliente-detalhe.tsx` — **reescrever** para orquestrar e compor (preservando
  loading/erro/edição/inativar e o cruzamento real com `ordensStore`/`orcamentosStore`).
- Módulo de exemplo: `src/features/clientes/cliente-showcase-data.ts` — determinístico por
  `id`. Expõe só EXEMPLO (KPIs faturado/saldo/trends/sparklines, linhas de contas a receber,
  horas+valor por OS, cadastrais extras, linhas de recebimentos, "recorrente", origem/data
  migração). **Não** inclui `legado_*` (vêm reais do `cliente`).

## Mapeamento de tokens (mock → projeto)

Idêntico ao operador. `--bg #16140f`→`bg-background`; `--surface/--card #211d15`→`bg-card`/`bg-surface`;
`--fg`→`text-foreground`; `--muted-2`→`text-foreground-faint`; `--amarelo #ffb300`→`text-primary`/`bg-primary`;
`--amarelo-soft`→`primary/10..15`; `--border`→`border-border`; success/danger/info→tokens existentes;
faixa diagonal→`HazardStripe`. O snapshot Farolti usa o sotaque "aço" (`text-muted`/`border-border`
tracejado) já presente no render atual.

## Estados de tela

- `isLoading` / `error` / "não encontrado" das stores (`equipamentosStore`, `clientesStore`)
  seguem tratados como hoje (skeleton, alerta com retry, "não encontrado").
- **Novo:** empty states por card com backing real (ver por página acima).
- Seções 100% showcase sempre renderizam.

## Acessibilidade (checklist)

- Contraste ≥ 4.5:1 nos dois temas; amarelo só como texto sobre escuro ou como fundo
  (`primary/15`) com texto escuro — nunca amarelo puro como texto sobre claro.
- Status sempre cor + label/led (nunca cor só).
- `cursor-pointer` + `focus-visible:ring-2 ring-primary` em clicáveis; linhas/cards
  clicáveis são `Link`/`button`.
- Avatar decorativo `aria-hidden`; ícones-only com `aria-label`.
- Tabelas com `<thead>`/`<tbody>` semânticos. `prefers-reduced-motion` já global.

## Testes

- `tsc --noEmit` limpo; suíte `vitest` existente permanece verde.
- Testes unitários dos dois módulos showcase (`equipamento-showcase-data.ts`,
  `cliente-showcase-data.ts`): determinismo (mesmo `id` → mesmo resultado) e variação entre
  ids, no mesmo formato dos testes do operador.
- Verificação visual manual (usuário) em light e dark, 375/768/1280px.

## Fora de escopo (futuro)

- Expandir os schemas `equipamentos` (marca/modelo/ano/aquisição) e `clientes`
  (fantasia/segmento/e-mail/endereço/contato).
- Store real de `ContaReceber` e de recebimentos; agregações reais de KPI/receita/horas;
  relação leituras de horímetro ↔ equipamento (apontamentos).
- Fluxos "registrar manutenção" e "novo orçamento" (hoje só navegam para as telas existentes).
- Quando esses dados existirem, trocar os módulos `*-showcase-data.ts` pelas fontes reais,
  sem mexer nos componentes de apresentação.
