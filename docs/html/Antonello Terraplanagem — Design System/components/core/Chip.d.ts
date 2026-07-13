import * as React from "react";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Leading icon (rendered amber) — brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
}

/** Neutral rounded tag with an amber icon — e.g. equipment capability chips. */
export function Chip(props: ChipProps): React.ReactElement;
