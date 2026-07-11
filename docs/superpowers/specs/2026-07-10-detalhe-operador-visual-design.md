# Refatoração visual — Detalhe do Operador (`/admin/operadores/:id`)

**Data:** 2026-07-10
**Área:** `src/features/operadores/components/operador-detalhe.tsx` (+ novos subcomponentes)
**Mock alvo:** `docs/html/mock-detalhe-operador.html`

## Objetivo

Refatorar a página de detalhe do operador para adotar a linguagem visual do mock
(tema "canteiro de obras": fundo asfalto, amarelo-máquina, faixa de sinalização,
fontes Archivo/IBM Plex), elevando de uma tela simples (3 campos + lista de OS)
para o layout rico do mock: hero, faixa de KPIs e grid de cards de atividade.

## Decisões (já aprovadas com o cliente)

1. **Lacuna de dados → fidelidade total com dados de exemplo.** O mock mostra muito
   mais dado do que existe no schema/DB hoje. A refatoração reproduz o layout
   completo; seções sem backing real recebem **dados de exemplo plausíveis**.
2. **Identidade = real; enriquecimento = exemplo.** O hero mostra o operador
   clicado de verdade (nome, CPF, telefone, status, "operador desde" vindos do
   Supabase via `operadoresStore`). Todo o resto (KPIs, apontamentos, OS,
   horas/semana, equipamentos habilitados, dados cadastrais extra, acesso ao app)
   usa dados de exemplo.
3. **Light + dark obrigatórios.** O mock é dark-only; a implementação usa **apenas
   tokens** (`bg-card`, `text-primary`, `border-border`, `text-foreground-faint`…),
   nunca hex hardcoded. Os tokens do projeto já coincidem 1:1 com o mock no dark
   (`--background #16140F`, `--card #211D15`, `--primary #FFB300`, `--border #2C2719`).
4. **Botão WhatsApp = link `wa.me` simples** com o telefone do operador. Sem
   integração WAHA (essa é para aviso de OS ao cliente, não ao operador).
5. **Lista de OS = exemplo** (como o resto), para a tela ficar visualmente completa.
   Não depende do `ordensStore` nesta versão.

## Insights de design aplicados (consultoria ui-ux-pro-max)

- Dark atinge WCAG AAA; manter contraste ≥ 4.5:1. Amarelo `#FFB300` só como
  **texto sobre escuro** (~9:1); em fundo claro usar como **fundo** (`primary/15`)
  com texto escuro — nunca amarelo puro como texto sobre claro.
- **Cor nunca sozinha** para status: sempre bolinha *led* + label (Ativo,
  Em andamento, Concluída…).
- Tabela densa: `<Table>` semântico (shadcn), números à direita, horímetro em mono.
  Sem virtualização (capamos em ~5 linhas).
- Charts com Recharts (já instalado): barras para "horas/semana" com rótulo de
  valor; sparklines de KPI como linha fina.
- Interação: `cursor-pointer` + `focus-visible:ring-2 ring-primary` em linhas/cards
  clicáveis; usar `Link`/`button` (não `div`); transições 150–300ms;
  respeitar `prefers-reduced-motion`.
- Reuso em vez de reinvenção: estender `KpiCard`, usar `HazardStripe`,
  `OperadorForm`, `StatusOSBadge`.

## Estrutura da página (área de conteúdo)

O shell (sidebar, header, faixa de sinalização) já é global em `retaguarda-shell.tsx`.
Refatoramos só o conteúdo:

1. **Back link** "← Operadores".
2. **Hero card**: avatar de iniciais (gradiente amarelo) · nome (Archivo uppercase) ·
   badges [Ativo/Inativo — **real** · "Operador" · "Acesso ao app"] ·
   quickfacts [CPF · Telefone · Operador desde — **real** | Última atividade — exemplo] ·
   ações [Editar — **real** · WhatsApp (`wa.me`) · Inativar/Reativar — **real**].
   "Editar" abre o `OperadorForm` inline (comportamento atual preservado).
3. **KPI strip** (4 cards, exemplo): Horas apontadas · OS ativas · OS concluídas ·
   Equipamentos operados — cada um com sparkline + trend.
