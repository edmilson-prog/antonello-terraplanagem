---
name: antonello-terraplanagem-design
description: Use this skill to generate well-branded interfaces and assets for Antonello Terraplanagem (a Brazilian earthmoving/terraplenagem contractor's internal operations platform, built by AILA), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and the Retaguarda UI-kit components for prototyping. pt-BR, dark worksite theme, safety-amber accent, hazard-stripe motif, Lucide icons.
user-invocable: true
---

Read the `readme.md` file within this skill first — it is the full design guide (content
fundamentals, visual foundations, iconography) and the manifest of everything available. Then
explore the other files:

- `styles.css` + `tokens/` + `foundations/` — the CSS foundation. Link `styles.css` and you get
  all tokens, fonts, base resets and the component class styles (`atp-*`).
- `components/` — reusable React primitives (Button, Badge, StatusChip, Card, KpiCard, DataRow,
  NavItem, Icon, …). Read each `*.prompt.md` for usage.
- `ui_kits/retaguarda/` — a full interactive recreation of the back-office (sidebar, header,
  Clientes/Operadores lists → detail screens). Copy it as a starting point for new screens.
- `assets/` — the logo mark SVGs. The wordmark is set in Archivo type, not an image.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy the assets out and
create static HTML files for the user to view — link `styles.css`, reuse the `atp-*` classes or
the component patterns, and keep the pt-BR voice, dark palette and mono numbers. If working on
production code, copy the assets and read the rules here to become an expert in designing with
this brand.

Guardrails: dark warm-black surfaces, a single amarelo `#ffb300` accent, steel/aço only for
legacy/read-only data, Lucide icons at ~1.9 stroke (never emoji), UPPERCASE Archivo titles,
IBM Plex Mono for all numbers/dates/IDs, flat cards (no drop shadows), and the hazard stripe used
sparingly as the signature motif.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask a few clarifying questions, and then act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.
