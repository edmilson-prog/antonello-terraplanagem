# PRD-015: Home Screens — Dashboard (Retaguarda) + Início (Operador)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Substituir os placeholders de `/admin` e `/app` por telas iniciais que agregam os dados das features já implementadas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Ambiente** | Transversal (`all`) — `/admin` (dashboard) e `/app` (início) |
| **Épico** | Pós-roadmap — extensão da Fase 2 |
| **PRDs Relacionados** | Consome: 002 (horas), 003 (OS), 004 (faturamento), 007 (contas), 010 (manutenção), 012 (diesel). Considerar o **patch Retrofit** aplicado |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase; **agrega** dados de features existentes, sem regra de negócio nova nem contrato persistido novo |

---

## Contexto do Problema

Todas as features do roadmap (000–014) estão implementadas, mas as duas **portas de entrada** — `/admin` (dashboard) e `/app` (início) — seguem como placeholders do scaffold. É a primeira tela que o Leonardo e os operadores veem; hoje ela não mostra nada.

Este PRD entrega as duas home screens como **agregadoras**: nenhum dado novo, nenhuma regra nova — apenas ler dos services existentes e apresentar o essencial de cada perfil.

---

## Conceito da Solução

### Situação Atual (As-Is)

`/admin` e `/app` exibem empty state "Em construção".

### Situação Desejada (To-Be)

- **Dashboard (retaguarda):** visão executiva do dia/período — OS por status, horas apontadas, pipeline financeiro (executado→faturado→recebido), contas a vencer/vencidas, alertas de manutenção, atalhos rápidos.
- **Início (operador):** foco na ação — apontamento em andamento (retomar/finalizar), CTA iniciar, minhas OS ativas, badge de manutenção do equipamento, indicador `pendente_sync`, ação secundária de abastecimento (PRD-012). **Sem qualquer valor financeiro.**

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Dashboard configurável (widgets arrastáveis) | Complexidade desnecessária agora; layout fixo resolve |
| Redirecionar `/admin` direto para `/admin/ordens` | Perde a visão consolidada — justamente o valor pro dono |
| Mesma home para os dois perfis | Necessidades opostas (executivo × ação de campo) + barreira financeira |

---

## Escopo

### Incluído

- ✅ Dashboard em `/admin` com widgets: OS por status, horas do período, pipeline financeiro, contas (vencidas destacadas), alertas de manutenção, atalhos (nova OS, novo orçamento)
- ✅ Início em `/app` com: apontamento em andamento, CTA iniciar, minhas OS, badge manutenção (sem custo), `pendente_sync`, atalho de abastecimento
- ✅ Filtro de período simples no dashboard (hoje / semana / mês)
- ✅ Estados de tela em todos os widgets

### Excluído

- ❌ Novos contratos persistidos, gráficos avançados ou drill-down além de navegar para a feature
- ❌ Dashboard configurável; notificações push
- ❌ Qualquer valor financeiro em `/app`

---

## Requisitos Funcionais

### Dashboard — Retaguarda

- **RF-001 (Must):** Exibir contadores de OS por status (aberta / em andamento / fechada no período), navegando para `/admin/ordens` filtrado.
- **RF-002 (Must):** Exibir total de horas apontadas no período (PRD-002).
- **RF-003 (Must):** Exibir o pipeline financeiro do período: executado → faturado → recebido (PRD-004/007), em R$.
- **RF-004 (Must):** Exibir contas a vencer e **vencidas** (destacadas) (PRD-007).
- **RF-005 (Should):** Exibir alertas de manutenção próxima/vencida (PRD-010).
- **RF-006 (Should):** Atalhos rápidos: nova OS, novo orçamento.
- **RF-007 (Should):** Filtro de período (hoje / semana / mês) aplicado aos widgets.

### Início — Operador

- **RF-008 (Must):** Se houver apontamento **em andamento**, exibi-lo em destaque com ação de retomar/finalizar; senão, CTA "Iniciar apontamento".
- **RF-009 (Must):** Listar as OS ativas do operador com acesso ao detalhe.
- **RF-010 (Should):** Exibir badge de manutenção próxima/vencida do(s) equipamento(s) usados pelo operador — **sem custo**.
- **RF-011 (Should):** Exibir indicador de itens `pendente_sync`.
- **RF-012 (Should):** Ação secundária "Registrar abastecimento" (PRD-012, conforme patch Retrofit).

### Transversais

- **RF-013 (Must):** Nenhum valor financeiro é exibido ou carregado em `/app`. Widgets financeiros vivem só no dashboard.
- **RF-014 (Must):** Cada widget navega para a feature de origem (dashboard = hub, não destino final).

---

## Requisitos Não-Funcionais

- **RNF-001:** Dashboard renderiza em < 2s; widgets carregam de forma independente (falha em um não derruba os demais).
- **RNF-002:** Início do operador mobile-first, alto contraste, toque ≥ 44px.
- **RNF-003:** Nenhum módulo financeiro importado em `/app` (barreira verificável).
- **RNF-004:** shadcn/ui + tokens do design system; responsivo (375/768/1280px).

---

## Contrato de Dados

Sem contrato persistido novo. Os agregados são **derivados** dos services existentes:

```typescript
// Shape ilustrativo — calculado em memória, não persistido
interface IDashboardResumo {
  periodo: 'hoje' | 'semana' | 'mes'
  os_abertas: number
  os_em_andamento: number
  os_fechadas_periodo: number
  horas_apontadas: number
  pipeline: { executado: number; faturado: number; recebido: number }  // R$ — retaguarda-only
  contas_a_vencer: number
  contas_vencidas: number
  alertas_manutencao: number
}
```

