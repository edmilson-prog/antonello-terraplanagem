# Antonello Terraplanagem — Contexto para o Claude Code

> Este arquivo é lido automaticamente em toda sessão. Contém as convenções e regras do projeto.
> O PRD diz *o que* construir; este arquivo diz *como*. Não repita convenções nos PRDs — apenas siga este arquivo.

## Sobre o Projeto

Plataforma de gestão (retaguarda web + app de campo) para uma empresa de terraplanagem. Tira do papel o controle de horas de equipamentos, ordens de serviço e cobrança, e dá visibilidade de **rentabilidade por máquina e por obra**.

| Campo | Valor |
|-------|-------|
| **Cliente** | Antonello Terraplanagem (Leonardo Antonello) |
| **Repositório** | [a definir — repo único / monorepo] |
| **PRDs** | `docs/prds/` |
| **Índice de PRDs** | `docs/prds/INDEX-PRDs-antonello.md` |

## Status Atual do Projeto

> ⚠️ **FASE ATUAL:** Fase 4 (Backend) — em andamento

- Schema, RLS e autenticação real já existem no Supabase (PRD-017/018, v0.20.0 "Ignition").
- As stores de domínio saíram de `src/mocks/` (Ondas 17–21). O que ainda não é real está
  listado, item a item, em [`docs/PENDENCIAS-MOCK.md`](docs/PENDENCIAS-MOCK.md).
- Integrações externas (WhatsApp/WAHA, gateway de cobrança, IA) dependem de credencial do
  cliente — o backend delas existe; ver o inventário para o estado de cada uma.

## Diretrizes Permanentes do Projeto

> Estas duas regras valem para **toda** tarefa, em qualquer sessão. Não são negociáveis e não
> expiram com o fim de um PRD.

### D1 — Nada mockado. Tudo em produção.

**Dado mockado, fabricado, simulado ou hardcoded não é entregável.** Toda feature tem que
funcionar de verdade, ponta a ponta, contra o banco real.

| Regra | Detalhe |
|-------|---------|
| **Sem dado fabricado na tela** | Nenhuma tela pode exibir número, data, nome ou status gerado por `Math.random()`, hash do id, pool de exemplos ou constante inventada. Se o dado não existe, a tela mostra **estado vazio honesto** — nunca um valor plausível de mentira |
| **Construir o backend faltante** | Se a feature precisa de tabela, coluna, RPC, índice, policy ou Edge Function que ainda não existe, **construir**. Falta de backend não é motivo para mockar — é a tarefa |
| **Nada suprimido** | Não remover feature, card, coluna ou KPI para "resolver" a falta de dado real. O escopo do que já existe na tela é o piso, não o teto |
| **Sem loading falso** | Estados de tela (`loading`/`error`/`empty`) vêm do estado real da consulta, nunca de `setTimeout` |
| **Credencial ausente ≠ mock** | Integração sem credencial do cliente entrega o caminho real (Edge Function, tabela, retry) e falha visível quando a credencial falta. Não simular resposta de provedor |

**Revisão obrigatória de pendências.** Ao receber uma tarefa nova — e **sempre** ao abrir uma
sessão com contexto zero — antes de codar:

1. Ler [`docs/PENDENCIAS-MOCK.md`](docs/PENDENCIAS-MOCK.md).
2. Rodar a varredura: `npm run auditar:mocks`.
3. Conferir se algo ficou para trás em ondas anteriores; se ficou, **entra no escopo desta
   tarefa** ou é registrado no inventário com o motivo — nunca some silenciosamente.
4. Ao fechar a tarefa, atualizar o inventário (remover o que virou real, registrar o que surgiu).

### D2 — Todo bump de versão atualiza a `main` local.

Sempre que a versão for incrementada (passo 4 do fluxo de PRDs), **sincronizar a `main` local**
com o remoto antes de encerrar o trabalho:

```bash
git fetch origin main
git checkout main && git merge --ff-only origin/main
git checkout -   # volta para a branch de trabalho
```

