# PRD-011: Comprovante Assinado pelo Cliente

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) para gerar um comprovante do serviço de uma OS e registrar a confirmação/assinatura do cliente |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Baixa |
| **Ambiente** | Retaguarda (`/admin/*`) — geração/gestão; assinatura conforme decisão (ver Perguntas em Aberto) |
| **Épico** | Onda 2 — Estrutura |
| **PRDs Relacionados** | PRD-003 (OS — origem do comprovante), PRD-001 (clientes) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, geração de documento + captura de assinatura, CRUD mockado, sem backend e sem integração externa |

---

## Contexto do Problema

Quando o serviço termina, é comum o cliente **confirmar/assinar** que foi executado — uma prova de entrega. Hoje isso é papel (ou nada), o que abre espaço para disputa ("não foi isso que combinamos") e atrasa o faturamento.

Este PRD entrega a geração de um **comprovante** a partir de uma OS finalizada (PRD-003), com o resumo do serviço (obra, período, equipamentos, horas/metragem) e o registro da **confirmação/assinatura** do cliente. Reduz atrito na cobrança e dá respaldo ao que foi faturado.

Está diretamente ligado a uma decisão em aberto do discovery — *o cliente assina digitalmente ou basta o aviso por WhatsApp?* — e cobre o caminho da **confirmação/assinatura**.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Será adicionada a rota `/admin/comprovantes`.

### Situação Desejada (To-Be)

A retaguarda gera um comprovante a partir de uma OS finalizada, com o resumo do serviço. O cliente **confirma/assina** (por assinatura em tela ou confirmação), e o comprovante passa a `assinado`, vinculado à OS. Por padrão, o comprovante mostra o **serviço executado** (não valores internos).

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Comprovante em papel | Perde rastreabilidade e agilidade; é a dor atual |
| Só o aviso por WhatsApp (sem assinatura) | É outro caminho (PRD-009); este cobre a confirmação formal |
| Incluir valores no comprovante ao cliente | Fora do escopo/decisão; por padrão o comprovante é do serviço, não do preço interno |

---

## Escopo

### Incluído

- ✅ **Gerar comprovante** a partir de uma OS finalizada (resumo do serviço)
- ✅ **Capturar assinatura/confirmação** do cliente (assinatura em tela + nome do assinante)
- ✅ Ciclo de status: `pendente → assinado / recusado`
- ✅ Listar comprovantes e vinculá-los à OS
- ✅ Conteúdo do comprovante: obra, período, equipamentos, horas/metragem — **sem valores por padrão**
- ✅ `types` (contrato): `IComprovante` (+ `StatusComprovante`)
- ✅ Mocks, estados de tela, validações

### Excluído

- ❌ Envio do comprovante por WhatsApp/e-mail — **PRD-009**
- ❌ Assinatura com validade jurídica/certificado digital (ICP-Brasil) — a avaliar / escopo futuro
- ❌ Geração de PDF final / armazenamento em nuvem — fase de backend
- ❌ Exibir **preço/valor** interno no comprovante (por padrão)
- ❌ Backend real (Supabase)

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Geração

- **RF-001 (Must):** Gerar um comprovante a partir de uma OS **finalizada** (PRD-003), preenchendo o resumo do serviço (obra, período, equipamentos, horas ou metragem).
- **RF-002 (Must):** Exibir o comprovante para conferência antes da assinatura — **sem valores** por padrão.

### Assinatura

- **RF-003 (Must):** **Capturar a assinatura** do cliente (assinatura em tela) e o **nome do assinante**.
- **RF-004 (Must):** Ao assinar, mudar o status para `assinado`; registrar data/hora.
- **RF-005 (Should):** Permitir registrar **recusa** (status `recusado`) com motivo.

### Listagem

- **RF-006 (Must):** Listar comprovantes com OS/cliente, status e data.
- **RF-007 (Should):** A partir da OS, acessar seu comprovante (e vice-versa).

### Transversais

- **RF-008 (Must):** Por padrão, o comprovante **não exibe valores**. Se, por decisão, passar a exibir, isso é conteúdo de retaguarda e **nunca** entra no app do operador com valor.

---

## Requisitos Não-Funcionais

- **RNF-001 (Captura de assinatura):** Assinatura em tela responsiva a toque e mouse; permitir refazer.
- **RNF-002 (Integridade):** O comprovante reflete fielmente o serviço da OS de origem.
- **RNF-003 (Segurança de exibição):** Nenhum valor interno aparece por padrão.
- **RNF-004 (Responsividade):** Desktop e mobile.
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type StatusComprovante = 'pendente' | 'assinado' | 'recusado'

interface IComprovante {
  id: string
  numero: string                 // legível, ex: "CMP-2026-0042"
  os_id: string                  // FK → IOrdemServico (PRD-003)
  cliente_id: string             // FK → ICliente (PRD-001)
  resumo_servico: string         // obra, período, equipamentos, horas/metragem (sem valores)
  assinante_nome: string | null
  assinatura_url: string | null  // imagem da assinatura capturada
  status: StatusComprovante
  motivo_recusa: string | null
  gerado_em: string              // ISO
  assinado_em: string | null
  created_at: string
  updated_at: string
}
```

> O comprovante **deriva** da OS (PRD-003). Não recria os apontamentos — referencia e resume.

---

## Critérios de Aceitação

### RF-001 / RF-002: Gerar comprovante

```gherkin
DADO uma OS finalizada
QUANDO a retaguarda gera o comprovante
ENTÃO ele exibe o resumo do serviço (obra, período, equipamentos, horas)
  E não exibe nenhum valor por padrão
