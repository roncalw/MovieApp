/**
 * Shared radius tokens for feature styles.
 *
 * Imported by:
 * - Feature style files under src/styles/**
 *
 * Code flow:
 * 1. radii exposes scaled radius values.
 * 2. Components use these tokens for consistent cards, posters, and controls.
 */
import { scaleSize } from './scale';

export const radii = {
  sm: scaleSize(5),
  md: scaleSize(10),
  pill: scaleSize(14),
  poster: scaleSize(20),
  round: scaleSize(25),
} as const;
