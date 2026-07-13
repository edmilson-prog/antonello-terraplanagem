import * as React from "react";

export interface HazardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 'default' (8px, sidebar) or 'header' (6px, content top). */
  variant?: "default" | "header";
  /** Override height (CSS length). */
  height?: string | number;
}

/** Signature diagonal amber/dark hazard-tape bar — the brand's core motif. Decorative. */
export function Hazard(props: HazardProps): React.ReactElement;
