import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour role. Default 'neutral'. */
  tone?: 'active' | 'neutral' | 'info' | 'gold';
  /** Show a leading LED dot in the current colour. */
  led?: boolean;
  /** Leading icon — brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
}

/** Larger status/type pill used in hero blocks (e.g. "Ativo", "Pessoa Jurídica", "Cliente recorrente"). */
export function Badge(props: BadgeProps): React.ReactElement;
