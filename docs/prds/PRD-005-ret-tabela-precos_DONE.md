# PRD-005: Tabela de Preços (Hora-Máquina e Por Metro)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) para o proprietário gerenciar os preços que alimentam orçamento e faturamento — sem nunca expô-los ao operador |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Ambiente** | Retaguarda (`/admin/*`) — **dado financeiro** |
| **Épico** | Onda 1 — Fundação |
| **PRDs Relacionados** | PRD-001 (equipamentos), PRD-004 (faturamento — consome os preços), PRD-006 (orçamentos — consome os preços) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, dois modelos de preço com CRUD mockado, sem backend e sem integração externa |

---

## Contexto do Problema

O Leonardo **centraliza todas as decisões comerciais**. Hoje os preços vivem na cabeça dele e em negociações pontuais. Para que o sistema consiga faturar (PRD-004) e montar orçamentos (PRD-006), os preços precisam existir de forma estruturada — mas sob controle exclusivo da retaguarda.

A empresa cobra de **duas formas distintas**:
1. **Hora-máquina** — valor por hora de equipamento (lido do horímetro). O valor muda conforme a máquina seja **seca** (sem operador) ou **operada** (com operador).
2. **Por metro (fundação/estaqueamento)** — valor por metro perfurado, que **varia conforme o diâmetro da broca**.

Este PRD entrega a tela onde o proprietário cadastra e mantém essas tabelas. É o único lugar do MVP onde valores em reais são geridos — e, por isso, vale **exclusivamente na retaguarda**: nenhum centavo disso pode aparecer no app do operador.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Não há rota de preços no scaffold; será adicionada em `/admin/precos`.

### Situação Desejada (To-Be)

A retaguarda passa a ter um CRUD mockado das tabelas de preço: **hora-máquina** (com valores seca/operada) e **por metro** (por diâmetro de broca), além de um valor opcional de **mobilização/desmobilização** (transporte). Os `types` aqui são o contrato que o faturamento (PRD-004) e os orçamentos (PRD-006) consomem.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Um único campo de "preço" por equipamento | Ignora seca×operada e o modelo por metro; o domínio tem dois modelos distintos |
| Preço fixo no código | Preço é decisão comercial viva do dono; precisa ser editável |
| Preço também no app do operador (para ele ver o valor do serviço) | Viola a restrição comercial rígida — operador nunca vê valores |

---

## Escopo

### Incluído

- ✅ CRUD mockado de **preço hora-máquina** (valor seca + valor operada)
- ✅ CRUD mockado de **preço por metro** (por diâmetro de broca)
- ✅ CRUD mockado de **preço de mobilização/desmobilização** (transporte) — opcional
- ✅ `types` (contrato): `IPrecoHoraMaquina`, `IPrecoFundacao`, `IPrecoMobilizacao`
- ✅ Mocks espelhando o schema futuro, com edge cases
- ✅ Estados de tela e validação (valores positivos)
- ✅ Restrição de ambiente: **somente retaguarda**, nunca operador

### Excluído

- ❌ Cálculo de faturamento (aplicar preço × horas/metros) — é o **PRD-004**
- ❌ Montagem de orçamento — é o **PRD-006**
- ❌ Backend real (Supabase) e controle de acesso por RLS (vem na fase de backend)
- ❌ Histórico/versionamento de preços (reajustes ao longo do tempo) — escopo futuro
- ❌ Qualquer exibição de valores no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Preço Hora-Máquina

- **RF-001 (Must):** Listar preços de hora-máquina exibindo o vínculo (equipamento ou tipo), valor seca e valor operada.
- **RF-002 (Must):** Cadastrar preço hora-máquina com **valor seca** e **valor operada**.
- **RF-003 (Must):** Editar preço hora-máquina.
- **RF-004 (Should):** Inativar um preço (sem apagar — pode ser referenciado por faturamentos futuros).

### Preço Por Metro (Fundação)

- **RF-005 (Must):** Listar preços por metro exibindo diâmetro da broca e valor por metro.
- **RF-006 (Must):** Cadastrar preço por metro (diâmetro + valor/metro).
- **RF-007 (Must):** Editar preço por metro.
- **RF-008 (Should):** Inativar preço por metro.

### Mobilização (opcional)

