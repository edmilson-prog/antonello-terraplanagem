# PRD-014: Rentabilidade por Equipamento e por Obra

> **⚠️ Camada analítica (Fase 4 / dependente de dados reais).** É o topo da pirâmide: cruza receita faturada (PRD-004) com custo (PRD-013). Só é confiável com todo o pipeline e os custos reais alimentados.

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) que mostra a rentabilidade (receita − custo) por equipamento e por obra — o painel de decisão do dono |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Baixa |
| **Ambiente** | Retaguarda (`/admin/*`) — **dado financeiro/estratégico** |
| **Épico** | Onda 3 — Acabamento |
| **PRDs Relacionados** | PRD-013 (custo), PRD-004 (faturamento/receita), PRD-003 (OS/obra), PRD-001 (equipamentos) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, cruza receita e custo em dois recortes (equipamento e obra), com ranking e período |

---

## Contexto do Problema

Este é o **destino de todo o projeto**. Tudo o que foi construído — apontar horas, faturar, calcular custo — existe para responder duas perguntas que hoje o Leonardo não consegue responder com números: **"qual máquina me dá lucro?"** e **"aquela obra foi rentável?"**.

Rentabilidade = **receita − custo**. A receita vem do faturamento (PRD-004); o custo, do custo da hora-máquina (PRD-013). Este PRD entrega os dois recortes — **por equipamento** e **por obra (OS)** — com margem em R$ e %, ranking e filtro por período. É o painel que transforma o sistema de "controle operacional" em "ferramenta de decisão".

Por ser o dado mais estratégico, vive **só na retaguarda**.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Será adicionada a rota `/admin/rentabilidade`.

### Situação Desejada (To-Be)

A retaguarda vê um painel com a rentabilidade **por equipamento** (receita gerada pelas horas daquela máquina − custo dela) e **por obra/OS** (faturado da obra − custo dos equipamentos naquela obra), com margem, percentual, ranking e filtro por período. Permite ver, por exemplo, que a escavadeira de 5t dá mais margem que a de 18t, ou que determinada obra deu prejuízo.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Só faturamento (receita) | Receita sem custo não é lucro; pode faturar muito e lucrar pouco |
| Rentabilidade só da empresa (agregada) | Não aponta qual máquina/obra puxa o resultado; perde o poder de decisão |
| Relatório manual periódico | Perde a visão contínua e o cruzamento automático |

---

## Escopo

### Incluído

- ✅ Rentabilidade **por equipamento**: receita gerada − custo (PRD-013), com margem (R$ e %)
- ✅ Rentabilidade **por obra/OS**: faturado (PRD-004) − custo dos equipamentos na obra, com margem
- ✅ **Ranking** (equipamentos e obras por margem)
- ✅ Filtro por **período**
- ✅ Visão de **detalhe** (o que compõe receita e custo daquele item)
- ✅ `types` (contrato): `IRentabilidadeEquipamento`, `IRentabilidadeObra` (derivados)
- ✅ Mocks, estados de tela; **retaguarda apenas**

### Excluído

- ❌ Projeções/forecast — escopo futuro
- ❌ Contabilidade formal / DRE fiscal — escopo futuro
- ❌ Backend real (Supabase)
- ❌ Qualquer exibição no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Por Equipamento

- **RF-001 (Must):** Calcular a rentabilidade por equipamento no período: **receita gerada** (faturamento atribuível às horas do equipamento) − **custo** (custo/hora × horas, PRD-013).
- **RF-002 (Must):** Exibir margem em **R$ e %** por equipamento.
- **RF-003 (Should):** **Ranking** de equipamentos por margem.

### Por Obra/OS

- **RF-004 (Must):** Calcular a rentabilidade por obra/OS: **faturado** da OS (PRD-004) − **custo** dos equipamentos naquela OS.
- **RF-005 (Must):** Exibir margem em **R$ e %** por obra.
- **RF-006 (Should):** **Ranking** de obras por margem (destacar prejuízo).

### Visão e Filtro

- **RF-007 (Must):** Filtrar por **período**.
- **RF-008 (Should):** **Detalhar** um item (composição de receita e custo).

### Transversais

- **RF-009 (Must):** Tudo vive na retaguarda (`/admin/rentabilidade`). **Nunca** acessível ou carregado em `/app/*`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** Atribuição correta de receita e custo aos recortes; margens coerentes.
- **RNF-002 (Segurança de exibição):** Nada de rentabilidade é carregado no ambiente do operador.
- **RNF-003 (Clareza executiva):** Painel legível para decisão (números-chave + gráfico); apto a ser apresentado.
- **RNF-004 (Responsividade):** Desktop (analítico/executivo).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Resultados **derivados** (não persistidos). Trecho ilustrativo:

