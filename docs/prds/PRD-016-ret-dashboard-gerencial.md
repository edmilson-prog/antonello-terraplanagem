# PRD-016: Dashboard Gerencial (Analítico)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar o painel gerencial com gráficos e comparativos — evolução de faturamento, receita × custo × margem, horas e utilização por equipamento, rankings — para decisão do proprietário |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Ambiente** | Retaguarda (`/admin/gerencial`) — **dado financeiro/estratégico** |
| **Épico** | Pós-roadmap — extensão analítica |
| **PRDs Relacionados** | Consome: 002 (horas), 004 (faturamento), 007 (recebido), 012 (diesel/utilização), 013 (custo), 014 (rentabilidade). Complementa o **PRD-015** (operacional). Considerar o **patch Retrofit** |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Agrega dados de features existentes em visualizações; sem regra de negócio nova nem contrato persistido novo |

### PRD-015 × PRD-016 (fronteira)

| | PRD-015 (Dashboard operacional) | **PRD-016 (Painel gerencial)** |
|--|--|--|
| Pergunta | "O que está acontecendo agora?" | "Como o negócio está indo?" |
| Horizonte | Hoje / semana | Meses, tendências, comparativos |
| Natureza | Contadores + navegação + ação | Gráficos + rankings + análise |
| Perfis | Ambos (com barreira) | **Só retaguarda** (proprietário) |

---

## Contexto do Problema

Os painéis analíticos existem espalhados por feature (diesel 012, custo 013, rentabilidade 014), e o dashboard operacional (015) mostra o dia. Falta a **visão executiva consolidada**: o Leonardo abrir uma tela e ver a evolução do faturamento, a margem ao longo dos meses, qual máquina rende e qual obra deu prejuízo — sem navegar por cinco telas.

Este PRD entrega esse painel. É a materialização visual do valor central do projeto: sair do "quanto trabalhei" para o **"quanto lucrei, e por quê"**.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe rota gerencial. Os dados analíticos vivem separados em `/admin/diesel`, `/admin/custo-hora` e `/admin/rentabilidade`.

### Situação Desejada (To-Be)

Rota `/admin/gerencial` (item "Painel Gerencial" no grupo **Financeiro** da sidebar) com gráficos e rankings derivados dos services existentes, filtros de período e comparativo com o período anterior. Cada visualização navega para o painel de origem para o drill-down.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Ampliar o PRD-015 com gráficos | Mistura operacional (ambos os perfis) com estratégico (só dono); horizontes e públicos diferentes |
| BI externo (Metabase/Looker) | Custo/complexidade desnecessários; os dados e cálculos já existem no app |
| Relatório PDF mensal | Perde interatividade e visão contínua |

---

## Escopo

### Incluído

- ✅ **Evolução do faturamento** por mês (últimos 6–12 meses) — gráfico de barras/linha (004)
- ✅ **Receita × Custo × Margem** por período — evolução (004 + 013 + 014)
- ✅ **Horas por equipamento** no período — barras comparativas (002)
- ✅ **Utilização e consumo (l/h)** por equipamento (012)
- ✅ **Rankings**: equipamentos e obras por margem, com prejuízo destacado (014)
- ✅ **Pipeline consolidado** do período: executado → faturado → recebido (004/007)
- ✅ Filtros: período (mês / trimestre / ano / personalizado), equipamento, cliente
- ✅ Comparativo com o **período anterior** (variação %)
- ✅ Drill-down: cada gráfico navega para o painel de origem

### Excluído

- ❌ Regras/cálculos novos (tudo derivado de 004/007/012/013/014)
- ❌ Projeções/forecast, metas configuráveis — escopo futuro
- ❌ Exportação PDF/Excel — escopo futuro
- ❌ Qualquer acesso pelo app do operador

---

## Requisitos Funcionais

### Visualizações