```

### RF-003 / RF-004: Assinatura

```gherkin
DADO um comprovante pendente
QUANDO o cliente assina em tela e informa o nome
ENTÃO o status muda para "assinado"
  E a data/hora e a assinatura ficam registradas
```

### RF-008: Sem valores / barreira

```gherkin
DADO o comprovante padrão
QUANDO é exibido para assinatura
ENTÃO nenhum preço/valor interno é mostrado
```

### Cenários de Erro / Edge

```gherkin
DADO uma OS ainda não finalizada
QUANDO se tenta gerar o comprovante
ENTÃO a ação é bloqueada com aviso (OS não finalizada)

DADO que não há comprovantes
QUANDO a retaguarda abre /admin/comprovantes
ENTÃO é exibido empty state explicativo
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista de Comprovantes | skeleton | "Nenhum comprovante" | mensagem + retry | tabela com OS/status/data |
| Comprovante / Assinatura | skeleton | — | erro inline | resumo + pad de assinatura + confirmar |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/comprovantes.ts` | ~5 comprovantes | 1 `pendente`, 1 `assinado` (com nome/assinatura), 1 `recusado` com motivo, 1 de OS por metro |

> Derivar de `ordens-servico.ts` (PRD-003) e `clientes.ts` (PRD-001). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (`IComprovante`) + mocks | ~2 |
| 2 | UI: geração do comprovante + tela de assinatura + lista | ~6-8 |
| 3 | Estados de tela + captura de assinatura + ciclo de status | ~4 |
| 4 | Fluxo completo em memória (gerar → assinar/recusar → vincular à OS) + responsividade | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
- [ ] Definir `IComprovante`, `StatusComprovante`
- [ ] Criar `src/mocks/comprovantes.ts` com edge cases
**Validação:** Mocks compilam e respeitam o type.

#### Fase 2: UI com Mocks
- [ ] Geração (resumo da OS), tela de assinatura e lista em `/admin/comprovantes`
**Validação:** Navegação; resumo correto; pad de assinatura presente.

#### Fase 3: Assinatura + Ciclo
- [ ] Captura de assinatura (toque/mouse, refazer); status pendente→assinado/recusado; estados de tela
**Validação:** Assinatura registrada; ciclo demonstrável.

#### Fase 4: Fluxo + Vínculo
- [ ] Gerar → assinar/recusar → vincular à OS (memória); responsividade
- [ ] Bloquear geração de OS não finalizada
**Validação:** Fluxo completo; sem valores por padrão.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-003 | Ordem de Serviço (origem do comprovante) | ⏳ Pendente (documentado) |
| PRD-001 | Cadastros base (clientes) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Envio ao cliente é o PRD-009; certificação digital a avaliar |

### Decisões Pendentes

- [ ] **Onde o cliente assina?** No dispositivo do operador em campo, por um **link** enviado, ou presencialmente na retaguarda? (impacta se toca `/app/*`)
- [ ] A assinatura precisa de **validade jurídica** (certificado/ICP-Brasil) ou basta confirmação simples?
- [ ] O comprovante deve exibir **valores** ao cliente, ou apenas o serviço executado?
- [ ] Numeração do comprovante: formato e origem.

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 2 — Estrutura"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-003 | Ordem de Serviço | ⏳ (documentado) | Origem do comprovante |
| **N** | **PRD-011** | **Comprovante Assinado** | **🔄 ATUAL** | Depende de PRD-003 |
| — | PRD-009 | Aviso/envio por WhatsApp | ⏳ | Caminho alternativo/complementar de confirmação |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Assinatura do cliente | PII / prova | Armazenar com integridade; no backend, acesso controlado |
| Dados do serviço | Operacional | Sem valores por padrão |

### Autenticação e Autorização

Geração e gestão do comprovante são da retaguarda. Se a assinatura ocorrer no dispositivo do operador (decisão em aberto), garantir que **valores** nunca sejam expostos ali. No backend, RLS.

### Auditoria

`gerado_em`, `assinado_em`, `assinante_nome`, vínculo com a OS e a assinatura compõem a prova de entrega.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[OS finalizada (PRD-003)] ─▶ [Retaguarda] gera comprovante (resumo do serviço)
─▶ cliente confere ─▶ assina em tela (nome) ─▶ "assinado" ─▶ vinculado à OS
```

### Fluxos de Exceção
- OS não finalizada → geração bloqueada.
- Cliente recusa → status `recusado` com motivo.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Seal"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Geração do comprovante não impede o restante |
| **Fail gracefully** | Falhas simuladas não travam a tela |
| **Preservar evidências** | Assinatura e vínculo com a OS são a prova |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Sem valores por padrão** | O comprovante mostra serviço; se exibir valor for decidido, é retaguarda-only |
| **Assinatura isolada** | Componente de assinatura reutilizável e testável |
| **Derivar da OS** | Resumo vem da OS (PRD-003); não recriar apontamentos |
| **Feature-based** | `src/features/comprovantes/` |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir valor interno no comprovante do operador |
| Gerar comprovante de OS não finalizada |
| Prometer validade jurídica sem definição (é decisão em aberto) |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-07-01 |
| **Versão do App** | 0.9.0 (Seal) |
| **Implementado por** | Claude Code via SDD |
| **Observações** | Assinatura em tela via canvas nativo (sem lib externa). Geração só a partir da OS (1 comprovante por OS). Sem PDF, sem envio, sem validade jurídica — fora de escopo desta fase. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |
| 2026-07-01 | v2 | Implementado — 0.9.0 (Seal) |

---

**AILA - Sistemas Inteligentes**
