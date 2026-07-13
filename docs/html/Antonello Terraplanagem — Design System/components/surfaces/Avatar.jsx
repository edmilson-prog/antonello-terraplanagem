import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * Avatar — initials or an icon in a coloured square/circle.
 * `flat` (solid amber, e.g. header user) or `brand` (amber gradient + glow, e.g. hero).
 */
export function Avatar({ initials, icon, shape = 'circle', size = 28, tone = 'flat', className = '', style, ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={Math.round(size * 0.48)} strokeWidth={1.7} /> : icon;
  const radius = shape === 'circle' ? '50%' : Math.max(10, Math.round(size * 0.23));
  return (
    <span
      className={['atp-avatar', tone === 'brand' ? 'atp-avatar--brand' : '', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, borderRadius: radius, fontSize: Math.round(size * 0.42), ...style }}
      {...rest}
    >
      {ic || initials}
    </span>
  );
}
