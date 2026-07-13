import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * IconTile — the small rounded square that holds an icon throughout the UI
 * (card headers, KPI corners, data rows). Tones set the fill + icon colour.
 */
export function IconTile({ icon, size = 'md', tone = 'amber', className = '', style, children, ...rest }) {
  const px = { sm: 28, md: 30, lg: 34 }[size] || 30;
  const gs = { sm: 15, md: 16, lg: 18 }[size] || 16;
  const ic = typeof icon === 'string' ? <Icon name={icon} size={gs} /> : icon;
  return (
    <span
      className={['atp-tile', `atp-tile--${tone}`, className].filter(Boolean).join(' ')}
      style={{ width: px, height: px, ...style }}
      {...rest}
    >
      {ic || children}
    </span>
  );
}
