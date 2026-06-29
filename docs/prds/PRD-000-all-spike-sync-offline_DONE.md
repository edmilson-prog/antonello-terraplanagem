# PRD-000: Spike — Arquitetura Offline-First + Sync Colaborativa

> **Tipo especial:** Este é um **Spike** (investigação técnica de arquitetura), não uma feature. Ele não entrega tela ao usuário — entrega uma **decisão arquitetural fundamentada + uma prova de conceito (PoC)**. Por isso a estrutura foge do template de feature: no lugar de requisitos MoSCoW e estados de tela, há a pergunta a responder, abordagens candidatas, matriz de avaliação e critérios de sucesso.

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Decidir **como** conciliar operação offline em campo com uma Ordem de Serviço colaborativa em tempo real, incluindo resolução de conflito |
| **Tipo** | Spike (investigação de arquitetura) |
| **Complexidade** | Alta |
| **Prioridade** | Alta |
| **Ambiente** | Transversal (`all`) — fundação técnica |
| **Épico** | Onda 1 — Fundação |
| **PRDs Relacionados** | **Bloqueia o PRD-003** (OS colaborativa). Influencia PRD-002 (apontamento). |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |
| **Natureza** | **Trilha técnica paralela** — corre junto com os PRDs de frontend; deve estar resolvido **antes de implementar o backend do PRD-003** |

---

## O Problema Arquitetural

O sistema tem duas exigências que, juntas, brigam entre si:

1. **Offline-first:** o operador trabalha em campo, muitas vezes **sem sinal de celular**. Ele precisa apontar horas, abrir e atualizar serviços mesmo offline, e o app não pode travar nem perder dados.
2. **OS colaborativa em tempo real:** a mesma Ordem de Serviço pode ser vista e editada por **vários celulares ao mesmo tempo** e pela central — e todos devem convergir para o mesmo estado.

A tensão: sincronização em tempo real pressupõe conectividade; offline-first pressupõe ausência dela. Conciliar os dois — **fila offline + sync ao vivo + resolução de conflito** — é o ponto mais delicado do produto. Se for mockado ingenuamente (sync "perfeito" no protótipo) e só descoberto na fase de backend, o risco é alto e caro.

> **Por que um spike (guia §3.5):** quando o núcleo é lógica de processamento/arquitetura pesada, o mock pode prometer o que o backend real não entrega. A decisão precisa ser validada com código antes de prometer o comportamento na UI.

---

## Hipótese de Direção (a validar)

Levantada no discovery e ponto de partida da investigação:

- **Cada apontamento é "dono" das próprias horas.** Como cada operador registra o horímetro do seu equipamento, dois apontamentos quase nunca disputam o mesmo dado → o fluxo de horas é, na prática, **append-only e de baixíssimo conflito**.
- **O conflito real mora no estado compartilhado da OS** (status aberta/fechada, campos do cabeçalho, quem fecha). É um conjunto pequeno e bem delimitado de campos.

Se a hipótese se confirmar, o problema deixa de ser "sincronização colaborativa genérica" e vira: **(a)** uma fila de apontamentos append-only + **(b)** uma estratégia simples de conflito para o cabeçalho da OS. Isso muda radicalmente a complexidade.

---

## Perguntas a Responder

1. Qual abordagem concilia melhor offline-first + tempo real **com o stack já escolhido (Supabase)**?
2. A hipótese "apontamento append-only / conflito só no cabeçalho da OS" se sustenta? Qual a estratégia de conflito para o cabeçalho (last-write-wins por campo? merge? bloqueio de fechamento?)?
3. Como o cliente offline **enfileira, detecta reconexão e sincroniza** sem perder dados nem duplicar?
4. O que acontece quando **dois operadores fecham a mesma OS** offline, e ao sincronizar há divergência?
5. Qual o **custo** (implementação, manutenção, dependências) de cada abordagem, e o impacto no prazo?

---

## Abordagens Candidatas

