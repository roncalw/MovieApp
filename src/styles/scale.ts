/**
 * Shared width-based size scaling helper.
 *
 * Imported by:
 * - src/styles/typography.ts
 * - Feature style files under src/styles/**
 * - Component files that need scaled icon sizes
 *
 * Code flow:
 * 1. This module reads the current device width once at startup.
 * 2. scaleSize converts design-size numbers into device-appropriate numbers.
 * 3. Style files use those values for predictable iOS and Android layouts.
 */
import { Dimensions } from 'react-native';

const BASE_SCREEN_WIDTH = 430;
const MIN_SCALE = 0.72;
const MAX_SCALE = 1;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const screenWidth = Dimensions.get('window').width;

function getCompactDeviceAdjustment(width: number) {
  if (width <= 360) {
    return 0.88;
  }

  if (width <= 375) {
    return 0.94;
  }

  return 1;
}

const widthScale = clamp(
  (screenWidth / BASE_SCREEN_WIDTH) * getCompactDeviceAdjustment(screenWidth),
  MIN_SCALE,
  MAX_SCALE
);

export function scaleSize(size: number) {
  return Math.round(size * widthScale);
}
