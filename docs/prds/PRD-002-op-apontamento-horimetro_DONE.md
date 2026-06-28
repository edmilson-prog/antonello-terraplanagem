# PRD-002: Apontamento de Horímetro (Operador)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) do apontamento de campo: o operador lê o horímetro do equipamento e lança as horas trabalhadas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Ambiente** | App do Operador (`/app/*`) |
| **Épico** | Onda 1 — Fundação |
| **PRDs Relacionados** | PRD-001 (cadastros — consome equipamentos/operadores), PRD-003 (OS — agrega apontamentos via `os_id`), PRD-000 (spike de sync — define o offline real) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos por fase, fluxo isolado com captura de horímetro e cálculo de horas, sem backend e sem integração externa (OCR fica como camada opcional) |

---

## Contexto do Problema

O apontamento é o **coração do sistema**: é o momento em que a hora trabalhada vira dado. Hoje o operador anota o horímetro num papel (ou não anota), e essa informação leva dias para chegar ao escritório — quando chega. É exatamente essa lacuna que atrasa o faturamento e impede saber quanto cada máquina rendeu.

Este PRD entrega a tela onde o operador, **no celular e em campo**, registra o horímetro do equipamento ao iniciar e ao finalizar o trabalho. O sistema calcula as horas automaticamente. É a primeira captura de dado real da operação.

Como é uma tela de campo, o ambiente impõe restrições fortes: uso sob sol, possivelmente com luva, muitas vezes com **uma mão só**, e — o ponto mais sensível — **sem sinal de celular**. A captura precisa ser à prova de erro e simples. (O motor de sincronização offline em si é tratado no spike PRD-000; aqui entregamos a UI e o estado visual de "pendente de envio".)

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. A rota `/app/apontamento` foi criada no scaffold (Fase 1) apenas como tela-placeholder.

### Situação Desejada (To-Be)

O operador inicia um apontamento selecionando um equipamento (do cadastro, PRD-001) e registrando o **horímetro inicial** — por digitação manual (sempre) ou por foto com leitura automática (OCR, opcional). Ao terminar, registra o **horímetro final**; o sistema calcula `horas = final − inicial`. O operador vê a lista dos próprios apontamentos (em andamento e recentes). Tudo mockado, em `/app/*`, mobile-first, sem qualquer dado financeiro.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apontar só as horas direto (sem horímetro) | Perde a evidência e abre espaço para erro/fraude; o horímetro é a fonte da verdade |
| Exigir OCR obrigatório | OCR é incerto (decisão em aberto) e pode falhar em campo; precisa de fallback manual sempre |
| Já embutir a OS completa aqui | A OS colaborativa é o PRD-003 (e depende do spike de sync); aqui o vínculo à OS é opcional |
| Cronômetro (start/stop por tempo) em vez de horímetro | O faturamento é pela hora-máquina do **horímetro do equipamento**, não pelo relógio do celular |

---

## Escopo

### Incluído

- ✅ Iniciar apontamento: seleção de equipamento + horímetro inicial
- ✅ Captura do horímetro por **digitação manual** (caminho principal)
- ✅ Captura do horímetro por **foto com OCR** (opcional, com fallback e edição manual)
- ✅ Finalizar apontamento: horímetro final + **cálculo automático de horas**
- ✅ Validação de consistência (final ≥ inicial)
- ✅ Lista "Meus apontamentos" (em andamento + recentes)
- ✅ Estado visual de "pendente de sincronização" (afford­ância para o offline)
- ✅ `types` do `IApontamento` (contrato) + mocks com edge cases

### Excluído

- ❌ Motor real de offline/sync e resolução de conflito — é o **PRD-000** (spike) e o **PRD-003**
- ❌ Gestão completa da OS (abrir/fechar/colaborar) — é o **PRD-003**; aqui o `os_id` é só um vínculo opcional
- ❌ Qualquer dado financeiro (preço, valor, custo) — restrição rígida do ambiente do operador
- ❌ Backend real (Supabase), upload real de fotos
- ❌ Edição/exclusão de apontamentos de outros operadores

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Captura e Apontamento

