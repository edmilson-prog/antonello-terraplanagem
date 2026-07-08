# PRD-019: Painel Operacional (Dashboard Secundário)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Adicionar uma segunda aba ao Dashboard (`/admin`) com uma visão "comando central": mapa real (Leaflet + OpenStreetMap) com posição dos equipamentos, cards de OS/horas/financeiro com mini-gráfico de tendência, contas a receber por cliente (vencida × a vencer) e manutenção preditiva com horas restantes |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Ambiente** | Retaguarda (`/admin`, aba "Operacional") — dado financeiro/estratégico, nunca exposto no app do operador |
| **PRDs Relacionados** | Consome: 002 (horas), 004 (faturamento), 007 (contas a receber), 010 (manutenção). Convive com o PRD-015 (aba "Visão geral", inalterada) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### PRD-015 × PRD-019 (fronteira)

| | PRD-015 — aba "Visão geral" (inalterada) | **PRD-019 — aba "Operacional" (nova)** |
|--|--|--|
| Formato | Cards de texto simples | Mapa real (Leaflet) + cards com mini-gráfico + tabela |
| Filtro de período | Sim (hoje/semana/mês, controla os widgets) | Não — janela fixa "últimos 7 dias" |
| Objetivo | Números certos, direto ao ponto | Visão visual "de relance" do canteiro |

---

## Contexto do Problema

O dashboard atual (`/admin`, PRD-015) resume OS, horas e financeiro em cards de texto, sem visualização gráfica nem noção espacial dos equipamentos. O Leonardo pediu uma segunda visão, inspirada numa referência visual, mais rica: mapa do canteiro com os equipamentos, mini-gráficos de tendência nos indicadores e um raio-x de contas a receber por cliente — **sem substituir** a visão atual.

## Conceito da Solução

### Situação Atual (As-Is)

`/admin` tem uma única visão: cards de texto (OS por status, horas, pipeline financeiro, alertas de manutenção, atalhos), sem gráficos e sem representação do canteiro.

### Situação Desejada (To-Be)

`/admin` ganha abas: **"Visão geral"** (conteúdo atual do PRD-015, sem alteração de comportamento) e **"Operacional"** (nova, este PRD). A aba Operacional traz:

1. Mapa real (Leaflet + tiles OpenStreetMap) com pins de equipamento — coordenadas fictícias, sem vínculo com endereço real da empresa (decisão do usuário: mudou de ilustração estilizada para mapa real), cor por status (`disponivel` / `em_uso` / `manutencao`).
2. Card de OS abertas (+ mini-gráfico de OS abertas por dia, últimos 7 dias) e card de horas apontadas (+ sparkline, últimos 7 dias).
3. Cards financeiros executado / faturado / recebido, cada um com sparkline de 7 dias.
4. Gráfico de contas a receber por cliente, barras empilhadas vencida × a vencer.
5. Tabela de manutenção preditiva: equipamento, plano, horas restantes (derivado do horímetro), status.
6. Atalhos rápidos: Nova O.S., Novo cliente, Gerar relatório de rentabilidade.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|-------------------------|
| Substituir o dashboard atual pelo novo | O usuário pediu explicitamente para manter a visão atual |
| Ilustração estilizada (SVG/CSS, sem lib) | Primeira versão implementada; o usuário decidiu trocar por mapa real (Leaflet) depois de ver o resultado inicial |
| Nova rota/item de sidebar separado | Usuário preferiu manter as duas visões juntas, via abas — reaproveita o padrão já usado em Financeiro (Receber/Pagar/Caixa) |
| Countdown "5 dias, 12h" (como na referência) | Não existe granularidade de tempo/data para manutenção — só horímetro (RF-004 do PRD-010). Fabricar dias/horas seria inventar dado. Mantido honesto: horas restantes de horímetro |

---

## Escopo

### Incluído

- ✅ Abas "Visão geral" / "Operacional" em `/admin`; Visão geral com comportamento idêntico ao atual
- ✅ Mapa real (Leaflet + OpenStreetMap) com pins de equipamento (coordenadas fictícias, cor por status operacional), carregado só no cliente (import dinâmico) para não quebrar o SSR
- ✅ Card de OS abertas com mini-gráfico de abertura por dia (7 dias) + contagem de "em andamento"
- ✅ Card de horas apontadas com sparkline (7 dias)
- ✅ Cards executado / faturado / recebido, cada um com sparkline (7 dias) — reaproveitando `pipelineFinanceiroPeriodo` (PRD-015) sem recalcular
- ✅ Gráfico de contas a receber por cliente, empilhado vencida × a vencer — reaproveitando `contaVencida` (PRD-007)
- ✅ Tabela de manutenção preditiva reaproveitando `alertasManutencao` (PRD-010), com horas restantes calculadas (`horimetro_previsto - horimetro_atual`)
- ✅ Atalhos rápidos: Nova O.S. (`/admin/ordens`), Novo cliente (`/admin/clientes`), Gerar relatório de rentabilidade (`/admin/rentabilidade`)
- ✅ Badge de variação % (vs mês anterior) nos 3 cards financeiros — dado real, via `variacaoPercentual` (PRD-016) sobre `pipelineFinanceiroPeriodo` do mês corrente e do mês anterior
- ✅ Traçado decorativo (mais "movimento") nas mini-tendências (sparklines dos cards financeiros/horas e barras de OS abertas) — **pedido explícito do usuário**, para aproximar visualmente de uma referência mais rica; ver RF-006

