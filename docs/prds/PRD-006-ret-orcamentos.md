# PRD-006: Orçamentos

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) para o proprietário montar orçamentos a partir das tabelas de preço, antes da execução do serviço |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Ambiente** | Retaguarda (`/admin/*`) — **dado financeiro** |
| **Épico** | Onda 2 — Estrutura |
| **PRDs Relacionados** | PRD-001 (clientes), PRD-005 (preços — base do orçamento), PRD-003 (OS — um orçamento aprovado pode virar OS) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, montagem de itens a partir de preços com CRUD mockado, sem backend e sem integração externa |

---

## Contexto do Problema

Antes de executar um serviço, o Leonardo frequentemente precisa **orçar**: dizer ao cliente quanto custaria a obra. Hoje isso é feito de cabeça ou em papel, sem padronização — e sem reaproveitar as tabelas de preço.

Este PRD entrega a tela onde o proprietário monta um orçamento estruturado: escolhe o cliente, descreve a obra, adiciona itens estimados (horas de equipamento ou metros de fundação) puxando os valores do PRD-005, e o sistema calcula o total. O orçamento tem um ciclo (rascunho → enviado → aprovado/recusado) e, quando aprovado, pode dar origem a uma OS (PRD-003).

É a porta de entrada do funil comercial — e, por lidar com valores, vive **só na retaguarda**.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Será adicionada a rota `/admin/orcamentos`.

### Situação Desejada (To-Be)

A retaguarda passa a ter um CRUD mockado de orçamentos, com itens calculados a partir dos preços (PRD-005) e um ciclo de status. Um orçamento aprovado é candidato a virar OS (vínculo opcional). Os `types` aqui são o contrato que a futura conversão em OS consome.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Orçar fora do sistema (planilha) | Não reaproveita preços nem vira OS; perde rastreabilidade |
| Orçamento = OS desde o início | Orçamento é estimativa pré-venda; OS é execução. São estágios distintos |
| Mostrar orçamento ao operador | Viola a barreira financeira |

---

## Escopo

### Incluído

- ✅ CRUD mockado de **orçamentos**
- ✅ Montagem de **itens** a partir das tabelas de preço (PRD-005): hora-máquina (seca/operada) e por metro
- ✅ Cálculo do **valor total** estimado (+ mobilização)
- ✅ Ciclo de status: `rascunho → enviado → aprovado / recusado`
- ✅ **Validade** do orçamento (data limite)
- ✅ Vínculo opcional do orçamento **aprovado → OS** (PRD-003)
- ✅ `types` (contrato): `IOrcamento`, `IOrcamentoItem` (+ `StatusOrcamento`)
- ✅ Mocks, estados de tela, validações; **retaguarda apenas**

### Excluído

- ❌ Geração da OS em si (apenas o vínculo/handoff) — fluxo da OS é o **PRD-003**
- ❌ Envio do orçamento por e-mail/WhatsApp ao cliente — escopo futuro / PRD-009
- ❌ Nota fiscal, impostos
- ❌ Backend real (Supabase); RLS (fase de backend)
- ❌ Qualquer exibição financeira no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Montagem do Orçamento

- **RF-001 (Must):** Criar orçamento informando cliente (PRD-001) e descrição da obra.
- **RF-002 (Must):** Adicionar **itens** ao orçamento, escolhendo o tipo (hora-máquina ou por metro) e puxando o valor do PRD-005; informar quantidade estimada.
- **RF-003 (Must):** Calcular o **valor total** = soma dos itens (+ mobilização, se houver).
- **RF-004 (Should):** Definir **validade** (data) do orçamento.
- **RF-005 (Should):** Editar/remover itens enquanto em `rascunho`.

### Ciclo

- **RF-006 (Must):** Marcar o orçamento como **enviado** (status `enviado`).
- **RF-007 (Must):** Registrar o desfecho: **aprovado** ou **recusado**.
- **RF-008 (Could):** A partir de um orçamento **aprovado**, iniciar a criação de uma **OS** (PRD-003) já preenchida com cliente/obra/itens.

