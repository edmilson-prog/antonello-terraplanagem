# DataRow

Key/value row for cadastral detail lists ("Dados cadastrais"). Muted icon tile + uppercase key + value. Stack several inside a padded `Card`.

```jsx
<Card title="Dados cadastrais" icon="contact" padded>
  <DataRow icon="mail" label="E-mail"><span className="mono">financeiro@valeverde.com.br</span></DataRow>
  <DataRow icon="phone" label="Telefone"><span className="mono">(55) 3312-8800</span></DataRow>
  <DataRow icon="map-pin" label="Endereço">Rua das Indústrias, 480 — Santo Ângelo/RS</DataRow>
  <DataRow icon="user" label="Contato">Marcos Feltrin · <small>Compras</small></DataRow>
</Card>
```

- Keys are short UPPERCASE labels; wrap secondary value text in `<small>`; use `className="mono"` for IDs, phones, emails.
- Rows self-divide; the last row drops its border.