4. **Grid 2 colunas** (1.6fr / 1fr, colapsa para 1 coluna < 1080px):
   - **Esquerda:** Apontamentos recentes (tabela, exemplo) · Ordens de Serviço
     (lista, exemplo).
   - **Direita:** Dados cadastrais (CNH/nascimento/vínculo/base — exemplo;
     telefone — real) · Horas por semana (barras Recharts, exemplo) ·
     Equipamentos habilitados (chips, exemplo) · Acesso ao app (exemplo).
5. **Nota rodapé**: "Perfil operacional — sem dados financeiros…" (reforça a
   partição de acesso).

## Estados de tela

Os estados `isLoading` / `error` / `não encontrado` do `operadoresStore` seguem
tratados como hoje (skeleton, alerta com retry, mensagem "não encontrado").
Como o enriquecimento é exemplo (sempre presente), os cards de atividade não têm
estado vazio — sempre renderizam.

## Decomposição em componentes (unidades pequenas e focadas)

Todos em `src/features/operadores/components/`:

- `operador-detalhe.tsx` — orquestrador (loading/error/not-found + composição).
- `operador-hero.tsx` — hero (avatar, nome, badges, quickfacts, ações).
- `operador-kpis.tsx` — faixa de 4 KPIs (usa/estende `KpiCard` + sparkline).
- `apontamentos-recentes-card.tsx` — tabela shadcn.
- `ordens-vinculadas-card.tsx` — lista estilo mock (`os-list`).
- `dados-cadastrais-card.tsx` — datalist (CNH, nascimento, vínculo, base, telefone).
- `horas-semana-card.tsx` — gráfico de barras (Recharts).
- `equipamentos-habilitados-card.tsx` — chips.
- `acesso-app-card.tsx` — status do app + grid de infos.
- `sparkline.tsx` (em `src/shared/components/`) — sparkline reutilizável.

Dados de exemplo isolados:

- `src/features/operadores/operador-showcase-data.ts` — **único ponto** com dado de
  exemplo. Função `showcaseDoOperador(id: string)` retorna KPIs, apontamentos, OS,
  horas/semana, equipamentos, dados cadastrais e acesso ao app. **Determinístico
  por `id`** (mesma seed → mesmos números, estável entre renders; varia entre
  operadores por hashing simples do id). Comentário no topo deixa explícito que é
  dado de exemplo temporário, a remover quando os dados reais existirem.

## Mapeamento de tokens (mock → projeto)

| Mock | Token do projeto |
|------|------------------|
| `--bg #16140f` | `bg-background` |
| `--surface / --card #211d15` | `bg-card` / `bg-surface` |
| `--fg #f0eee6` | `text-card-foreground` / `text-foreground` |
| `--muted-2` | `text-foreground-faint` |
| `--amarelo #ffb300` | `text-primary` / `bg-primary` |
| `--amarelo-soft` | `bg-primary/10..15` |
| `--border` | `border-border` |
| success/danger/info | `success` / `destructive` / `info` (tokens existentes) |
| faixa diagonal | `<HazardStripe />` / util `hazard-stripe` |

## Acessibilidade (checklist)

- Contraste ≥ 4.5:1 em ambos os temas; amarelo só como regra acima.
- Status com cor + ícone/label (nunca cor só).
- `cursor-pointer` + `focus-visible:ring-2 ring-primary` em clicáveis.
- Linhas/cards clicáveis são `Link`/`button` (teclado nativo).
- Avatar decorativo com `aria-hidden`; ícones-only com `aria-label`.
- `prefers-reduced-motion` respeitado (já global no projeto).
- Tabela com `<thead>`/`<tbody>` semânticos.

## Fora de escopo (futuro)

- Expandir o schema `operadores` (CNH, nascimento, vínculo, base).
- Relação operador ↔ equipamentos habilitados.
- Migração `apontamentos` mock → Supabase e agregações reais de KPI/horas.
- Quando esses dados existirem, trocar `operador-showcase-data.ts` pelas fontes
  reais, sem mexer nos componentes de apresentação.

## Testes

- `tsc --noEmit` limpo.
- Suíte `vitest` existente continua verde (481 testes).
- Teste unitário do `operador-showcase-data.ts`: determinismo (mesmo id → mesmo
  resultado) e variação entre ids diferentes.
- Verificação visual manual (usuário) em light e dark, 375/768/1280px.