Regra: a `main` local nunca fica atrás da `origin/main` depois de um bump. Sem force-push,
sem merge de branch de trabalho direto na `main` — a `main` só avança pelo PR.

## Os Dois Ambientes (Surfaces)

Repositório único com dois ambientes que compartilham os mesmos `types` (o contrato de dados):

| Ambiente | Rota | Form factor | Perfis | Observação |
|----------|------|-------------|--------|------------|
| **App do Operador** | `/app/*` | Mobile-first (PWA), bottom nav | operador | Campo. **Nunca exibe preço, valor ou dado financeiro.** Alta legibilidade sob sol. |
| **Retaguarda** | `/admin/*` | Desktop, sidebar + tabelas | recepção, proprietário/admin | Escritório. Completa registros, cadastros, faturamento. |

Os perfis (`operador`, `recepção`, `proprietário/admin`) definem o que cada um vê. Dados financeiros só para perfis autorizados.

> **Navegação da retaguarda:** a sidebar crescerá com as ondas (~12 itens ao final do roadmap). Prever **agrupamento de menu** desde o scaffold: **Operação** (ordens, apontamentos), **Cadastros** (equipamentos, operadores, clientes), **Comercial** (orçamentos, preços), **Financeiro** (faturamento, contas, rentabilidade), **Frota** (manutenção, diesel). No app do operador, o bottom nav permanece com 4 itens — novas ações entram como ações secundárias dentro das telas, não como novos itens.

## Glossário do Domínio

| Termo | Significado |
|-------|-------------|
| **Horímetro** | Medidor de horas de uso do equipamento (como o hodômetro de um carro, mas conta horas de motor). Base da cobrança por hora. |
| **Apontamento** | Registro do operador: horímetro inicial/final, equipamento e OS. |
| **OS (Ordem de Serviço)** | O "trabalho" para um cliente. Pode ser **colaborativa**: vários operadores apontam horas na mesma OS. |
| **Hora-máquina** | Modelo de cobrança por hora de equipamento (lido do horímetro). |
| **Por metro / estaca / fundação** | Modelo de cobrança alternativo (estaqueamento), varia por **diâmetro da broca**. |
| **Equipamento** | Escavadeira (18t/10t/5t), carregadeira, caçamba, trator de esteira, etc. |
| **Pipeline de cobrança** | **Executado → Faturado → Recebido**: serviço feito → nota emitida → pagamento recebido. São estágios distintos, não um log único. |
| **Máquina seca × operada** | Locação **sem** operador (seca) ou **com** operador (operada) — muda o preço da hora. |
| **Mobilização / desmobilização** | Transporte do equipamento até a obra e de volta — pode ser cobrado à parte. |
| **Material rodante** | Pneus/esteiras e componentes de rodagem — custo relevante por hora de uso. |
| **FINAME / BNDES** | Financiamento típico de equipamento pesado — a parcela entra no custo fixo mensal (PRD-013). |

## Arquitetura — Ponto Crítico (ler antes de modelar dados)

O núcleo técnico de maior risco é a **OS colaborativa**: precisa ser **offline-first** (o operador aponta em campo sem sinal) e, ao mesmo tempo, **sincronizar em tempo real** entre vários celulares e a central.

> ✅ **Resolvido pelo spike PRD-000 → [`ADR-001`](docs/adr/ADR-001-sync-offline-os-colaborativa.md).** Decisão: **Supabase Realtime + fila offline própria (Abordagem A)**:
> - **Apontamentos append-only e idempotentes** (dedup por `opId` do cliente) — cada apontamento é dono das próprias horas; conflito ~zero.
> - **Cabeçalho da OS por LWW por campo** (last-write-wins) — basta porque a colaboração simultânea é rara.
> - **Fechar a OS é exclusivo da retaguarda** (RLS) — o operador nunca fecha; elimina o conflito mais perigoso.
> - **Fila offline em IndexedDB** → flush idempotente ao reconectar → Supabase Realtime propaga.
>
> Validado por PoC descartável (branch `spike/prd-000-sync-poc`, 5/5 cenários). O impacto no PRD-003 (o que o frontend pode prometer / o que o backend entrega) está no ADR.

