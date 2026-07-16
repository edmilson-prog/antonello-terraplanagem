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

---

## Tabela de Cobertura

| # | Tela (UI Kit) | Rota / componente real | Status | Onda / observação |
|---|----------------|------------------------|--------|---------------------|
| 1 | `ClientesList.jsx` | `admin.clientes.index.tsx` | ✅ | Onda 4 |
| 2 | `ClienteDetail.jsx` | `admin.clientes.$clienteId.tsx` | ✅ | Onda 2 |
| 3 | `NovoCliente.jsx` | diálogo em `clientes-page.tsx` (`FormDialog`) | 🔲 | Mock mostra página dedicada; real ainda é diálogo genérico — não entrou em nenhuma onda |
| 4 | `EquipamentosList.jsx` | `admin.equipamentos.index.tsx` | ✅ | Onda 4 |
| 5 | `EquipamentoDetail` (implícito no mock) | `admin.equipamentos.$equipamentoId.tsx` | ✅ | Onda 2 |
| 6 | `NovoEquipamento.jsx` | diálogo em `equipamentos-page.tsx` (`FormDialog`) | 🔲 | Mesma situação de `NovoCliente` |
| 7 | `OperadoresList.jsx` | `admin.operadores.index.tsx` | ✅ | Onda 4 |
| 8 | `OperadorDetail.jsx` | `admin.operadores.$operadorId.tsx` | ✅ | Onda 1 |
| 9 | `NovoOperador.jsx` | diálogo em `operadores-page.tsx` (`FormDialog`) | 🔲 | Mesma situação |
| 10 | `PrecosList.jsx` | `admin.precos.tsx` | 🔧 | Sem onda — última mudança real foi a criação (2026-06-28) |
| 11 | `OSList.jsx` | `admin.ordens.index.tsx` | ✅ | Onda 5 |
| 12 | `OSDetail.jsx` | `admin.ordens.$ordemId.tsx` | ✅ | Onda 3 |
| 13 | `NovaOS.jsx` | `admin.ordens.nova.tsx` | ✅ | Onda 7 (esta sessão) — referência do padrão "página dedicada" |
| 14 | `Faturamento.jsx` | `admin.faturamento.index.tsx` + `$faturamentoId` | ✅ | Onda 5 (lista/página) + Onda 3 (detalhe) |
| 15 | `NovaNF.jsx` | — | ⚠️ | Fluxo manual de emissão de NF não existe — Faturamento é gerado automaticamente ao fechar a OS. Questão de produto, não de refatoração visual |
| 16 | `OrcamentosList.jsx` | `admin.orcamentos.index.tsx` | ✅ | Onda 5 |
| 17 | `OrcamentoDetail.jsx` | `admin.orcamentos.$orcamentoId.tsx` | ✅ | Onda 3 |
| 18 | `NovoOrcamento.jsx` | diálogo em `orcamentos-page.tsx` (`FormDialog`) | 🔲 | Mesma situação de `NovoCliente` |
| 19 | `Financeiro.jsx` | `admin.financeiro.index.tsx` | 🔧 | Sem onda — última mudança real 2026-06-30 |
| 20 | `NovoPagamento.jsx` | `nova-conta-pagar-dialog.tsx` (`FormDialog`) | 🔲 | Só contas a pagar são criadas manualmente; a receber nasce do faturamento (mesma lógica da linha 15) |
| 21 | `ComprovantesList.jsx` | `admin.comprovantes.index.tsx` + `$comprovanteId` | ✅ | Onda 5 (lista) + Onda 3 (detalhe) |
| 22 | `Manutencao.jsx` | `admin.manutencao.tsx` | 🔧 | Sem onda — última mudança real 2026-07-01 |
| 23 | `NovaManutencao.jsx` | `registrar-manutencao-dialog.tsx` (`FormDialog`) | 🔲 | Mesma situação de `NovoCliente` |
| 24 | `Diesel.jsx` | `admin.diesel.tsx` | 🔧 | Sem onda — última mudança real 2026-07-02 |
| 25 | `NovoAbastecimento.jsx` | `registrar-abastecimento-dialog.tsx` (`FormDialog`) | 🔲 | Mesma situação de `NovoCliente` |
| 26 | `CustoHora.jsx` | `admin.custo-hora.tsx` | 🔧 | Sem onda — última mudança real 2026-07-02 |
| 27 | `NovoCusto.jsx` | diálogo em `componente-custo-list.tsx` (`FormDialog`) | 🔲 | Mesma situação de `NovoCliente` |
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
| ✅ Refatorado (bate com o design system) | 16 / 34 |
| 🔧 Funcional, visual antigo | 8 / 34 |
| 🔲 Funcional, mas em diálogo genérico (mock pede página dedicada) | 8 / 34 |
| ⏳ Não existe | 2 / 34 |
| ⚠️ Divergência de fluxo (não é visual) | 1 / 34 |

## O que falta, em ordem sugerida

1. **🔲 Diálogos → páginas dedicadas** (8 telas: NovoCliente, NovoEquipamento, NovoOperador, NovoOrcamento, NovoPagamento, NovoCusto, NovoAbastecimento, NovaManutencao) — mesmo padrão da Nova OS. Candidato natural a virar a próxima onda, reaproveitando o padrão recém-validado (`ResumoNovaXxx` com `useWatch`, rota dedicada).
2. **🔧 Páginas de área ainda sem refatoração** (8 telas: Preços, Financeiro, Manutenção, Diesel, Custo da Hora, Rentabilidade, Painel Gerencial, Dashboard + Painel Operacional) — candidatas a agrupar em ondas por afinidade, ex.: "Preços + Financeiro" (Comercial), "Diesel + Manutenção" (Frota), "Custo/Rentabilidade/Gerencial/Dashboard" (Analítico).
3. **⏳ Parâmetros** — maior gap: não tem PRD nem rota. Precisa decisão de escopo antes de virar plano.
4. **⏳ Sobre** — institucional, baixo esforço.
5. **⚠️ Nova NF** — decisão de produto pendente com o Leonardo (emissão manual avulsa é necessária, ou o automático ao fechar OS já cobre?).

---

## Última Atualização

| Campo | Valor |
|-------|-------|
| **Data** | 2026-07-15 |
| **Gerado por** | Claude Code, a pedido do usuário |
| **Método** | Leitura dos 34 arquivos `.jsx` do UI kit + `find` em rotas reais + `git log` por arquivo/feature para achar a última mudança real (distinguindo refatoração de commits incidentais como lint/type-check) + leitura do `Goal` de cada plano em `docs/superpowers/plans/` para mapear onda → telas cobertas |
