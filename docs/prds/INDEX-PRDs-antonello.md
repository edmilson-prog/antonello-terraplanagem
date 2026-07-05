# Índice de PRDs — Antonello Terraplanagem

## Informações do Projeto

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Cliente** | Leonardo Antonello |
| **Repositório** | [a definir — repo único / monorepo] |
| **Início** | Jun/2026 |
| **Versão Atual** | 0.16.0 (Messenger) |
| **Fase Atual** | Frontend First (mockado) |
| **PRDs no Roadmap** | 17 (PRD-000 a PRD-016) |
| **PRDs Documentados** | **17 — roadmap 100% documentado** (PRD-000 a PRD-014) + **PRD-015** (pós-roadmap, home screens) + **PRD-016** (pós-roadmap, dashboard gerencial — proposto pelo Arquiteto, ⏳ aguardando implementação) |
| **PRDs Implementados** | 16 (inclui o spike PRD-000) — **roadmap numerado 100% implementado** + integrações provisórias 008/009 (MVP mockado, Fase 4) também implementadas. Resta só o **PRD-016** (dashboard gerencial, ainda não implementado) |

### Agentes do Workflow

| Agente | Modelo | Ambiente | Função |
|--------|--------|----------|--------|
| **Arquiteto** | Claude Opus 4.5 (Anthropic) | Plataforma Web (claude.ai) | Cria e mantém PRDs |
| **Desenvolvedor** | Claude Opus 4.5 (Anthropic) | Claude Code CLI | Implementa PRDs |

---

## Convenção de Numeração (deste projeto)

- **Sequência global:** `PRD-000`, `PRD-001`, ... (repo único; a numeração não reinicia por ambiente nem por onda).
- **Sufixo de ambiente:**
  - `op` — App do Operador (`/app/*`)
  - `ret` — Retaguarda (`/admin/*`, recepção/proprietário)
  - `all` — transversal (vale para os dois)
- **Sufixo de categoria** (quando aplicável): `spike`, `ia`, `dgn`, ou nenhum (feature padrão).
- **Formato:** `PRD-NNN-[ambiente]-[categoria?]-titulo.md`
  - Ex.: `PRD-002-op-apontamento-horimetro.md`, `PRD-000-all-spike-sync-offline.md`

> ⚠️ **Número ≠ ordem de implementação.** A sequência numérica é só identidade. A **ordem de construção é ditada pelo grafo de dependências** (ver mapa abaixo).

---

## Resumo de Status (implementação)

| Status | Quantidade | Percentual |
|--------|------------|------------|
| ✅ Implementado | 16 | 94% |
| 🔄 Em Andamento | 0 | 0% |
| ⏳ Pendente | 1 | 6% |
| ❌ Cancelado | 0 | 0% |
| **Total** | **17** | **100%** |

**Progresso de documentação:** **17/17 — roadmap 100% documentado** (PRD-000 a PRD-014) + PRD-015 + PRD-016 (pós-roadmap). 16/17 implementados (94%) — resta só o **PRD-016** (dashboard gerencial, proposto pelo Arquiteto em Jun/2026, ainda não implementado).

---

## 🗺️ Roadmap Completo (por Onda) — ✍️ 100% documentado

> Legenda de documento: ✍️ escrito · 📋 planejado · Legenda de status: ⏳ pendente · 🔄 em andamento · ✅ implementado

### Onda 1 — Fundação (MVP) — ✍️ completa

O coração do sistema: campo aponta horas, central recebe, fatura.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 000 | `PRD-000-all-spike-sync-offline_DONE.md` | Spike | all | Alta | — | (adaptado) | ✍️ | ✅ |
| 001 | `PRD-001-ret-cadastros-base_DONE.md` | Feature | ret | Alta | — | feature | ✍️ | ✅ |
| 002 | `PRD-002-op-apontamento-horimetro_DONE.md` | Feature | op | Alta | 001 | feature | ✍️ | ✅ |
| 003 | `PRD-003-all-ordem-servico-colaborativa_DONE.md` | Feature | all | Alta | 000, 001 | feature | ✍️ | ✅ |
| 004 | `PRD-004-ret-faturamento-fechamento-os_DONE.md` | Feature | ret | Média | 003, 005 | feature | ✍️ | ✅ |
| 005 | `PRD-005-ret-tabela-precos_DONE.md` | Feature | ret | Média | 001 | feature | ✍️ | ✅ |

