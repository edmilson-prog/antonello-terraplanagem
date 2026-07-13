import * as React from "react";

export interface KpiTrend {
  dir: "up" | "down";
  /** Displayed trend text, e.g. "18%" or "3". */
  value: React.ReactNode;
}

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase metric label, e.g. "Faturado em 2025". */
  label: React.ReactNode;
  /** The headline value. Use a formatted string, e.g. "R$ 148.500" or "182". */
  value: React.ReactNode;
  /** Small trailing unit, e.g. "h". */
  unit?: React.ReactNode;
  /** Corner icon — brand Icon name or ReactNode. */
  icon?: string | React.ReactNode;
  /** Render the value in the mono font (for currency / long numbers). */
  mono?: boolean;
  /** Coloured trend chip shown in the footnote. */
  trend?: KpiTrend;
  /** Footnote content after the trend, e.g. "vs. 2024". */
  foot?: React.ReactNode;
  /** Sparkline points array, or a ReactNode to render in the corner. */
  spark?: Array<number | [number, number]> | React.ReactNode;
  /** Warning styling (icon turns "down" orange) — e.g. saldo a receber. */
  warn?: boolean;
}

/** Headline metric tile used in KPI strips across dashboards and detail views. */
export function KpiCard(props: KpiCardProps): React.ReactElement;
