# PRD-001: Cadastros Base (Equipamentos, Operadores, Clientes)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) dos cadastros base que todo o resto da Onda 1 referencia: equipamentos, operadores e clientes |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Ambiente** | Retaguarda (`/admin/*`) |
| **Épico** | Onda 1 — Fundação |
| **PRDs Relacionados** | PRD-002 (apontamento), PRD-003 (OS), PRD-004 (faturamento), PRD-005 (preços) — consomem estes cadastros |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, três entidades isoladas com CRUD mockado, sem backend e sem integração externa |

---

## Contexto do Problema

A plataforma inteira gira em torno de três entidades: **equipamentos** (de onde vem o horímetro), **operadores** (quem aponta as horas) e **clientes** (para quem a obra é feita). Apontamento, ordem de serviço e faturamento — tudo referencia esses cadastros.

Hoje esses dados vivem na cabeça do Leonardo e em papéis avulsos. Sem um cadastro digital estruturado, não há como vincular horas a um equipamento, atribuir um operador a uma OS, nem emitir cobrança a um cliente.

Por isso este é o **primeiro PRD de feature**: ele é a base de dados (ainda mockada) que destrava toda a cadeia da Onda 1. Construir os cadastros primeiro também define o **contrato de `types`** que os próximos PRDs vão implementar.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. As rotas `/admin/equipamentos`, `/admin/operadores` e `/admin/clientes` foram criadas no scaffold (Fase 1) apenas como telas-placeholder vazias.

### Situação Desejada (To-Be)

Cada uma das três rotas passa a ter um CRUD completo sobre **dados mockados**: listar, buscar/filtrar, cadastrar, editar e inativar. As telas vivem só na Retaguarda; o App do Operador não as acessa. Os `types` definidos aqui são o contrato estável que mocks (agora) e Supabase (futuro) implementam.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Cadastrar tudo numa única tela genérica | As três entidades têm campos e validações distintos; telas separadas são mais claras e mais próximas do schema futuro |
| Excluir registros fisicamente (hard delete) | Equipamentos/operadores/clientes serão referenciados por apontamentos e OS; excluir quebraria a integridade. Padrão é **inativar** (soft) |
| Adiar cadastros e começar pelo apontamento | Apontamento depende de equipamentos e operadores existentes — inverteria a dependência |

---

## Escopo

### Incluído

- ✅ CRUD mockado de **Equipamentos** (listar, criar, editar, inativar, buscar, filtrar)
- ✅ CRUD mockado de **Operadores** (listar, criar, editar, ativar/inativar, buscar)
- ✅ CRUD mockado de **Clientes** (listar, criar, editar, inativar, buscar)
- ✅ Definição dos `types` (contrato): `IEquipamento`, `IOperador`, `ICliente`
- ✅ Mocks em `src/mocks/` espelhando o schema futuro, com edge cases
- ✅ Estados de tela (loading / empty / error / success) em cada listagem
- ✅ Validação de campos obrigatórios com feedback inline

### Excluído

- ❌ Backend real (Supabase) — fase posterior, após aprovação
- ❌ **Preços / tarifas** de equipamento — é o PRD-005 (e nunca aparece no app do operador)
- ❌ Apontamento de horímetro e seleção de equipamento pelo operador — PRD-002
- ❌ Autenticação real e perfis — login é mockado no scaffold; RLS vem no backend
- ❌ Importação/migração de cadastros do sistema antigo (Farol) — decisão em aberto
- ❌ OCR, fotos de equipamento, anexos

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Equipamentos

- **RF-001 (Must):** Listar equipamentos exibindo, no mínimo: nome, tipo, capacidade, horímetro atual e status.
- **RF-002 (Must):** Cadastrar novo equipamento (nome, tipo, capacidade, horímetro inicial, status; identificador/patrimônio opcional).
- **RF-003 (Must):** Editar equipamento existente.
- **RF-004 (Must):** Inativar equipamento (status → `inativo`) em vez de excluir, preservando o vínculo histórico futuro.
- **RF-005 (Should):** Buscar equipamento por nome ou identificador.
- **RF-006 (Should):** Filtrar lista por tipo e por status.
- **RF-007 (Could):** Excluir definitivamente um equipamento (em Frontend First sempre permitido; no backend, bloquear se houver apontamentos vinculados).

