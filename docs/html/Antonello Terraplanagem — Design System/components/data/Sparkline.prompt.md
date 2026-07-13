# Sparkline

Tiny inline trend polyline, amber by default. Lives in the corner of a KPI tile.

```jsx
<Sparkline points={[19,17,18,12,13,8,9,4]} />
```

`points` is an array of y-values (higher = higher on the chart) or `[x,y]` pairs; the component auto-scales to fit. Keep it decorative — no axes or labels.
