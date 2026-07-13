import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * Badge — a hero/header-level status or type indicator (pill).
 * Tones: active (green), neutral (grey), info (steel-blue), gold (amber).
 * Optional `led` dot or leading `icon`.
 */
export function Badge({ tone = 'neutral', led = false, icon, children, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={13} /> : icon;
  return (
    <span className={['atp-badge', `atp-badge--${tone}`, className].filter(Boolean).join(' ')} {...rest}>
      {led && <span className="atp-badge__led" />}
      {ic}
      {children}
    </span>
  );
}