### Operadores

- **RF-008 (Must):** Listar operadores exibindo nome e status (ativo/inativo).
- **RF-009 (Must):** Cadastrar operador (nome; telefone opcional; ativo por padrão).
- **RF-010 (Must):** Editar operador.
- **RF-011 (Must):** Ativar/inativar operador (toggle), preservando histórico.
- **RF-012 (Should):** Buscar operador por nome.

### Clientes

- **RF-013 (Must):** Listar clientes exibindo nome, documento e status.
- **RF-014 (Must):** Cadastrar cliente (nome; documento CPF/CNPJ opcional; telefone opcional; ativo).
- **RF-015 (Must):** Editar cliente.
- **RF-016 (Should):** Validar formato de CPF/CNPJ quando o documento for preenchido.
- **RF-017 (Should):** Buscar cliente por nome ou documento.
- **RF-018 (Should):** Inativar cliente.

### Transversais

- **RF-019 (Must):** Todas as telas de cadastro vivem na Retaguarda (`/admin/*`). O App do Operador não as acessa.
- **RF-020 (Must):** Salvar só com os campos obrigatórios válidos; feedback inline em cada campo inválido.

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listas renderizam em < 1s com até ~200 registros mockados.
- **RNF-002 (Responsividade):** A Retaguarda é desktop-first, mas as telas funcionam no mobile (tabela vira lista/cards). Validar em 375px, 768px, 1280px.
- **RNF-003 (Acessibilidade):** Formulários com `label` associado a cada campo, navegação por teclado e contraste conforme o design system.
- **RNF-004 (Consistência):** Usar os componentes shadcn/ui e os tokens do design system; nada de cor/fonte hardcoded.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Formato espelha o banco futuro (`snake_case`). Trecho ilustrativo do *shape* esperado:

```typescript
type TipoEquipamento =
  | 'escavadeira'
  | 'carregadeira'
  | 'caminhao_cacamba'
  | 'trator_esteira'
  | 'retroescavadeira'
  | 'outro'

type StatusEquipamento = 'ativo' | 'em_manutencao' | 'inativo'

interface IEquipamento {
  id: string
  nome: string                 // ex: "Escavadeira CAT 320 #1"
  tipo: TipoEquipamento
  capacidade: string           // ex: "18t", "20m³" (unidade varia por tipo)
  horimetro_atual: number      // horas, com decimal (ex: 1234.5)
  identificador: string | null // patrimônio/placa (opcional)
  status: StatusEquipamento
  created_at: string           // ISO 8601
  updated_at: string
}

interface IOperador {
  id: string
  nome: string
  telefone: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

interface ICliente {
  id: string
  nome: string                 // razão social ou nome
  documento: string | null     // CPF/CNPJ (opcional nesta fase)
  telefone: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}
```

> `created_at`/`updated_at` já entram no contrato porque viram colunas de auditoria no backend.

---

## Critérios de Aceitação

### RF-002: Cadastrar equipamento

```gherkin
DADO que a recepção está em /admin/equipamentos
QUANDO clica em "Novo equipamento", preenche nome, tipo, capacidade e horímetro inicial válidos e salva
ENTÃO o equipamento aparece na lista com status "ativo"
  E exibe confirmação visual (toast de sucesso)
```

### RF-004: Inativar em vez de excluir

```gherkin
DADO um equipamento ativo na lista
QUANDO a recepção o inativa
ENTÃO o status muda para "inativo"
  E o registro continua na base (apenas filtrado/marcado), não é apagado
```

### RF-016: Validação de documento

```gherkin
DADO o formulário de cliente
QUANDO o documento é preenchido com um CPF/CNPJ de formato inválido
ENTÃO o campo exibe erro inline
  E o botão salvar permanece desabilitado até a correção
```

### RF-005 / RF-006: Busca e filtro

```gherkin
DADO uma lista com equipamentos de tipos e status variados
QUANDO a recepção busca por nome ou aplica o filtro de tipo/status
ENTÃO a lista mostra apenas os registros correspondentes
  E exibe empty state se nenhum corresponder
```

### Cenários de Erro / Edge