- **RF-001 (Must):** Gráfico de evolução do faturamento por mês (004), respeitando o filtro de período.
- **RF-002 (Must):** Gráfico receita × custo × margem por período (004/013/014).
- **RF-003 (Must):** Barras comparativas de horas trabalhadas por equipamento (002).
- **RF-004 (Should):** Utilização e consumo médio (l/h) por equipamento (012).
- **RF-005 (Must):** Rankings de margem — equipamentos e obras — com **prejuízo destacado** (014).
- **RF-006 (Should):** Pipeline consolidado do período: executado → faturado → recebido (004/007).

### Filtros e Comparativos

- **RF-007 (Must):** Filtro de período (mês / trimestre / ano / personalizado) aplicado a todas as visualizações.
- **RF-008 (Should):** Filtros por equipamento e por cliente.
- **RF-009 (Should):** Variação % vs período anterior nos números-chave.

### Navegação e Acesso

- **RF-010 (Must):** Cada visualização navega para o painel de origem (012/013/014/004) para detalhamento.
- **RF-011 (Must):** Rota `/admin/gerencial`, item no grupo **Financeiro** da sidebar. **Nunca** acessível ou carregado em `/app/*`.
- **RF-012 (Should):** Itens com custo incompleto (013) sinalizados como "margem não confiável" — nunca ocultar prejuízo.

---

## Requisitos Não-Funcionais

- **RNF-001:** Gráficos respeitam os tokens do design system e o tema light/dark.
- **RNF-002:** Visualizações carregam de forma independente (falha isolada por gráfico).
- **RNF-003:** Painel renderiza em < 2s com 12 meses de dados.
- **RNF-004:** Responsivo (gráficos legíveis em 768px+; em 375px, empilhados).
- **RNF-005:** Nenhum módulo deste painel importado em `/app/*` (barreira verificável).

---

## Contrato de Dados

Sem contrato persistido novo. Séries **derivadas** dos services existentes:

```typescript
// Shape ilustrativo — calculado em memória, não persistido
interface ISerieMensal {
  mes: string                 // "2026-06"
  receita: number             // faturado (004)
  recebido: number            // (007)
  custo: number               // (013)
  margem: number              // receita - custo
}

interface IComparativoEquipamento {
  equipamento_id: string
  horas: number               // (002)
  utilizacao_percent: number  // (012)
  consumo_l_h: number         // (012)
  margem: number              // (014)
}
```

> Regra: **derivar via services existentes** (faturamentoService, financeiroService, custoService, rentabilidadeService, dieselService, apontamentoService). Não duplicar cálculo — em especial os de custo/margem (013/014), que são a fonte da verdade.

---

## Critérios de Aceitação

### RF-001 / RF-007: Evolução com filtro

```gherkin
DADO faturamentos distribuídos em 6 meses
QUANDO o proprietário abre /admin/gerencial com período "ano"
ENTÃO o gráfico exibe a evolução mensal do faturamento
  E ao mudar o período, todas as visualizações atualizam
```

### RF-005: Ranking com prejuízo

```gherkin
DADO uma obra com margem negativa (014)
QUANDO o ranking de obras é exibido
ENTÃO a obra aparece destacada como prejuízo
  E clicar nela navega para o painel de rentabilidade
```

### RF-009: Comparativo

```gherkin
DADO dados no período atual e no anterior
QUANDO os números-chave são exibidos
ENTÃO cada um mostra a variação % vs o período anterior
```

### RF-011: Barreira financeira

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum dado ou módulo do painel gerencial é carregado
```

### Edge

```gherkin
DADO um período sem dados
QUANDO o painel é aberto
ENTÃO cada visualização exibe seu empty state, sem quebrar o layout