### Listagem

- **RF-009 (Must):** Listar orçamentos com cliente, valor, validade e status.
- **RF-010 (Should):** Filtrar por status, cliente e período.

### Transversais

- **RF-011 (Must):** Toda a tela vive na retaguarda (`/admin/orcamentos`). **Nunca** acessível ou carregada em `/app/*`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** Cálculo exato; valores em R$ com 2 casas.
- **RNF-002 (Segurança de exibição):** Nenhum dado de orçamento é importado/renderizado no ambiente do operador.
- **RNF-003 (Reaproveitamento):** Itens espelham a estrutura de itens do faturamento (PRD-004) para consistência.
- **RNF-004 (Responsividade):** Desktop e mobile (tabela → cards).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type StatusOrcamento = 'rascunho' | 'enviado' | 'aprovado' | 'recusado'

interface IOrcamentoItem {
  id: string
  descricao: string            // ex: "Escavadeira 18t — estimativa 40h operada"
  tipo: ModeloCobranca         // 'hora_maquina' | 'por_metro'
  quantidade_estimada: number  // horas ou metros
  valor_unitario: number       // R$/h ou R$/m (do PRD-005)
  valor_total: number          // quantidade_estimada × valor_unitario
}

interface IOrcamento {
  id: string
  numero: string               // legível, ex: "ORC-2026-0042"
  cliente_id: string           // FK → ICliente (PRD-001)
  descricao_obra: string
  itens: IOrcamentoItem[]
  valor_total: number          // soma dos itens (+ mobilização)
  validade: string | null      // data limite (ISO)
  status: StatusOrcamento
  os_id: string | null         // preenchido se virar OS (PRD-003)
  observacao: string | null
  enviado_em: string | null
  decidido_em: string | null   // quando aprovado/recusado
  created_at: string
  updated_at: string
}
```

> O item do orçamento espelha o item do faturamento (PRD-004) — mesma estrutura, contexto pré-venda (`quantidade_estimada` em vez de realizada).

---

## Critérios de Aceitação

### RF-001 / RF-002 / RF-003: Montar orçamento

```gherkin
DADO que o proprietário está em /admin/orcamentos
QUANDO cria um orçamento para um cliente e adiciona um item "40h operada" de uma escavadeira
ENTÃO o item exibe 40 × valor_hora_operada
  E o valor total reflete a soma dos itens
```

### RF-007: Desfecho

```gherkin
DADO um orçamento "enviado"
QUANDO o proprietário registra "aprovado"
ENTÃO o status muda para "aprovado"
  E fica disponível a ação de gerar OS a partir dele
```

### RF-011: Barreira financeira (segurança)

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum dado de orçamento é exibido ou carregado
```

### Cenários de Erro / Edge

```gherkin
DADO um orçamento sem nenhum item
QUANDO o proprietário tenta marcá-lo como "enviado"
ENTÃO a ação é bloqueada com aviso (orçamento vazio)

DADO que não há orçamentos
QUANDO o proprietário abre /admin/orcamentos
ENTÃO é exibido empty state com CTA "Novo orçamento"
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista de Orçamentos | skeleton | "Nenhum orçamento" + CTA | mensagem + retry | tabela com status/valor/validade |
| Detalhe / Edição | skeleton | "Sem itens ainda" | mensagem + retry | itens + total + ações de ciclo |
| Formulário de item | — | — | erro inline | item somado ao total |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/orcamentos.ts` | ~5 orçamentos (mix de status) | 1 `rascunho` vazio, 1 `enviado`, 1 `aprovado` com `os_id`, 1 `recusado`, 1 com validade vencida |

