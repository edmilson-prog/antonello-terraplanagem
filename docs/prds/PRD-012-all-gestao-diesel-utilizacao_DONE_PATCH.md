# PRD-012: Gestão de Diesel e Utilização

> **🔧 PATCH v2 — nota corrigida (2026-07-02).**
> Este arquivo foi originalmente criado pelo Agente Arquiteto **afirmando incorretamente** que o PRD-012 já estava implementado. Na verdade, na época, não havia nenhuma pasta `src/features/diesel`, commit ou entrada no CHANGELOG — o PRD estava genuinamente pendente.
>
> **Situação real:** o PRD-012 foi implementado em 2026-07-02, versão 0.10.0 (Fuel), via Claude Code/SDD. A clarificação de RF-003 abaixo (abastecimento do operador como ação secundária do fluxo de apontamento, sem novo item no bottom nav) **foi incorporada diretamente na implementação original** — não como um patch pós-hoc.


> **⚠️ Camada analítica (Fase 4 / dependente de dados reais).** O painel é mockável agora, mas os números só fazem sentido com abastecimentos e horas reais alimentados. É insumo do custo (PRD-013).

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) para registrar abastecimentos de diesel por equipamento e exibir indicadores de consumo e utilização |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Baixa |
| **Ambiente** | Transversal (`all`) — operador registra abastecimento; retaguarda vê indicadores |
| **Épico** | Onda 3 — Acabamento |
| **PRDs Relacionados** | PRD-001 (equipamentos), PRD-002 (horímetro/horas — base da utilização), PRD-013 (custo — consome consumo de diesel) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, registro + indicadores derivados, CRUD mockado, sem backend e sem integração externa |

---

## Contexto do Problema

Diesel é um dos **maiores custos variáveis** da terraplanagem — e hoje é um "buraco negro": abastece-se, mas não se sabe quanto cada máquina consome por hora trabalhada. Sem esse dado, não há como calcular o custo real da hora-máquina (PRD-013) nem a rentabilidade (PRD-014).

Este PRD entrega o registro dos **abastecimentos** (litros por equipamento) e os **indicadores** derivados: consumo médio (litros/hora) e utilização (quanto cada máquina roda). É a **camada de insumo** da pirâmide analítica da Onda 3.

O registro do abastecimento pode acontecer em campo (o operador informa os litros ao abastecer); os indicadores ficam na retaguarda. O **custo em R$** do diesel é retaguarda-only; os **litros e as horas** são operacionais.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Serão adicionadas telas em `/admin/diesel` (indicadores) e um registro de abastecimento acessível ao operador.

### Situação Desejada (To-Be)

Registra-se cada abastecimento (equipamento, litros, horímetro do momento). O sistema cruza os litros com as horas (do horímetro/PRD-002) para derivar **consumo médio (l/h)** e **utilização**. A retaguarda vê os indicadores por equipamento e por período.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Controlar diesel só no total (sem por equipamento) | Impede custo/rentabilidade por máquina |
| Registrar litros sem horímetro | Sem o horímetro no abastecimento não se calcula consumo por hora |
| Deixar diesel só na retaguarda | O abastecimento acontece em campo; registrar lá é mais fiel |

---

## Escopo

### Incluído

- ✅ Registrar **abastecimento** (equipamento, litros, horímetro no momento, data)
- ✅ Indicador de **consumo médio** (litros/hora) por equipamento
- ✅ Indicador de **utilização** (horas trabalhadas por período, do PRD-002)
- ✅ Registro do **custo do diesel** (R$/litro ou total) — **retaguarda-only** (insumo do PRD-013)
- ✅ Registro de abastecimento acessível ao **operador** (litros/horímetro, **sem custo**)
- ✅ `types` (contrato): `IAbastecimento` (+ indicadores derivados)
- ✅ Mocks, estados de tela, validações

### Excluído

- ❌ Cálculo do **custo da hora-máquina** (usa o diesel, mas é o PRD-013)
- ❌ Rentabilidade (PRD-014)
- ❌ Integração com bomba/posto ou telemetria — escopo futuro
- ❌ Backend real (Supabase)
- ❌ Exibir **custo** de diesel no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Registro

