import * as React from "react";

export interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading icon — brand Icon name or ReactNode. Default 'info'. */
  icon?: string | React.ReactNode;
  /** 'default' (amber-dim icon) or 'steel' (legacy / read-only context). */
  tone?: "default" | "steel";
  children?: React.ReactNode;
}

/** Dashed-border informational callout. Use <b> to emphasise key terms. */
export function Note(props: NoteProps): React.ReactElement;
