# PRD-010: Manutenção Preventiva por Horímetro

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) que avisa quando um equipamento atinge a marca de horas para manutenção, usando a leitura do horímetro |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Baixa |
| **Ambiente** | Transversal (`all`) — retaguarda configura/gerencia; operador vê o alerta do equipamento |
| **Épico** | Onda 2 — Estrutura |
| **PRDs Relacionados** | PRD-001 (equipamentos), PRD-002 (horímetro — fonte da contagem), PRD-013 (custo — consome custo de manutenção, Onda 3) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, regra de cálculo (horímetro vs intervalo) com CRUD mockado, sem backend e sem integração externa |

---

## Contexto do Problema

Equipamento pesado exige **manutenção preventiva por horas de uso** — como um carro que troca óleo a cada X km, mas aqui a cada X **horas de motor**. Passar da marca acelera o desgaste (motor, material rodante) e aumenta o risco de quebra em campo, que é caro e para a operação.

Hoje esse controle é mental. Como o sistema já lê o horímetro de cada equipamento (PRD-002), ele pode **avisar** quando a manutenção se aproxima ou vence. Este PRD entrega os planos de manutenção (a cada quantas horas) e os alertas derivados do horímetro atual.

É informação **operacional** (não financeira): pode aparecer nos dois ambientes. O operador vê que a máquina está para revisar; a retaguarda configura os planos e acompanha a frota. (Custo da manutenção é opcional e só na retaguarda — alimenta a Onda 3.)

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Serão adicionadas telas em `/admin/manutencao` (config + acompanhamento) e um indicador no equipamento visível ao operador.

### Situação Desejada (To-Be)

A retaguarda define **planos de manutenção** por equipamento (ou tipo): a cada X horas, tal revisão. O sistema calcula, a partir do **horímetro atual**, o status de cada equipamento (em dia / próxima / vencida) e lista os alertas. Ao realizar a manutenção, registra-se o horímetro do momento, reiniciando o ciclo.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manutenção por data (calendário) | O desgaste é por uso (horas), não por tempo; horímetro é a métrica correta |
| Só um lembrete manual | Perde o automatismo derivado do horímetro que o sistema já tem |
| Esconder do operador | O operador é quem opera a máquina; ver o alerta ajuda a evitar dano |

---

## Escopo

### Incluído

- ✅ CRUD mockado de **planos de manutenção** (intervalo em horas, descrição) por equipamento/tipo
- ✅ Cálculo do **status** por equipamento a partir do horímetro atual: `em_dia / proxima / vencida`
- ✅ Lista de **alertas** (equipamentos com manutenção próxima ou vencida)
- ✅ **Registrar manutenção realizada** (horímetro do momento), reiniciando o ciclo
- ✅ Indicador de manutenção **visível ao operador** no equipamento
- ✅ `types` (contrato): `IPlanoManutencao`, `IRegistroManutencao` (+ `StatusManutencao`)
- ✅ Mocks, estados de tela, validações

### Excluído

- ❌ **Custo** detalhado da manutenção e sua análise — Onda 3 (PRD-013); campo de custo opcional aqui é retaguarda-only
- ❌ Ordem de compra de peças / estoque — escopo futuro
- ❌ Agendamento com terceiros / oficinas — escopo futuro
- ❌ Backend real (Supabase); notificações push/WhatsApp (PRD-009)
- ❌ Exibir **custo** de manutenção no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Planos (Retaguarda)

- **RF-001 (Must):** Cadastrar plano de manutenção com intervalo em horas e descrição, vinculado a um equipamento (ou tipo).
- **RF-002 (Must):** Listar e editar planos.
- **RF-003 (Should):** Inativar plano.

### Alertas e Status

- **RF-004 (Must):** Calcular, para cada equipamento com plano, o **status** (`em_dia`/`proxima`/`vencida`) a partir do horímetro atual (PRD-001/002) e do último registro.
- **RF-005 (Must):** Listar os equipamentos com manutenção **próxima** ou **vencida** (painel de alertas na retaguarda).
- **RF-006 (Should):** Definir a **antecedência** que caracteriza "próxima" (ex.: faltam ≤ 20h).

### Registro