- **RF-001 (Must):** Iniciar um apontamento selecionando um equipamento (lista vinda do cadastro, apenas equipamentos `ativo`) e registrando o horímetro inicial.
- **RF-002 (Must):** Registrar o horímetro por **digitação manual** (numérico, aceita decimal).
- **RF-003 (Could):** Capturar o horímetro por **foto com leitura automática (OCR)**, sempre com fallback de digitação e permitindo **editar** o valor lido antes de confirmar.
- **RF-004 (Must):** Finalizar um apontamento em andamento registrando o horímetro final; o sistema calcula e exibe `horas_trabalhadas = final − inicial`.
- **RF-005 (Must):** Validar que o horímetro final ≥ inicial; se inconsistente, bloquear a confirmação e avisar com clareza.
- **RF-006 (Should):** Permitir anexar uma observação curta ao apontamento.
- **RF-007 (Should):** Associar (opcional) o apontamento a uma OS/obra via seletor mockado — a gestão plena da OS é o PRD-003.

### Visualização

- **RF-008 (Must):** Listar os apontamentos do **próprio operador**, separando "em andamento" de "recentes/finalizados".
- **RF-009 (Should):** Em cada apontamento não enviado, exibir o estado **"pendente de sincronização"** (preparando o offline — engine real no PRD-000/003).

### Transversais

- **RF-010 (Must):** Toda a experiência vive no App do Operador (`/app/*`), mobile-first, com alto contraste e alvos de toque ≥ 44px.
- **RF-011 (Must):** **NUNCA** exibir preço, valor, custo ou qualquer dado financeiro.

---

## Requisitos Não-Funcionais

- **RNF-001 (Usabilidade de campo):** Operável com **uma mão**; ações primárias ao alcance do polegar; botões grandes.
- **RNF-002 (Legibilidade):** Alto contraste para uso sob sol; números do horímetro em fonte mono e tamanho ampliado.
- **RNF-003 (Performance):** Iniciar/finalizar um apontamento responde em < 1s (em memória/mock).
- **RNF-004 (Captura):** A foto usa a câmera do dispositivo; o app degrada graciosamente para digitação se a câmera/OCR falhar.
- **RNF-005 (Responsividade):** Prioridade 375px; validar também 768px.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type StatusApontamento = 'em_andamento' | 'finalizado'

interface IApontamento {
  id: string
  equipamento_id: string          // FK → IEquipamento (PRD-001)
  operador_id: string             // FK → IOperador (PRD-001) — quem apontou
  os_id: string | null            // FK → OS (PRD-003) — opcional nesta fase
  horimetro_inicial: number       // horas, com decimal (ex: 1234.5)
  horimetro_final: number | null  // null enquanto em andamento
  horas_trabalhadas: number | null// calculado: final - inicial
  foto_inicial_url: string | null // evidência do horímetro (captura)
  foto_final_url: string | null
  observacao: string | null
  status: StatusApontamento
  pendente_sync: boolean          // afford­ância de offline (mock nesta fase)
  iniciado_em: string             // ISO 8601
  finalizado_em: string | null
  created_at: string
  updated_at: string
}
```

> O `os_id` é o ponto de junção com o PRD-003: lá a OS agrega vários apontamentos. `pendente_sync` é só visual nesta fase; o motor real vem no PRD-000/003.

---

## Critérios de Aceitação

### RF-001 / RF-002: Iniciar apontamento (manual)

```gherkin
DADO que o operador está em /app/apontamento
QUANDO seleciona um equipamento ativo, digita o horímetro inicial e confirma
ENTÃO um apontamento "em andamento" é criado
  E aparece na lista de apontamentos do operador
```

### RF-004 / RF-005: Finalizar e calcular horas

```gherkin
DADO um apontamento em andamento com horímetro inicial 1200.0
QUANDO o operador registra o horímetro final 1208.5 e confirma
ENTÃO o sistema calcula 8.5 horas trabalhadas
  E o apontamento passa para "finalizado"

DADO um apontamento em andamento com horímetro inicial 1200.0
QUANDO o operador informa um horímetro final menor que 1200.0
ENTÃO a confirmação é bloqueada
  E é exibido aviso de inconsistência
```

### RF-003: OCR com fallback

```gherkin
DADO que o operador opta por capturar o horímetro por foto
QUANDO a leitura automática retorna um valor
ENTÃO o valor é exibido em campo editável para conferência antes de confirmar

DADO que a câmera ou a leitura automática falha
QUANDO o operador tenta capturar por foto
ENTÃO o app oferece a digitação manual sem travar o fluxo
```

### Cenários de Erro / Edge

```gherkin
DADO que o operador ainda não tem nenhum apontamento
QUANDO abre a lista
ENTÃO é exibido um empty state com CTA "Iniciar apontamento"

