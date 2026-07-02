# Índice de PRDs — Antonello Terraplanagem

## Informações do Projeto

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Cliente** | Leonardo Antonello |
| **Repositório** | [a definir — repo único / monorepo] |
| **Início** | Jun/2026 |
| **Versão Atual** | 0.9.0 (Seal) |
| **Fase Atual** | Frontend First (mockado) |
| **PRDs no Roadmap** | 15 (PRD-000 a PRD-014) |
| **PRDs Documentados** | **15 — roadmap 100% documentado** (PRD-000 a PRD-014) |
| **PRDs Implementados** | 10 (inclui o spike PRD-000) |

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
| ✅ Implementado | 10 | 67% |
| 🔄 Em Andamento | 0 | 0% |
| ⏳ Pendente | 5 | 33% |
| ❌ Cancelado | 0 | 0% |
| **Total** | **15** | **100%** |

**Progresso de documentação:** **15/15 — roadmap 100% documentado** (PRD-000 a PRD-014). 10/15 implementados (67%) — restam 008, 009, 012, 013, 014.

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

Fecha o ciclo financeiro e adiciona automações. As **features (006, 007, 010, 011)** já foram mockadas/implementadas na Fase 2 — a Onda 2 está com todas as features prontas. As **integrações reais (008, 009)** são **Fase 4** e dependem de provedor — documentadas como provisórias.

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 006 | `PRD-006-ret-orcamentos_DONE.md` | Feature | ret | Média | 001, 005 | feature | ✍️ | ✅ |
| 007 | `PRD-007-ret-contas-pagar-receber_DONE.md` | Feature | ret | Média | 004 | feature | ✍️ | ✅ |
| 008 | `PRD-008-ret-integracao-gateway-cobranca.md` | Integração | ret | Média | 004, 007 | integration | ✍️* | ⏳ |
| 009 | `PRD-009-all-integracao-whatsapp-fechamento-os.md` | Integração (n8n) | all | Média | 003 | integration | ✍️* | ⏳ |
| 010 | `PRD-010-all-manutencao-preventiva-horimetro_DONE.md` | Feature | all | Baixa | 001, 002 | feature | ✍️ | ✅ |
| 011 | `PRD-011-ret-comprovante-assinado_DONE.md` | Feature | ret | Baixa | 003 | feature | ✍️ | ✅ |

\* Integrações documentadas como **provisórias** (Fase 4 / provedor em aberto).

### Onda 3 — Acabamento — ✍️ completa

A inteligência de negócio: o "porquê" do projeto — rentabilidade por máquina e por obra. **Camada analítica (Fase 4 / dados reais).**

| PRD | Arquivo | Tipo | Amb. | Prioridade | Depende de | Template | Doc | Status |
|-----|---------|------|------|------------|------------|----------|-----|--------|
| 012 | `PRD-012-all-gestao-diesel-utilizacao.md` | Feature | all | Baixa | 001, 002 | feature | ✍️ | ⏳ |
| 013 | `PRD-013-ret-custo-hora-maquina.md` | Feature | ret | Baixa | 002, 010, 012 | feature | ✍️ | ⏳ |
| 014 | `PRD-014-ret-rentabilidade-equipamento-obra.md` | Feature | ret | Baixa | 004, 013 | feature | ✍️ | ⏳ |

> **Pirâmide analítica:** diesel/utilização (012) → custo da hora-máquina (013) → rentabilidade por equipamento e obra (014).

---

## Catálogo por Status

### ✍️ Documentados, ⏳ aguardando implementação

