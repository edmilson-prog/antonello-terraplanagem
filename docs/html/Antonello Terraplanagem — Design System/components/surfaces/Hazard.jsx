import React from 'react';

/**
 * Hazard — the signature diagonal amber/dark construction-tape bar.
 * Use as a brand emphasis stripe (under the sidebar wordmark, atop the content area).
 * `default` = 8px, `header` = 6px thinner variant.
 */
export function Hazard({ variant = 'default', height, className = '', style, ...rest }) {
  return (
    <div
      className={['atp-hazard', variant === 'header' ? 'atp-hazard--header' : '', className].filter(Boolean).join(' ')}
      style={{ ...(height ? { height } : {}), ...style }}
      role="presentation"
      {...rest}
    />
  );
}