```gherkin
DADO o formulário de cadastro com um campo obrigatório vazio
QUANDO a recepção tenta salvar
ENTÃO o salvamento é bloqueado
  E cada campo inválido recebe feedback inline

DADO que ainda não há nenhum registro cadastrado
QUANDO a recepção abre a listagem
ENTÃO é exibido um empty state com texto e CTA "Cadastrar primeiro [entidade]"
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista de Equipamentos | skeleton de tabela/cards | "Nenhum equipamento cadastrado" + CTA | mensagem + botão "Tentar novamente" | tabela/cards com dados |
| Lista de Operadores | skeleton | "Nenhum operador cadastrado" + CTA | mensagem + retry | lista com dados |
| Lista de Clientes | skeleton | "Nenhum cliente cadastrado" + CTA | mensagem + retry | lista com dados |
| Formulário (criar/editar) | botão com spinner ao salvar | — | toast de erro, mantém dados preenchidos | toast de sucesso + volta à lista |

> Em Frontend First, loading/error são simulados (delay e toggle de erro nos mocks) só para exercitar os estados visuais.

---

## Dados Mockados (Frontend First)

> Espelham o schema futuro (`snake_case`) e viram `seed.sql` na fase de backend.

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/equipamentos.ts` | ~8 equipamentos: escavadeira 18t/10t/5t, carregadeira, caminhão caçamba, trator de esteira, retroescavadeira | 1 `em_manutencao`, 1 `inativo`, 1 com nome longo, 1 com horímetro alto (ex: 9876.5), 1 sem identificador |
| `src/mocks/operadores.ts` | ~5 operadores | 1 `inativo`, 1 com nome longo, 1 sem telefone |
| `src/mocks/clientes.ts` | ~4 clientes | 1 sem documento, 1 com CNPJ, 1 com nome longo, 1 `inativo` |

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Preparação: `types` (contrato) + mocks das 3 entidades | ~4 |
| 2 | Componentes de UI com dados mockados (listas + formulários criar/editar) | ~9-12 |
| 3 | Estados de tela (loading/empty/error/success) + validações de formulário | ~3-5 |
| 4 | Integração de fluxo (CRUD em memória sobre os mocks, busca/filtro, navegação lista↔form) + validação visual responsiva | ~3 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks

**Objetivo:** Estabelecer os `types` e popular os mocks.

**Ações:**
- [ ] Definir `IEquipamento`, `IOperador`, `ICliente` (+ unions `TipoEquipamento`, `StatusEquipamento`)
- [ ] Criar `src/mocks/equipamentos.ts`, `operadores.ts`, `clientes.ts` com os edge cases

**Validação:** Os mocks compilam, respeitam os types e cobrem os edge cases listados.

#### Fase 2: UI com Mocks

**Objetivo:** Telas de lista e formulários das três entidades.

**Ações:**
- [ ] Listagens (`/admin/equipamentos`, `/admin/operadores`, `/admin/clientes`) lendo dos mocks
- [ ] Formulários de criar/editar para cada entidade
- [ ] Estrutura por feature em `src/features/` (ex.: `features/equipamentos/`)

**Validação:** É possível navegar pelas três áreas e ver os dados mockados renderizados.

#### Fase 3: Estados + Validação

**Objetivo:** Tratar os quatro estados de tela e validar formulários.

**Ações:**
- [ ] Loading (skeleton), empty (com CTA), error (retry), success em cada lista
- [ ] Validação de campos obrigatórios e de formato (CPF/CNPJ) com feedback inline

**Validação:** Cada estado é demonstrável; salvar inválido é bloqueado com feedback claro.

#### Fase 4: Fluxo + Responsividade

**Objetivo:** CRUD funcional sobre os mocks e validação visual.

**Ações:**
- [ ] Criar/editar/inativar refletindo em memória na lista
- [ ] Busca e filtros (equipamentos por tipo/status)
- [ ] Responsividade (tabela → cards no mobile), validar em 375/768/1280px

**Validação:** Fluxo completo de cada entidade funciona com mocks; responsivo e consistente com o design system.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| — | É a base da Onda 1; não depende de PRD anterior | — |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum | — | Frontend First / mockado |

### Decisões Pendentes