### Onda 2 — Estrutura — ✍️ completa

Fecha o ciclo financeiro e adiciona automações. As **features (006, 007, 010, 011)** já foram mockadas/implementadas na Fase 2. As **integrações (008, 009)**, antes provisórias/Fase 4, foram implementadas como **MVP mockado** (v0.15.0 Gateway / v0.16.0 Messenger) — multi-provedor, sem backend real.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 006 | `PRD-006-ret-orcamentos_DONE.md` | Feature | ret | Média | 001, 005 | feature | ✍️ | ✅ |
| 007 | `PRD-007-ret-contas-pagar-receber_DONE.md` | Feature | ret | Média | 004 | feature | ✍️ | ✅ |
| 008 | `PRD-008-ret-integracao-gateway-cobranca_DONE.md` | Integração | ret | Média | 004, 007 | integration | ✍️* | ✅ |
| 009 | `PRD-009-all-integracao-whatsapp-fechamento-os_DONE.md` | Integração (n8n) | all | Média | 003 | integration | ✍️* | ✅ |
| 010 | `PRD-010-all-manutencao-preventiva-horimetro_DONE.md` | Feature | all | Baixa | 001, 002 | feature | ✍️ | ✅ |
| 011 | `PRD-011-ret-comprovante-assinado_DONE.md` | Feature | ret | Baixa | 003 | feature | ✍️ | ✅ |

\* Integrações implementadas como **MVP mockado** (multi-provedor, sem chamada de rede real); integração real com o provedor de produção fica para uma futura Fase 4/backend.

### Onda 3 — Acabamento — ✍️ completa

A inteligência de negócio: o "porquê" do projeto — rentabilidade por máquina e por obra. **Camada analítica (Fase 4 / dados reais).**

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 012 | `PRD-012-all-gestao-diesel-utilizacao_DONE.md` | Feature | all | Baixa | 001, 002 | feature | ✍️ | ✅ |
| 013 | `PRD-013-ret-custo-hora-maquina_DONE.md` | Feature | ret | Baixa | 002, 010, 012 | feature | ✍️ | ✅ |
| 014 | `PRD-014-ret-rentabilidade-equipamento-obra_DONE.md` | Feature | ret | Baixa | 004, 013 | feature | ✍️ | ✅ |

> **Pirâmide analítica — completa:** diesel/utilização (012) → custo da hora-máquina (013) → rentabilidade por equipamento e obra (014). Roadmap numerado (000–014) 100% implementado.

### Pós-Roadmap — home screens

Telas de entrada dos dois ambientes, adicionadas depois do roadmap original de 15 PRDs (ver "Próximos PRDs Planejados" mais abaixo — o item "Dashboard retaguarda + Início operador" foi promovido a PRD numerado).

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 015 | `PRD-015-all-home-dashboard-inicio_DONE.md` | Feature | all | Alta | 002, 003, 004, 007, 010, 012 | feature | ✍️ | ✅ |

### Pós-Roadmap — extensão analítica

Painel gerencial consolidado (evolução de faturamento, receita × custo × margem, horas/utilização por equipamento, rankings) para decisão do proprietário — complementa o dashboard operacional (PRD-015). **Proposto e documentado pelo Arquiteto** (Jun/2026); ainda não implementado.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 016 | `PRD-016-ret-dashboard-gerencial.md` | Feature | ret | Alta | 002, 004, 007, 012, 013, 014 | feature | ✍️ | ⏳ |

---

## Catálogo por Status

### ✍️ Documentados, ⏳ aguardando implementação

| PRD | Título | Tipo | Ambiente |
|-----|--------|------|----------|
| [PRD-016](./PRD-016-ret-dashboard-gerencial.md) | Dashboard Gerencial (Analítico) | Feature | ret |

### ✅ Implementados

