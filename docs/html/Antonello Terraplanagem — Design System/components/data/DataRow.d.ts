import * as React from 'react';

export interface DataRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading icon (muted tile) — brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  /** Uppercase key label, e.g. "E-mail", "Telefone". */
  label: React.ReactNode;
  /** The value. Wrap secondary text in <small> for muted emphasis; add className="mono" for IDs. */
  children?: React.ReactNode;
}

/** Key/value row for cadastral detail lists (inside a padded Card). */
export function DataRow(props: DataRowProps): React.ReactElement;
