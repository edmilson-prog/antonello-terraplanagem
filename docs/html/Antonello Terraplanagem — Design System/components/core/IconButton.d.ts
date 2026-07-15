import * as React from 'react';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Brand Icon name or a ReactNode. */
  icon: string | React.ReactNode;
  /** Accessible label (also shown as tooltip). Required. */
  label: string;
  size?: 'md' | 'sm';
}

/** Square icon-only button (36px / 30px). Muted by default, amber on hover. */
export function IconButton(props: IconButtonProps): React.ReactElement;
