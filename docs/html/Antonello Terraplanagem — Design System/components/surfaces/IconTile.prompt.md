# IconTile

The small rounded square that holds an icon everywhere in the UI — card headers, KPI corners, data-row leadings.

```jsx
<IconTile icon="clipboard-list" />               {/* amber (default) */}
<IconTile icon="mail" tone="muted" />            {/* neutral data rows */}
<IconTile icon="database" tone="steel" />        {/* legacy / read-only */}
<IconTile icon="building-2" size="lg" tone="brand" /> {/* raised amber tile */}
```

- **tone:** `amber` (inset fill, amber glyph — the default), `muted` (neutral), `steel` (legacy/Farolti data), `brand` (raised amber-gradient, dark glyph).
- **size:** `sm` 28 · `md` 30 · `lg` 34.