- **RF-001 (Must):** Registrar abastecimento com equipamento, litros e horímetro no momento.
- **RF-002 (Should):** Registrar o custo (R$/litro ou total) do abastecimento — **retaguarda-only**.
- **RF-003 (Must):** O operador pode registrar abastecimento (litros/horímetro), **sem qualquer valor** — como **ação secundária** acessível do Início (`/app`) e do fluxo de apontamento, **sem novo item no bottom nav** (que permanece com 4 itens, conforme o `CLAUDE.md`).
- **RF-004 (Must):** Listar abastecimentos por equipamento e período.

### Indicadores

- **RF-005 (Must):** Calcular **consumo médio (litros/hora)** por equipamento, cruzando litros com a variação de horímetro/horas (PRD-002).
- **RF-006 (Should):** Exibir **utilização** (horas trabalhadas por período) por equipamento.
- **RF-007 (Could):** Comparar consumo entre equipamentos (ranking).

### Transversais

- **RF-008 (Must):** O **custo** do diesel nunca é exibido/carregado no app do operador; litros e horas são operacionais e podem aparecer nos dois ambientes.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** Consumo/utilização calculados corretamente a partir de litros e horas.
- **RNF-002 (Segurança de exibição):** Custo de diesel é retaguarda-only.
- **RNF-003 (Clareza):** Indicadores apresentados de forma legível (números + gráfico simples).
- **RNF-004 (Responsividade):** Registro mobile-friendly (operador); indicadores desktop (retaguarda).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
interface IAbastecimento {
  id: string
  equipamento_id: string          // FK → IEquipamento (PRD-001)
  operador_id: string | null      // quem registrou (se em campo)
  litros: number
  horimetro_no_abastecimento: number
  custo_total: number | null      // R$ — RETAGUARDA-ONLY (opcional)
  custo_por_litro: number | null  // R$/l — RETAGUARDA-ONLY (opcional)
  local: string | null            // posto/obra
  data: string                    // ISO
  created_at: string
  updated_at: string
}

// Indicadores são DERIVADOS (não armazenados):
// consumo_medio_l_h = litros no período / horas trabalhadas no período
// utilizacao = horas trabalhadas por período (dos apontamentos, PRD-002)
```

> Consumo e utilização são **calculados** a partir de abastecimentos + apontamentos; não são campos persistidos.

---

## Critérios de Aceitação

### RF-001 / RF-005: Registro e consumo

```gherkin
DADO abastecimentos de uma escavadeira e as horas trabalhadas no período (PRD-002)
QUANDO os indicadores são calculados
ENTÃO o consumo médio (litros/hora) do equipamento é exibido
```

### RF-003 / RF-008: Operador sem custo

```gherkin
DADO o operador registrando um abastecimento em campo
QUANDO informa litros e horímetro
ENTÃO o registro é salvo
  E nenhum campo de custo (R$) é exibido no app do operador
```

### Cenários de Erro / Edge

```gherkin
DADO um abastecimento com litros zero ou horímetro menor que o anterior
QUANDO se tenta salvar
ENTÃO a ação é bloqueada com aviso