| PRD | Título | Tipo | Ambiente | Versão |
|-----|--------|------|----------|--------|
| [PRD-000](./PRD-000-all-spike-sync-offline_DONE.md) | Spike — Sync offline-first + OS colaborativa | Spike | all | — (ADR-001) |
| [PRD-001](./PRD-001-ret-cadastros-base_DONE.md) | Cadastros Base (equipamentos, operadores, clientes) | Feature | ret | 0.1.0 Registry |
| [PRD-002](./PRD-002-op-apontamento-horimetro_DONE.md) | Apontamento de Horímetro | Feature | op | 0.2.0 Tally |
| [PRD-003](./PRD-003-all-ordem-servico-colaborativa_DONE.md) | Ordem de Serviço Colaborativa | Feature | all | 0.4.0 Worksite |
| [PRD-004](./PRD-004-ret-faturamento-fechamento-os_DONE.md) | Faturamento ao Fechar OS | Feature | ret | 0.5.0 Invoice |
| [PRD-005](./PRD-005-ret-tabela-precos_DONE.md) | Tabela de Preços (hora-máquina + por metro) | Feature | ret | 0.3.0 Tariff |
| [PRD-006](./PRD-006-ret-orcamentos_DONE.md) | Orçamentos | Feature | ret | 0.6.0 Quote |
| [PRD-007](./PRD-007-ret-contas-pagar-receber_DONE.md) | Contas a Pagar e Receber | Feature | ret | 0.7.0 Cashflow |
| [PRD-010](./PRD-010-all-manutencao-preventiva-horimetro_DONE.md) | Manutenção Preventiva por Horímetro | Feature | all | 0.8.0 Wrench |
| [PRD-011](./PRD-011-ret-comprovante-assinado_DONE.md) | Comprovante Assinado pelo Cliente | Feature | ret | 0.9.0 Seal |
| [PRD-012](./PRD-012-all-gestao-diesel-utilizacao_DONE.md) | Gestão de Diesel e Utilização | Feature | all | 0.10.0 Fuel |
| [PRD-015](./PRD-015-all-home-dashboard-inicio_DONE.md) | Home Screens — Dashboard (Retaguarda) + Início (Operador) | Feature | all | 0.12.0 Cockpit |
| [PRD-013](./PRD-013-ret-custo-hora-maquina_DONE.md) | Custo Real da Hora-Máquina | Feature | ret | 0.13.0 Meter |
| [PRD-014](./PRD-014-ret-rentabilidade-equipamento-obra_DONE.md) | Rentabilidade por Equipamento e Obra | Feature | ret | 0.14.0 Compass |
| [PRD-008](./PRD-008-ret-integracao-gateway-cobranca_DONE.md) | Integração — Gateway de Cobrança (MVP mockado, multi-provedor Mercado Pago + Asaas) | Integração | ret | 0.15.0 Gateway |
| [PRD-009](./PRD-009-all-integracao-whatsapp-fechamento-os_DONE.md) | Integração — Aviso ao Cliente por WhatsApp (MVP mockado, multi-provedor) | Integração | all | 0.16.0 Messenger |

### 🔄 Em Andamento

*Nenhum.*

### ❌ Cancelados

*Nenhum.*

---

## Mapa de Dependências

Caminho crítico da Onda 1:

```
PRD-000 (spike sync) ──────────────┐
                                   ▼
PRD-001 (cadastros) ──┬──────▶ PRD-003 (OS colaborativa) ──▶ PRD-004 (faturamento)
       │              │                                          ▲
       ├──▶ PRD-002 (apontamento)                                │
       └──▶ PRD-005 (preços) ───────────────────────────────────┘
```

Pirâmide analítica (Onda 3):

```
PRD-002 (horas) ──┐
PRD-012 (diesel) ─┼──▶ PRD-013 (custo/hora) ──▶ PRD-014 (rentabilidade)
PRD-010 (manut.) ─┘                                  ▲
PRD-004 (receita) ───────────────────────────────────┘
```

### Tabela de Dependências (completa)

