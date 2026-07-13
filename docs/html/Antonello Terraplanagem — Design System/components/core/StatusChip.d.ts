import * as React from "react";

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Colour role:
   * amber = em andamento / a vencer; info = aberto; success = concluída / pago / aprovado;
   * danger = vencido; neutral = perdido / inativo.
   */
  tone?: "amber" | "info" | "success" | "danger" | "neutral";
  /** Leading LED dot (for "in progress" style states). */
  led?: boolean;
  /** Leading icon — brand Icon name or ReactNode (e.g. 'check' for pago, 'circle-alert' for vencido). */
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
}

/** Compact per-row status pill for tables and lists. */
export function StatusChip(props: StatusChipProps): React.ReactElement;