- **RF-007 (Must):** Registrar uma manutenção **realizada**, informando o horímetro do momento; o ciclo reinicia (próxima marca recalculada).
- **RF-008 (Could):** Registrar **custo** da manutenção (campo opcional, **retaguarda apenas**) — insumo para a Onda 3.

### Operador

- **RF-009 (Should):** Exibir ao operador, no equipamento, um indicador quando a manutenção estiver **próxima/vencida** — **sem custo, sem valor**.

### Transversais

- **RF-010 (Must):** O eventual campo de **custo** nunca é exibido/carregado no app do operador. O restante (status, horas) é operacional e pode aparecer nos dois ambientes.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** Cálculo de status correto a partir do horímetro e do intervalo.
- **RNF-002 (Segurança de exibição):** Custo de manutenção, se houver, é retaguarda-only.
- **RNF-003 (Clareza do alerta):** O indicador comunica com clareza (cor/ícone) o estado próxima/vencida.
- **RNF-004 (Responsividade):** Desktop (retaguarda) e mobile (operador).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type StatusManutencao = 'em_dia' | 'proxima' | 'vencida'   // derivado do horímetro

interface IPlanoManutencao {
  id: string
  equipamento_id: string | null            // plano de um equipamento
  tipo_equipamento: TipoEquipamento | null // ou por tipo
  descricao: string                        // ex: "Troca de óleo e filtros"
  intervalo_horas: number                  // ex: 250
  ativo: boolean
  created_at: string
  updated_at: string
}

interface IRegistroManutencao {
  id: string
  equipamento_id: string
  plano_id: string
  horimetro_previsto: number               // marca em que era prevista
  horimetro_realizado: number | null       // horímetro no momento da execução
  status: 'prevista' | 'realizada'
  custo: number | null                     // R$ — RETAGUARDA-ONLY (opcional)
  observacao: string | null
  realizada_em: string | null
  created_at: string
  updated_at: string
}
```

> O status `em_dia/proxima/vencida` de um equipamento é **derivado** (horímetro atual vs próxima marca), não armazenado.

---

## Critérios de Aceitação

### RF-004: Cálculo de status

```gherkin
DADO um equipamento com plano de 250h e última manutenção a 1000h
  E horímetro atual em 1245h
QUANDO o status é calculado (próxima marca = 1250h, antecedência 20h)
ENTÃO o equipamento aparece como "próxima" (faltam 5h)
```

### RF-007: Registro reinicia o ciclo

```gherkin
DADO um equipamento "vencido"
QUANDO a retaguarda registra a manutenção realizada no horímetro atual
ENTÃO o status volta para "em dia"
  E a próxima marca é recalculada a partir do horímetro informado
```

### RF-010: Barreira de custo

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO o indicador de manutenção é exibido no equipamento
ENTÃO mostra o status (próxima/vencida) sem qualquer valor de custo
```

### Cenários de Erro / Edge

```gherkin
DADO que nenhum plano foi cadastrado
QUANDO a retaguarda abre /admin/manutencao
ENTÃO é exibido empty state com CTA "Novo plano"
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Planos (retaguarda) | skeleton | "Nenhum plano" + CTA | mensagem + retry | tabela de planos |
| Alertas (retaguarda) | skeleton | "Nada para revisar" | mensagem + retry | lista de próximas/vencidas |
| Indicador no equipamento (operador) | — | — | — | badge de status (sem custo) |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/planos-manutencao.ts` | ~4 planos (por equipamento e por tipo) | 1 inativo, intervalos distintos |
| `src/mocks/registros-manutencao.ts` | ~5 registros | 1 equipamento "vencido", 1 "próxima", 1 recém-realizada, 1 com custo (retaguarda) |

> Derivar de `equipamentos.ts` (PRD-001) usando `horimetro_atual`. Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (planos + registros) + mocks | ~3 |
| 2 | UI: planos + painel de alertas (retaguarda) + indicador (operador) | ~6-8 |
| 3 | Estados de tela + cálculo de status + registro de manutenção | ~4 |
| 4 | Fluxo completo em memória (plano → alerta → registrar → recalcular) + responsividade + barreira de custo | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
- [ ] Definir `IPlanoManutencao`, `IRegistroManutencao`, `StatusManutencao`
- [ ] Criar mocks derivando do horímetro dos equipamentos
**Validação:** Mocks compilam; há equipamento vencido e próximo.

