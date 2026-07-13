# Avatar

Initials or an icon in an amber square/circle. Circle for people, rounded square for companies; small `flat` in the header, large `brand` (gradient + glow) on entity heroes.

```jsx
<Avatar initials="AA" size={28} />                        {/* header user */}
<Avatar initials="AM" size={78} shape="square" tone="brand" /> {/* operator hero */}
<Avatar icon="building-2" size={78} shape="square" tone="brand" /> {/* company hero */}
```

- **initials** for people (Archivo, extrabold, dark on amber); **icon** for companies/entities.
- **tone:** `flat` (solid amber, no shadow) or `brand` (amber gradient + soft glow).