| # | Abordagem | Resumo | Observação inicial |
|---|-----------|--------|--------------------|
| A | **Supabase Realtime + fila offline própria** | Fila local (IndexedDB) de operações; flush ao reconectar; Realtime para propagar mudanças; LWW por campo no cabeçalho da OS | Menor dependência nova; mais código de sync manual |
| B | **Sync engine sobre Postgres** (PowerSync / ElectricSQL) | Camada dedicada de sincronização local-first sobre o banco | Resolve offline robustamente; nova dependência e curva de aprendizado |
| C | **CRDT no documento da OS** (Yjs / Automerge) | Estrutura sem conflito para o estado compartilhado da OS | Forte para colaboração; pode ser overkill se o conflito for pequeno |
| D | **Event sourcing de apontamentos** | Apontamentos como eventos append-only; reconciliação no servidor | Casa com a hipótese de "append-only"; cabeçalho da OS ainda precisa de estratégia |
| E | **Banco local + sync custom** (WatermelonDB) | Base local reativa + protocolo de sync próprio | Boa DX offline; protocolo de conflito por nossa conta |

> A investigação deve focar primeiro em validar a **hipótese de direção** — se confirmada, abordagens mais simples (A, D) tendem a bastar; CRDT (C) e sync engines (B) só se justificam se o conflito for maior que o previsto.

---

## Critérios de Avaliação

| Critério | Peso | O que observar |
|----------|------|----------------|
| Robustez offline | Alto | Não perde dado sem sinal; reconexão confiável |
| Resolução de conflito | Alto | Comportamento previsível quando há divergência |
| Fit com Supabase | Alto | Quanto reaproveita do stack já escolhido |
| Complexidade de implementação | Médio | Esforço para chegar ao MVP |
| Manutenibilidade | Médio | Custo de evoluir e depurar |
| Curva/risco de dependência | Médio | Maturidade da lib, lock-in, comunidade |
| Time-to-market | Alto | Impacto no prazo da Onda 1 |

> Preencher a **matriz (abordagens × critérios)** durante o spike e justificar a recomendação.

---

## Escopo da Prova de Conceito (PoC)

Construir o **mínimo** para responder às perguntas — não é a feature de produção.

- [ ] Dois clientes simulados (duas abas/dispositivos) editando a **mesma OS**.
- [ ] Cada cliente cria **apontamentos** offline (sem rede) e os enfileira.
- [ ] Ao "reconectar", os apontamentos sincronizam — **verificar ausência de perda e de duplicação**.
- [ ] Forçar um **conflito de cabeçalho**: dois clientes alteram/fecham a OS offline; observar e registrar o comportamento na reconciliação.
- [ ] Medir e anotar: complexidade do código, pontos de falha, comportamento de conflito.

> O PoC é descartável (throwaway). O entregável valioso é o **aprendizado documentado**, não o código do PoC.

---

## Critérios de Sucesso do Spike

O spike está **concluído** quando:

- [ ] A **hipótese de direção** foi confirmada ou refutada com evidência do PoC.
- [ ] Existe uma **recomendação única** (abordagem escolhida) com justificativa pela matriz.
- [ ] Está definida a **estratégia de conflito do cabeçalho da OS** (regra explícita de quem vence / como fechar).
- [ ] Está definido o **protocolo de fila offline** (enfileirar, detectar reconexão, sincronizar, deduplicar).
- [ ] O **impacto no PRD-003** está descrito (o que o frontend pode prometer; o que o backend precisará entregar).
- [ ] A decisão está registrada como **ADR** (Architecture Decision Record) no repositório.

---

## Entregáveis

| Entregável | Formato |
|------------|---------|
| Recomendação arquitetural | ADR em `docs/adr/` (decisão, contexto, consequências) |
| Matriz de avaliação preenchida | Tabela no próprio ADR |
| Estratégia de conflito + protocolo de fila | Seção do ADR |
| PoC (descartável) | Branch separada, marcada como throwaway |
| Impacto nos PRDs | Atualização da seção "Arquitetura — Ponto Crítico" do `CLAUDE.md` e do PRD-003 |