- **RF-009 (Could):** Cadastrar/editar valores de mobilização/desmobilização (descrição + valor).

### Transversais

- **RF-010 (Must):** Validar que todos os valores monetários são **positivos**; bloquear salvar caso contrário.
- **RF-011 (Must):** Toda a tela vive na retaguarda (`/admin/precos`). **Nunca** acessível em `/app/*`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Segurança de exibição):** Valores monetários jamais são importados/renderizados por componentes do ambiente do operador.
- **RNF-002 (Formato monetário):** Valores em Real (R$), com duas casas decimais; entrada com máscara apropriada.
- **RNF-003 (Responsividade):** Funciona em desktop e mobile (tabela → cards). Validar 375/768/1280px.
- **RNF-004 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
// O vínculo do preço hora-máquina pode ser por equipamento OU por tipo (decisão pendente).
interface IPrecoHoraMaquina {
  id: string
  equipamento_id: string | null            // preço de um equipamento específico
  tipo_equipamento: TipoEquipamento | null  // ou preço por tipo
  valor_hora_seca: number                   // R$/h sem operador
  valor_hora_operada: number                // R$/h com operador
  ativo: boolean
  created_at: string
  updated_at: string
}

// Fundação/estaqueamento: varia por diâmetro da broca.
interface IPrecoFundacao {
  id: string
  diametro_broca_mm: number                 // ex: 300, 400, 500
  valor_metro: number                       // R$/m
  descricao: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

// Transporte do equipamento até/da obra (opcional).
interface IPrecoMobilizacao {
  id: string
  descricao: string                         // ex: "Mobilização escavadeira até 50km"
  valor: number                             // R$
  ativo: boolean
  created_at: string
  updated_at: string
}
```

> **Decisão pendente embutida no contrato:** o preço hora-máquina aceita vínculo por `equipamento_id` **ou** por `tipo_equipamento` (um dos dois preenchido). Qual usar é decisão do Leonardo (ver Perguntas em Aberto).

---

## Critérios de Aceitação

### RF-002: Cadastrar preço hora-máquina

```gherkin
DADO que o proprietário está em /admin/precos
QUANDO cadastra um preço hora-máquina com valor seca e valor operada positivos
ENTÃO o preço aparece na lista de hora-máquina
  E exibe os dois valores distintamente
```

### RF-006: Cadastrar preço por metro

```gherkin
DADO o formulário de preço por metro
QUANDO o proprietário informa diâmetro da broca e valor por metro
ENTÃO o preço aparece na lista de fundação vinculado ao diâmetro
```

### RF-010: Validação de valor

```gherkin
DADO o formulário de qualquer preço
QUANDO um valor é zero ou negativo
ENTÃO salvar é bloqueado
  E o campo recebe feedback inline
```

### RF-011: Restrição de ambiente (segurança)

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum valor de preço é exibido ou sequer carregado
```

### Cenários de Erro / Edge

```gherkin
DADO que nenhuma tabela de preço foi cadastrada
QUANDO o proprietário abre /admin/precos
ENTÃO é exibido empty state com CTA para cadastrar o primeiro preço
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista Hora-Máquina | skeleton | "Nenhum preço cadastrado" + CTA | mensagem + retry | tabela/cards com seca/operada |
| Lista Por Metro | skeleton | "Nenhum preço por metro" + CTA | mensagem + retry | tabela/cards por diâmetro |
| Formulário (criar/editar) | botão com spinner | — | toast de erro, mantém dados | toast de sucesso + volta à lista |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/precos-hora-maquina.ts` | ~5 preços (mix de por-equipamento e por-tipo) | 1 inativo, 1 com seca = operada, 1 de tipo sem equipamento específico |
| `src/mocks/precos-fundacao.ts` | ~3 diâmetros (ex: 300/400/500mm) | 1 inativo, valores distintos por diâmetro |
| `src/mocks/precos-mobilizacao.ts` | ~2 itens | 1 com descrição longa |

> Reutilizar `equipamentos.ts` (PRD-001) para o vínculo. Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (3 contratos de preço) + mocks | ~4 |
| 2 | UI: listas + formulários dos modelos de preço | ~6-8 |
| 3 | Estados de tela + validações (valores positivos, máscara monetária) | ~3 |
| 4 | Fluxo CRUD em memória + responsividade + verificação da barreira "nada no operador" | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
**Objetivo:** Definir os 3 types de preço e popular mocks.
**Ações:**
- [ ] Definir `IPrecoHoraMaquina`, `IPrecoFundacao`, `IPrecoMobilizacao`
- [ ] Criar os mocks com edge cases
**Validação:** Mocks compilam e respeitam os types.

#### Fase 2: UI com Mocks
**Objetivo:** Telas de gestão dos preços.
**Ações:**
- [ ] Listas e formulários (hora-máquina, por metro, mobilização) em `/admin/precos`
**Validação:** Navegação e renderização dos preços mockados.

#### Fase 3: Estados + Validação
**Objetivo:** Estados de tela e regras de valor.
**Ações:**
- [ ] Loading/empty/error/success; validação de valores positivos; máscara R$
**Validação:** Salvar inválido é bloqueado; estados demonstráveis.

#### Fase 4: Fluxo + Barreira
**Objetivo:** CRUD funcional e garantia de não-vazamento.
**Ações:**
- [ ] CRUD em memória; responsividade
- [ ] Garantir que nenhum mock/components de preço é importado em `/app/*`
**Validação:** Fluxo completo; nenhuma referência financeira no ambiente do operador.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Cadastros base (equipamentos) — vínculo do preço por equipamento | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum | — | Frontend First / mockado |

### Decisões Pendentes

- [ ] Preço hora-máquina é por **equipamento específico** ou por **tipo de equipamento**? (ou ambos coexistem?)
- [ ] Existe diferença de preço além de **seca × operada** (ex: faixa de horas, turno, hora extra)?
- [ ] **Mobilização** é valor fixo, por distância (km) ou por equipamento?
- [ ] Haverá **reajuste/histórico** de preços (versionar) ou sempre vale o preço atual?

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 1 — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-001 | Cadastros Base | ⏳ (documentado) | Base |
| **N** | **PRD-005** | **Tabela de Preços** | **🔄 ATUAL** | Depende de PRD-001 |
| N+1 | PRD-004 | Faturamento ao fechar OS | ⏳ | Consome os preços |
| N+1 | PRD-006 | Orçamentos | ⏳ | Consome os preços |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Tabelas de preço (R$) | **Comercial sensível** | Retaguarda apenas; no backend, RLS restringindo a `proprietário/admin` (e leitura à recepção para faturar) |

### Autenticação e Autorização

Gestão de preços é do perfil **proprietário/admin**. A recepção pode ter leitura (para faturar), mas a edição é do dono. Em Frontend First, a separação é por ambiente/rota; RLS entra no backend.

### Auditoria

`created_at`/`updated_at` no contrato. No backend, alterações de preço são candidatas a log de auditoria (quem mudou, quando).

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Proprietário] ─▶ /admin/precos ─▶ aba (hora-máquina | por metro | mobilização) ─▶ "Novo" ─▶ preenche e salva ─▶ aparece na lista
```

### Fluxos de Exceção
- Valor zero/negativo → salvar bloqueado + feedback inline.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Tariff"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Operações secundárias não impedem o core |
| **Fail gracefully** | Falhas simuladas não travam a tela |
| **Preservar evidências** | Manter histórico de alteração no backend (futuro) |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Barreira financeira** | Centralizar preço em `src/features/precos/`; jamais importar nada disso em código de `/app/*` |
| **Máscara monetária** | Entrada e exibição em R$ com 2 casas; usar utilitário compartilhado |
| **Contrato primeiro** | Definir os 3 types antes da UI — PRD-004 e PRD-006 consomem |
| **Soft delete** | Inativar preços, não apagar (serão referenciados por faturamentos) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Expor, importar ou renderizar valores de preço no ambiente do operador |
| Calcular faturamento aqui (é o PRD-004) |
| Hardcodar valores de preço |
| Hard delete de preços |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-28 |
| **Versão do App** | 0.3.0 (Tariff) |
| **Implementado por** | Claude Opus 4.8 (Claude Code CLI) |
| **Observações** | Frontend First / mockado. Vínculo hora-máquina por equipamento OU tipo. 3 abas (inclui mobilização). Types sem prefixo `I` p/ consistência. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
