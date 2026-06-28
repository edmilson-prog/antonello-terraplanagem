# Design — PRD-001: Cadastros Base (Equipamentos, Operadores, Clientes)

| Campo | Valor |
|-------|-------|
| **PRD de origem** | `docs/prds/PRD-001-ret-cadastros-base.md` |
| **Data** | 2026-06-27 |
| **Fase** | Frontend First (mockado) — sem backend |
| **Ambiente** | Retaguarda (`/admin/*`) — operador nunca acessa |
| **Status** | Design aprovado, aguardando plano de implementação |

## Objetivo

Transformar as rotas-placeholder `/admin/equipamentos`, `/admin/operadores` e `/admin/clientes` em CRUDs completos sobre **dados mockados** (listar, buscar/filtrar, criar, editar, inativar). Este PRD define o **contrato de `types`** estável que os PRDs seguintes (002 apontamento, 003 OS, 004 faturamento, 005 preços) vão consumir.

## Contexto do código atual (ponto de partida)

- O scaffold (design system, 2 shells, login por perfil, SEO/landing/blog) já existe.
- As 3 rotas de cadastro são **apenas placeholders** (`PageHeader` + `EmptyState`).
- `src/shared/types/index.ts` já tem versões **mínimas** de `Equipamento`, `Operador`, `Cliente`, usadas hoje só pelos mocks. **Nada consome `Equipamento.status`, `tipo`, etc. para lógica** — as features de faturamento e operador usam campos denormalizados (`equipamento_nome`/`equipamento_id`). Logo, **estender esses types é baixo risco**.
- Já existe um padrão de store em memória reativo: `features/operador/ordens-store.ts` usando `useSyncExternalStore`. O design **generaliza** esse padrão.
- Stack real: **TanStack Start + TanStack Router** (o `CLAUDE.md` menciona "React Router", mas o código usa TanStack — seguimos o código). Form: **react-hook-form + zod** (já nas deps). UI: **shadcn/ui** + tokens.

## Decisões de design (fechadas no brainstorming)

1. **Status do equipamento = dois eixos ortogonais.**
   - `ativo: boolean` → ciclo de vida / soft-delete (consistente com operador e cliente).
   - `status: EquipamentoStatus` (`disponivel | em_uso | manutencao`) → operacional (onde a máquina está). Preserva o que já existe e alimenta o filtro do RF-006.
   - *Rejeitado:* o campo único do PRD (`ativo|em_manutencao|inativo`) — misturava disponibilidade com ciclo de vida.
2. **`tipo` do equipamento vira enum/union** (`TipoEquipamento`), em vez de string livre — habilita o filtro por tipo (RF-006) e aproxima do schema futuro.
3. **`capacidade` permanece texto livre** (`"18 toneladas"`, `"2,5 m³"`) — unidades heterogêneas não compensam estruturar nesta fase.
4. **`documento` do cliente é opcional** nesta fase, mas **validado quando preenchido** (CPF/CNPJ) — RF-016.
5. **Soft-delete (inativar) é a ação primária**; **hard delete fica fora do MVP** (registros serão referenciados por OS/apontamentos depois).
6. **Ícones via Iconify** (`@iconify/react`), conforme `CLAUDE.md`. Set `lucide:*` para continuidade visual com o resto do app. Componentes shadcn mantêm o lucide interno.
7. **Features por domínio no topo de `src/features/`** (`equipamentos/`, `operadores/`, `clientes/`), conforme `CLAUDE.md`. As pastas por surface existentes (`features/operador/`, `features/retaguarda/`) **não são tocadas** — migrar shells para `shared/layouts/` é limpeza futura, fora deste escopo.

## Contrato de dados (`src/shared/types/index.ts`)

Estende as 3 interfaces existentes. `OrdemServicoOperador`, `SessaoMock` e os types de faturamento **não mudam**.

```typescript
export type TipoEquipamento =
  | "escavadeira" | "carregadeira" | "caminhao_cacamba"
  | "trator_esteira" | "retroescavadeira" | "outro";

// status OPERACIONAL — distinto de `ativo` (ciclo de vida)
export type EquipamentoStatus = "disponivel" | "em_uso" | "manutencao";

export interface Equipamento {
  id: string;
  nome: string;
  tipo: TipoEquipamento;          // (era string livre)
  capacidade: string;             // texto livre
  horimetro_atual: number;
  identificador: string | null;   // patrimônio/placa (opcional) — NOVO
  status: EquipamentoStatus;       // operacional
  ativo: boolean;                  // soft-delete — NOVO
  created_at: string;              // NOVO
  updated_at: string;              // NOVO
}

export interface Operador {
  id: string;
  nome: string;
  telefone: string | null;         // NOVO (opcional)
  ativo: boolean;
  created_at: string;              // NOVO
  updated_at: string;              // NOVO
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string | null;        // CPF/CNPJ opcional — NOVO
  telefone: string | null;         // NOVO
  ativo: boolean;                  // NOVO (soft-delete)
  created_at: string;              // NOVO
  updated_at: string;              // NOVO
}
```

