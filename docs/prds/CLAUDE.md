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

> ⚠️ **FASE ATUAL:** Frontend First (mockado)

- NÃO criar tabelas no Supabase.
- NÃO conectar backend real.
- Todos os dados vêm de `src/mocks/`.
- O backend (Supabase + n8n) só será implementado **após aprovação do projeto**.

## Os Dois Ambientes (Surfaces)

Repositório único com dois ambientes que compartilham os mesmos `types` (o contrato de dados):

| Ambiente | Rota | Form factor | Perfis | Observação |
|----------|------|-------------|--------|------------|
| **App do Operador** | `/app/*` | Mobile-first (PWA), bottom nav | operador | Campo. **Nunca exibe preço, valor ou dado financeiro.** Alta legibilidade sob sol. |
| **Retaguarda** | `/admin/*` | Desktop, sidebar + tabelas | recepção, proprietário/admin | Escritório. Completa registros, cadastros, faturamento. |

Os perfis (`operador`, `recepção`, `proprietário/admin`) definem o que cada um vê. Dados financeiros só para perfis autorizados.

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

## Arquitetura — Ponto Crítico (ler antes de modelar dados)

O núcleo técnico de maior risco é a **OS colaborativa**: precisa ser **offline-first** (o operador aponta em campo sem sinal) e, ao mesmo tempo, **sincronizar em tempo real** entre vários celulares e a central.

> ✅ **Resolvido pelo spike PRD-000 → [`ADR-001`](../adr/ADR-001-sync-offline-os-colaborativa.md).** Decisão: **Supabase Realtime + fila offline própria (Abordagem A)**:
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
| Interfaces | PascalCase + `I` | `IOrdemServico`, `IApontamento` |
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
| Interfaces para objetos | Prefixo `I` |
| Optional chaining | `os?.cliente?.nome` (não usar `!`) |
| Enums para estados fixos | Em vez de strings soltas |

## Supabase (quando backend ativo)

| Regra | Detalhe |
|-------|---------|
| RLS sempre ativo | Em todas as tabelas |
| Types gerados | `supabase gen types typescript` |
| Queries tipadas | `.returns<IOrdemServico[]>()` |
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

## Fluxo de Trabalho com PRDs

1. PRDs ficam em `docs/prds/`. **Sempre ler o PRD da tarefa antes de implementar.**
2. **Antes de implementar:** explore a estrutura dos dados, planeje cada passo, analise, investigue a fundo, pense e revise tudo.
3. **Faça perguntas** para esclarecer ambiguidades antes de codar.
4. **Após implementar:**
   - Incrementar versão seguindo [SemVer](https://semver.org/).
   - Atualizar `CHANGELOG.md` seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
   - Gerar codinome em inglês para MINOR/MAJOR (baseado no contexto das mudanças).
   - Renomear o PRD adicionando `_DONE`.
   - Atualizar o `INDEX-PRDs-antonello.md`.
