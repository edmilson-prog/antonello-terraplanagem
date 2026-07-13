import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Initials to show (e.g. "AM"). Ignored if `icon` is set. */
  initials?: string;
  /** Icon instead of initials — brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  /** 'circle' (people) or 'square' (companies / large hero). Default 'circle'. */
  shape?: 'circle' | 'square';
  /** Pixel size. Header user = 28; hero = 78. Default 28. */
  size?: number;
  /** 'flat' (solid amber) or 'brand' (amber gradient + glow). Default 'flat'. */
  tone?: 'flat' | 'brand';
}

/** Initials/icon avatar in amber. Circle for people, rounded square for companies. */
export function Avatar(props: AvatarProps): React.ReactElement;
