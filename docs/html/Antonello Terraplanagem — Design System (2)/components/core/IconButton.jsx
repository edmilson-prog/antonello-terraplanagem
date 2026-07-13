import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * IconButton — square, icon-only control (theme toggle, row actions, toolbar).
 * Always pass `label` for accessibility (used as aria-label + tooltip).
 */
export function IconButton({ icon, label, size = 'md', className = '', ...rest }) {
  const gs = size === 'sm' ? 15 : 18;
  const ic = typeof icon === 'string' ? <Icon name={icon} size={gs} /> : icon;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={['atp-icon-btn', size === 'sm' ? 'atp-icon-btn--sm' : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {ic}
    </button>
  );
}