---

## Riscos e Restrições

| Risco | Mitigação |
|-------|-----------|
| Spike virar implementação de produção | Time-box explícito; PoC é descartável; objetivo é decidir, não entregar feature |
| Hipótese de direção se mostrar falsa (conflito maior que o previsto) | Ter abordagens B/C como plano caso o append-only não baste |
| Dependência nova (B/C/E) criar lock-in | Avaliar maturidade e custo de saída no critério "risco de dependência" |
| Decisão depender de respostas do cliente | Ver Decisões Pendentes — algumas premissas precisam do Leonardo |

---

## Decisões Pendentes (premissas que dependem do Leonardo)

- [ ] **Quanto tempo** o operador costuma ficar sem sinal? (minutos? o dia todo?) — define o quão robusta a fila precisa ser.
- [ ] **Quantos operadores** realisticamente editam a **mesma OS** ao mesmo tempo? (2-3? muitos?) — calibra a necessidade de CRDT.
- [ ] Com que frequência a **mesma OS** é, de fato, colaborativa vs. um operador por OS?
- [ ] É aceitável que o **fechamento da OS** seja uma ação reservada à retaguarda (reduz drasticamente o conflito)?

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este é um **spike**: o objetivo é **investigar, prototipar, medir e recomendar** — não construir a feature de produção. Siga as convenções do `CLAUDE.md`.

### Esclarecimento de Dúvidas

> **💬 Antes de iniciar, alinhe as premissas (especialmente as Decisões Pendentes) e o time-box do spike.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE INVESTIGAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. NATUREZA DO SPIKE:**
> - O PoC é **descartável** — não promova para produção.
> - O valor está na **decisão documentada (ADR)**, não no código.
> - Respeite o **time-box**; o objetivo é reduzir incerteza o suficiente para o PRD-003.

> **⚠️ 3. AO CONCLUIR:**
> - Registrar o **ADR** em `docs/adr/`.
> - Atualizar a seção "Arquitetura — Ponto Crítico" do `CLAUDE.md` com a decisão.
> - Atualizar o PRD-003 com o impacto (o que o frontend pode prometer / o que o backend entrega).
> - Renomear este arquivo adicionando `_DONE`.
> - Atualizar o `INDEX-PRDs-antonello.md`.
> - Atualizar a seção "Status de Implementação".

### Princípios de Investigação

| Princípio | Descrição |
|-----------|-----------|
| **Reduzir incerteza** | O sucesso é uma decisão fundamentada, não uma feature |
| **Validar a hipótese primeiro** | Confirmar/refutar "append-only + conflito só no cabeçalho" antes de comparar libs |
| **Medir, não achar** | Registrar comportamento real do PoC (perda, duplicação, conflito) |
| **Documentar decisões** | ADR com contexto, decisão e consequências |
| **Não otimizar cedo** | Não adotar CRDT/sync engine se o caso simples bastar |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Transformar o PoC em código de produção |
| Escolher a abordagem mais sofisticada sem evidência de que é necessária |
| Estourar o time-box "para deixar pronto" |
| Decidir sem registrar o ADR |
| Prometer no PRD-003 comportamento que o PoC não validou |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ CONCLUÍDO |
| **Data de Conclusão** | 2026-06-28 |
| **Recomendação (abordagem)** | **A — Supabase Realtime + fila offline própria** (apontamentos append-only idempotentes; cabeçalho LWW por campo; fechar OS exclusivo da retaguarda) |
| **ADR** | [`ADR-001`](../adr/ADR-001-sync-offline-os-colaborativa.md) |
| **Investigado por** | Claude Opus 4.8 (Claude Code CLI) |
| **Observações** | Hipótese de direção **confirmada** por PoC descartável (branch `spike/prd-000-sync-poc`, 5/5 cenários). Premissas alinhadas: fechar = retaguarda, colaboração simultânea rara. Sem bump de versão (spike não entrega código de produção). PoC **não** merge na main. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
