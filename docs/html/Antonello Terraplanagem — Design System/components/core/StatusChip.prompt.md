# StatusChip

Compact status pill for table cells and list rows (OS status, invoice status, quote status).

```jsx
<StatusChip tone="amber" led>Em andamento</StatusChip>
<StatusChip tone="info" led>Aberta</StatusChip>
<StatusChip tone="success" icon="check">Pago</StatusChip>
<StatusChip tone="danger" icon="circle-alert">Vencido</StatusChip>
<StatusChip tone="neutral">Perdido</StatusChip>
```

Tone → meaning convention: `amber` = em andamento / a vencer · `info` = aberto · `success` = concluída / pago / aprovado · `danger` = vencido · `neutral` = perdido / inativo. Use `led` for active/pending, `icon` for settled states.
