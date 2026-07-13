import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * Note — a dashed-border informational callout with a leading icon.
 * `default` uses an amber-dim icon; `steel` for legacy/read-only context (Farolti).
 */
export function Note({ icon = 'info', tone = 'default', children, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={15} /> : icon;
  return (
    <div className={['atp-note', tone === 'steel' ? 'atp-note--steel' : '', className].filter(Boolean).join(' ')} {...rest}>
      {ic}
      <span className="atp-note__t">{children}</span>
    </div>
  );
}