DADO equipamento com custo incompleto (013)
QUANDO aparece em gráfico/ranking
ENTÃO é sinalizado como "margem não confiável"
```

---

## Estados de Tela

| Componente | Loading | Empty | Error | Success |
|------------|---------|-------|-------|---------|
| Cada gráfico/ranking | skeleton individual | mensagem própria | erro + retry **no componente** | visualização + drill-down |
| Números-chave | skeleton | "—" | erro isolado | valor + variação % |

---

## Dados

Reutilizar os dados/services das features implementadas (mocks ou reais, conforme a fase). **Não criar mocks novos** — se faltar volume histórico para os gráficos (ex.: 6 meses de faturamento), enriquecer os mocks das features de origem (004/007), mantendo coerência com apontamentos e custos.

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Agregadores de séries (funções derivando dos services; períodos e comparativo) | ~2-3 |
| 2 | Visualizações: evolução, receita×custo×margem, horas, utilização | ~5-6 |
| 3 | Rankings + pipeline consolidado + filtros (período/equipamento/cliente) | ~4 |
| 4 | Estados por componente + drill-down + responsividade + barreira financeira | ~2 |

---

## Dependências

| PRD | Descrição | Status |
|-----|-----------|--------|
| 002, 004, 007, 012, 013, 014 | Fontes de dados e cálculos | ✅ Implementados |
| Patch **Retrofit** | Deltas de contrato (modalidade, metragem) | ⏳ Aplicar antes |
| PRD-015 | Independente (complementar); atalho mútuo é desejável | ⏳ Pendente |

### Perguntas em Aberto

- [ ] Quais **KPIs** o Leonardo prioriza no gerencial? (validar a seleção antes de refinar)
- [ ] Regime do painel: **competência** (faturado) ou **caixa** (recebido)? — mesma decisão aberta do PRD-014; exibir ambos até definir?
- [ ] Existe **meta mensal** de faturamento a exibir? (se sim, vira linha de referência no gráfico)
- [ ] Período padrão ao abrir: mês atual ou últimos 12 meses?

---

## Cadeia de PRDs

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | 000–014 | Roadmap completo | ✅ Implementados | Fontes |
| 1 | PRD-015 | Home Screens (operacional) | ⏳ Pendente | Complementar |
| **2** | **PRD-016** | **Dashboard Gerencial** | **🔄 ATUAL** | Consome 004/007/012/013/014 |
| 3 | PRD-017 | Auth + perfis + RLS | ⏳ Planejado | — |

---

## Considerações de Segurança

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Séries de receita/custo/margem, rankings | **Financeiro estratégico (o mais sensível)** | Retaguarda-only; no backend, RLS restrito a `proprietário/admin` (PRD-017) |

Nesta entrega a separação é por ambiente/rota; RLS formal é o PRD-017.

---

## Fluxos de Usuário

```
[Proprietário] ─▶ /admin/gerencial ─▶ escolhe período ─▶ lê evolução, margem e rankings
─▶ identifica prejuízo/queda ─▶ drill-down no painel de origem (014/013/012)
```

Exceções: período sem dados → empty por componente; custo incompleto → "margem não confiável".

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md` do repositório.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.** Em especial: confirme a **fase atual** (mock × backend real), se o patch **Retrofit** foi aplicado e o **regime** (competência × caixa).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o `CHANGELOG.md` seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar o `INDEX-PRDs-antonello.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** MINOR — sugestão: **"Radar"**.

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Falha em um gráfico não derruba o painel |
| **Fail gracefully** | Erro isolado por componente, com retry |
| **Derivar, não duplicar** | Custo/margem vêm de 013/014 — fonte única da verdade |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Biblioteca de gráficos** | Sugestão: recharts (integra bem com shadcn/Tailwind e tokens); se outra já estiver no projeto, manter a existente |
| **Séries isoladas** | Agregadores de série em utilitário testável, separados dos componentes visuais |
| **Barreira financeira** | `src/features/gerencial/` nunca importado em `/app/*` |
| **Transparência** | Nunca ocultar prejuízo; sinalizar margem não confiável (custo incompleto) |
| **Drill-down** | Gráficos são porta de entrada — o detalhe vive nos painéis de origem |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Recalcular custo/margem aqui (derivar de 013/014) |
| Exibir/importar qualquer dado deste painel em `/app/*` |
| Criar contratos persistidos para as séries |
| Gráfico que quebra o painel inteiro ao falhar |
| Ocultar ou suavizar margens negativas |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