> **Regra:** não mockar sync perfeito e descobrir o problema só na fase de backend. O comportamento prometido na UI deve respeitar o **ADR-001**.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React + Vite + TypeScript |
| **Estilização** | Tailwind CSS + shadcn/ui |
| **Ícones** | Iconify (`@iconify/react`) para ícones de aplicação. Componentes shadcn podem manter seus ícones padrão (lucide) internamente. |
| **Backend** | Supabase (PostgreSQL) — *aguardando aprovação* |
| **Automação** | n8n — notificação WhatsApp ao cliente, automações de cobrança *(Onda 2+)* |
| **Deploy** | Vercel |

## Identidade Visual (tokens — nunca hardcodar cor ou fonte)

Tema do mundo da obra: amarelo-máquina, terra, aço, concreto.

| Token | Valor |
|-------|-------|
| Primária / ação | `#FFB300` (hover `#E09600`) |
| Terra | `#A2622F` / suave `#C07B43` |
| Aço | `#717A82` / suave `#9AA1A8` |
| Escuros (asfalto) | `#16140F`, `#211D15`, `#2C2719` |
| Claros (concreto) | `#E8E2D5`, `#F4EFE6` · linha `#D6CDBC` |
| Texto (tinta) | `#1B1912` / suave `#5A554A` / fraco `#8C8678` |

- Fontes: **Archivo** (display/headings), **IBM Plex Sans** (corpo), **IBM Plex Mono** (números/dados — horímetro, nº de OS, valores).
- Light/dark **obrigatório**, com toggle e persistência. No app do operador, **priorizar alto contraste** (sol forte em campo).
- Assinatura: faixa de sinalização de canteiro (listras diagonais amarelo/asfalto) no cabeçalho.

## Convenções de Nomenclatura

### Arquivos
| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `ApontamentoCard.tsx` |
| Hooks | camelCase + `use` | `useApontamento.ts` |
| Services | camelCase + `Service` | `osService.ts` |
| Utils | camelCase | `formatHorimetro.ts` |
| Types | PascalCase | `OrdemServico.ts` |
| Pastas | kebab-case | `ordem-servico/` |

