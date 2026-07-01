# Índice de PRDs — Antonello Terraplanagem

## Informações do Projeto

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Cliente** | Leonardo Antonello |
| **Repositório** | [a definir — repo único / monorepo] |
| **Início** | Jun/2026 |
| **Versão Atual** | 0.7.0 (Cashflow) |
| **Fase Atual** | Frontend First (mockado) |
| **PRDs no Roadmap** | 15 (PRD-000 a PRD-014) |
| **PRDs Documentados** | 8 — Onda 1 (PRD-000 a PRD-005) + PRD-006, PRD-007 |
| **PRDs Implementados** | 8 (inclui o spike PRD-000) |

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
| ✅ Implementado | 8 | 53% |
| 🔄 Em Andamento | 0 | 0% |
| ⏳ Pendente | 7 | 47% |
| ❌ Cancelado | 0 | 0% |
| **Total** | **15** | **100%** |

**Progresso de documentação:** 6/15 PRDs com documento escrito — **toda a Onda 1** (PRD-000 a PRD-005). Ondas 2 e 3 planejadas.

---

## 🗺️ Roadmap Completo (por Onda)

> Legenda de documento: ✍️ escrito · 📋 planejado · Legenda de status: ⏳ pendente · 🔄 em andamento · ✅ implementado

### Onda 1 — Fundação (MVP) — ✍️ documentação completa

O coração do sistema: campo aponta horas, central recebe, fatura.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 000 | `PRD-000-all-spike-sync-offline_DONE.md` | Spike | all | Alta | — | (adaptado) | ✍️ | ✅ |
| 001 | `PRD-001-ret-cadastros-base_DONE.md` | Feature | ret | Alta | — | feature | ✍️ | ✅ |
| 002 | `PRD-002-op-apontamento-horimetro_DONE.md` | Feature | op | Alta | 001 | feature | ✍️ | ✅ |
| 003 | `PRD-003-all-ordem-servico-colaborativa_DONE.md` | Feature | all | Alta | 000, 001 | feature | ✍️ | ✅ |
| 004 | `PRD-004-ret-faturamento-fechamento-os_DONE.md` | Feature | ret | Média | 003, 005 | feature | ✍️ | ✅ |
| 005 | `PRD-005-ret-tabela-precos_DONE.md` | Feature | ret | Média | 001 | feature | ✍️ | ✅ |

### Onda 2 — Estrutura

Fecha o ciclo financeiro e adiciona automações. **Boa parte é Fase 4 (backend)** e só destrava após a aprovação do frontend.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 006 | `PRD-006-ret-orcamentos_DONE.md` | Feature | ret | Média | 001, 005 | feature | ✍️ | ✅ |
| 007 | `PRD-007-ret-contas-pagar-receber_DONE.md` | Feature | ret | Média | 004 | feature | ✍️ | ✅ |
| 008 | `PRD-008-ret-integracao-gateway-cobranca.md` | Integração | ret | Média | 004, 007 | integration | 📋 | ⏳ |
| 009 | `PRD-009-all-integracao-whatsapp-fechamento-os.md` | Integração (n8n) | all | Média | 003 | integration | 📋 | ⏳ |
| 010 | `PRD-010-all-manutencao-preventiva-horimetro.md` | Feature | all | Baixa | 001, 002 | feature | 📋 | ⏳ |
| 011 | `PRD-011-ret-comprovante-assinado.md` | Feature | ret | Baixa | 003 | feature | 📋 | ⏳ |

### Onda 3 — Acabamento

A inteligência de negócio: o "porquê" do projeto — rentabilidade por máquina e por obra.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 012 | `PRD-012-all-gestao-diesel-utilizacao.md` | Feature | all | Baixa | 001, 002 | feature | 📋 | ⏳ |
| 013 | `PRD-013-ret-custo-hora-maquina.md` | Feature | ret | Baixa | 002, 012 | feature | 📋 | ⏳ |
| 014 | `PRD-014-ret-rentabilidade-equipamento-obra.md` | Feature | ret | Baixa | 004, 013 | feature | 📋 | ⏳ |

> **Nota sobre a Onda 3:** diesel/utilização (012) vem **antes** de custo (013) porque o custo real da hora-máquina depende do consumo de combustível. Rentabilidade (014) é a camada final: custo (013) cruzado com receita faturada (004).

---

