import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * NavItem — a sidebar navigation row: icon + label, optional count bubble,
 * and an active state (amber text, inset fill, left amber marker + LED dot).
 * Renders as <a> when `href` is set, otherwise <div role="button">.
 */
export function NavItem({ icon, children, count, active = false, dot = true, href, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={17} /> : icon;
  const cls = ['atp-nav-item', active ? 'is-active' : '', className].filter(Boolean).join(' ');
  const inner = (
    <>
      {ic}
      <span className="atp-nav-item__label">{children}</span>
      {count != null && !active && <span className="atp-nav-item__count">{count}</span>}
      {active && dot && <span className="atp-nav-item__dot" />}
    </>
  );
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <div role="button" tabIndex={0} className={cls} {...rest}>{inner}</div>;
}
