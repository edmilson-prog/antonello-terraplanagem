# PRD-003: Ordem de Serviço Colaborativa

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) da Ordem de Serviço que agrega os apontamentos de vários operadores e organiza o trabalho por cliente/obra — colaborativa entre campo e central |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Ambiente** | Transversal (`all`) — operador (`/app/*`) e retaguarda (`/admin/*`) |
| **Épico** | Onda 1 — Fundação |
| **PRDs Relacionados** | **PRD-000** (spike — define o sync/offline real), PRD-001 (clientes), PRD-002 (apontamentos — agregados via `os_id`), PRD-004 (faturamento — consome a OS fechada) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, dois ambientes, regra de negócio do ciclo da OS, agrega outra entidade (apontamentos) e tem dependência arquitetural (PRD-000) |

---

## Contexto do Problema

A **Ordem de Serviço (OS)** é a espinha do trabalho: representa um serviço para um cliente, numa obra, ao qual se vinculam as horas dos equipamentos. É ela que transforma apontamentos soltos em algo faturável e rastreável (executado → faturado → recebido).

O traço que a torna difícil — e valiosa — é ser **colaborativa**: numa mesma obra, vários operadores podem estar apontando horas na mesma OS ao mesmo tempo, e a central precisa enxergar tudo convergindo. Some-se a isso o campo **sem sinal**, e a OS vira o encontro de dois mundos: o offline do operador e o tempo real da central.

Este PRD entrega a **UI** da OS — listar, criar, detalhar, vincular apontamentos, acompanhar o trabalho colaborativo e fechar — com dados **mockados**. O motor real de sincronização/offline **não** é construído aqui: ele é decidido no **PRD-000 (spike)** e implementado na fase de backend. Aqui, o comportamento colaborativo/tempo real é **simulado** para validar a experiência.

> **Barreira financeira:** a OS é vista pelo operador, mas **valores em R$ nunca aparecem no app dele**. O operador vê o trabalho e as horas; a retaguarda vê as horas e (no PRD-004) os valores.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. As rotas `/app/ordens` e `/admin/ordens` foram criadas no scaffold como placeholders.

### Situação Desejada (To-Be)

- **Retaguarda:** cria a OS (cliente, obra, modelo de cobrança), acompanha as OS em aberto/andamento, vê os apontamentos agregados e fecha a OS.
- **Operador:** vê as OS a que está vinculado, contribui com seus apontamentos (do PRD-002) e enxerga as contribuições dos colegas na mesma OS.
- O comportamento colaborativo e o estado "pendente de sincronização" são **simulados** na UI (engine real definido no PRD-000).

### Sincronização — decisão do PRD-000 (ADR-001)

O spike PRD-000 está **concluído**. A arquitetura de sync/offline foi decidida no
[`ADR-001`](../adr/ADR-001-sync-offline-os-colaborativa.md): **Supabase Realtime + fila
offline própria**. O que isso fixa para este PRD:

**O frontend (esta UI) PODE prometer / simular com segurança:**
- Apontar e atualizar a OS **offline** sem travar nem perder; selo "pendente de
  sincronização" (campo `pendente_sync` do PRD-002) e reconciliação ao reconectar.
- Atualizações **otimistas** dos campos do cabeçalho; reconciliação por **LWW por campo**.
- Visão "tempo real" da OS quando há rede.

**Regras de negócio que a UI DEVE refletir desde já:**
- **Fechar a OS é exclusivo da retaguarda.** O app do operador **não** oferece a ação de
  fechar — só aponta e acompanha. (Elimina o conflito mais perigoso.)
- **Apontamentos são append-only:** cada operador é dono das próprias horas; somam-se na
  OS, nunca se sobrescrevem.

**O que NÃO prometer:** co-edição em tempo real sem conflito de campos arbitrários por
muitos operadores; resolução de conflito além de LWW por campo (colaboração simultânea na
mesma OS é rara — premissa do spike).

**O backend (fase 4) entregará:** ingestão idempotente por `opId`, `updated_at` por campo
para o LWW, RLS reservando o fechamento à retaguarda, e canal Realtime por OS.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apontamento sem OS (horas soltas) | Sem a OS não há como faturar por cliente/obra nem agregar o trabalho |
| Uma OS por operador (não colaborativa) | Não reflete a realidade: várias máquinas/operadores na mesma obra |
| Implementar o sync real já neste PRD | O sync é risco arquitetural — decidido no PRD-000 antes de comprometer o backend |
| Mostrar valores da OS ao operador | Viola a restrição comercial rígida |

---

## Escopo

### Incluído

