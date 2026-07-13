# Badge

Hero/header-level status or type pill. Bigger and softer than StatusChip; used on entity detail headers.

```jsx
<Badge tone="active" led>Ativo</Badge>
<Badge tone="info" icon="building-2">Pessoa Jurídica</Badge>
<Badge tone="gold" icon="badge-check">Cliente recorrente</Badge>
<Badge tone="neutral" icon="briefcase">Operador · CLT</Badge>
```

- **tone:** `active` (green, live), `neutral` (grey, factual), `info` (steel-blue, classification), `gold` (amber, highlight).
- **led:** small pulsing-style dot for live/active states.
- Use for identity/classification on a hero. For per-row status in tables/lists, use **StatusChip**.
