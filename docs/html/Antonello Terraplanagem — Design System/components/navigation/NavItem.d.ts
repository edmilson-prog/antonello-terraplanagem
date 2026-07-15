import * as React from 'react';

export interface NavItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Leading icon — brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  /** Trailing count bubble (hidden when active — replaced by the LED dot). */
  count?: React.ReactNode;
  /** Active/current route styling. */
  active?: boolean;
  /** Show the LED dot when active. Default true. */
  dot?: boolean;
  /** Render as a link. */
  href?: string;
  children?: React.ReactNode;
}

/**
 * Sidebar nav row. Place inside a container with ~12px horizontal padding so the
 * active left-marker (which sits at left:-12px) aligns to the sidebar edge.
 */
export function NavItem(props: NavItemProps): React.ReactElement;