> `created_at`/`updated_at` entram no contrato desde já porque viram colunas de auditoria no backend.

## Arquitetura — primitivos compartilhados + feature própria

### Primitivos novos em `src/shared/`

> Convenção de nome de arquivo: **kebab-case** em tudo (segue o código real — `use-theme.ts`, `ordens-store.ts`, `error-capture.ts`). Funções/hooks em camelCase no código.

| Arquivo | Responsabilidade | Como você usa | Depende de |
|---------|------------------|---------------|-----------|
| `shared/lib/create-mock-store.ts` | Fábrica genérica de store em memória sobre `useSyncExternalStore`. Generaliza `ordens-store.ts`. | `const store = createMockStore(seed)` → `store.useAll()`, `getById(id)`, `create(data)`, `update(id, patch)`, `setAtivo(id, ativo)`. Mutações síncronas; `create` injeta `id` + timestamps; `update` atualiza `updated_at`. | tipos da entidade (genérico `<T extends { id: string }>`) |
| `shared/hooks/use-mock-resource.ts` | Envelope que simula `loading` (delay no mount) e `error` (toggle) + `retry`, para exercitar os 4 estados de tela. Mutações continuam indo direto ao store. | `const { data, isLoading, error, retry } = useMockResource(store.useAll())` | — |
| `shared/components/data-list.tsx` | Lista responsiva: **tabela** em ≥768px, **cards** em <768px. Trata loading (skeleton), empty, error (retry) e success internamente. | Recebe `columns`, `renderCard`, `data`, `isLoading`, `error`, `onRetry`, `emptyState`, e slots de toolbar (busca + filtros). | shadcn `table`, `skeleton`, `EmptyState`, Iconify |
| `shared/components/form-dialog.tsx` | `Dialog` (shadcn) para criar/editar sobre a lista. Botão salvar com spinner, toast de sucesso/erro, fecha e volta à lista; em erro mantém os dados. | Recebe `titulo`, `open`, `onOpenChange`, conteúdo do form (children). | shadcn `dialog`, `sonner` (toast) |
| `shared/lib/validators.ts` | Validação de formato CPF/CNPJ (refinements zod) + helpers. | `zCpfCnpjOpcional`, `isCpf`, `isCnpj`. | zod |
| `shared/lib/format.ts` | Formatadores compartilhados (telefone, documento, horímetro). Mantém financeiro fora (cadastros não exibem valor). | `formatHorimetro`, `formatDocumento`, `formatTelefone`. | — |

Ajuste mínimo e retrocompatível: `EmptyState` e `PageHeader` passam a aceitar **também** um nome de ícone Iconify (string), mantendo o default lucide dos placeholders atuais.

### Por feature (`src/features/{equipamentos,operadores,clientes}/`)

```
features/equipamentos/
├── equipamentos-store.ts        # createMockStore(equipamentosMock)
├── labels.ts                    # mapas tipo/status → rótulo PT-BR + variante de badge
├── equipamento-schema.ts        # schema zod do form
├── components/
│   ├── equipamentos-page.tsx    # PageHeader + toolbar + DataList + estado do dialog
│   ├── equipamentos-columns.tsx # config de colunas + renderCard (mobile)
│   └── equipamento-form.tsx     # react-hook-form + zod
└── index.ts                     # barrel export
```

- **Equipamentos:** busca por nome/identificador; filtros por tipo e status; badge de status operacional + marca de inativo.
- **Operadores:** mais enxuto — nome, telefone, toggle ativo; busca por nome.
- **Clientes:** nome, documento (validado se preenchido), telefone, ativo; busca por nome/documento.

### Rotas

`admin.equipamentos.tsx`, `admin.operadores.tsx`, `admin.clientes.tsx` deixam de ser placeholder e montam `<XyzPage/>`, mantendo o bloco `head` com SEO `noindex,nofollow` (padrão das telas internas).

## Estrutura de arquivos (resumo do impacto)

**Modificados:** `src/shared/types/index.ts` · `src/mocks/{equipamentos,operadores,clientes}.ts` · `src/shared/components/{empty-state,page-header}.tsx` (ajuste Iconify) · `src/routes/admin.{equipamentos,operadores,clientes}.tsx` · `package.json` (+`@iconify/react`).