#### Fase 2: UI com Mocks
- [ ] Planos e painel de alertas em `/admin/manutencao`; indicador no equipamento (operador)
**Validação:** Navegação; alertas listados; badge no operador sem custo.

#### Fase 3: Cálculo + Registro
- [ ] Cálculo de status (horímetro vs intervalo, antecedência); registro de manutenção; estados de tela
**Validação:** Status correto; registrar reinicia o ciclo.

#### Fase 4: Fluxo + Barreira
- [ ] Plano → alerta → registrar → recalcular (memória); responsividade
- [ ] Garantir que custo nunca é carregado em `/app/*`
**Validação:** Fluxo completo; custo invisível ao operador.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Cadastros base (equipamentos, `horimetro_atual`) | ⏳ Pendente (documentado) |
| PRD-002 | Apontamento (mantém o horímetro atualizado) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Notificação de alerta (push/WhatsApp) é escopo futuro (PRD-009) |

### Decisões Pendentes

- [ ] **Antecedência** padrão para "próxima" (ex.: 20h antes)?
- [ ] Planos por **equipamento específico** ou por **tipo**? (ou ambos)
- [ ] Um equipamento pode ter **múltiplos planos** (óleo a cada 250h, revisão maior a cada 1000h)?
- [ ] O operador deve poder **sinalizar** que a máquina precisa de reparo (não previsto)?

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 2 — Estrutura"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-001 | Cadastros Base | ⏳ (documentado) | Base (equipamentos) |
| — | PRD-002 | Apontamento de Horímetro | ⏳ (documentado) | Mantém o horímetro |
| **N** | **PRD-010** | **Manutenção Preventiva por Horímetro** | **🔄 ATUAL** | Depende de PRD-001, PRD-002 |
| — | PRD-013 | Custo real da hora-máquina | ⏳ | Consome custo de manutenção (Onda 3) |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Custo de manutenção (R$) | Financeiro sensível | Retaguarda-only; nunca em `/app/*` |
| Status/horas de manutenção | Operacional | Pode aparecer nos dois ambientes |

### Autenticação e Autorização

Config de planos e custo são da retaguarda. O indicador operacional (sem custo) pode aparecer ao operador. No backend, RLS garante o recorte de custo.

### Auditoria

`realizada_em`, `horimetro_realizado`, `created_at`/`updated_at` compõem o histórico de manutenção do equipamento.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Retaguarda] ─▶ /admin/manutencao ─▶ cria plano (250h) ─▶ sistema calcula status por horímetro
[Operador] ─▶ vê badge "revisão próxima" no equipamento
[Retaguarda] ─▶ registra manutenção realizada ─▶ ciclo reinicia
```

### Fluxos de Exceção
- Equipamento vencido → destacado no painel de alertas.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Wrench"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | O alerta é secundário; não impede o apontamento |
| **Fail gracefully** | Falhas simuladas não travam a tela |
| **Preservar evidências** | Histórico de manutenção por equipamento |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Status derivado** | Calcular em_dia/proxima/vencida do horímetro; não armazenar o status |
| **Barreira de custo** | Campo de custo isolado, retaguarda-only; nunca em `/app/*` |
| **Reuso do horímetro** | Ler `horimetro_atual` do equipamento (PRD-001), mantido pelo PRD-002 |
| **Feature-based** | `src/features/manutencao/` |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir custo de manutenção no app do operador |
| Basear manutenção em data em vez de horas |
| Armazenar o status derivado (recalcular sempre) |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-07-01 |
| **Versão do App** | 0.8.0 (Wrench) |
| **Implementado por** | Claude Opus 4.5 via Claude Code CLI |
| **Observações** | Antecedência de "próxima" fixada em 20h (constante, não configurável por plano). Planos por tipo materializam o 1º registro apenas para os equipamentos já existentes no momento do cadastro do plano — equipamentos cadastrados depois não recebem retroativamente um registro "prevista" automático. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