DADO um apontamento ainda não sincronizado
QUANDO o operador o visualiza
ENTÃO é exibido o indicador "pendente de sincronização"
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista "Meus apontamentos" | skeleton de cards | "Nenhum apontamento ainda" + CTA "Iniciar" | mensagem + "Tentar novamente" | cards (em andamento + recentes) |
| Captura de horímetro (foto/OCR) | spinner durante leitura | — | "Não foi possível ler — digite manualmente" | valor lido em campo editável |
| Iniciar / Finalizar (form) | botão com spinner | — | toast de erro, mantém dados | toast de sucesso + volta à lista |

> Em Frontend First, loading/error/OCR são simulados (delays e toggles nos mocks) para exercitar os estados.

---

## Dados Mockados (Frontend First)

> Espelham o schema futuro (`snake_case`); reutilizam equipamentos/operadores do PRD-001; viram `seed.sql` na fase de backend.

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/apontamentos.ts` | ~5 apontamentos | 1 `em_andamento`, alguns `finalizado`, 1 sem `os_id`, 1 com observação longa, 1 com `pendente_sync: true` |
| `src/mocks/obras.ts` (auxiliar) | ~3 OS/obras mínimas para o seletor opcional | placeholder até o PRD-003 definir a OS completa |

> Reutilizar `src/mocks/equipamentos.ts` e `operadores.ts` (PRD-001). Não duplicar.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Preparação: `types` (`IApontamento`) + mocks | ~3 |
| 2 | UI: iniciar apontamento (seleção + captura), finalizar, lista "Meus apontamentos" | ~6-9 |
| 3 | Estados de tela + validações (final ≥ inicial, campos) + estado "pendente de sync" | ~3-4 |
| 4 | Fluxo completo em memória (iniciar → finalizar → listar) + cálculo de horas + OCR como camada opcional plugável + responsividade/contraste | ~3 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks

**Objetivo:** Definir o `IApontamento` e popular os mocks.

**Ações:**
- [ ] Definir `IApontamento` e `StatusApontamento`
- [ ] Criar `src/mocks/apontamentos.ts` (+ `obras.ts` auxiliar) com os edge cases

**Validação:** Mocks compilam, respeitam o type e cobrem os edge cases.

#### Fase 2: UI com Mocks

**Objetivo:** As telas do fluxo de apontamento.

**Ações:**
- [ ] Tela de iniciar (seleção de equipamento + captura de horímetro inicial)
- [ ] Componente de captura (campo manual + opção de foto/OCR simulado)
- [ ] Tela de finalizar (horímetro final)
- [ ] Lista "Meus apontamentos" em `/app/apontamento`

**Validação:** É possível percorrer iniciar → finalizar → ver na lista, com mocks.

#### Fase 3: Estados + Validação

**Objetivo:** Estados de tela e regras de consistência.

**Ações:**
- [ ] Loading/empty/error/success na lista e na captura
- [ ] Validar final ≥ inicial e campos obrigatórios, com feedback claro
- [ ] Indicador "pendente de sincronização"

**Validação:** Cada estado é demonstrável; inconsistência é bloqueada com aviso.

#### Fase 4: Fluxo + Captura + Responsividade

**Objetivo:** Fluxo funcional e refino de campo.

**Ações:**
- [ ] Iniciar/finalizar refletindo em memória; cálculo de `horas_trabalhadas`
- [ ] OCR como camada opcional, isolada, fácil de plugar/desplugar
- [ ] Alto contraste, toque ≥ 44px, operação com uma mão; validar 375/768px

**Validação:** Fluxo completo funciona com mocks; usável em campo e sem qualquer dado financeiro.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Cadastros base (equipamentos, operadores) — fonte do seletor | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| OCR (leitura de horímetro) | Biblioteca/serviço | A avaliar — opcional, com fallback manual |

### Decisões Pendentes

- [ ] **OCR** do horímetro é viável/confiável o suficiente para o MVP? (decisão em aberto com Leonardo)
- [ ] Precisão do horímetro: registrar com **uma casa decimal** (décimos) é suficiente, ou há centésimos?
- [ ] Um operador pode ter **mais de um apontamento em andamento** ao mesmo tempo (equipamentos diferentes)?
- [ ] Como o apontamento se comporta **sem sinal** depende do resultado do **PRD-000** (spike de sync).

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 1 — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-001 | Cadastros Base | ⏳ (documentado) | Base |
| **2** | **PRD-002** | **Apontamento de Horímetro** | **🔄 ATUAL** | Depende de PRD-001 |
| 3 | PRD-003 | Ordem de Serviço colaborativa | ⏳ | Agrega apontamentos (depende de PRD-000, PRD-001) |
| — | PRD-010 | Manutenção preventiva por horímetro | ⏳ | Consome leitura de horímetro |

> **Nota:** Implemente na ordem indicada. O motor de offline/sync (PRD-000) deve estar resolvido antes da OS colaborativa (PRD-003), mas **não bloqueia** este PRD-002 (aqui o offline é só afford­ância visual).

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Foto do horímetro | Evidência operacional | Preservar como prova; no backend, storage com acesso controlado |
| Apontamentos do operador | Operacional | No backend, RLS: operador acessa/edita apenas os próprios |

### Autenticação e Autorização

A experiência é exclusiva do perfil `operador` (`/app/*`). No backend (fase posterior), o operador só enxerga e edita os próprios apontamentos. Nesta fase, a separação é por ambiente/rota.

### Auditoria

`iniciado_em`, `finalizado_em`, `created_at`, `updated_at` e as fotos compõem a trilha de evidência — fundamentais porque o horímetro é a base da cobrança.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Operador] ─▶ /app/apontamento ─▶ "Iniciar" ─▶ escolhe equipamento ─▶ registra horímetro inicial
        ─▶ (trabalha) ─▶ abre o apontamento ─▶ registra horímetro final ─▶ sistema calcula horas ─▶ finalizado
```

1. Operador abre a tela de apontamento.
2. Inicia: seleciona equipamento, captura o horímetro inicial (manual ou foto/OCR).
3. Sistema cria o apontamento "em andamento".
4. Ao terminar, registra o horímetro final.
5. Sistema valida (final ≥ inicial), calcula as horas e marca "finalizado".

### Fluxos de Exceção

- Horímetro final < inicial → confirmação bloqueada + aviso.
- OCR/câmera falha → cai para digitação manual sem travar.

### Fluxos de Erro

- Falha simulada ao carregar a lista → estado de erro com "Tentar novamente".

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
> - Renomear este arquivo adicionando `_DONE` ao final (ex.: `PRD-002-op-apontamento-horimetro_DONE.md`)
> - Atualizar o `INDEX-PRDs-antonello.md`
> - Atualizar a seção "Status de Implementação" (status, data, versão, observações)

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto (sugestão para este: **"Tally"** ou **"Clock"**, por registrar horas trabalhadas).

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
| **Não bloquear fluxo principal** | A captura por foto/OCR é secundária: se falhar, o apontamento prossegue por digitação |
| **Fail gracefully** | OCR/câmera indisponível → fallback manual sem travar |
| **Preservar evidências** | Guardar as fotos do horímetro como prova; dados parciais ainda valem |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **OCR isolado** | Manter a leitura automática numa camada/serviço isolado e plugável — para ligar/desligar conforme a decisão sobre viabilidade |
| **Fonte mono nos números** | Horímetro e horas em IBM Plex Mono, ampliados, para leitura sob sol |
| **Contrato primeiro** | Definir `IApontamento` antes da UI — o PRD-003 (OS) agrega por `os_id` |
| **Afford­ância de offline** | `pendente_sync` é só visual aqui; não implementar engine de sync (é o PRD-000/003) |
| **Feature-based** | Organizar em `src/features/apontamento/`; extrair captura/estados reutilizáveis para `src/shared/` |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir preço, valor, custo ou qualquer dado financeiro no app do operador |
| Implementar o motor real de offline/sync ou resolução de conflito (é o PRD-000/003) |
| Tornar o OCR obrigatório ou bloquear o fluxo se ele falhar |
| Construir a gestão completa da OS aqui (é o PRD-003) |
| Conectar Supabase, fazer upload real de fotos ou hardcodar cores/listas |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-06-28 |
| **Versão do App** | 0.2.0 — Tally |
| **Implementado por** | Claude Opus 4.8 (Claude Code) |
| **Observações** | Frontend First (mockado). OS embutida na `/app/ordens` mantida; reconciliação fica no PRD-003. OCR simulado/plugável. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