```typescript
interface IRentabilidadeEquipamento {
  equipamento_id: string
  periodo: string                 // ex: "2026-06"
  horas_trabalhadas: number
  receita: number                 // faturamento atribuível às horas (PRD-004)
  custo: number                   // custo/hora × horas (PRD-013)
  margem: number                  // receita - custo
  margem_percentual: number       // margem / receita
}

interface IRentabilidadeObra {
  os_id: string
  os_numero: string
  cliente_id: string
  receita: number                 // faturado da OS (PRD-004)
  custo: number                   // soma do custo dos equipamentos na OS (PRD-013)
  margem: number
  margem_percentual: number
}
```

> Ambos são **calculados** cruzando faturamento (PRD-004) e custo (PRD-013); não são persistidos.

---

## Critérios de Aceitação

### RF-001 / RF-002: Rentabilidade por equipamento

```gherkin
DADO a receita atribuível a uma escavadeira e seu custo no período (PRD-013)
QUANDO a rentabilidade é calculada
ENTÃO o painel exibe receita, custo e margem (R$ e %) do equipamento
```

### RF-004 / RF-006: Rentabilidade por obra (prejuízo)

```gherkin
DADO uma obra cujo custo dos equipamentos superou o faturado
QUANDO a rentabilidade da obra é exibida
ENTÃO a margem aparece negativa
  E a obra é destacada como prejuízo no ranking
```

### RF-009: Barreira financeira

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum dado de rentabilidade é exibido ou carregado
```

### Cenários de Erro / Edge

```gherkin
DADO um equipamento com receita mas sem custo configurado (PRD-013 incompleto)
QUANDO a rentabilidade seria exibida
ENTÃO o item é sinalizado como "custo incompleto" (margem não confiável)