DADO que não há abastecimentos
QUANDO a retaguarda abre /admin/diesel
ENTÃO é exibido empty state explicativo
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Indicadores (retaguarda) | skeleton | "Sem dados de diesel" | mensagem + retry | números + gráfico de consumo/utilização |
| Lista de abastecimentos | skeleton | "Nenhum abastecimento" + CTA | mensagem + retry | tabela por equipamento/período |
| Registro (operador) | botão com spinner | — | erro inline | toast de sucesso (sem custo) |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/abastecimentos.ts` | ~8 abastecimentos (vários equipamentos/datas) | 1 sem custo (registrado por operador), 1 com litros alto, sequência coerente de horímetro |

> Derivar de `equipamentos.ts` (PRD-001) e cruzar com `apontamentos.ts` (PRD-002). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (`IAbastecimento`) + mocks | ~2 |
| 2 | UI: registro (operador + retaguarda) + painel de indicadores | ~6-8 |
| 3 | Estados de tela + cálculo de consumo/utilização + validações | ~4 |
| 4 | Fluxo completo em memória + gráficos + responsividade + barreira de custo | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
- [ ] Definir `IAbastecimento`
- [ ] Criar `src/mocks/abastecimentos.ts` coerente com horímetro/apontamentos
**Validação:** Mocks compilam; sequência de horímetro consistente.

#### Fase 2: UI com Mocks
- [ ] Registro de abastecimento (operador sem custo; retaguarda com custo) + painel `/admin/diesel`
**Validação:** Registro funciona; indicadores exibidos.

#### Fase 3: Cálculo + Estados
- [ ] Consumo médio (l/h), utilização; validações; estados de tela
**Validação:** Indicadores corretos; validações ativas.

#### Fase 4: Fluxo + Barreira
- [ ] Registro → indicadores (memória); gráficos; responsividade
- [ ] Garantir que custo nunca é carregado em `/app/*`
**Validação:** Fluxo completo; custo invisível ao operador.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Cadastros base (equipamentos) | ⏳ Pendente (documentado) |
| PRD-002 | Apontamento (horas para a utilização) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Telemetria/bomba é escopo futuro |

### Decisões Pendentes

- [ ] O abastecimento é registrado **por litros** sempre, ou às vezes só por valor (R$)?
- [ ] O operador **de fato** registra abastecimento em campo, ou isso é da retaguarda?
- [ ] "Utilização" deve considerar **disponibilidade** (horas possíveis) ou só horas trabalhadas?
- [ ] Há controle de **estoque próprio** de diesel (comboio/tanque na obra)?

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 3 — Acabamento"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-001 | Cadastros Base | ⏳ (documentado) | Base (equipamentos) |
| — | PRD-002 | Apontamento de Horímetro | ⏳ (documentado) | Horas p/ utilização |
| **1** | **PRD-012** | **Gestão de Diesel e Utilização** | **🔄 ATUAL** | Insumo do custo |
| 2 | PRD-013 | Custo real da hora-máquina | ⏳ | Consome consumo de diesel |
| 3 | PRD-014 | Rentabilidade por equipamento e obra | ⏳ | Depende do custo |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Custo do diesel (R$) | Financeiro sensível | Retaguarda-only; nunca em `/app/*` |
| Litros / horímetro / utilização | Operacional | Pode aparecer nos dois ambientes |

### Autenticação e Autorização

Registro de litros pode ser do operador; custo e indicadores financeiros são da retaguarda. No backend, RLS separa o custo.

### Auditoria

`data`, `horimetro_no_abastecimento`, `operador_id`, `created_at`/`updated_at` compõem o histórico de abastecimento.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Operador] ─▶ registra abastecimento (litros, horímetro) — sem custo
[Retaguarda] ─▶ /admin/diesel ─▶ vê consumo médio (l/h) e utilização por equipamento
```

### Fluxos de Exceção
- Litros zero ou horímetro inconsistente → bloqueado com aviso.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Fuel"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | O registro é simples e não trava o campo |
| **Fail gracefully** | Falhas simuladas não travam a tela |
| **Preservar evidências** | Histórico de abastecimento por equipamento |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Indicadores derivados** | Calcular consumo/utilização; não persistir os indicadores |
| **Barreira de custo** | Campo de custo isolado, retaguarda-only |
| **Reuso** | Cruzar com apontamentos (PRD-002) para as horas |
| **Feature-based** | `src/features/diesel/` |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir custo de diesel no app do operador |
| Calcular custo da hora-máquina aqui (é o PRD-013) |
| Persistir indicadores derivados |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO — *(ao mesclar: preservar data/versão/observações reais do repositório)* |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |
| Jun/2026 | v2 | 🔧 Patch pós-implementação (revisão de consistência) — ver bloco no topo |

---

**AILA - Sistemas Inteligentes**