- [ ] O **documento do cliente** (CPF/CNPJ) é obrigatório ou opcional no MVP? (faturamento futuro pode exigir)
- [ ] **Hard delete** deve existir para registros sem vínculo, ou só inativação?
- [ ] **Capacidade** do equipamento fica como texto livre ou vira campo estruturado (valor + unidade)?
- [ ] Confirmar a **frota real** (inconsistência nos áudios) para dimensionar os mocks finais.

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 1 — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-001** | **Cadastros Base** | **🔄 ATUAL** | Base |
| 2 | PRD-002 | Apontamento de horímetro (operador) | ⏳ | Depende de PRD-001 |
| 3 | PRD-003 | Ordem de Serviço colaborativa | ⏳ | Depende de PRD-001, PRD-000 (spike) |
| 4 | PRD-005 | Tabela de preços | ⏳ | Depende de PRD-001 |
| 5 | PRD-004 | Faturamento ao fechar OS | ⏳ | Depende de PRD-003 |

> **Nota:** Implemente na ordem indicada. PRD-001 deve estar ✅ antes de iniciar os dependentes.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Documento do cliente (CPF/CNPJ) | PII | Em Frontend First é mock; no backend, RLS + acesso restrito a recepção/admin |
| Telefone (operador/cliente) | PII | Idem |

### Autenticação e Autorização

Cadastros são **exclusivos da Retaguarda** (perfis `recepção` e `proprietário/admin`). O perfil `operador` não acessa estas telas. Autorização real (RLS) entra na fase de backend; nesta fase, a separação é por rota/ambiente.

### Auditoria

`created_at` e `updated_at` já constam no contrato de `types` desde já, para virarem colunas de auditoria no backend.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Recepção] ──▶ /admin/equipamentos ──▶ "Novo" ──▶ preenche e salva ──▶ aparece na lista (toast de sucesso)
```

1. Recepção abre a listagem da entidade.
2. Sistema exibe a lista (ou empty state com CTA).
3. Recepção clica em "Novo", preenche o formulário.
4. Sistema valida em tempo real; salvar habilita só com campos válidos.
5. Sistema persiste (em memória/mock), volta à lista e confirma.

### Fluxos de Exceção

- Campo obrigatório vazio → salvar bloqueado + feedback inline.
- Documento com formato inválido → erro inline no campo.

### Fluxos de Erro

- Falha simulada ao carregar a lista → estado de erro com botão "Tentar novamente".

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
> - Renomear este arquivo adicionando `_DONE` ao final (ex.: `PRD-001-ret-cadastros-base_DONE.md`)
> - Atualizar o `INDEX-PRDs-antonello.md`
> - Atualizar a seção "Status de Implementação" (status, data, versão, observações)

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto (sugestão para este: **"Ledger"** ou **"Registry"**, por ser a base de cadastros).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos de mudança a documentar:
- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Deprecated** — funcionalidades que serão removidas
- **Removed** — funcionalidades removidas
- **Fixed** — correções de bugs
- **Security** — correções de vulnerabilidades

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Operações secundárias não devem impedir o core |
| **Fail gracefully** | Se captura opcional falhar, prosseguir com dados parciais |
| **Preservar evidências** | Dados parciais ainda são valiosos para auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Contrato primeiro** | Definir os `types` antes dos mocks e da UI — eles são o contrato do PRD-002/003/004/005 |
| **Mock → Seed** | Projetar os mocks pensando que virarão `seed.sql`; incluir os edge cases listados |
| **Soft delete** | Inativar (mudar status) em vez de apagar — registros serão referenciados depois |
| **Feature-based** | Organizar por entidade em `src/features/` (equipamentos, operadores, clientes) |
| **Reuso** | Lista, formulário e estados de tela tendem a repetir entre as 3 entidades — extrair componentes compartilhados em `src/shared/` |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Conectar Supabase ou qualquer backend nesta fase |
| Incluir preço/tarifa de equipamento (é o PRD-005, e nunca aparece no app do operador) |
| Hard delete de registros por padrão |
| Hardcodar cores, fontes ou listas — usar tokens e mocks |
| Expor estas telas no ambiente do operador (`/app/*`) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-28 |
| **Versão do App** | 0.1.0 (Registry) |
| **Implementado por** | Claude Opus 4.8 (Claude Code) |
| **Observações** | CRUD mockado das 3 entidades sobre kit compartilhado (DataList responsiva, FormDialog, ConfirmDialog, store em memória) + testes vitest da lógica pura. Status do equipamento em dois eixos (ativo + operacional). |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
