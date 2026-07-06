import type { HTMLAttributes } from 'vue';

/**
 * Size/type preset for the border beam effect.
 */
export type BorderBeamSize = 'sm' | 'md' | 'line' | 'pulse-outside' | 'pulse-inner';

/**
 * Theme mode for adapting beam colors to the background.
 */
export type BorderBeamTheme = 'dark' | 'light' | 'auto';

/**
 * Color variant for the beam effect.
 */
export type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset';

/**
 * Configuration for a size preset.
 */
export interface SizeConfig {
  borderRadius: number;
  borderWidth: number;
  width?: number;
  height?: number;
}

/**
 * Theme color configuration.
 */
export interface ThemeColors {
  strokeOpacity: number;
  innerOpacity: number;
  bloomOpacity: number;
  innerShadow: string;
  saturation: number;
  brightness?: number;
  hairlineOpacity?: number;
}

/**
 * Props for the BorderBeam component.
 */
export interface BorderBeamProps extends /* @vue-ignore */ HTMLAttributes {
  size?: BorderBeamSize;
  colorVariant?: BorderBeamColorVariant;
  theme?: BorderBeamTheme;
  staticColors?: boolean;
  duration?: number;
  active?: boolean;
  borderRadius?: number;
  brightness?: number;
  saturation?: number;
  hueRange?: number;
  strength?: number;
}
