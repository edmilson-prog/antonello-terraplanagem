# NavItem

Sidebar navigation row: icon + label, optional count bubble, active state (amber text + inset fill + left amber marker + LED dot).

```jsx
<NavItem icon="dashboard" href="#">Dashboard</NavItem>
<NavItem icon="truck" count={14}>Equipamentos</NavItem>
<NavItem icon="hard-hat" active>Operadores</NavItem>
```

- **active** replaces the count bubble with an amber LED dot and shows the left marker.
- Group items under a `.eyebrow` label ("Operação", "Cadastros", "Financeiro"…).
- Place inside a container with ~12px horizontal padding so the active marker (at `left:-12px`) meets the sidebar edge.