**Novos:** `src/shared/lib/{create-mock-store,validators,format}.ts` · `src/shared/hooks/use-mock-resource.ts` · `src/shared/components/{data-list,form-dialog}.tsx` · `src/features/{equipamentos,operadores,clientes}/**`.

## Fluxo de dados

```
Rota monta XyzPage → useMockResource(store.useAll()) → { data, isLoading, error, retry }
  ├─ busca / filtros = estado local → lista derivada (useMemo)
  ├─ "Novo"     → FormDialog vazio     → submit → store.create()  → toast sucesso → fecha
  ├─ "Editar"   → FormDialog preenchido → submit → store.update()  → toast sucesso → fecha
  └─ "Inativar" → AlertDialog confirma  → store.setAtivo(false)    → toast (registro permanece, badge "inativo")
```

Salvar só habilita com os campos obrigatórios válidos (RF-020).

## Estados de tela (cada lista)

| Estado | Tratamento |
|--------|-----------|
| Loading | skeleton de linhas (desktop) / cards (mobile) |
| Empty | `EmptyState` + CTA "Cadastrar primeiro [entidade]" |
| Error | mensagem + botão "Tentar novamente" (`retry`) |
| Success | tabela (desktop) / cards (mobile) |

Form: erros inline por campo; salvar inválido bloqueado; sucesso = toast + volta à lista; erro = toast mantendo os dados preenchidos.

## Validação por entidade (zod)

- **Equipamento:** `nome`* (mín.), `tipo`* (enum), `capacidade`*, `horimetro_atual`* (número ≥ 0), `identificador` opcional.
- **Operador:** `nome`*, `telefone` opcional, `ativo`.
- **Cliente:** `nome`*, `documento` opcional **mas válido (CPF/CNPJ) se preenchido**, `telefone` opcional, `ativo`.

(* = obrigatório)

## Dados mockados (edge cases do PRD)

| Arquivo | Conteúdo | Edge cases |
|---------|----------|-----------|
| `mocks/equipamentos.ts` | ~8 equipamentos (escavadeira 18t/10t/5t, carregadeira, caçamba, trator de esteira, retroescavadeira) | 1 `manutencao`, 1 `ativo:false`, 1 nome longo, 1 horímetro alto (≈9876.5), 1 sem `identificador` |
| `mocks/operadores.ts` | ~5 operadores | 1 inativo, 1 nome longo, 1 sem telefone |
| `mocks/clientes.ts` | ~4 clientes | 1 sem documento, 1 com CNPJ, 1 nome longo, 1 inativo |

Mocks espelham o schema futuro (`snake_case`) e devem virar `seed.sql` quando o backend chegar.

## Responsividade, tema e acessibilidade

- Mobile-first; validar em **375 / 768 / 1280px**. Tabela → cards em <768px.
- Light/dark via tokens/CSS variables; **nada hardcoded**.
- Formulários com `label` associado, navegação por teclado, contraste do design system.
- **Nenhum dado financeiro** — cadastros não exibem preço/valor (e nunca aparecem em `/app/*`).

## Fora de escopo

Backend/Supabase · preços/tarifas (PRD-005) · apontamento (PRD-002) · OS (PRD-003) · hard delete · OCR/fotos/anexos · importação do sistema antigo (Farol) · expor cadastros no app do operador.

## Critérios de aceitação

Os cenários Gherkin do PRD-001 (RF-002 cadastrar, RF-004 inativar-não-excluir, RF-016 validação de documento, RF-005/006 busca e filtro, e cenários de erro/empty) são o critério de pronto. Cada um deve ser demonstrável sobre os mocks.

## Riscos e pontos de atenção

| Risco | Mitigação |
|-------|-----------|
| Alterar `tipo` de string→enum quebra o mock atual | Atualizar os 3 mocks no mesmo passo; nada além dos mocks lê `tipo`. |
| Ajuste do `EmptyState` para Iconify quebrar placeholders | Manter o prop `icone: LucideIcon` atual funcionando; adicionar o caminho Iconify como opcional. |
| Simular loading/error com `useSyncExternalStore` confunde | Separar responsabilidades: store = dados reativos; `useMockResource` = envelope assíncrono simulado. |

## Pós-implementação (exigido por PRD + CLAUDE.md)

1. Bump SemVer (nova feature → **MINOR**, codinome sugerido: **"Registry"** ou **"Ledger"**).
2. Atualizar `CHANGELOG.md` (Keep a Changelog).
3. Renomear o PRD para `PRD-001-ret-cadastros-base_DONE.md`.
4. Atualizar `docs/prds/INDEX-PRDs-antonello.md` (status, versão, dependências).
5. (Limpeza oportuna) remover o arquivo duplicado `docs/prds/INDEX-PRDs-antonello (1).md`.
