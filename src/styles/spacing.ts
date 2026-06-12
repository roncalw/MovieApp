/**
 * Shared spacing tokens for feature styles.
 *
 * Imported by:
 * - Feature style files under src/styles/**
 *
 * Code flow:
 * 1. spacing exposes named scaled sizes for repeated layout gaps.
 * 2. Feature style files use these names where the spacing has semantic meaning.
 */
import { scaleSize } from './scale';

export const spacing = {
  xxs: scaleSize(2),
  xs: scaleSize(4),
  sm: scaleSize(7),
  md: scaleSize(10),
  lg: scaleSize(14),
  xl: scaleSize(18),
  xxl: scaleSize(24),
} as const;
