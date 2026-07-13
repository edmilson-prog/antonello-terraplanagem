import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Uppercase card title (Archivo, tracked). */
  title?: React.ReactNode;
  /** Header icon — brand Icon name or ReactNode (shown in an amber IconTile). */
  icon?: string | React.ReactNode;
  /** Right-aligned header slot — usually a <Pill> tally or an amber "Ver todos" link. */
  headerRight?: React.ReactNode;
  /** Apply standard body padding (16×18). Omit for tables / self-padded lists. */
  padded?: boolean;
  children?: React.ReactNode;
}

/** The standard content surface: dark panel, hairline border, 14px radius. */
export function Card(props: CardProps): React.ReactElement;
