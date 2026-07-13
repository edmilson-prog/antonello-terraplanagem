# Antonello Terraplanagem — Design System

Design system for the internal operations platform of **Antonello Terraplanagem**, a
Brazilian (pt‑BR) earthmoving / earthwork ("terraplenagem") contractor. The software is
built by **AILA**. It is a dark, worksite‑grade back‑office where the operator of a fleet
of heavy machines runs clients, service orders, operators, equipment, quotes, invoicing
and fleet costs.

Two products are represented:

- **Retaguarda** — the desktop back‑office web app (the primary surface). Modules:
  Dashboard, Ordens de Serviço, Comprovantes, Equipamentos, Operadores, Clientes, Preços,
  Orçamentos, Faturamento, Financeiro, Custo da Hora, Rentabilidade, Painel Gerencial,
  Manutenção, Diesel.
- **App de campo** — a companion Android field app operators use to log hours
  (*apontamentos* / *horímetro*) against a service order. Not recreated here; it is
  referenced by the operator detail ("Acesso ao app").

The current product version brands itself **v0.1 · fundação** (foundation).

---

## Sources

Everything here was reverse‑engineered from an attached codebase of hand‑built HTML mocks
(the ground truth — one shared token system + inline styles):

- `html/mock-detalhe-cliente.html` — Client detail screen (Retaguarda).
- `html/mock-detalhe-operador.html` — Operator detail screen (Retaguarda).
- `html/Antonello Terraplanagem - Design System.html` — a pre‑bundled/compressed page
  (not directly readable; the two mocks above are the authoritative source).

The mocks are pt‑BR, dark‑themed, and share an identical `:root` token block, Lucide icons,
and the Archivo / IBM Plex Sans / IBM Plex Mono type trio. All numeric values in this system
(paddings, radii, font sizes) are copied verbatim from those mocks.

---

## CONTENT FUNDAMENTALS

**Language.** Brazilian Portuguese (pt‑BR) throughout. Domain vocabulary is fixed and should
be reused exactly: *Retaguarda* (back‑office), *Ordem de Serviço / OS*, *Operador*, *Cliente*,
*Equipamento*, *Orçamento*, *Apontamento* (time entry), *Horímetro* (hour meter), *Faturamento*,
*Comprovante* (payment proof), *Custo da Hora*, *Rentabilidade*, *Diesel*.

**Voice.** Impersonal and operational — the UI names things, it does not talk to "você" and
never speaks in the first person. Labels are short nouns; buttons are short imperatives:
"Novo orçamento", "Editar", "Inativar", "Perguntar à IA", "Ver todos". Tone is pragmatic,
grounded, trustworthy — a tool for a worksite office, not a consumer app. No marketing fluff.

**Casing.**
- **UPPERCASE** (Archivo, tracked): page titles / entity names (`h1`), card titles, section
  eyebrows, KPI labels, data‑row keys.
- **Sentence case**: body copy, list item titles, button labels, values.

**Numbers & formats** — always in the mono font:
- Currency: `R$ 148.500` (dot thousands, no decimals for whole amounts).
- Hours: `8,0 h` (comma decimal).
- Dates: `09/07`, `08/07/2025`, or ranges `02–24/05`; month tags `mar/2022`, `jun/2024`.
- IDs / codes: `OS‑021`, `NF 1042`, `ORC‑055`, `CNPJ 12.345.678/0001‑90`, `CPF 044.428.710‑86`,
  horímetro `4.210 → 4.218`.

**Status lexicon** (drive StatusChip/Badge tones): Ativo, Inativo, Em andamento, Concluída,
Aberta, A vencer, Vencido, Pago, Aprovado, Perdido, "Importado · congelado".

**Emoji.** Never. Meaning is carried by Lucide icons.

---

## VISUAL FOUNDATIONS

**Overall vibe.** A warm near‑black "canteiro de obras" (worksite) dark theme lit by a single
safety amber — the color of heavy equipment (CAT‑yellow). Dense, instrument‑panel information
design; every pixel is data. Confident, industrial, legible.

**Color.** Backgrounds are warm near‑blacks with a brown undertone (`#16140f` page, `#211d15`
cards, `#141109` sidebar) — never pure grey/blue‑black. The one brand accent is **amarelo
`#ffb300`**, used sparingly for the single primary action, active nav, KPIs and focus. **Aço**
(steel‑blue `#8fa0b3`) marks legacy / read‑only / imported data (the ERP Farolti snapshot).
Semantics are muted and earthy — success `#4C7A3F`/`#9bd08e`, danger `#b00020`/`#e58b7b`, info
`#5a7fa6`/`#9db8d6` — always used as a soft tinted fill + brighter text + subtle border, not
saturated blocks.

