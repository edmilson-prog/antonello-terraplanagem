# Roadmap — UI Kit Retaguarda × Refatoração Visual

> Cruza as 34 telas do protótipo estático em
> `docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/`
> com o estado real de `/admin/*`. Não é "existe ou não existe" — a funcionalidade
> de quase tudo já existia antes deste UI kit chegar (PRDs 001–019, Fase 2/3).
> O que este roadmap rastreia é **onda de refatoração visual**: quais telas já foram
> re-vestidas para bater com este design system, e quais ainda estão no visual antigo
> (ou em diálogo genérico, quando o mock pede página dedicada).
>
> Não é um PRD — é um índice de rastreamento, no espírito do `INDEX-PRDs-antonello.md`.

## Informações

| Campo | Valor |
|-------|-------|
| **Fonte do design** | `docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/` |
| **Fonte do real** | `src/routes/admin.*.tsx` + `src/features/*/components/` |
| **Telas no UI kit** | 34 (excluindo shell `App/Header/Sidebar`, `data.js` e `Placeholder.jsx`) |
| **Gerado em** | 2026-07-15 |

**Legenda:**
- ✅ **Refatorado** — visual já bate com este design system (hero/KPIs/`CardSecao`, tokens Tailwind, etc.)
- 🔧 **Funcional, visual antigo** — feature completa e com dado real, mas ainda no estilo anterior a este UI kit
- 🔲 **Funcional, mas em diálogo genérico** — existe como `FormDialog`/modal; o mock pede página dedicada (mesmo padrão que a Nova OS tinha antes desta sessão)
- ⏳ **Não existe** — sem rota nem feature equivalente
- ⚠️ **Divergência de fluxo** — implementado, mas com lógica de produto diferente do mock (não é sobre visual)

---

## Ondas de refatoração já concluídas