> Derivar de `clientes.ts` (PRD-001) e `precos-*.ts` (PRD-005). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (`IOrcamento`, `IOrcamentoItem`) + mocks | ~3 |
| 2 | UI: lista, detalhe/edição, montagem de itens a partir de preços | ~7-9 |
| 3 | Estados de tela + cálculo + ciclo de status + validações | ~4 |
| 4 | Fluxo completo em memória (montar → enviar → aprovar/recusar → handoff OS) + responsividade + barreira "nada no operador" | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
**Objetivo:** Definir types e mocks.
**Ações:**
- [ ] Definir `IOrcamento`, `IOrcamentoItem`, `StatusOrcamento`
- [ ] Criar `src/mocks/orcamentos.ts` com edge cases
**Validação:** Mocks compilam e respeitam os types.

#### Fase 2: UI com Mocks
**Objetivo:** Telas de orçamento.
**Ações:**
- [ ] Lista, detalhe/edição e montagem de itens (puxando preços) em `/admin/orcamentos`
**Validação:** Navegação completa; itens calculados.

#### Fase 3: Cálculo + Ciclo
**Objetivo:** Cálculo, estados e ciclo.
**Ações:**
- [ ] Total + mobilização; loading/empty/error/success; transições de status; bloqueio de envio vazio
**Validação:** Ciclo e cálculo demonstráveis.

#### Fase 4: Fluxo + Handoff
**Objetivo:** Fluxo ponta a ponta.
**Ações:**
- [ ] Montar → enviar → aprovar/recusar (memória); handoff para criar OS; responsividade
- [ ] Garantir que nada de orçamento é importado em `/app/*`
**Validação:** Fluxo completo; barreira financeira intacta.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Cadastros base (clientes) | ⏳ Pendente (documentado) |
| PRD-005 | Tabela de Preços (base dos itens) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Envio ao cliente é escopo futuro (PRD-009) |

### Decisões Pendentes

- [ ] **Validade** padrão do orçamento (ex.: 15/30 dias)?
- [ ] Ao aprovar, a OS é criada **automaticamente** ou só com confirmação?
- [ ] Há **desconto** / condição comercial no orçamento?
- [ ] Numeração do orçamento: formato e origem.

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 2 — Estrutura"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-001 | Cadastros Base | ⏳ (documentado) | Base (clientes) |
| — | PRD-005 | Tabela de Preços | ⏳ (documentado) | Base dos itens |
| **N** | **PRD-006** | **Orçamentos** | **🔄 ATUAL** | Depende de PRD-001, PRD-005 |
| — | PRD-003 | Ordem de Serviço | ⏳ (documentado) | Destino de orçamento aprovado |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Orçamentos e valores (R$) | Comercial sensível | Retaguarda apenas; no backend, RLS por perfil |

### Autenticação e Autorização

Orçamento é da retaguarda (proprietário; recepção conforme política). Operador jamais acessa. Em Frontend First, a barreira é por ambiente/rota.

### Auditoria

`enviado_em`, `decidido_em`, `created_at`, `updated_at` compõem a trilha comercial.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Proprietário] ─▶ /admin/orcamentos ─▶ "Novo" (cliente, obra) ─▶ adiciona itens (preços) ─▶ envia ─▶ aprovado ─▶ (gera OS)
```

### Fluxos de Exceção
- Enviar orçamento vazio → bloqueado com aviso.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Quote"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Operações secundárias não impedem o core |
| **Fail gracefully** | Falhas simuladas não travam a tela |
| **Preservar evidências** | Manter histórico de status |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Barreira financeira** | `src/features/orcamentos/` nunca importado em `/app/*` |
| **Reuso de item** | Reaproveitar a estrutura de item do faturamento (PRD-004) |
| **Cálculo isolado** | Reutilizar o utilitário de cálculo/máscara monetária |
| **Contrato primeiro** | Definir types antes da UI |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir, importar ou renderizar orçamento/valores no app do operador |
| Construir o fluxo completo da OS aqui (é o PRD-003) |
| Hardcodar valores ou cálculos |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