| PRD | Depende de | Bloqueia |
|-----|-----------|----------|
| PRD-000 | — | PRD-003 |
| PRD-001 | — | PRD-002, PRD-003, PRD-005, PRD-006, PRD-010, PRD-012 |
| PRD-002 | PRD-001 | PRD-010, PRD-012, PRD-013, PRD-015, PRD-016 |
| PRD-003 | PRD-000, PRD-001 | PRD-004, PRD-009, PRD-011, PRD-015 |
| PRD-004 | PRD-003, PRD-005 | PRD-007, PRD-008, PRD-014, PRD-015, PRD-016 |
| PRD-005 | PRD-001 | PRD-004, PRD-006 |
| PRD-006 | PRD-001, PRD-005 | — |
| PRD-007 | PRD-004 | PRD-008, PRD-015, PRD-016 |
| PRD-008 | PRD-004, PRD-007 | — |
| PRD-009 | PRD-003 | — |
| PRD-010 | PRD-001, PRD-002 | PRD-013, PRD-015 |
| PRD-011 | PRD-003 | — |
| PRD-012 | PRD-001, PRD-002 | PRD-013, PRD-015, PRD-016 |
| PRD-013 | PRD-002, PRD-010, PRD-012 | PRD-014, PRD-016 |
| PRD-014 | PRD-004, PRD-013 | PRD-016 |
| PRD-015 | PRD-002, PRD-003, PRD-004, PRD-007, PRD-010, PRD-012 | — |
| PRD-016 | PRD-002, PRD-004, PRD-007, PRD-012, PRD-013, PRD-014 | — |

---

## Linha do Tempo

```
Jun/2026  ───────────────────────────────────────────────────────────▶
          │
          ├─ Fase 0 (Kickoff): CLAUDE.md + INDEX ✅
          ├─ Fase 1 (Scaffold): kickoff Lovable (design system + shells)
          │
          ├─ Fase 2 (Frontend First) — Onda 1 ✅ + Onda 2 (features) ✅ mockadas:
          │     PRD-001 → PRD-002 → PRD-005 → (PRD-000 spike) → PRD-003 → PRD-004 → PRD-006 → PRD-007 → PRD-010 → PRD-011 → PRD-012
          │
          ├─ Fase 3 (Validação): frontend navegável apresentado ao Leonardo
          │
          └─ Fase 4 (Backend, se aprovado) — Ondas 2 e 3 [✍️ completas]:
                features (006, 007, 010, 011) implementadas; integrações (008, 009) implementadas como MVP mockado (v0.15.0/v0.16.0);
                camada analítica: (002/010/012 + 004) → 013 → 014 implementada
                + PRD-015 (home screens) implementado; PRD-016 (dashboard gerencial) ainda pendente
```

### Histórico de Versões do App

| Versão | Codinome | Data | PRDs Incluídos | Tipo |
|--------|----------|------|----------------|------|
| 0.0.0 | — | Jun/2026 | (pré-scaffold) | Inicial |
| 0.1.0 | Registry | 2026-06-28 | PRD-001 | MINOR |
| 0.2.0 | Tally | 2026-06-28 | PRD-002 | MINOR |
| 0.3.0 | Tariff | 2026-06-28 | PRD-005 | MINOR |
| 0.4.0 | Worksite | 2026-06-29 | PRD-003 | MINOR |
| 0.5.0 | Invoice | 2026-06-29 | PRD-004 | MINOR |
| 0.6.0 | Quote | 2026-06-29 | PRD-006 | MINOR |
| 0.7.0 | Cashflow | 2026-06-30 | PRD-007 | MINOR |
| 0.8.0 | Wrench | 2026-07-01 | PRD-010 | MINOR |
| 0.9.0 | Seal | 2026-07-01 | PRD-011 | MINOR |
| 0.10.0 | Fuel | 2026-07-02 | PRD-012 | MINOR |
| 0.11.0 | Retrofit | 2026-07-02 | Deltas pós-implementação dos PRD-002/003/004 (patches v2) | MINOR |
| 0.12.0 | Cockpit | 2026-07-02 | PRD-015 (Home Screens — Dashboard retaguarda + Início operador) | MINOR |
| 0.13.0 | Meter | 2026-07-02 | PRD-013 (Custo Real da Hora-Máquina — painel + componentes de custo) | MINOR |
| 0.14.0 | Compass | 2026-07-03 | PRD-014 (Rentabilidade por Equipamento e Obra — topo da pirâmide analítica) | MINOR |
| 0.15.0 | Gateway | 2026-07-05 | PRD-008 (Gateway de Cobrança — MVP mockado, multi-provedor Mercado Pago + Asaas) | MINOR |
| 0.16.0 | Messenger | 2026-07-05 | PRD-009 (Aviso ao Cliente por WhatsApp — MVP mockado, multi-provedor Evolution API/Evolution GO/Meta Cloud API/OpenWA) | MINOR |