### Código
| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Variáveis | camelCase | `horimetroFinal`, `isLoading` |
| Funções | camelCase (verbos) | `abrirOS()`, `calcularHoras()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Interfaces (contratos de dados) | PascalCase, sem prefixo | `OrdemServico`, `Apontamento` |
| Types (unions) | PascalCase | `type Perfil = 'operador' \| 'recepcao' \| 'admin'` |
| Enums | PascalCase + UPPER_SNAKE valores | `enum StatusOS { ABERTA, FECHADA }` |
| Props | PascalCase + `Props` | `ApontamentoCardProps` |

### Banco de Dados (Supabase/PostgreSQL)
| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabelas | snake_case (plural) | `ordens_servico`, `apontamentos` |
| Colunas | snake_case | `horimetro_inicial`, `created_at` |
| Foreign keys | snake_case + `_id` | `equipamento_id`, `os_id` |
| Índices | `idx_` + tabela + coluna | `idx_apontamentos_os_id` |

**Mapeamento:** Banco em `snake_case` ↔ Código em `camelCase`. O Supabase retorna `snake_case`; manter consistência na escolha.

## Estrutura de Pastas (Feature-based)

```
src/
├── features/          # Agrupado por domínio (apontamento, ordem-servico, faturamento...)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── index.ts   # barrel export
├── shared/            # Compartilhado entre features
│   ├── components/
│   ├── layouts/       # OperadorLayout (/app) e RetaguardaLayout (/admin)
│   ├── hooks/
│   ├── utils/
│   └── types/
├── mocks/             # Dados mockados (fase Frontend First)
├── lib/               # Configs de terceiros (supabase.ts — futuro)
└── config/            # Constantes globais, rotas
```

> Os dois ambientes não duplicam features: a lógica de domínio é compartilhada em `src/features/`; o que muda é o **layout** (`OperadorLayout` vs `RetaguardaLayout`) e quais features cada rota expõe.

## Ordem de Imports

```typescript
// 1. React / framework
// 2. Bibliotecas externas
// 3. Componentes internos
// 4. Hooks internos
// 5. Utils e helpers
// 6. Types e interfaces
```

## UI — Regras Obrigatórias

| Regra | Detalhe |
|-------|---------|
| **Ícones** | Iconify (`@iconify/react`) para ícones de aplicação |
| **Tema light/dark** | Obrigatório. Toggle no header, persistir preferência, cores via tokens/CSS variables |
| **Estados de tela** | Toda tela de dados trata: loading, empty, error, success |
| **Responsividade** | Mobile-first. Validar em 375px, 768px, 1280px. Toque ≥ 44px no app do operador |
| **Financeiro no operador** | **NUNCA** exibir preço, valor ou dado financeiro no ambiente `/app/*` |

## Dados Pessoais (LGPD)

O sistema trata dados pessoais: CPF/CNPJ e telefone de clientes, telefone de operadores, assinatura no comprovante (PRD-011). Regras transversais:

- **Minimização:** coletar o mínimo necessário; campos pessoais opcionais quando possível.
- **Backend:** RLS restringindo acesso por perfil; **nunca logar** dados pessoais.
- **Comunicação ao cliente** (WhatsApp, PRD-009): exige base legal / opt-in registrado.

## Dados Mockados (fase Frontend First)

| Regra | Detalhe |
|-------|---------|
| **Localização** | `src/mocks/` |
| **Formato** | Espelhar o schema futuro do banco (`snake_case`, mesmos campos) |
| **Edge cases** | Incluir: listas vazias, nomes longos, volumes altos, registros sem foto/dado opcional |
| **Contrato** | Definir os `types` primeiro — mocks e backend futuro implementam o mesmo type |
| **Mock → Seed** | Projetar os mocks pensando que virarão `seed.sql` quando o backend chegar |

## TypeScript

| Regra | Detalhe |
|-------|---------|
| Sem `any` | Usar `unknown` ou tipo específico |
| Interfaces para objetos | PascalCase, sem prefixo `I` (ex.: `OrdemServico`, não `IOrdemServico`) |
| Optional chaining | `os?.cliente?.nome` (não usar `!`) |
| Enums para estados fixos | Em vez de strings soltas |

## Supabase (quando backend ativo)

| Regra | Detalhe |
|-------|---------|
| RLS sempre ativo | Em todas as tabelas |
| Types gerados | `supabase gen types typescript` |
| Queries tipadas | `.returns<OrdemServico[]>()` |
| Nunca expor `service_role` | Apenas `anon` key no frontend |
| Migrations versionadas | Cada alteração em arquivo SQL separado |

## Variáveis de Ambiente

| Contexto | Padrão |
|----------|--------|
| Frontend (Vite) | Prefixo `VITE_` → `VITE_SUPABASE_URL` |
| Backend/Edge | Sem prefixo → `SUPABASE_SERVICE_ROLE_KEY` |
| `.env.example` | No repo, com placeholders |
| `.env` | Nunca commitar (no `.gitignore`) |

## Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Linter
```

## Git — Conventional Commits

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova feature |
| `fix:` | Correção |
| `refactor:` | Refatoração |
| `docs:` | Documentação |
| `chore:` | Manutenção |
| `style:` | Formatação |
| `test:` | Testes |

## Isolamento do Trabalho — Worktree

**Toda feature nova ou mudança substancial começa em um worktree isolado.** Não trabalhar direto na
árvore principal nesses casos — o worktree evita que trabalho em andamento colida com a cópia de
trabalho do usuário ou com outras sessões rodando em paralelo.

| Situação | Onde trabalhar |
|----------|----------------|
| Feature nova, PRD, onda do UI kit | **Worktree isolado** (`EnterWorktree`, uma branch por trabalho) |
| Refatoração ampla, migração, mudança de schema | **Worktree isolado** |
| Correção pontual, ajuste de texto/estilo, doc curto | Árvore atual — sem worktree |
| Só leitura, investigação, responder pergunta | Árvore atual — sem worktree |

Regras de fechamento:

- Commitar **antes** de encerrar (o worktree pode ser apagado junto com a sessão) e dar push se houver remote.
- Nunca commitar direto em `main`, nunca force-push, nunca merge sem pedido.
- Abrir PR (draft quando o trabalho ainda não estiver pronto para review).

## Grafo de Conhecimento (graphify)

O projeto mantém um grafo de conhecimento navegável (código + docs + PRDs), útil para achar conceitos duplicados entre PRDs, rastrear o "porquê" de uma decisão antiga e medir impacto antes de mexer em algo compartilhado (ex.: `cn()`, `Button`, `OrdemServico`).

| Item | Detalhe |
|------|---------|
| **Local** | `graphify-out/` — gerado, **não versionado** (`.gitignore`) |
| **Atualizar** | `graphify . --update` — reextrai só arquivos novos/alterados. Rodar **após fechar cada PRD** (ver passo 4 abaixo), não a cada commit |
| **Reconstruir do zero** | `graphify .` (sem `--update`) — só quando `--update` não bastar (ex.: renomeação em massa de arquivos) |
| **Consultar via CLI** | `graphify query "<pergunta>"` (busca ampla), `graphify explain "<nó>"` (conexões de um nó específico — preferir a `query` para rastrear um nó só), `graphify path "A" "B"` (caminho entre dois conceitos) |
| **Consultar via MCP** | `.mcp.json` (não versionado — caminho do Python varia por instalação `uv tool install`) registra um server local com as tools `query_graph`, `get_node`, `get_neighbors`, `get_community`, `god_nodes`, `graph_stats`, `shortest_path`. Recriar com: `command` = saída de `cat graphify-out/.graphify_python`, `args` = `["-m", "graphify.serve", "<caminho absoluto para graphify-out/graph.json>"]` |
| **Relatório humano** | `graphify-out/GRAPH_REPORT.md` — God Nodes, comunidades, conexões surpreendentes, hyperedges, ciclos de import |

> Antes de escrever a spec de um PRD novo, vale rodar uma consulta rápida para checar se o conceito já existe em outro PRD — foi assim que se achou a inconsistência do prefixo `I` em interfaces e a duplicação do conceito "barreira financeira" entre PRD-006/007.

## Fluxo de Trabalho com PRDs

1. PRDs ficam em `docs/prds/`. **Sempre ler o PRD da tarefa antes de implementar.**
2. **Antes de implementar:** explore a estrutura dos dados, planeje cada passo, analise, investigue a fundo, pense e revise tudo.
3. **Faça perguntas** para esclarecer ambiguidades antes de codar.
4. **Após implementar:**
   - Incrementar versão seguindo [SemVer](https://semver.org/) — e atualizar `VERSAO_SISTEMA`
     em `src/features/auth/versao-sistema.ts`.
   - Atualizar `CHANGELOG.md` seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
   - Gerar codinome em inglês para MINOR/MAJOR (baseado no contexto das mudanças).
   - **Atualizar a `main` local** (diretriz **D2**).
   - **Atualizar `docs/PENDENCIAS-MOCK.md`** (diretriz **D1**).
   - Renomear o PRD adicionando `_DONE`.
   - Atualizar o `INDEX-PRDs-antonello.md`.
   - Atualizar o grafo de conhecimento: `graphify . --update`.
