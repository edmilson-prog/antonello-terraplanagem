import React from 'react';

/**
 * Pill — a small monospace count/label bubble (nav counts, card-header tallies).
 */
export function Pill({ children, className = '', ...rest }) {
  return (
    <span className={['atp-pill', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}