- ✅ **Retaguarda:** criar, listar, detalhar, editar e **fechar** OS
- ✅ **Operador:** listar OS vinculadas, contribuir com apontamentos, ver contribuições dos colegas
- ✅ Agregação dos **apontamentos** (PRD-002) na OS via `os_id` (soma de horas; metragem para fundação)
- ✅ Ciclo de status da OS: `aberta → em_andamento → fechada`
- ✅ Regras de abertura/fechamento (quem pode, pré-condições)
- ✅ Visão colaborativa **simulada** (vários apontamentos de operadores diferentes) + estado "pendente de sincronização"
- ✅ `types` (contrato): `IOrdemServico` (+ `StatusOS`, `ModeloCobranca`)
- ✅ Mocks com edge cases; estados de tela em ambos os ambientes

### Excluído

- ❌ Motor real de offline/sync e resolução de conflito — **PRD-000** (spike) + fase de backend
- ❌ Cálculo de **valores** e faturamento — **PRD-004**
- ❌ Exibição de qualquer valor financeiro no app do operador
- ❌ Comprovante assinado pelo cliente — PRD-011
- ❌ Backend real (Supabase), notificação WhatsApp (PRD-009)

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Retaguarda — Gestão da OS

- **RF-001 (Must):** Criar OS informando cliente (PRD-001), obra/local e modelo de cobrança (`hora_maquina` ou `por_metro`).
- **RF-002 (Must):** Listar OS com status e filtro por status/cliente.
- **RF-003 (Must):** Detalhar uma OS exibindo os apontamentos vinculados e o **total de horas** (ou metragem, no modelo por metro).
- **RF-004 (Must):** **Fechar** uma OS, respeitando pré-condições (ver regra abaixo).
- **RF-005 (Should):** Editar dados da OS (obra, observação) enquanto não fechada.
- **RF-006 (Should):** Gerar/exibir um **número legível** de OS (ex.: `OS-2026-0042`).

### Operador — Colaboração em Campo

- **RF-007 (Must):** Listar as OS a que o operador está vinculado (abertas/em andamento).
- **RF-008 (Must):** Vincular seus apontamentos (PRD-002) a uma OS.
- **RF-009 (Must):** Ver, na OS, os apontamentos dos **colegas** na mesma obra (visão colaborativa).
- **RF-010 (Should):** Ver o estado **"pendente de sincronização"** dos itens ainda não enviados.

### Ciclo e Regras

- **RF-011 (Must):** Status da OS evolui `aberta → em_andamento → fechada`; `em_andamento` quando há ao menos um apontamento.
- **RF-012 (Must):** **Não permitir fechar** uma OS que tenha apontamento **em andamento** (horímetro final pendente) — avisar o motivo.
- **RF-013 (Could):** Definir que o **fechamento** é ação da retaguarda (reduz conflito) — confirmar no spike/Decisões.

### Transversais

- **RF-014 (Must):** A OS é visível em ambos os ambientes; **valores em R$ nunca** aparecem no app do operador.
- **RF-015 (Must):** No modelo `por_metro`, a OS registra **metragem executada** e **diâmetro da broca**.

---

## Requisitos Não-Funcionais

- **RNF-001 (Colaboração simulada):** A visão colaborativa deve atualizar de forma percebida como "ao vivo" no protótipo (ex.: refletir mudanças em memória), preparando a experiência sem o engine real.
- **RNF-002 (Resiliência percebida):** O estado "pendente de sincronização" comunica claramente o que ainda não foi enviado.
- **RNF-003 (Mobile-first no operador):** Visão da OS no campo é mobile-first, alto contraste; retaguarda é desktop-first com tabela.
- **RNF-004 (Performance):** Detalhe da OS com dezenas de apontamentos renderiza em < 1s (mock).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type ModeloCobranca = 'hora_maquina' | 'por_metro'
type StatusOS = 'aberta' | 'em_andamento' | 'fechada'   // 'faturada' é tratado no PRD-004

interface IOrdemServico {
  id: string
  numero: string                  // legível, ex: "OS-2026-0042"
  cliente_id: string              // FK → ICliente (PRD-001)
  obra_nome: string               // identificação da obra/local
  endereco: string | null
  modelo_cobranca: ModeloCobranca
  status: StatusOS
  responsavel_id: string | null   // operador/recepção responsável
  observacao: string | null
  // modelo por_metro:
  metragem_executada: number | null
  diametro_broca_mm: number | null
  // ciclo:
  aberta_em: string               // ISO 8601
  fechada_em: string | null
  pendente_sync: boolean          // afford­ância de offline (mock nesta fase)
  created_at: string
  updated_at: string
  // apontamentos vinculados: via IApontamento.os_id (PRD-002)
  // total de horas = soma das horas dos apontamentos vinculados (derivado)
}
```

> A OS **não** guarda valores em R$. O total de horas é **derivado** dos apontamentos; os valores entram só no PRD-004 (retaguarda).

---

## Critérios de Aceitação

### RF-001 / RF-003: Criar e detalhar OS

```gherkin
DADO que a recepção está em /admin/ordens
QUANDO cria uma OS para um cliente, com obra e modelo "hora_maquina"
ENTÃO a OS aparece na lista com status "aberta" e um número legível
  E ao detalhá-la, exibe o total de horas (0 enquanto não há apontamentos)