DADO um período sem faturamento
QUANDO o painel é aberto
ENTÃO é exibido empty state explicativo
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Rentabilidade por Equipamento | skeleton | "Sem dados no período" | mensagem + retry | tabela/cards + ranking + gráfico |
| Rentabilidade por Obra | skeleton | "Sem obras no período" | mensagem + retry | tabela/cards + ranking (prejuízo destacado) |
| Detalhe do item | skeleton | — | mensagem + retry | composição de receita e custo |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/rentabilidade.ts` | ~6 equipamentos e ~5 obras com receita/custo/margem | 1 obra com **prejuízo** (margem negativa), 1 item com "custo incompleto", margens variadas |

> Derivar de `faturamentos.ts` (PRD-004) e do custo (PRD-013, que por sua vez usa PRD-012/010/002). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (rentabilidade eq./obra) + mocks | ~2 |
| 2 | UI: painéis por equipamento e por obra, com ranking | ~7-9 |
| 3 | Estados de tela + cálculo (atribuição receita/custo, margem) + filtro por período | ~4 |
| 4 | Fluxo completo em memória + detalhe + gráficos + responsividade + barreira financeira | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
- [ ] Definir `IRentabilidadeEquipamento`, `IRentabilidadeObra`
- [ ] Criar `src/mocks/rentabilidade.ts` (incluir prejuízo e custo incompleto)
**Validação:** Mocks compilam; recortes coerentes com faturamento/custo.

#### Fase 2: UI com Mocks
- [ ] Painéis por equipamento e por obra + ranking em `/admin/rentabilidade`
**Validação:** Navegação; margens e ranking exibidos.

#### Fase 3: Cálculo + Filtro
- [ ] Atribuição de receita/custo; margem (R$ e %); filtro por período; estados de tela
**Validação:** Cálculo correto; prejuízo e "custo incompleto" sinalizados.

#### Fase 4: Fluxo + Barreira
- [ ] Detalhe da composição; gráficos; responsividade
- [ ] Garantir que nada de rentabilidade é carregado em `/app/*`
**Validação:** Painel completo, apto a apresentar; barreira intacta.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-013 | Custo real da hora-máquina | ✅ Implementado |
| PRD-004 | Faturamento (receita) | ✅ Implementado |
| PRD-003 | Ordem de Serviço (obra) | ✅ Implementado |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | — |

### Decisões Pendentes

- [x] Como **atribuir receita** a um equipamento quando a OS tem vários (proporcional às horas? aos itens do faturamento)? → **Resolvido:** via `FaturamentoItem.origem_id` (atribuição exata já existente, sem rateio). Ver "Observações" em Status de Implementação.
- [x] O custo de **mobilização** entra na rentabilidade da obra? → **Resolvido:** sim, automaticamente (receita da obra = `Faturamento.valor_total`); sem custo de mobilização modelado (margem "pura").
- [x] Rentabilidade considera **regime de caixa** (recebido, PRD-007) ou **competência** (faturado)? → **Resolvido:** qualquer `Faturamento` gerado (rascunho ou faturado), chaveado por `gerado_em`; não é caixa (PRD-007 fica de fora).
- [x] Períodos padrão do painel (mês, obra, personalizado)? → **Resolvido:** mês de competência, reaproveitando o seletor de mês do PRD-013 (promovido para `src/shared/`).

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 3 — Acabamento"** — e é o **último do roadmap**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-013 | Custo Real da Hora-Máquina | ✅ | Fornece o custo |
| — | PRD-004 | Faturamento | ✅ | Fornece a receita |
| **3** | **PRD-014** | **Rentabilidade por Equipamento e Obra** | **✅ Implementado** | Topo da pirâmide analítica |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Rentabilidade, margens (R$/%) | **Financeiro estratégico (o mais sensível)** | Retaguarda-only; no backend, RLS restrito a `proprietário/admin` |

### Autenticação e Autorização

É o dado mais estratégico do negócio — acesso do dono. Operador jamais acessa. No backend, RLS rigoroso.

### Auditoria

Como é derivado, a trilha está nas fontes (faturamento, custo, apontamentos). Acessos ao painel podem ser logados.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Proprietário] ─▶ /admin/rentabilidade ─▶ escolhe período
─▶ vê margem por equipamento (ranking) e por obra (prejuízos destacados)
─▶ detalha um item (composição receita × custo)
```

### Fluxos de Exceção
- Item com custo incompleto → sinalizado (margem não confiável).
- Período sem faturamento → empty state.

### Fluxos de Erro
- Falha simulada ao carregar → estado de erro com retry.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md` do repositório.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Compass"** — navega o negócio pela margem).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Itens com custo incompleto sinalizam, não travam o painel |
| **Fail gracefully** | Evitar percentuais quebrados (receita zero) |
| **Preservar evidências** | Rastreabilidade nas fontes (faturamento/custo) |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Atribuição transparente** | Deixar claro como receita/custo foram atribuídos ao recorte |
| **Derivar** | Cruzar faturamento (PRD-004) e custo (PRD-013); não recriar |
| **Apto a apresentar** | Painel legível para o dono/cliente (números-chave + gráfico) |
| **Barreira financeira** | `src/features/rentabilidade/` nunca em `/app/*` |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir rentabilidade no app do operador |
| Confundir receita com lucro (sempre subtrair custo) |
| Ocultar prejuízo (destacar margem negativa) |
| Persistir os resultados derivados (recalcular) |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO (mockado — camada analítica aguarda dados reais da Fase 4 para ter valor pleno) |
| **Data de Implementação** | 2026-07-03 |
| **Versão do App** | 0.14.0 (Compass) |
| **Implementado por** | Claude Opus 4.5 via Claude Code CLI, Subagent-Driven Development (4 tasks + revisão final, 0 Critical/Important) |
| **Observações** | Último PRD do roadmap numerado (000–014). Decisões Pendentes resolvidas por leitura estrutural dos dados existentes, sem necessidade de decisão de negócio: (1) **atribuição de receita por equipamento** — usa a atribuição exata já existente em `FaturamentoItem.origem_id` (cada item `hora_maquina` já nasce escopado a um equipamento via `gerarItens`, PRD-004); nenhum rateio proporcional foi necessário; itens `por_metro`/`mobilizacao` não têm `origem_id` de equipamento e por isso só entram na receita da obra, não na do equipamento (limitação estrutural documentada). (2) **Mobilização na rentabilidade da obra** — entra automaticamente (receita da obra = `Faturamento.valor_total`, que já inclui o item de mobilização); não há custo de mobilização modelado em PRD-013, logo mobilização é margem "pura" neste MVP. (3) **Regime de caixa × competência** — nem um nem outro estritamente: conta qualquer `Faturamento` gerado (rascunho ou faturado) para a OS, chaveado pelo mês de `gerado_em`; só o "recebido" (PRD-007) fica de fora, pois este PRD depende de PRD-004, não de PRD-007. (4) **Período padrão** — mês de competência reaproveitado do PRD-013 (o seletor de mês foi promovido para `src/shared/`, usado por ambas as features agora). Custo por obra usa o `custo_por_hora` da companhia (PRD-013) para aquele equipamento no período × horas que o equipamento trabalhou especificamente naquela OS. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |
| 2026-07-03 | v2 | Implementado (app v0.14.0 "Compass") — Decisões Pendentes resolvidas, painel `/admin/rentabilidade` entregue |

---

**AILA - Sistemas Inteligentes**
