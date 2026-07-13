# Note

Dashed-border informational callout with a leading icon. For caveats and context — e.g. explaining that a legacy snapshot is frozen, or an access-control notice.

```jsx
<Note icon="info">
  Os números do <b>snapshot Farolti</b> refletem o histórico anterior à migração e permanecem congelados.
</Note>

<Note icon="lock" tone="steel">
  Perfil operacional — sem dados financeiros. Custo-hora fica restrito às telas de <b>Custo da Hora</b>.
</Note>
```

- **tone:** `default` (amber-dim icon) or `steel` (muted, for legacy/read-only context).
- Muted body text; wrap key terms in `<b>` (turns them to full-strength foreground).