```

### RF-008 / RF-009: Colaboração

```gherkin
DADO uma OS aberta com apontamentos de dois operadores diferentes
QUANDO um operador abre o detalhe da OS no app
ENTÃO vê os apontamentos dele e os dos colegas na mesma OS
  E NÃO vê nenhum valor em R$
```

### RF-012: Regra de fechamento

```gherkin
DADO uma OS com um apontamento ainda "em andamento" (sem horímetro final)
QUANDO a recepção tenta fechar a OS
ENTÃO o fechamento é bloqueado
  E é exibido o motivo (há apontamento em andamento)
```

### RF-011: Evolução de status

```gherkin
DADO uma OS "aberta" sem apontamentos
QUANDO o primeiro apontamento é vinculado
ENTÃO o status passa para "em andamento"
```

### Cenários de Erro / Edge

```gherkin
DADO que não há nenhuma OS cadastrada
QUANDO a recepção abre /admin/ordens
ENTÃO é exibido empty state com CTA "Abrir primeira OS"

DADO uma OS com itens não sincronizados
QUANDO é visualizada
ENTÃO os itens exibem o indicador "pendente de sincronização"
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista de OS (retaguarda) | skeleton de tabela | "Nenhuma OS" + CTA | mensagem + retry | tabela com status/cliente |
| Detalhe da OS (ambos) | skeleton | "Sem apontamentos ainda" | mensagem + retry | cabeçalho + lista de apontamentos + total de horas |
| Lista de OS (operador) | skeleton de cards | "Você não tem OS abertas" | mensagem + retry | cards das OS vinculadas |
| Fechar OS | botão com spinner | — | toast com motivo do bloqueio | toast de sucesso + status "fechada" |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/ordens-servico.ts` | ~6 OS (mix de `hora_maquina` e `por_metro`) | 1 `aberta` sem apontamentos, 1 `em_andamento` colaborativa (apontamentos de 2+ operadores), 1 `fechada`, 1 com `pendente_sync: true`, 1 modelo `por_metro` com metragem/diâmetro |

> Reutilizar `clientes.ts` (PRD-001), `operadores.ts`, `equipamentos.ts` e `apontamentos.ts` (PRD-002), ligando apontamentos às OS via `os_id`. Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (`IOrdemServico` + status/modelo) + mocks ligando apontamentos às OS | ~3 |
| 2 | UI: lista + detalhe + criação (retaguarda); lista + detalhe colaborativo (operador) | ~9-12 |
| 3 | Estados de tela + regras de ciclo/fechamento + estado "pendente de sync" | ~4-5 |
| 4 | Fluxo completo em memória (criar → vincular apontamentos → evoluir status → fechar) + colaboração simulada + responsividade | ~3 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
**Objetivo:** Definir `IOrdemServico` e popular mocks vinculando apontamentos.
**Ações:**
- [ ] Definir `IOrdemServico`, `StatusOS`, `ModeloCobranca`
- [ ] Criar `src/mocks/ordens-servico.ts` com OS colaborativa e edge cases; ligar `apontamentos.os_id`
**Validação:** Mocks compilam; uma OS agrega apontamentos de 2+ operadores.

#### Fase 2: UI com Mocks
**Objetivo:** Telas da OS nos dois ambientes.
**Ações:**
- [ ] Retaguarda: lista, detalhe (com total de horas) e criação em `/admin/ordens`
- [ ] Operador: lista de OS vinculadas e detalhe colaborativo em `/app/ordens` (**sem valores**)
**Validação:** Navegação completa; operador vê colegas; nenhum R$ no app do operador.

#### Fase 3: Estados + Regras
**Objetivo:** Ciclo e estados de tela.
**Ações:**
- [ ] Loading/empty/error/success; evolução de status; bloqueio de fechamento com apontamento em andamento
- [ ] Indicador "pendente de sincronização"
**Validação:** Regras de ciclo demonstráveis; estados completos.

#### Fase 4: Fluxo + Colaboração Simulada
**Objetivo:** Fluxo funcional ponta a ponta.
**Ações:**
- [ ] Criar → vincular apontamentos → status evolui → fechar (em memória)
- [ ] Colaboração simulada (refletir mudanças) e responsividade (operador mobile / retaguarda desktop)
**Validação:** Ciclo completo com mocks; experiência colaborativa percebida; barreira financeira intacta.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-000 | Spike de sync/offline — define o comportamento real | ⏳ Pendente (documentado) |
| PRD-001 | Cadastros base (clientes) | ⏳ Pendente (documentado) |
| PRD-002 | Apontamento de horímetro — agregado pela OS | ⏳ Pendente (documentado) |

> **Atenção:** o **frontend** deste PRD pode ser construído com mocks **em paralelo** ao spike. Mas o **backend** da OS (sync real) só deve ser implementado **após o PRD-000** concluir e registrar o ADR.

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Sync real depende do PRD-000 |

### Decisões Pendentes

- [ ] O **fechamento** da OS é exclusivo da retaguarda ou o operador também pode fechar? (impacta conflito — ver PRD-000)
- [ ] Uma OS pertence a **uma obra** ou pode abranger várias frentes? Há hierarquia obra → OS?
- [ ] No modelo `por_metro`, a metragem é lançada pelo operador (campo) ou pela retaguarda?
- [ ] Numeração da OS: formato e origem (sequencial por ano? global?).

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 1 — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-000 | Spike de sync/offline | ⏳ (documentado) | Pré-requisito do backend |
| — | PRD-001 | Cadastros Base | ⏳ (documentado) | Base (clientes) |
| — | PRD-002 | Apontamento de Horímetro | ⏳ (documentado) | Agregado pela OS |
| **N** | **PRD-003** | **Ordem de Serviço Colaborativa** | **🔄 ATUAL** | Depende de PRD-000, PRD-001, PRD-002 |
| N+1 | PRD-004 | Faturamento ao fechar OS | ⏳ | Consome a OS fechada |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Valores da OS (R$) | Comercial sensível | **Não existem** no app do operador; computados só na retaguarda (PRD-004) |
| Vínculo cliente/obra | Operacional/PII | No backend, RLS por perfil |

### Autenticação e Autorização

OS visível em ambos os ambientes, com **recortes distintos**: operador vê trabalho/horas e contribui; retaguarda gere e fecha. Fechamento possivelmente restrito à retaguarda (a confirmar). No backend, RLS garante o recorte; nesta fase, é por ambiente/rota.

### Auditoria

`aberta_em`, `fechada_em`, `created_at`, `updated_at` e o histórico de apontamentos compõem a trilha — base do pipeline executado → faturado → recebido.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Recepção] ─▶ /admin/ordens ─▶ "Nova OS" (cliente, obra, modelo) ─▶ OS "aberta"
[Operador] ─▶ /app/ordens ─▶ abre a OS ─▶ vincula apontamentos (PRD-002) ─▶ OS "em andamento"
[Recepção] ─▶ confere apontamentos ─▶ "Fechar OS" (se nada em andamento) ─▶ OS "fechada"
```

