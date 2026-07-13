import * as React from 'react';

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  /** 28 / 30 / 34 px. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * amber = default (inset fill, amber icon); muted = neutral data rows;
   * steel = legacy/read-only (Farolti); brand = raised amber-gradient tile.
   */
  tone?: 'amber' | 'muted' | 'steel' | 'brand';
  children?: React.ReactNode;
}

/** Small rounded icon container used in card headers, KPI corners and data rows. */
export function IconTile(props: IconTileProps): React.ReactElement;
