
# Fundação Navegável — Plataforma Antonello Terraplanagem

Esta etapa entrega **apenas a fundação navegável**, sem backend e sem features. Todo dado é mock. Interface 100% em português brasileiro.

## Ajuste de stack (importante)

O prompt original cita **React Router**, mas este projeto Lovable usa **TanStack Router + TanStack Start** (file-based routing em `src/routes/`). Vou usar TanStack Router — o resultado para o usuário final é idêntico (mesmas rotas, mesmos shells), só muda a forma como os arquivos são organizados internamente. Mantenho todo o resto do briefing (cores, fontes, estrutura de pastas `features/shared/mocks`, snake_case nos mocks, sem backend, sem dados financeiros no app do operador).

## 1. Design System (tokens, zero hardcode)

Atualizar `src/styles.css`:
- Tokens de cor em CSS variables convertidas para `oklch`, mapeadas em `@theme inline` para utilitários Tailwind semânticos:
  - `--primary` (amarelo-máquina #FFB300) + `--primary-hover` (#E09600)
  - `--secondary` (terra #A2622F) + `--secondary-soft` (#C07B43)
  - `--muted` / `--steel` (aço #717A82 / #9AA1A8)
  - `--background` claro (concreto #F4EFE6), `--surface` (#E8E2D5), `--border` (#D6CDBC)
  - `--foreground` (tinta #1B1912), `--muted-foreground` (#5A554A), `--foreground-faint` (#8C8678)
  - Asfalto (#16140F, #211D15, #2C2719) usados no dark mode e na faixa de canteiro
- `.dark` com inversão (asfalto como background, concreto como foreground), contraste reforçado.
- Famílias tipográficas como CSS vars: `--font-display` (Archivo), `--font-sans` (IBM Plex Sans), `--font-mono` (IBM Plex Mono). Fontes carregadas via `<link>` no `__root.tsx` (Google Fonts) — não via `@import` no CSS.
- Utilitários Tailwind: `font-display`, `font-sans`, `font-mono` via `@theme`.
- Componente `<HazardStripe />` em `src/shared/components/` — faixa de listras diagonais amarelo/asfalto via `repeating-linear-gradient` com tokens, usada no topo dos headers de ambos os shells.
- Toggle de dark mode com persistência em `localStorage` (`src/shared/hooks/use-theme.ts`).

## 2. Estrutura de pastas

```text
src/
  routes/                      # file-based routing (TanStack)
    __root.tsx                 # shell HTML + fonts + theme provider
    index.tsx                  # redireciona para /login
    login.tsx
    app.tsx                    # layout Operador (bottom nav + hazard stripe)
    app.index.tsx              # /app — Início
    app.apontamento.tsx
    app.ordens.tsx
    app.perfil.tsx
    admin.tsx                  # layout Retaguarda (sidebar + header)
    admin.index.tsx            # /admin — Dashboard
    admin.ordens.tsx
    admin.equipamentos.tsx
    admin.clientes.tsx
    admin.operadores.tsx
    admin.faturamento.tsx
  features/
    auth/                      # tela de login mock + seletor de perfil
    operador/                  # shell + placeholders do app de campo
    retaguarda/                # shell + placeholders do escritório
  shared/
    components/                # HazardStripe, EmptyState, ThemeToggle, PageHeader
    hooks/                     # use-theme, use-mock-session
    types/                     # contratos compartilhados (perfil, equipamento, etc.)
  mocks/
    equipamentos.ts
    operadores.ts
    clientes.ts
```

## 3. Tipos compartilhados (`src/shared/types/`)

Definidos **antes** dos mocks — são o contrato do backend futuro. Campos em `snake_case`.

- `Perfil = "operador" | "recepcao" | "proprietario"`
- `Equipamento { id; nome; tipo; capacidade; horimetro_atual; status }`
- `Operador { id; nome; ativo }`
- `Cliente { id; nome }`

## 4. Mocks (`src/mocks/`, snake_case)

- `equipamentos.ts` — 6 itens (escavadeira 18t/10t/5t, carregadeira, caçamba, trator de esteira), incluindo um `nome` longo.
- `operadores.ts` — 4 itens.
- `clientes.ts` — 3 itens.
- Garantir que pelo menos uma listagem (ex.: clientes) possa ser exibida vazia para validar o empty state.

## 5. Login mock (`/login`)

- Card centralizado com faixa de canteiro no topo.
- Campos visuais de e-mail/senha (sem validação real).
- Seletor de perfil (Operador / Recepção / Proprietário) — botão "Entrar" grava `{ perfil }` em `localStorage` via `use-mock-session` e redireciona:
  - operador → `/app`
  - recepção e proprietário → `/admin`
- `/` redireciona para `/login`.

## 6. Shell Operador (`/app/*`)

- Mobile-first, container `max-w-md mx-auto`, alvos de toque ≥ 44px.
- Header com `<HazardStripe />`, título da seção, `<ThemeToggle />`.
- **Bottom navigation** fixo: Início, Apontamento, Minhas OS, Perfil (ícones lucide).
- Dark mode com contraste alto (fundo asfalto, texto concreto, primária amarelo-máquina vívida).
- **Nenhum valor financeiro em nenhuma tela** deste ambiente — regra registrada em comentário no layout.
- Cada rota: `<PageHeader>` + `<EmptyState>` ("Em construção").

## 7. Shell Retaguarda (`/admin/*`)

- Desktop-first responsivo. Sidebar fixa ≥ md (Dashboard, Ordens, Equipamentos, Clientes, Operadores, Faturamento). No mobile vira `Sheet` (hambúrguer no header).
- Header com faixa de canteiro, breadcrumbs derivados da rota, `<ThemeToggle />`, avatar mock.
- Cada rota: `<PageHeader>` (título + descrição curta) + `<EmptyState>` ("Em construção").

## 8. Componentes compartilhados

- `HazardStripe` — faixa decorativa (8px) amarelo/asfalto.
- `EmptyState` — ícone (lucide `Construction`), título, subtítulo.
- `PageHeader` — título display + descrição.
- `ThemeToggle` — alterna `.dark` no `<html>` e persiste.

## 9. Responsividade

Validar manualmente em 375 / 768 / 1280px (Operador prioriza 375, Retaguarda prioriza 1280 mas continua usável no mobile).

---

## Fora do escopo desta etapa

- Backend (Supabase / Lovable Cloud), autenticação real, CRUD, formulários funcionais, dados financeiros no app do operador, tabelas com dados reais, lógica de horímetro / OS / faturamento. Tudo isso entra em prompts incrementais posteriores.
