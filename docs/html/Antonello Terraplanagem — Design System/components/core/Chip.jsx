import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * Chip — a neutral tag with an amber icon (e.g. equipment the operator is cleared for).
 */
export function Chip({ icon, children, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={15} /> : icon;
  return (
    <span className={['atp-chip', className].filter(Boolean).join(' ')} {...rest}>
      {ic}
      {children}
    </span>
  );
}
