import * as React from "react";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** Small monospace count/label bubble (e.g. "4 vinculadas", "R$ 32.400 em aberto"). */
export function Pill(props: PillProps): React.ReactElement;