**Type.** Three families, strict roles: **Archivo** (display — headings, KPIs, eyebrows; often
UPPERCASE with +0.07–0.14em tracking; weights 700/800), **IBM Plex Sans** (UI + body; 400–700),
**IBM Plex Mono** (every number, code, date, currency, ID; 400–600). Body is 14px/1.5.

**Spacing & layout.** Tight, dense grid. Card gap 16px; card padding 16–18px; content region
`22px 28px 48px`, max‑width 1320px. Fixed 236px sticky sidebar (darker than the page); sticky
translucent header; 4‑up KPI strip; 1.62fr / 1fr two‑column body.

**Backgrounds.** Flat dark fills. **No photography, no illustration, no repeating texture** —
with one exception: the signature **hazard stripe** (diagonal amber/dark construction tape) used
as a thin emphasis bar under the sidebar wordmark and atop the content. Heroes add a subtle
vertical gradient (`surface → #1d1a13`) plus a faint radial amber glow in the top‑right corner.
No large gradients elsewhere; never bluish‑purple.

**Corner radii.** 14px cards/heroes/KPIs · 10px buttons & nav items · 9px icon tiles · 7px small
tiles · 20px pills/badges/status chips · 50% avatars & LED dots.

**Cards.** Dark fill `#211d15`, 1px `#2e2c26` border, 14px radius, `overflow:hidden`, **no drop
shadow**. Optional header = 30px amber icon tile + UPPERCASE tracked title + right‑aligned pill
or amber "Ver todos ›" link, separated by a full‑width border.

**Borders.** Hairlines do the structural work (there are almost no shadows): `#2e2c26` default,
`#241f18` soft row dividers, `#413c2c` on hover. **Dashed** borders signal informational or
read‑only context (Note callouts; the Farolti legacy snapshot).

**Shadows & elevation.** Deliberately sparse. The only shadow is a warm amber glow
(`0 6px 20px rgba(255,179,0,.18)`) under raised brand tiles (the hero avatar). Active nav LED
dots get a `0 0 0 3px` amber‑soft halo. Cards themselves are flat.

**Transparency & blur.** The sticky header is a scrim: `rgba(22,20,15,.86)` + `backdrop-filter:
blur(8px)`. Tinted fills use 10–16% alpha of their hue. That is the extent of transparency.

**Hover states.** Nav items → background `#1d1a12`, text to full `#f0eee6`. Table/list rows →
`#1e1a13`. Buttons: primary lightens to `#ffc233`; ghost gains a stronger border + faint fill;
tinted variants deepen their tint. Icon buttons → amber icon + stronger border.

**Press / active.** No shrink/scale press effect. "Active" is a persistent state: amber text,
inset `#2c2712` fill, a 3px amber left marker, and an amber LED dot.

**Motion.** Minimal and functional — `0.12–0.14s` transitions on background/color for hovers
only. No entrance animations, no bounces, no infinite loops. `prefers-reduced-motion` disables
transitions.

**Focus.** `outline: 2px solid var(--amarelo)` with `2px` offset — brand‑amber, always visible.

**Selection.** `::selection` is amber background with `#16140f` text.

---

## ICONOGRAPHY