### Excluído

- ❌ GPS real / rastreamento ao vivo de equipamento (o mapa é real — tiles OpenStreetMap — mas as coordenadas dos pins são fictícias)
- ❌ Countdown por data/hora de relógio na manutenção (fica horas de horímetro, dado real)
- ❌ Qualquer alteração de comportamento na aba "Visão geral" existente
- ❌ Filtro de período ou de equipamento/cliente na aba Operacional (fica para eventual PRD futuro, se necessário)
- ❌ Regras de cálculo novas de custo/margem/faturamento — tudo é reagrupamento de derivações já existentes (002/004/007/010/015)

---

## Regras de Negócio

- **RF-001 (barreira financeira):** a aba Operacional e tudo em `src/features/dashboard-operacional/` só é renderizado em `/admin/*`. Nada em `src/features/operador/` ou em rotas `/app/*` importa deste módulo.
- **RF-002 (sem cálculo novo):** todo valor exibido é derivado de funções puras já existentes (`pipelineFinanceiroPeriodo`, `contaVencida`, `alertasManutencao`, `contagemOSPorStatus`, `horasApontadasNoPeriodo`) ou de novas funções puras que apenas rebalizam (bucketizam por dia) essas mesmas fontes — nunca recalculam custo, margem ou faturamento por conta própria.
- **RF-003 (posição ilustrativa):** as coordenadas dos pins no mapa são fictícias, sem vínculo com endereço real da empresa, documentado como tal no código — nunca usado para decisão de negócio, roteamento ou geofencing.
- **RF-005 (mapa client-only):** o componente Leaflet (`mapa-canteiro-leaflet.tsx`) é carregado via import dinâmico e só renderizado após a montagem no cliente — a lib acessa `window`/`navigator` na importação e quebraria o SSR (TanStack Start) se fosse importada estaticamente.
- **RF-004 (referência temporal):** como a fase é "Frontend First" e os mocks têm uma data-horizonte fixa (não acompanham o relógio real), as janelas de "últimos 7 dias" são ancoradas na data mais recente presente nos mocks (`dataReferenciaOperacional`), não em `new Date()` do sistema — evita gráficos vazios quando o relógio real está à frente do horizonte dos dados mockados.
- **RF-006 (traçado decorativo isolado):** a "ondulação" visual das mini-tendências (`serieDecorativa`) é gerada por uma função pura e determinística (sem `Math.random`), separada da série real — nunca altera os números grandes exibidos nos cards (KPI, R$, badge de variação), e os gráficos que a usam ocultam o tooltip (`mostrarTooltip={false}`) para não exibir um valor exato "fabricado" como se fosse real. Aplicado apenas às mini-tendências (OS abertas, horas, executado/faturado/recebido) — a tabela de manutenção e o gráfico de contas a receber por cliente permanecem 100% reais, por serem dados usados para decisão.

## Critérios de Aceite

- [x] `/admin` mostra as duas abas; "Visão geral" com comportamento e visual idênticos ao PRD-015 (nenhuma regressão)
- [x] Aba "Operacional" renderiza sem erros com os 8 equipamentos mockados; cada widget trata loading/error/empty de forma isolada (RNF-002 — falha em um widget não derruba os demais)
- [x] Nenhum dado financeiro ou de custo é recalculado fora das funções já existentes — apenas reagrupamento/derivação pura, coberta por teste
- [x] `npx tsc --noEmit`, `npx vitest run` e `npm run build` limpos
- [x] `grep` confirma que nada em `/app/*` ou `src/features/operador/` importa de `@/features/dashboard-operacional`

## Observações

Verificação foi feita via `tsc`/`vitest`/`build` + grep da barreira financeira. A checagem visual em navegador (mapa ilustrativo, sparklines, responsividade) fica a critério do usuário, que optou por validar pessoalmente esta rodada.

## Status

✅ IMPLEMENTADO — v0.18.0 "Beacon" (2026-07-07).
