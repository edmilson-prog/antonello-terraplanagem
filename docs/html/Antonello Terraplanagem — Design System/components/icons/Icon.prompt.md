# Icon

Single-color line icon from the brand's Lucide-derived set; inherits `currentColor` and sits inside almost every other component (IconTile, Button, Badge, NavItem, KpiCard).

```jsx
<Icon name="truck" />
<Icon name="clock" size={16} />
<Icon name="check" strokeWidth={1.9} style={{ color: 'var(--success-fg)' }} />
```

- **Sizing:** `size` (px, square) — inline icons are 15–18; the brand mark is 23.
- **Weight:** `strokeWidth` defaults to 1.9 (the product's inline weight); use 2.1 for the logo mark.
- **Color:** never hard-code — the icon takes `currentColor`, so set `color` on the icon or its parent.
- **Coverage:** module glyphs (`dashboard`, `clipboard-list`, `truck`, `hard-hat`, `users`, `wallet`, `fuel`…), actions (`sparkles`, `pencil`, `ban`, `check`), equipment (`truck`, `forklift`, `tractor`), finance (`credit-card`, `hand-coins`, `landmark`), legacy data (`database`, `archive`). Read `IconNames` (on the bundle namespace) for the full list. Unknown names render nothing and warn.
