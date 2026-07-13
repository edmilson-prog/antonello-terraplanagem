# Button

The product's action control. Use exactly one `primary` (amber) button per view for the main action; everything else is `ghost`.

```jsx
<Button variant="primary" icon="file-plus">Novo orçamento</Button>
<Button variant="ghost" icon="pencil">Editar</Button>
<Button variant="ai" icon="sparkles">Perguntar à IA</Button>
<Button variant="wa" icon="message-circle">WhatsApp</Button>
<Button variant="danger" icon="ban">Inativar</Button>
```

- **variant:** `primary` (amber fill, dark text — main action), `ghost` (outline, muted — secondary), `ai` (amber-tinted, for the AI assistant), `wa` (green, WhatsApp), `danger` (red outline, destructive).
- **size:** `md` (default) or `sm`.
- **icon / iconRight:** pass a brand `Icon` name (e.g. `"file-plus"`) or a node.
- Labels are sentence-case Portuguese verbs ("Novo orçamento", "Editar", "Inativar").