> Regra: **derivar via services existentes** (osService, apontamentoService, faturamentoService, financeiroService, manutencaoService). Não duplicar queries nem lógica de cálculo.

---

## Critérios de Aceitação

### RF-003: Pipeline no dashboard

```gherkin
DADO faturamentos e contas existentes no período
QUANDO o proprietário abre /admin
ENTÃO vê executado, faturado e recebido em R$
  E clicar no widget navega para a feature de origem
```

### RF-008: Início do operador

```gherkin
DADO um operador com apontamento em andamento
QUANDO abre /app
ENTÃO o apontamento aparece em destaque com ação de retomar/finalizar

DADO um operador sem apontamento em andamento
QUANDO abre /app
ENTÃO vê o CTA "Iniciar apontamento"
```

### RF-013: Barreira financeira

```gherkin
DADO o ambiente do operador (/app)
QUANDO a tela de início é renderizada
ENTÃO nenhum valor em R$ é exibido ou carregado
```

### Edge

```gherkin
DADO um sistema sem dados no período
QUANDO o dashboard é aberto
ENTÃO cada widget exibe seu empty state, sem quebrar o layout

DADO falha ao carregar um widget
QUANDO o dashboard é aberto
ENTÃO o widget exibe erro com retry e os demais carregam normalmente
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Cada widget (dashboard) | skeleton individual | mensagem própria | erro + retry **no widget** | dado + navegação |
| Início operador | skeleton | CTA "Iniciar apontamento" | mensagem + retry | apontamento/OS/badges |

---

## Dados

Reutilizar integralmente os dados/services das features implementadas (mocks ou reais, conforme a fase). **Não criar mocks novos** — se faltar cenário (ex.: conta vencida), enriquecer o mock existente da feature de origem.

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Agregadores derivados (funções que consomem os services existentes) | ~2 |
| 2 | Dashboard `/admin`: widgets + navegação + filtro de período | ~6-8 |
| 3 | Início `/app`: apontamento em destaque, OS, badges, atalho abastecimento | ~4-5 |
| 4 | Estados de tela por widget + responsividade + verificação da barreira financeira | ~2 |

---

## Dependências

| PRD | Descrição | Status |
|-----|-----------|--------|
| 002, 003, 004, 007, 010, 012 | Features de origem dos dados | ✅ Implementados |
| Patch **Retrofit** | Deltas de contrato (modalidade, metragem, atalho diesel) | ⏳ Aplicar antes ou junto |

### Perguntas em Aberto

- [ ] Quais KPIs o **Leonardo** quer ver primeiro no dashboard? (validar a seleção de widgets)
- [ ] Período padrão do dashboard: hoje ou semana?
- [ ] Fase atual do projeto (mock × backend real) — confirma qual fonte os services usam. **Confirmar antes de implementar.**

---

## Cadeia de PRDs

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | 000–014 | Roadmap completo | ✅ Implementados | Fontes de dados |
| **1** | **PRD-015** | **Home Screens** | **🔄 ATUAL** | Agrega as features |
| 2 | PRD-016 | Auth + perfis + RLS | ⏳ Planejado | — |

---

## Considerações de Segurança

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Pipeline, contas, valores (R$) | Financeiro sensível | Widgets exclusivos do dashboard; nunca importados em `/app` |
| Badges de manutenção / horas | Operacional | Ambos os ambientes (sem custo no operador) |

Autorização real (RLS) é o PRD-016; nesta entrega a separação é por ambiente/rota.

---

## Fluxos de Usuário

```
[Proprietário] ─▶ /admin ─▶ lê o dia num relance ─▶ clica num widget ─▶ feature de origem
[Operador]     ─▶ /app   ─▶ retoma/inicia apontamento ─▶ segue o trabalho
```

Exceções: widget sem dados → empty próprio; falha em um widget → erro isolado com retry.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md` do repositório.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.** Em especial: confirme a **fase atual** (mock × backend real) e se o patch **Retrofit** já foi aplicado.

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

**Codinomes:** MINOR — sugestão: **"Cockpit"**.

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Falha em um widget não derruba o dashboard |
| **Fail gracefully** | Erro isolado por widget, com retry |
| **Derivar, não duplicar** | Agregados leem dos services existentes |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Reuso** | Consumir os services das features; zero lógica de negócio nova |
| **Barreira financeira** | Widgets financeiros em `src/features/dashboard/`; nada disso em `/app` |
| **Carregamento independente** | Cada widget com seu loading/error/empty |
| **Retrofit** | Considerar os deltas do patch (modalidade, metragem derivada, atalho diesel) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Duplicar queries/cálculos das features |
| Exibir/importar valores financeiros em `/app` |
| Criar contratos persistidos novos |
| Widget que quebra o dashboard inteiro ao falhar |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-07-02 |
| **Versão do App** | 0.12.0 "Cockpit" |
| **Implementado por** | Claude Code via Subagent-Driven Development (5 tasks + revisão final) |
| **Observações** | Revisão final: 0 Critical, 0 Important, 4 Minor (cosméticos — Error Boundary por widget, estado de erro inalcançável na fase mock, filtro de período não afeta Contas/Alertas por decisão de domínio, área de toque do link "Ver todas" — corrigida). |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |
| 2026-07-02 | v2 | ✅ Implementado (v0.12.0 "Cockpit") |

---

**AILA - Sistemas Inteligentes**
