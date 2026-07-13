import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Glyph name from the brand set (Lucide-derived). See `iconNames` for the full list. */
  name: IconName;
  /** Pixel size (square). In-app defaults: 15–18 inline, 23 for the brand mark. Default 18. */
  size?: number;
  /** Stroke width. Product default is 1.9 (nav/inline); the logo mark uses 2.1. Default 1.9. */
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export type IconName =
  | 'dashboard' | 'clipboard-list' | 'receipt' | 'truck' | 'hard-hat' | 'users' | 'user'
  | 'tag' | 'file-text' | 'file-plus' | 'file-check' | 'wallet' | 'calculator'
  | 'trending-up' | 'line-chart' | 'bar-chart' | 'wrench' | 'fuel'
  | 'sparkles' | 'sun' | 'chevron-right' | 'arrow-left' | 'arrow-up-right' | 'pencil'
  | 'message-circle' | 'ban' | 'check' | 'circle-check-big' | 'circle-alert' | 'info'
  | 'lock' | 'history' | 'sliders' | 'building-2' | 'badge-check' | 'briefcase' | 'contact'
  | 'id-card' | 'cake' | 'mail' | 'phone' | 'map-pin' | 'smartphone' | 'clock' | 'gauge'
  | 'calendar' | 'credit-card' | 'hand-coins' | 'landmark' | 'link' | 'dollar-sign'
  | 'forklift' | 'tractor' | 'database' | 'archive';

/**
 * Icon renders a single-color brand glyph (24×24, round caps) that inherits
 * `currentColor`. Used everywhere: inside IconTile, Button, Badge, NavItem, KpiCard.
 */
export function Icon(props: IconProps): React.ReactElement | null;

/** Every icon name available in the set. */
export const IconNames: IconName[];
/** @deprecated lowercase alias — not exposed on the bundle namespace; use IconNames. */
export const iconNames: IconName[];
