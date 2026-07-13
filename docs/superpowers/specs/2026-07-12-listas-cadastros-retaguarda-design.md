# Listas de cadastro da retaguarda — Clientes, Operadores, Equipamentos

**Data:** 2026-07-12
**Áreas:**
- `src/features/clientes/components/clientes-page.tsx`
- `src/features/operadores/components/operadores-page.tsx`
- `src/features/equipamentos/components/equipamentos-page.tsx`
- Novos compartilhados: `src/shared/components/filtro-chips.tsx`, `src/shared/components/linha-entidade-cell.tsx`
- Restilizado: `src/shared/components/status-ativo.tsx`

**Mocks alvo (UI kit, fonte de verdade de design):** projeto Claude Design "Antonello
Terraplanagem — Design System" (`claude_design` MCP, projeto `2ede574c-b344-4984-8c24-88e1130720be`),
também disponível como cópia local em
`docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/{ClientesList,OperadoresList,EquipamentosList}.jsx`.

## Relação com trabalho irmão (não duplicar)

Existe uma branch paralela `feat/telas-area-retaguarda` (spec em
`docs/superpowers/specs/2026-07-12-telas-area-retaguarda-design.md`), com sessão ativa no momento
desta spec, re-vestindo as telas de **área/operação** (Faturamento, Ordens de Serviço, Orçamentos,
Comprovantes) com o mesmo design system. Ela cria `src/shared/components/status-filter-chips.tsx`
— chips de filtro com contador, API `{itens: {id,label,tone?}[], ativo, onChange, counts}`.

Esta spec cobre as telas de **cadastro** (Clientes/Operadores/Equipamentos) — sem sobreposição de
arquivos com a branch irmã. Mas a necessidade de um componente de chip de filtro é a mesma. Como
`status-filter-chips.tsx` ainda não está em `main`, esta spec cria um componente próprio
(`filtro-chips.tsx`) com **API deliberadamente compatível** (mesmos nomes de prop: `itens`,
`ativo`, `onChange`, `counts`, mesmo shape de item `{id, label, tone?}`) para que, quando as duas
branches mergearem, a reconciliação seja renomear/importar um dos dois e apagar o outro — não
reescrever chamadores.

## Decisões de design