- **System:** [Lucide](https://lucide.dev) — 24×24 grid, round caps/joins, `currentColor`,
  rendered at **stroke‑width ≈ 1.9** inline (the brand logo mark uses 2.1). No icon font, no PNG
  icons, no emoji, no ad‑hoc unicode glyphs.
- The source embeds Lucide as inline `<svg>`. Here the exact glyphs in use are **harvested into
  the `Icon` component** (`components/icons/Icon.jsx`) so the system is self‑contained — ~55
  named glyphs (`IconNames` lists them). Add more Lucide glyphs to that map as new screens need
  them; keep the 1.9 stroke and 24×24 box.
- **Equipment** is iconographically distinct: `truck` (escavadeira / caminhão), `tractor`
  (retroescavadeira), `forklift` (pá carregadeira).
- Icons are monochrome and inherit color; they sit inside `IconTile` (amber / muted / steel /
  brand), `Button`, `Badge`, `NavItem`, `KpiCard`.

**Logo.** The brand mark — a stylised excavator/loader on a ground line — is provided in the
source as a bespoke 3‑path SVG (not a Lucide glyph). It is saved verbatim to `assets/`
(`logo-tile.svg` = amber tile + dark mark; `mark-amber.svg`; `mark-dark.svg`). The wordmark
"ANTONELLO / TERRAPLANAGEM" is **set in Archivo type**, not an image (the subline is amber,
+0.22em tracking). No other logo file was provided; render the wordmark in type where a fuller
lockup is needed.

**Fonts note.** Archivo, IBM Plex Sans and IBM Plex Mono are the real product families and are
loaded from **Google Fonts** via `@import` (`tokens/fonts.css`). No font binaries were included
in the source — these are the genuine families, not substitutions. If you need self‑hosted
`.woff2`, drop them in `assets/` and swap the `@import` for `@font-face`.

---

## Components

All are bundled React components, reachable at `window.<Namespace>.<Name>` (run
`check_design_system` for the current namespace). Each has a sibling `.d.ts` + `.prompt.md`, and
each directory ships an `@dsCard` demo.

- **Icon** (`components/icons/`) — the Lucide‑derived glyph set (`Icon`, `IconNames`).
- **Core** (`components/core/`) — **Button**, **IconButton**, **Badge**, **StatusChip**,
  **Chip**, **Pill**.
- **Surfaces** (`components/surfaces/`) — **Card**, **IconTile**, **Avatar**, **Hazard**.
- **Data** (`components/data/`) — **KpiCard**, **Sparkline**, **DataRow**, **Note**.
- **Navigation** (`components/navigation/`) — **NavItem**.

Sixteen components in total: Avatar, Badge, Button, Card, Chip, DataRow, Hazard, Icon, IconButton,
IconTile, KpiCard, NavItem, Note, Pill, Sparkline, StatusChip.

> These are exactly the primitives the source mocks use — there were no form inputs
> (Input/Select/Checkbox/Switch), Tabs, Tooltip, Toast or Dialog in the source, so none were
> invented. Add them following the same conventions if/when the product introduces them.

---

## Index / manifest

```
styles.css                     ← global entry point (consumers link this) — @imports only
tokens/
  fonts.css                    Google Fonts @import (Archivo, IBM Plex Sans, IBM Plex Mono)
  colors.css                   surfaces, brand amarelo, semantics, aço, aliases
  typography.css               font stacks, weights, size scale, tracking
  spacing.css                  spacing scale + layout metrics
  radii.css                    corner radii
  effects.css                  shadows, blur, motion, hazard gradient
foundations/
  base.css                     reset + brand defaults + .mono/.eyebrow/.hazard-bar utilities
  components.css               class styles + interaction states for the React components (atp-*)
components/
  icons/      Icon             (+ .d.ts, .prompt.md, icons.card.html)
  core/       Button, IconButton, Badge, StatusChip, Chip, Pill   (+ core.card.html)
  surfaces/   Card, IconTile, Avatar, Hazard                      (+ surfaces.card.html)
  data/       KpiCard, Sparkline, DataRow, Note                   (+ data.card.html)
  navigation/ NavItem                                             (+ navigation.card.html)
guidelines/                    foundation specimen cards (Colors, Type, Spacing, Brand)
ui_kits/
  site/                        landing page institucional (marketing)
    index.html                 hero animado, contadores, serviços, frota, processo, contato
    site.css  image-slot.js    estilos lp-* + slots de foto (arraste imagens reais)
  retaguarda/                  the back-office recreation (interactive)
    index.html                 app shell — Dashboard, Clientes/Operadores list → detail click-through
    screen-dashboard.html      Dashboard screen (operational overview)
    screen-os.html             Ordens de Serviço list (status filters)
    screen-orcamentos.html     Orçamentos (pipeline comercial)
    screen-precos.html         Preços (tabela vigente vs. custo/h)
    screen-comprovantes.html   Comprovantes (PIX/TED/boleto por NF)
    screen-faturamento.html    Faturamento (NFs por OS, a faturar, evolução mensal)
    screen-financeiro.html     Financeiro (a receber / a pagar, comprovantes)
    screen-custohora.html      Custo da Hora (custo/h por equipamento + composição)
    screen-rentabilidade.html  Rentabilidade (margem por OS e por cliente)
    screen-painel.html         Painel Gerencial (visão executiva do ano)
    screen-equipamentos.html   Equipamentos (frota — horímetro, diesel, manutenção)
    screen-diesel.html         Diesel (abastecimentos, consumo L/h, tanque interno)
    screen-manutencao.html     Manutenção (ordens + planos por horímetro)
    screen-parametros.html     Parâmetros (configurações do sistema)
    screen-sobre.html          Sobre (o sistema, produtos e legado Farolti)
    screen-cliente.html        Client detail screen (standalone / starting point)
    screen-operador.html       Operator detail screen (standalone / starting point)
    App.jsx Sidebar.jsx Header.jsx Dashboard.jsx OSList.jsx OrcamentosList.jsx PrecosList.jsx
    Faturamento.jsx Financeiro.jsx CustoHora.jsx Rentabilidade.jsx ComprovantesList.jsx
    EquipamentosList.jsx Diesel.jsx Manutencao.jsx PainelGerencial.jsx Parametros.jsx Sobre.jsx
    ClientesList.jsx OperadoresList.jsx
    ClienteDetail.jsx OperadorDetail.jsx Placeholder.jsx  data.js  kit.css
assets/                        logo-tile.svg, mark-amber.svg, mark-dark.svg
readme.md  SKILL.md
```

**Generated (never edit):** `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`.