### Fluxos de Exceção
- Tentar fechar com apontamento em andamento → bloqueado + motivo.
- Dois operadores na mesma OS → ambos enxergam as contribuições (colaboração simulada).

### Fluxos de Erro
- Falha simulada ao carregar OS/apontamentos → estado de erro com retry.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md` do repositório.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. DEPENDÊNCIA ARQUITETURAL:**
> - O **frontend** pode ser feito com mocks em paralelo ao spike.
> - O **backend** (sync real) só após o **PRD-000** concluir e registrar o ADR. Não improvisar sync de produção aqui.

> **⚠️ 3. APÓS IMPLEMENTAR:**
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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Worksite"** ou **"Mesh"**, pela natureza colaborativa).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | A simulação de sync não pode travar a navegação |
| **Fail gracefully** | Falhas simuladas degradam com aviso, sem perda visual |
| **Preservar evidências** | Apontamentos e histórico da OS são a trilha de auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Barreira financeira** | A visão da OS no operador não importa nem renderiza valores; horas/trabalho sim |
| **Horas derivadas** | Total de horas da OS = soma dos apontamentos vinculados; não duplicar o dado |
| **Colaboração simulada** | Refletir contribuições de vários operadores em memória; deixar claro o que é "ao vivo" simulado |
| **Afford­ância de offline** | `pendente_sync` é visual; engine real é PRD-000 + backend |
| **Feature-based** | `src/features/ordem-servico/`; reaproveitar apontamento (PRD-002) e cadastros (PRD-001) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir ou carregar valores em R$ no app do operador |
| Implementar o motor real de offline/sync ou resolução de conflito (é o PRD-000 + backend) |
| Calcular faturamento aqui (é o PRD-004) |
| Permitir fechar OS com apontamento em andamento |
| Conectar Supabase ou hardcodar dados |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-29 |
| **Versão do App** | 0.4.0 (Worksite) |
| **Implementado por** | Claude Opus 4.8 (Claude Code CLI) |
| **Observações** | Frontend First. Reconcilia o modelo legado (ADR-001). Fechar = retaguarda; horas derivadas; colaboração demonstrável (os-001). |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
