import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconTile } from '../surfaces/IconTile.jsx';

/**
 * DataRow — a key/value row for "Dados cadastrais"-style lists: a muted icon tile,
 * an uppercase key, and a value below. Rows divide with a soft hairline.
 */
export function DataRow({ icon, label, children, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon;
  return (
    <div className={['atp-datarow', className].filter(Boolean).join(' ')} {...rest}>
      {icon != null && <IconTile size="md" tone="muted" className="atp-datarow__i">{ic}</IconTile>}
      <div className="atp-datarow__c">
        <div className="atp-datarow__k">{label}</div>
        <div className="atp-datarow__v">{children}</div>
      </div>
    </div>
  );
}
