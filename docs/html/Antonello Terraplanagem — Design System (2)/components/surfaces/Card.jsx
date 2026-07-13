import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconTile } from './IconTile.jsx';

/**
 * Card — the standard surface. Optional built-in header (icon tile + uppercase
 * title + right-aligned slot). Pass `padded` for simple body padding, or leave
 * unpadded for tables / list rows that manage their own insets.
 */
export function Card({ title, icon, headerRight, padded = false, children, className = '', ...rest }) {
  const hasHeader = title != null || icon != null || headerRight != null;
  const ic = typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon;
  return (
    <section className={['atp-card', className].filter(Boolean).join(' ')} {...rest}>
      {hasHeader && (
        <div className="atp-card__h">
          {icon != null && <IconTile size="md" tone="amber">{ic}</IconTile>}
          {title != null && <h3 className="atp-card__title">{title}</h3>}
          {headerRight != null && <div className="atp-card__right">{headerRight}</div>}
        </div>
      )}
      <div className={padded ? 'atp-card__body atp-card__body--pad' : 'atp-card__body'}>{children}</div>
    </section>
  );
}