---

## Próximos PRDs Planejados (a numerar quando chegar a hora)

A **Fase 4 (backend)** gerará PRDs próprios quando o frontend for aprovado:

| # | Título Provisório | Tipo | Fase | Gate / Observação |
|---|-------------------|------|------|-------------------|
| 017 | **Auth real + perfis + RLS** (Supabase Auth) | Feature (backend) | Fase 4 | **Primeiro da Fase 4** — pré-requisito de todo backend; as políticas finas dependem do **ADR do spike** (PRD-000), por isso não é escrito agora |
| 018 | Schema + migrations + **mock→seed** | Feature (backend) | Fase 4 | Após auth; converte os mocks em `seed.sql` |
| 0xx | Backend por feature (conexão mock→real, por onda) | Feature (backend) | Fase 4 | Ordem do grafo; backend da OS (003) **só após o ADR** |
| 0xx | Notificação interna de alertas (manutenção → retaguarda) | Integração | Fase 4+ | Automação própria — distinta do PRD-009 (aviso ao cliente) |

> **Regra:** não escrever esses PRDs antes de seus gates (aprovação do frontend / ADR do spike / provedor definido). Escrever antes = especular = retrabalho. Os itens "Dashboard retaguarda + Início operador" e "Dashboard gerencial" que estavam nesta lista foram promovidos a **PRD-015** e **PRD-016** (ver seções "Pós-Roadmap" acima); por isso Auth e Schema foram renumerados de `0xx` para **017**/**018**.

---

## Notas e Observações

### Decisões Importantes

| Data | Decisão | Impacto |
|------|---------|---------|
| Jun/2026 | Repo **único** (monorepo) com dois ambientes por rota (`/app`, `/admin`) | Numeração global + sufixo de ambiente |
| Jun/2026 | **Frontend First** (mockado) — backend só após aprovação | Sem Supabase na Fase 2 |
| Jun/2026 | Estilização **Tailwind + shadcn/ui** | — |
| Jun/2026 | Identidade visual herdada do mapa de funcionalidades (amarelo-máquina/terra/aço) | Continuidade com o documento apresentado ao cliente |
| Jun/2026 | Roadmap completo formalizado: 15 PRDs (000–014) em 3 ondas | Base de planejamento da Onda 1 à 3 |
| Jun/2026 | **Onda 1 totalmente documentada** (PRD-000 a PRD-005) | Pronta para implementação após scaffold |
| 2026-06-28 | **Sync offline-first decidido** (spike PRD-000 → [ADR-001](../adr/ADR-001-sync-offline-os-colaborativa.md)): Supabase Realtime + fila offline própria; apontamentos append-only; cabeçalho LWW por campo; fechar OS = retaguarda | Destrava o PRD-003; define o que o backend (Fase 4) entrega |
| Jun/2026 | **Ondas 1 e 2 totalmente documentadas** (PRD-000 a PRD-011) | Onda 1 e features da Onda 2 (006, 007, 010, 011) mockáveis/implementadas; integrações (008, 009) provisórias |
| Jun/2026 | Integrações **008/009 orquestradas/isoladas** (gateway; WhatsApp via n8n) | Trocar provedor = mudar fluxo, não o app |
| Jun/2026 | **Roadmap 100% documentado** (PRD-000 a PRD-014) | Todo o produto especificado; camada analítica (012→013→014) é Fase 4/dados reais |
| Jun/2026 | **Patch consolidado "Retrofit"** (v2 em 002/003/004/010/012): modalidade no apontamento, metragem append-only, rota do diesel | 2026-07-02: delta de código dos PRD-002/003/004 aplicado (v0.11.0 Retrofit); PRD-010 era docs-only (sem ação de código); PRD-012 já havia sido implementado à parte (v0.10.0 Fuel) |
| Jun/2026 | **PRD-015 (Home Screens) criado** pelo Arquiteto — promove o item "Dashboard retaguarda + Início operador" de "planejado" para PRD numerado | Substitui os placeholders de `/admin` e `/app` agregando dados das features já implementadas; sem contrato novo |
| 2026-07-02 | **PRD-015 implementado** (v0.12.0 "Cockpit") — dashboard da retaguarda (6 widgets + filtro de período) e Início do operador, via Subagent-Driven Development (5 tasks + revisão final, 0 Critical/Important) | Placeholders de `/admin` e `/app` substituídos por telas reais; barreira financeira verificada transitivamente |
| 2026-07-02 | **PRD-013 implementado** (v0.13.0 "Meter") — painel de custo/hora por equipamento (fixos + variáveis + diesel + manutenção ÷ horas) com margem vs. preço praticado, mockado antes da Fase 4 (a spec já sinalizava "painel mockável agora"), via Subagent-Driven Development (4 tasks + revisão final, 0 Critical/Important) | Onda 3 (camada analítica) avança: diesel (012, implementado) → custo/hora (013, implementado) → falta só rentabilidade (014) |
| 2026-07-03 | **PRD-014 implementado** (v0.14.0 "Compass") — painel de rentabilidade por equipamento e por obra (receita do faturamento − custo do PRD-013), com ranking, margem em R$/%, sinalização de "custo incompleto" e "prejuízo", via Subagent-Driven Development (4 tasks + revisão final, 0 Critical/Important, 5 Minor não-bloqueantes). Seletor de mês promovido de `custo-hora` para `shared/` (reaproveitado pelas duas features) | Onda 3 (pirâmide analítica) completa: diesel (012) → custo/hora (013) → rentabilidade (014). Roadmap numerado (000–014) 100% implementado; restavam só as integrações provisórias 008/009 (Fase 4) |
| Jun/2026 | **PRD-016 (Dashboard Gerencial) proposto e documentado pelo Arquiteto** — painel analítico consolidado (evolução de faturamento, receita × custo × margem, rankings), complementar ao PRD-015 (operacional); decisão definiu provedores multi-gateway (Mercado Pago + Asaas) e multi-WhatsApp (Evolution API, Evolution GO, Meta Cloud API, OpenWA) para 008/009 | Destrava a implementação de 008/009 como MVP mockado; numeração 017/018 (Auth, Schema) ajustada na fila de "Próximos PRDs Planejados" |
| 2026-07-05 | **PRD-008 implementado** (v0.15.0 "Gateway") — MVP mockado do gateway de cobrança, multi-provedor (Mercado Pago + Asaas), emissão simulada de cobrança + webhook de pagamento com baixa automática, via Subagent-Driven Development (4 tasks + revisão final, 0 Critical/Important) | Integrações da Onda 2 avançam: resta só o PRD-009 |
| 2026-07-05 | **PRD-009 implementado** (v0.16.0 "Messenger") — MVP mockado do aviso ao cliente por WhatsApp, multi-provedor (Evolution API, Evolution GO, WhatsApp Cloud API/Meta, OpenWA), via Subagent-Driven Development (4 tasks + revisão final, 0 Critical/Important, 4 Minor cosméticos/herdados) | Roadmap numerado (000–014) + integrações provisórias (008/009) 100% implementados. Resta só o PRD-016 (dashboard gerencial, proposto) |
| 2026-07-05 | **Reconciliação deste índice com o rascunho do Arquiteto** — incorporado: PRD-016 (dashboard gerencial, pendente), renumeração 017/018 (Auth/Schema), status real de implementação de 008/009. A correção documental pendente do PRD-010 (`_DONE_PATCH`, docs-only — distingue o alerta interno de manutenção do aviso ao cliente do PRD-009) já estava refletida narrativamente neste índice e foi commitada nesta reconciliação. Rascunho original do Arquiteto preservado em `INDEX-PRDs-antonello.ARQUITETO-DRAFT-2026-07-04.md` para referência | Sincroniza a visão do Arquiteto (claude.ai) com o estado real do repositório, sem perder o histórico real de implementação |

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| OS colaborativa **offline + sync em tempo real** com resolução de conflito | **Mitigado** | Alto | ✅ **Resolvido pelo spike PRD-000 → [ADR-001](../adr/ADR-001-sync-offline-os-colaborativa.md)** (Realtime + fila offline; append-only; LWW por campo; fechar = retaguarda). PoC confirmou a hipótese. |
| Integrações da Onda 2 (gateway, WhatsApp) **não se mockam** de verdade | **Mitigado** | Médio | ✅ Implementadas como MVP mockado multi-provedor (008/009); integração real com o provedor de produção fica para uma futura Fase 4/backend |
| Camada analítica (Onda 3) exige **dados reais** para ter valor | Média | Médio | Documentada como Fase 4; mock mostra o formato, não substitui dados reais |
| OCR do horímetro por foto pode não ser viável no MVP | Média | Médio | Validar viabilidade; fallback de digitação manual (PRD-002) |
| Migração de clientes do sistema antigo (Farol) | Baixa | Médio | Confirmar com o cliente; mocks preveem cadastro do zero |

### Decisões em Aberto (do discovery — fechar com Leonardo)

- [ ] Existe **tabela de preço** por porte/tipo de equipamento, ou negocia caso a caso?
- [ ] **Migrar** o cadastro de clientes do sistema antigo (Farol) ou começar do zero?
- [ ] Cliente **assina/confirma** o serviço digitalmente (PRD-011) ou basta o aviso por WhatsApp (PRD-009)? (ou os dois)
- [ ] Leonardo **aluga máquinas de terceiros** ou **aluga as dele** para terceiros? (muda o modelo)
- [ ] **OCR** do horímetro por foto — viável no MVP, ou só digitação manual?
- [ ] Onde se define **máquina seca × operada** para o cálculo do faturamento?
- [x] **Gateway** de cobrança (boleto + PIX): Asaas / Efí / outro? — **Resolvido:** multi-provedor, começando com Mercado Pago + Asaas (servidores de API já em produção)
- [x] **Provedor de WhatsApp:** Evolution API (não oficial) ou Meta Cloud API (oficial, com templates)? — **Resolvido:** multi-provedor — Evolution API, Evolution GO, WhatsApp Cloud API (Meta) e OpenWA (servidores de API já em produção)
- [ ] **Operação offline** — quanto tempo o operador fica sem sinal em campo? (define a estratégia de fila)
- [ ] **Frota real** — inconsistência nos áudios (≈15 equipamentos vs "três ou quatro"). Confirmar contagem.
- [ ] Como calcular **depreciação** e o custo do **operador** no custo da hora-máquina (PRD-013)? — o mock adotou convenção provisória (depreciação como valor fixo mensal informado; operador como valor variável por hora informado, sem fórmula própria); questão de negócio (como Leonardo de fato pensa esses custos) segue em aberto para quando houver dado real
- [x] Rentabilidade por **competência** (faturado) ou **caixa** (recebido)? (PRD-014) — **Resolvido no mock:** nem um nem outro estritamente; conta qualquer `Faturamento` gerado (rascunho ou faturado), chaveado por `gerado_em`; caixa (recebido, PRD-007) fica fora. Validar com Leonardo se esse é o critério certo quando houver dado real.
- [ ] **Modelo comercial** do software — como o Leonardo paga/usa a plataforma?

---

## Como Manter Este Índice

| Evento | Ação no Índice |
|--------|----------------|
| PRD documentado | Marcar Doc ✍️ no roadmap; mover para "Documentados" |
| PRD iniciado | Mover para "Em Andamento" |
| PRD implementado | Mover para "Implementados", atualizar versão |
| PRD cancelado | Mover para "Cancelados", documentar motivo |
| Nova versão do app | Atualizar "Histórico de Versões" |

### Checklist de Atualização

- [ ] Status do PRD atualizado (roadmap + catálogo)
- [ ] Link do arquivo correto (com ou sem `_DONE`)
- [ ] Versão do app atualizada (se implementado)
- [ ] Dependências atualizadas
- [ ] Resumo de status recalculado

---

## Última Atualização

| Campo | Valor |
|-------|-------|
| **Data** | 2026-07-05 |
| **Atualizado por** | Claude Code (reconciliação com o rascunho do Arquiteto) |
| **Motivo** | PRD-008 (v0.15.0 Gateway) e PRD-009 (v0.16.0 Messenger) implementados e refletidos; PRD-016 (Dashboard Gerencial) incorporado do rascunho do Arquiteto como pendente; numeração de "Próximos PRDs Planejados" ajustada (017 Auth, 018 Schema); correção documental do PRD-010 (`_DONE_PATCH`, docs-only) commitada |
