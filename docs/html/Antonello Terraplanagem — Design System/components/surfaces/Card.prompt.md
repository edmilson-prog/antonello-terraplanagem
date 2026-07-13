# Card

The standard content surface — dark panel, hairline border, 14px radius. Optional built-in header with an amber icon tile, an UPPERCASE title, and a right slot.

```jsx
<Card title="Ordens de Serviço" icon="clipboard-list" headerRight={<Pill>4 vinculadas</Pill>}>
  {/* table or list rows */}
</Card>

<Card title="Dados cadastrais" icon="contact" padded>
  <DataRow icon="mail" label="E-mail">financeiro@valeverde.com.br</DataRow>
</Card>
```

- **padded:** add for simple content; omit for tables and list rows that manage their own insets (the header divider still renders).
- **headerRight:** a `<Pill>` tally, or an amber "Ver todos ›" link.
- Titles are short UPPERCASE Portuguese nouns.