## Catálogo por Status

### ✍️ Documentados, ⏳ aguardando implementação

*Nenhum da Onda 1 pendente.*

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

### 🔄 Em Andamento

*Nenhum ainda.*

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

### Tabela de Dependências (completa)

| PRD | Depende de | Bloqueia |
|-----|-----------|----------|
| PRD-000 | — | PRD-003 |
| PRD-001 | — | PRD-002, PRD-003, PRD-005, PRD-006, PRD-010, PRD-012 |
| PRD-002 | PRD-001 | PRD-010, PRD-012, PRD-013 |
| PRD-003 | PRD-000, PRD-001 | PRD-004, PRD-009, PRD-011 |
| PRD-004 | PRD-003, PRD-005 | PRD-007, PRD-008, PRD-014 |
| PRD-005 | PRD-001 | PRD-004, PRD-006 |
| PRD-006 | PRD-001, PRD-005 | — |
| PRD-007 | PRD-004 | PRD-008 |
| PRD-008 | PRD-004, PRD-007 | — |
| PRD-009 | PRD-003 | — |
| PRD-010 | PRD-001, PRD-002 | — |
| PRD-011 | PRD-003 | — |
| PRD-012 | PRD-001, PRD-002 | PRD-013 |
| PRD-013 | PRD-002, PRD-012 | PRD-014 |
| PRD-014 | PRD-004, PRD-013 | — |

---

## Linha do Tempo

```
Jun/2026  ───────────────────────────────────────────────────────────▶
          │
          ├─ Fase 0 (Kickoff): CLAUDE.md + INDEX ✅
          ├─ Fase 1 (Scaffold): kickoff Lovable (design system + shells)
          │
          ├─ Fase 2 (Frontend First) — Onda 1 mockada [documentação ✍️ completa]:
          │     PRD-001 → PRD-002 → PRD-005 → (PRD-000 spike) → PRD-003 → PRD-004
          │
          ├─ Fase 3 (Validação): frontend navegável apresentado ao Leonardo
          │
          └─ Fase 4 (Backend, se aprovado) — Ondas 2 e 3:
                cobrança (008), WhatsApp (009), financeiro (007),
                e a inteligência de custo/rentabilidade (012→013→014)
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

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| OS colaborativa **offline + sync em tempo real** com resolução de conflito | **Mitigado** | Alto | ✅ **Resolvido pelo spike PRD-000 → [ADR-001](../adr/ADR-001-sync-offline-os-colaborativa.md)** (Realtime + fila offline; append-only; LWW por campo; fechar = retaguarda). PoC confirmou a hipótese. |
| Integrações da Onda 2 (gateway, WhatsApp) **não se mockam** de verdade | Média | Médio | Tratar 008/009 como Fase 4; considerar spike antes da UI dependente (guia §3.5) |
| OCR do horímetro por foto pode não ser viável no MVP | Média | Médio | Validar viabilidade; fallback de digitação manual (PRD-002) |
| Migração de clientes do sistema antigo (Farol) | Baixa | Médio | Confirmar com o cliente; mocks preveem cadastro do zero |

### Decisões em Aberto (do discovery — fechar com Leonardo)

- [ ] Existe **tabela de preço** por porte/tipo de equipamento, ou negocia caso a caso?
- [ ] **Migrar** o cadastro de clientes do sistema antigo (Farol) ou começar do zero?
- [ ] Cliente **assina/confirma** o serviço digitalmente, ou basta o aviso por WhatsApp?
- [ ] Leonardo **aluga máquinas de terceiros** ou **aluga as dele** para terceiros? (muda o modelo)
- [ ] **OCR** do horímetro por foto — viável no MVP, ou só digitação manual?
- [ ] Onde se define **máquina seca × operada** para o cálculo do faturamento?
- [ ] **Gateway** de cobrança (boleto + PIX): Asaas / Efí / outro?
- [ ] **Operação offline** — quanto tempo o operador fica sem sinal em campo? (define a estratégia de fila)
- [ ] **Frota real** — inconsistência nos áudios (≈15 equipamentos vs "três ou quatro"). Confirmar contagem.
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
| **Data** | 2026-06-30 |
| **Atualizado por** | Claude Code via SDD |
| **Motivo** | PRD-007 Contas a Pagar e Receber implementado → 0.7.0 Cashflow; 8/15 (53%) |
