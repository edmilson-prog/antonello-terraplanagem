import * as React from 'react';

export interface SparklineProps extends React.SVGProps<SVGSVGElement> {
  /** Y-values (higher renders higher) or [x,y] pairs. */
  points: Array<number | [number, number]>;
  width?: number;
  height?: number;
  /** Stroke colour. Default amber. */
  stroke?: string;
  strokeWidth?: number;
}

/** Tiny amber trend polyline used in the corner of KPI tiles. */
export function Sparkline(props: SparklineProps): React.ReactElement;
