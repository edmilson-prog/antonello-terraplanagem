import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * StatusChip — compact status pill for table cells and list rows.
 * Tones map to the product's status colours; pass `led` for a dot or `icon` for a glyph.
 */
export function StatusChip({ tone = 'neutral', led = false, icon, children, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={12} /> : icon;
  return (
    <span className={['atp-status', `atp-status--${tone}`, className].filter(Boolean).join(' ')} {...rest}>
      {led && <span className="atp-status__led" />}
      {ic}
      {children}
    </span>
  );
}
