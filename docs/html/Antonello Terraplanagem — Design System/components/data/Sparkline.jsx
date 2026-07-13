import React from 'react';

/**
 * Sparkline — tiny inline trend polyline (as used in the corner of KPI tiles).
 * `points` is an array of numbers (y-values, higher = up) or [x,y] pairs.
 */
export function Sparkline({ points = [], width = 60, height = 24, stroke = 'var(--amarelo)', strokeWidth = 2, className = '', style, ...rest }) {
  const vals = points.map((p) => (Array.isArray(p) ? p : [null, p]));
  const ys = vals.map((v) => v[1]);
  const min = Math.min(...ys), max = Math.max(...ys), range = (max - min) || 1;
  const n = vals.length;
  const pad = 2;
  const d = vals.map((v, i) => {
    const x = v[0] != null ? v[0] : (n > 1 ? (i / (n - 1)) * width : 0);
    const y = pad + (1 - (v[1] - min) / range) * (height - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg
      className={['atp-spark', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${width} ${height}`} width={width} height={height}
      fill="none" style={style} aria-hidden="true" {...rest}
    >
      <polyline points={d} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