1. **Híbrido real+exemplo, mas nem toda coluna nova é real.** Cliente já deriva "OS ativas" e
   "Saldo" de verdade no `cliente-detalhe` (via `ordensStore`/`contasReceberStore` por
   `cliente_id`) — a lista reaproveita a **mesma derivação**, então essas duas colunas são reais.
   Operador e Equipamento são diferentes: o `operador-detalhe` e o `equipamento-detalhe` **já
   decidiram** tratar métricas equivalentes ("Horas apontadas"/"OS ativas" do operador, "Horas no
   mês" do equipamento) como **exemplo** (`operador-showcase-data.ts` / `equipamento-showcase-data.ts`),
   mesmo havendo função de derivação real disponível (`src/features/apontamento/apontamentos-store.ts`,
   `src/features/diesel/derivacoes.ts`) — porque os mocks de apontamento/abastecimento ainda usam
   IDs que não batem com os UUIDs reais de operador/equipamento no Supabase (mesmo "seam"
   documentado na revisão final da rodada de detalhe). Se a lista tornasse essas colunas reais,
   o mesmo registro mostraria números diferentes ao navegar lista → detalhe. Por isso, as colunas
   novas de Operador e Equipamento reaproveitam os módulos de showcase já existentes (mesma fonte
   que o detalhe usa para o mesmo `id`), preservando consistência lista↔detalhe. Única exceção:
   "Próx. manutenção" do Equipamento é real (mesma lógica do `proxima-manutencao-card.tsx`,
   já com fallback "—" para o mesmo "seam" de IDs).
2. **Sem "Exportar".** Nenhuma das 3 listas tem função de exportação real hoje — o botão do mock
   é omitido (mesma decisão da spec irmã, por `CLAUDE.md` "nunca half-finished").
3. **Pills de filtro só onde já existe filtro multi-valor.** Hoje só Equipamentos tem `Select` de
   Tipo e de Status; Clientes/Operadores só têm o toggle binário "Mostrar inativos". Pills
   (`FiltroChips`) substituem o `Select` de **Status** do Equipamento (4 valores: Todos/Disponível/
   Em uso/Em manutenção). O `Select` de **Tipo** (6 valores) é mantido como dropdown — pills
   ficariam apertadas/quebrando linha demais para esse volume. Clientes/Operadores não ganham
   pills novas (não há filtro multi-valor a substituir); o toggle "Mostrar inativos" ganha só o
   verniz visual (borda/tom), sem virar chip de contagem.
4. **Equipamentos mantém a coluna "Capacidade".** O mock não a mostra, mas é dado real já exibido
   hoje — não é removida só para bater 1:1 com o mock (mesmo princípio de "nunca rebaixar dado
   real" das rodadas anteriores).
5. **`StatusAtivo` é restilizado, não substituído.** Visual de chip com LED (bolinha colorida +
   texto), API inalterada (`{ativo: boolean}`) — qualquer outra tela que já usa esse componente
   ganha o visual novo de graça, sem precisar migrar chamadores.
6. **Tipo (PJ/PF) vira coluna nova no Cliente**, real via `tipo_pessoa` — dado que já existe no
   tipo `Cliente` mas não era exibido na lista.
7. **Cidade/Segmento do Cliente são exemplo**, reaproveitando `cliente-showcase-data.ts`
   (`cadastrais.segmento` já existe; `cadastrais.cidade` é campo novo, extraído do
   `CIDADES_POOL` já existente no módulo — aditivo, não quebra o consumidor atual do detalhe).
8. **Paginação não é estendida.** Hoje só `ClientesPage` pagina; `OperadoresPage`/`EquipamentosPage`
   não. Este trabalho é visual — não estende paginação para as outras duas.

## Reuso (não reinventar)

- `src/shared/components/data-list.tsx` — `DataList`/`Column` continua fornecendo a tabela +
  fallback mobile em cards + loading/error/empty/toolbar. Não é modificado na lógica, só na
  classe visual (bordas, tipografia mono, espaçamento) para casar com o resto.
- `src/shared/components/page-header.tsx`, `form-dialog.tsx`, `confirm-dialog.tsx` — mantidos
  sem alteração de comportamento.
- `src/features/clientes/cliente-showcase-data.ts` (estendido, campo `cadastrais.cidade` novo),
  `src/features/operadores/operador-showcase-data.ts`,
  `src/features/equipamentos/equipamento-showcase-data.ts` — nenhum arquivo de exemplo novo é
  criado; os módulos por entidade que já existem ganham os campos que a lista precisa.
- Derivações reais já existentes: OS ativas/Saldo do cliente (mesma lógica de
  `cliente-detalhe.tsx`), `planosParaEquipamento`/`statusPlano`
  (`src/features/manutencao/derivacoes.ts`) para "Próx. manutenção".
- `EquipamentoStatusBadge`, `InativoBadge`, `TIPO_LABEL`, `STATUS_LABEL`
  (`src/features/equipamentos/labels.tsx`) — mantidos.
- Formatadores: `formatDocumento`, `formatTelefone`, `formatHorimetro`
  (`src/shared/lib/format.ts`).

## Componentes compartilhados novos

### `src/shared/components/filtro-chips.tsx`

```ts
interface FiltroChipItem {
  id: string;
  label: string;
  tone?: "info" | "success" | "warn" | "neutral"; // cor do led; omitido = sem led (ex. "Todos")
}
interface FiltroChipsProps {
  itens: FiltroChipItem[];
  ativo: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}
function FiltroChips(props: FiltroChipsProps): JSX.Element;
```
Visual: linha de `<button type="button" aria-pressed>` `rounded-full border px-3 py-1.5 text-xs`,
ativo com `border-primary bg-primary text-primary-foreground`, led colorido por `tone` (token
semântico — `text-primary`/`text-secondary`/`text-destructive`/`text-muted-foreground`, nunca
hex), contador `· {count}` ao final do label. Mesma API de shape que
`status-filter-chips.tsx` da branch irmã, para facilitar reconciliação futura.

### `src/shared/components/linha-entidade-cell.tsx`

```ts
interface LinhaEntidadeCellProps {
  variante: "icone" | "avatar";
  icone?: string;       // obrigatório se variante === "icone" (nome Iconify, ex. "lucide:building-2")
  iniciais?: string;    // obrigatório se variante === "avatar"
  titulo: React.ReactNode;   // nome, geralmente um <Link>
  subtitulo?: React.ReactNode;
  tonePrimaria?: boolean; // true = tile/avatar em tom âmbar (padrão); false = tom neutro
}
function LinhaEntidadeCell(props: LinhaEntidadeCellProps): JSX.Element;
```
Renderiza `<div className="flex items-center gap-3">` com o tile/avatar (30-34px, `rounded-lg`/
`rounded-full`) + coluna `título` (negrito, trunca) + `subtítulo` (texto pequeno, `foreground-faint`).
Usada nas 3 listas na coluna principal, substituindo o markup de nome/subtítulo hoje duplicado
inline em cada `renderCard`/coluna "Nome".

## Página 1 — Clientes (`/admin/clientes`)

`PageHeader` (Clientes · Novo cliente) inalterado. `DataList` com busca (mantém) + toggle
"Mostrar inativos" (mantém, resestilizado). Colunas:

| Coluna | Conteúdo | Fonte |
|---|---|---|
| Cliente | `LinhaEntidadeCell` variante ícone (`building-2` PJ / `user` PF) + nome (link) + Cidade (subtítulo) | Nome real · ícone por `tipo_pessoa` real · Cidade exemplo |
| Tipo | Badge PJ/PF | Real (`tipo_pessoa`) — coluna nova |
| Documento | mono | Real (mantém) |
| Telefone | mono | Real (mantém) |
| OS ativas | número, direita | **Real** — coluna nova, mesma derivação do `cliente-detalhe` |
| Saldo | mono, direita, destaque se > 0 | **Real** — coluna nova, mesma derivação do `cliente-detalhe` |
| Situação | `StatusAtivo` (restilizado) | Real (mantém) |

`renderCard` (mobile) ganha as mesmas colunas novas de forma compacta, sem quebrar o card atual.
Ordenação/paginação/busca (nome + documento) preservadas exatamente como hoje.

## Página 2 — Operadores (`/admin/operadores`)

`PageHeader` (Operadores · Novo operador) inalterado. `DataList` com busca (mantém) + toggle
"Mostrar inativos" (mantém, resestilizado). Colunas:

| Coluna | Conteúdo | Fonte |
|---|---|---|
| Operador | `LinhaEntidadeCell` variante avatar (iniciais) + nome (link) + "N OS ativas" (subtítulo) | Nome real · OS ativas **exemplo** (`showcaseDoOperador(id).kpis.osAtivas.valor`) |
| Vínculo | Badge | Exemplo (`cadastrais.vinculo`) — coluna nova |
| Base | texto | Exemplo (`cadastrais.base`) — coluna nova |
| Horas (mês) | mono, direita | Exemplo (`kpis.horasApontadas.valor`) — coluna nova |
| Acesso ao app | Badge simples "Liberado"/"Sem acesso" (não usa `FiltroChips` — sem contador, não é filtro) | Exemplo (`acessoApp.liberado`) — coluna nova |
| Situação | `StatusAtivo` (restilizado) | Real (mantém) |

Sem pills aqui (não há filtro multi-valor hoje). `renderCard` ganha as colunas novas compactadas.

## Página 3 — Equipamentos (`/admin/equipamentos`)

`PageHeader` (Equipamentos · Novo equipamento) inalterado. `DataList` com busca (mantém) +
**`FiltroChips` de Status** (Todos/Disponível/Em uso/Em manutenção, com contador — substitui o
`Select` de status) + `Select` de Tipo mantido (6 valores) + toggle "Mostrar inativos" (mantém).
Colunas:

| Coluna | Conteúdo | Fonte |
|---|---|---|
| Equipamento | `LinhaEntidadeCell` variante ícone (por tipo: `truck`/`tractor`/`forklift`) + nome (link) + identificador (subtítulo, mantém) | Real (mantém) |
| Tipo | Badge | Real (mantém) |
| Capacidade | texto | Real (mantém — decisão 4) |
| Horímetro | mono, direita | Real (mantém) |
| Horas (mês) | mono, direita | Exemplo (`kpis.horasMes.valor`) — coluna nova |
| Diesel médio | mono, direita | Exemplo (novo campo em `equipamento-showcase-data.ts`, formato `"N,N L/h"`) — coluna nova |
| Próx. manutenção | texto, destaque vermelho se vencida, "—" se sem plano | **Real** (mesma lógica do `proxima-manutencao-card.tsx`) — coluna nova |
| Situação | `EquipamentoStatusBadge`/`InativoBadge` (mantém) | Real (mantém) |

`renderCard` ganha as colunas novas compactadas.

## Estados de tela

`isLoading`/`error`/empty de cada `DataList` preservados exatamente como hoje — nenhuma store
muda de comportamento assíncrono. Empty states (ícone/título/descrição/CTA) mantidos.

## Acessibilidade

- `FiltroChips` são `<button type="button">` com `aria-pressed` no ativo.
- Led de tom sempre acompanhado de label (nunca cor só).
- Contraste ≥ 4.5:1; `focus-visible:ring-2 ring-primary` em chips/links/botões.
- `LinhaEntidadeCell`: o tile/avatar decorativo não recebe `alt`/label (é puramente visual, o
  nome ao lado já carrega a informação — sem texto duplicado para leitor de tela).

## Testes

- `tsc --noEmit` limpo; suíte `vitest` existente permanece verde.
- `cliente-showcase-data.test.ts` — estender para o novo campo `cadastrais.cidade`
  (determinístico, dentro do pool).
- `equipamento-showcase-data.test.ts` — estender para o novo campo de diesel médio
  (determinístico, formato `"N,N L/h"`).
- Testes unitários novos: `filtro-chips.test.tsx` (seleção, contador, `aria-pressed`,
  callback `onChange`) e `linha-entidade-cell.test.tsx` (renderiza variante ícone e variante
  avatar-iniciais).
- Sem testes de snapshot/integração novos para as 3 `*-page.tsx` em si — mesmo padrão das
  rodadas anteriores (confiança vem de `tsc`/`eslint`/vitest da suíte completa + revisão final).
- Verificação visual manual (usuário) em light/dark, 375/768/1280px — não delegada a subagent.

## Fora de escopo (futuro)

- Reconciliar `filtro-chips.tsx` com `status-filter-chips.tsx` da branch irmã quando ambas
  mergearem (decisão de qual nome/arquivo prevalece fica para esse momento).
- Exportação real (CSV) para qualquer uma das 3 listas — não existe hoje, não é criada aqui.
- Estender paginação para Operadores/Equipamentos — fora de escopo desta rodada visual.
- Filtro de Tipo do Cliente (PJ/PF) — não solicitado, só 2 valores, não justifica.
