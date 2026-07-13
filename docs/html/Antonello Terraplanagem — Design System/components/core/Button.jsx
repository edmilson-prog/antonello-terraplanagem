import React from 'react';
import { Icon } from '../icons/Icon.jsx';

function resolveIcon(icon, size) {
  return typeof icon === 'string' ? <Icon name={icon} size={size} /> : icon;
}

/**
 * Button — the product's action control.
 * Variants: primary (amber fill), ghost (outline), ai (amber-tinted "Perguntar à IA"),
 * wa (WhatsApp/green), danger (destructive outline).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const cls = [
    'atp-btn',
    `atp-btn--${variant}`,
    size !== 'md' ? `atp-btn--${size}` : '',
    className,
  ].filter(Boolean).join(' ');
  const gs = size === 'sm' ? 15 : 16;
  return (
    <button type={type} className={cls} {...rest}>
      {resolveIcon(icon, gs)}
      {children != null && <span className="atp-btn__label">{children}</span>}
      {resolveIcon(iconRight, gs)}
    </button>
  );
}
