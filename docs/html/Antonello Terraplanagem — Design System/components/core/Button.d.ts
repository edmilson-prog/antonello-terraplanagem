import * as React from 'react';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual role. Default 'primary'. */
  variant?: 'primary' | 'ghost' | 'ai' | 'wa' | 'danger';
  /** 'md' (default, 8×13px) or 'sm' (compact). */
  size?: 'md' | 'sm';
  /** Leading icon — a brand Icon name or a ReactNode. */
  icon?: string | React.ReactNode;
  /** Trailing icon — a brand Icon name or a ReactNode. */
  iconRight?: string | React.ReactNode;
  children?: React.ReactNode;
}

/** Primary action control. Amber fill = the one main action per view. */
export function Button(props: ButtonProps): React.ReactElement;
