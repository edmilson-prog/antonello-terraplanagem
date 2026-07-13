# KpiCard

Headline metric tile for KPI strips (4-up grid). Uppercase label, big value, corner icon, footnote with optional trend, optional sparkline.

```jsx
<KpiCard
  label="Faturado em 2025" value="R$ 148.500" mono icon="credit-card"
  trend={{ dir: 'up', value: '18%' }} foot="vs. 2024"
  spark={[19,17,18,12,13,8,9,4]}
/>

<KpiCard label="Saldo a receber" value="R$ 32.400" mono warn icon="hand-coins"
  foot={<>3 títulos · <b style={{color:'var(--danger-fg)'}}>1 vencido</b></>} />

<KpiCard label="Horas apontadas" value="182" unit="h" icon="clock"
  trend={{ dir: 'up', value: '12%' }} foot="vs. junho" spark={[20,17,19,12,14,8,10,4]} />
```

- **mono** for currency and long numbers; plain (Archivo) for small counts.
- **warn** turns the corner icon orange for attention metrics (overdue, etc.).
- Values are pre-formatted strings — pt-BR currency uses `R$` with `.` thousands.