| PRD | Título | Tipo | Ambiente |
|-----|--------|------|----------|
| [PRD-008](./PRD-008-ret-integracao-gateway-cobranca.md) | Integração — Gateway de Cobrança (provisório) | Integração | ret |
| [PRD-009](./PRD-009-all-integracao-whatsapp-fechamento-os.md) | Integração — WhatsApp via n8n (provisório) | Integração | all |
| [PRD-012](./PRD-012-all-gestao-diesel-utilizacao.md) | Gestão de Diesel e Utilização | Feature | all |
| [PRD-013](./PRD-013-ret-custo-hora-maquina.md) | Custo Real da Hora-Máquina | Feature | ret |
| [PRD-014](./PRD-014-ret-rentabilidade-equipamento-obra.md) | Rentabilidade por Equipamento e Obra | Feature | ret |

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
| PRD-002 | PRD-001 | PRD-010, PRD-012, PRD-013 |
| PRD-003 | PRD-000, PRD-001 | PRD-004, PRD-009, PRD-011 |
| PRD-004 | PRD-003, PRD-005 | PRD-007, PRD-008, PRD-014 |
| PRD-005 | PRD-001 | PRD-004, PRD-006 |
| PRD-006 | PRD-001, PRD-005 | — |
| PRD-007 | PRD-004 | PRD-008 |
| PRD-008 | PRD-004, PRD-007 | — |
| PRD-009 | PRD-003 | — |
| PRD-010 | PRD-001, PRD-002 | PRD-013 |
| PRD-011 | PRD-003 | — |
| PRD-012 | PRD-001, PRD-002 | PRD-013 |
| PRD-013 | PRD-002, PRD-010, PRD-012 | PRD-014 |
| PRD-014 | PRD-004, PRD-013 | — |

---

## Linha do Tempo

```
Jun/2026  ───────────────────────────────────────────────────────────▶
          │
          ├─ Fase 0 (Kickoff): CLAUDE.md + INDEX ✅
          ├─ Fase 1 (Scaffold): kickoff Lovable (design system + shells)
          │
          ├─ Fase 2 (Frontend First) — Onda 1 ✅ + Onda 2 (features) ✅ mockadas:
          │     PRD-001 → PRD-002 → PRD-005 → (PRD-000 spike) → PRD-003 → PRD-004 → PRD-006 → PRD-007 → PRD-010 → PRD-011
          │
          ├─ Fase 3 (Validação): frontend navegável apresentado ao Leonardo
          │
          └─ Fase 4 (Backend, se aprovado) — integrações provisórias (008, 009)
                + Onda 3, a inteligência de custo/rentabilidade (012→013→014)
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
| Jun/2026 | **Roadmap 100% documentado** (PRD-000 a PRD-014) — Onda 3 (012–014) adicionada pelo Arquiteto | Todo o produto especificado; falta implementar 011 (Onda 2) e a Onda 3 completa |

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| OS colaborativa **offline + sync em tempo real** com resolução de conflito | **Mitigado** | Alto | ✅ **Resolvido pelo spike PRD-000 → [ADR-001](../adr/ADR-001-sync-offline-os-colaborativa.md)** (Realtime + fila offline; append-only; LWW por campo; fechar = retaguarda). PoC confirmou a hipótese. |
| Integrações da Onda 2 (gateway, WhatsApp) **não se mockam** de verdade | Média | Médio | Tratadas como Fase 4 e provisórias (008/009); spike antes da UI dependente (guia §3.5) |
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
- [ ] **Gateway** de cobrança (boleto + PIX): Asaas / Efí / outro?
- [ ] **Provedor de WhatsApp:** Evolution API (não oficial) ou Meta Cloud API (oficial, com templates)?
- [ ] **Operação offline** — quanto tempo o operador fica sem sinal em campo? (define a estratégia de fila)
- [ ] **Frota real** — inconsistência nos áudios (≈15 equipamentos vs "três ou quatro"). Confirmar contagem.
- [ ] Como calcular **depreciação** e o custo do **operador** no custo da hora-máquina (PRD-013)?
- [ ] Rentabilidade por **competência** (faturado) ou **caixa** (recebido)? (PRD-014)
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
| **Data** | 2026-07-01 |
| **Atualizado por** | Claude Code via SDD |
| **Motivo** | PRD-011 Comprovante Assinado pelo Cliente implementado → 0.9.0 Seal; 10/15 (67%) |