| Onda | Plano | Telas cobertas | Merge |
|------|-------|-----------------|-------|
| 1 | `2026-07-10-detalhe-operador-visual.md` | Detalhe do Operador | ✅ |
| 2 | `2026-07-11-detalhe-cliente-equipamento-visual.md` | Detalhe do Cliente, Detalhe do Equipamento | ✅ |
| 3 | `2026-07-11-detalhe-documentos-visual.md` | Detalhe de OS, Orçamento, Faturamento, Comprovante | ✅ (branch `feat/detalhe-documentos-visual`) |
| 4 | `2026-07-12-listas-cadastros-retaguarda.md` | Lista de Clientes, Operadores, Equipamentos | ✅ |
| 5 | `2026-07-12-telas-area-retaguarda.md` | Página de Faturamento (reescrita p/ KPIs+cards+gráfico), Lista de OS, Lista de Orçamentos, Lista de Comprovantes | ✅ (branch `feat/telas-area-retaguarda`) |
| 6 | `2026-07-14-login-v2-redesign.md` + `login-theme-swap.md` + `login-brand-copy.md` | Login (split-screen, 2 variações de logo) | ✅ |
| 7 | `2026-07-14-nova-os-campos-e-layout.md` | Nova OS — promovida de diálogo para página dedicada (`/admin/ordens/nova`), 2 colunas + resumo ao vivo | ✅ (PR #8, merge `5671e2b`) |
| 8 | `2026-07-15-cadastros-paginas-dedicadas.md` | NovoCliente, NovoEquipamento, NovoOperador, NovoCusto, NovoPagamento — 5 diálogos genéricos promovidos a páginas dedicadas, mesmo padrão da Nova OS | ✅ (PR #9, merge `ea7a22d`) |
| 9 | `2026-07-16-onda-comercial-precos-financeiro.md` | Preços (colunas Custo ref./Margem + histórico de alterações) e Financeiro (KPIs + grid 2 colunas + cards novos) — reskin de páginas de área já funcionais, sub-onda "Comercial" | ✅ (PR #10, merge `8b9c1a1`) |

---

## Tabela de Cobertura

| # | Tela (UI Kit) | Rota / componente real | Status | Onda / observação |
|---|----------------|------------------------|--------|---------------------|
| 1 | `ClientesList.jsx` | `admin.clientes.index.tsx` | ✅ | Onda 4 |
| 2 | `ClienteDetail.jsx` | `admin.clientes.$clienteId.tsx` | ✅ | Onda 2 |
| 3 | `NovoCliente.jsx` | `admin.clientes.novo.tsx` | ✅ | Onda 8 |
| 4 | `EquipamentosList.jsx` | `admin.equipamentos.index.tsx` | ✅ | Onda 4 |
| 5 | `EquipamentoDetail` (implícito no mock) | `admin.equipamentos.$equipamentoId.tsx` | ✅ | Onda 2 |
| 6 | `NovoEquipamento.jsx` | `admin.equipamentos.novo.tsx` | ✅ | Onda 8 |
| 7 | `OperadoresList.jsx` | `admin.operadores.index.tsx` | ✅ | Onda 4 |
| 8 | `OperadorDetail.jsx` | `admin.operadores.$operadorId.tsx` | ✅ | Onda 1 |
| 9 | `NovoOperador.jsx` | `admin.operadores.novo.tsx` | ✅ | Onda 8 (+5 campos cadastrais e vínculo com equipamentos, além do reskin) |
| 10 | `PrecosList.jsx` | `admin.precos.tsx` | ✅ | Onda 9 (mantidas as 3 abas; colunas Custo ref./Margem na aba Hora-Máquina; histórico de alterações "Tabelas anteriores") |
| 11 | `OSList.jsx` | `admin.ordens.index.tsx` | ✅ | Onda 5 |
| 12 | `OSDetail.jsx` | `admin.ordens.$ordemId.tsx` | ✅ | Onda 3 + aprofundado em 2026-07-21 — KPIs financeiros (Valor previsto/Custo estimado/Faturado/Margem, via `rentabilidadePorObra`), quickfact + evento de Orçamento de origem (busca reversa por `os_id`), tabela de Apontamentos com Horímetro e Data, card "Faturamento" (troca do conceito fictício "Medições" do mock, que não existe no modelo real) e card "Histórico" novo |
| 13 | `NovaOS.jsx` | `admin.ordens.nova.tsx` | ✅ | Onda 7 (esta sessão) — referência do padrão "página dedicada" |
| 14 | `Faturamento.jsx` | `admin.faturamento.index.tsx` + `$faturamentoId` | ✅ | Onda 5 (lista/página) + Onda 3 (detalhe) |
| 15 | `NovaNF.jsx` | — | ⚠️ | Fluxo manual de emissão de NF não existe — Faturamento é gerado automaticamente ao fechar a OS. Questão de produto, não de refatoração visual |
| 16 | `OrcamentosList.jsx` | `admin.orcamentos.index.tsx` | ✅ | Onda 5 |
| 17 | `OrcamentoDetail.jsx` | `admin.orcamentos.$orcamentoId.tsx` | ✅ | Onda 3 |
| 18 | `NovoOrcamento.jsx` | `admin.orcamentos.novo.tsx` | ✅ | Onda 10 (página dedicada, mesmo padrão da Onda 8 + itens do orçamento levados para a criação, ligados aos catálogos reais — equipamento/preço vigente, fundação, mobilização — em vez do catálogo fixo do mock) |
| 19 | `Financeiro.jsx` | `admin.financeiro.index.tsx` | ✅ | Onda 9 (saiu do modelo 3-abas para KPIs + grid 2 colunas + cards "Recebimentos por forma"/"Comprovantes recentes"; fluxos de dar baixa/emitir cobrança preservados) |
| 20 | `NovoPagamento.jsx` | `admin.financeiro.contas-pagar.novo.tsx` | ✅ | Onda 8. Só contas a pagar são criadas manualmente; a receber nasce do faturamento (mesma lógica da linha 15) |
| 21 | `ComprovantesList.jsx` | `admin.comprovantes.index.tsx` + `$comprovanteId` | ✅ | Onda 5 (lista) + Onda 3 (detalhe) |
| 22 | `Manutencao.jsx` | `admin.manutencao.tsx` | 🔧 | Sem onda — última mudança real 2026-07-01 |
| 23 | `NovaManutencao.jsx` | `admin.manutencao.registrar.$registroId.tsx` | ✅ | Onda 10 — escopo reduzido por decisão do usuário: o mock modela manutenção corretiva sob demanda (tipo/prioridade/bloqueio de equipamento/fornecedor), que **não existe no produto real** (só preventiva, disparada por `PlanoManutencao`). Página dedicada cobre só o fluxo real ("Registrar Manutenção Realizada" a partir de um alerta específico, não um "+ Novo" livre) |
| 24 | `Diesel.jsx` | `admin.diesel.tsx` | 🔧 | Sem onda — última mudança real 2026-07-02 |
| 25 | `NovoAbastecimento.jsx` | `admin.diesel.novo.tsx` | ✅ | Onda 10 (página dedicada; sem o seletor fictício "Origem do diesel"/estoque/conta a pagar automática do mock, que não existe no produto real — decisão do usuário; botão de leitura de cupom por IA, que já existia e não está no mock, preservado) |
| 26 | `CustoHora.jsx` | `admin.custo-hora.tsx` | 🔧 | Sem onda — última mudança real 2026-07-02 |
| 27 | `NovoCusto.jsx` | `admin.custo-hora.novo.tsx` | ✅ | Onda 8 (+categoria/competência/observação, e coluna Custo ref./Margem em Preços na Onda 9 reaproveita a mesma estimativa de custo) |
| 28 | `Rentabilidade.jsx` | `admin.rentabilidade.tsx` | 🔧 | Sem onda — última mudança real 2026-07-03 |
| 29 | `Dashboard.jsx` | `admin.index.tsx` (aba "Visão geral") | 🔧 | Sem onda real — o único commit de 2026-07-13 foi lint/type-check, não refatoração |
| 30 | `DashboardOperacional.jsx` | `admin.index.tsx` (aba "Operacional") | 🔧 | Idem |
| 31 | `PainelGerencial.jsx` | `admin.gerencial.tsx` | 🔧 | Sem onda — última mudança real 2026-07-06 |
| 32 | `Login.jsx` / `LoginV2.jsx` | `src/features/auth/login-page.tsx` | ✅ | Onda 6 |
| 33 | `Parametros.jsx` | — | ⏳ | Não existe rota nem feature. Sem PRD |
| 34 | `Sobre.jsx` | — | ⏳ | Não existe rota nem feature. Sem PRD, baixa prioridade |

---

## Resumo

| Status | Quantidade |
|--------|------------|
| ✅ Refatorado (bate com o design system) | 24 / 34 |
| 🔧 Funcional, visual antigo | 7 / 34 |
| 🔲 Funcional, mas em diálogo genérico (mock pede página dedicada) | 0 / 34 |
| ⏳ Não existe | 2 / 34 |
| ⚠️ Divergência de fluxo (não é visual) | 1 / 34 |

> Nota: a contagem anterior (16/8/8/2/1 = 35) tinha um erro de soma — 34 telas no total, não 35. Corrigido junto com as Ondas 8 e 9.

## Ondas de refatoração concluídas (cont.)

| Onda | Plano | Telas cobertas | Merge |
|------|-------|-----------------|-------|
| 10 | Sem plano formal — uma tela por vez, Artifact fiel antes de codar (ver `feedback_onda_por_pagina_artifact_first` na memória) | Diálogos → páginas dedicadas: NovoOrcamento, NovoAbastecimento, NovaManutencao (escopo reduzido — ver linha 23) | ✅ (commits `dc97f52`, `5d6c927`, e o de NovaManutencao) |

## O que falta, em ordem sugerida

1. **🔧 Páginas de área ainda sem refatoração** (6 telas: Manutenção, Diesel, Custo da Hora, Rentabilidade, Painel Gerencial, Dashboard + Painel Operacional) — candidatas a agrupar em ondas por afinidade, ex.: "Diesel + Manutenção" (Frota), "Custo da Hora/Rentabilidade/Painel Gerencial/Dashboard" (Analítico, a maior — 4 telas).
2. **⏳ Parâmetros** — maior gap: não tem PRD nem rota. Precisa decisão de escopo antes de virar plano.
3. **⏳ Sobre** — institucional, baixo esforço.
4. **⚠️ Nova NF** — decisão de produto pendente com o Leonardo (emissão manual avulsa é necessária, ou o automático ao fechar OS já cobre?). Mesma categoria de divergência que apareceu em NovaManutencao (linha 23) — vale revisitar as duas juntas com o Leonardo.

---

## Última Atualização

| Campo | Valor |
|-------|-------|
| **Data** | 2026-07-21 |
| **Gerado por** | Claude Code, a pedido do usuário |
| **Método** | Leitura dos 34 arquivos `.jsx` do UI kit + `find` em rotas reais + `git log` por arquivo/feature para achar a última mudança real (distinguindo refatoração de commits incidentais como lint/type-check) + leitura do `Goal` de cada plano em `docs/superpowers/plans/` para mapear onda → telas cobertas |
| **Atualização 2026-07-16** | Fechadas as Ondas 8 (Cadastros — Páginas Dedicadas, PR #9) e 9 (Onda Comercial — Preços + Financeiro, PR #10). 7 telas passaram de 🔲/🔧 para ✅ (NovoCliente, NovoEquipamento, NovoOperador, NovoCusto, NovoPagamento, Preços, Financeiro). Corrigido também um erro de soma no resumo anterior (34 telas, não 35). |
| **Atualização 2026-07-21** | Iniciada a Onda 10 (Diálogos → páginas dedicadas), agora uma tela por vez com Artifact-primeiro em vez de spec/plano/SDD. `NovoOrcamento` fechado: página dedicada em `/admin/orcamentos/novo`, com os itens do orçamento levados para a criação (divergência do mock resolvida a favor de ligar aos catálogos reais — equipamento/preço vigente, fundação, mobilização — reaproveitando `AdicionarItemOrcamento`/`OrcamentoItemRow` já existentes). |
| **Atualização 2026-07-21 (2)** | Aprofundado `OSDetail`/`admin.ordens.$ordemId.tsx` (linha 12), fora de onda formal — pedido direto do usuário para bater mais fielmente com o mock. KPIs financeiros adicionados (reaproveitando `rentabilidadePorObra` já existente da Rentabilidade, não recalculado do zero); a seção fictícia "Medições" do mock foi substituída por um card "Faturamento vinculado" (busca reversa por `os_id`, com botão "Gerar faturamento" espelhando o já existente em `AguardandoFaturamento`); nova tabela `ApontamentosOSTabela` (Data/Horímetro, mantendo o componente `ApontamentosDaOS` original intocado por ser compartilhado com o app do operador); novo card "Histórico" montado a partir de timestamps reais (orçamento/OS/faturamento/comprovante), sem inventar um conceito de auditoria novo. |
| **Atualização 2026-07-22** | `NovoAbastecimento` fechado (linha 25): página dedicada em `/admin/diesel/novo`, mesmo formulário/validação de horímetro que já existia (só mudou o shell, não a lógica), com resumo ao vivo estimando o custo (litros × preço) quando só um dos dois é informado. Sem o seletor "Origem do diesel" com preço fixo/estoque/conta a pagar automática do mock — decisão do usuário, não existe no produto real. `RegistrarAbastecimentoDialog` (retaguarda) removido, substituído pela página; `RegistrarAbastecimentoOperadorDialog` (app do operador, schema diferente, sem dado financeiro) não foi tocado. |
| **Atualização 2026-07-22 (2)** | **Onda 10 fechada.** `NovaManutencao` (linha 23) — maior divergência mock×real das três telas da onda: o mock modela manutenção corretiva sob demanda (tipo, prioridade com bloqueio de equipamento, fornecedor/oficina, descrição livre), que não existe no produto real (só preventiva, disparada por `PlanoManutencao` por intervalo de horas). Por decisão do usuário, a página dedicada (`/admin/manutencao/registrar/$registroId`) cobre só o fluxo real — "Registrar Manutenção Realizada" a partir de um alerta específico da aba Alertas, não um "+ Novo" livre — sem inventar tipo/prioridade/bloqueio/fornecedor. `AlertasTab` passou a linkar direto pra rota em vez de abrir diálogo; `RegistrarManutencaoDialog` removido. |
