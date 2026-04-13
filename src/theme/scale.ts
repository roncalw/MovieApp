/*
Step: 9
   * /MovieApp/src/theme/scale.ts
Imported by:
   * /MovieApp/src/theme/typography.ts
   * /MovieApp/src/components/header/SubHeaderTop.tsx
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
   * /MovieApp/src/components/ui/MovieCard.tsx
   * /MovieApp/src/screens/MovieDetail.tsx
   * /MovieApp/src/screens/MovieSearchScreen.tsx
   * /MovieApp/src/screens/PopularMoviesScreen.tsx
Next step path:
   * /MovieApp/src/theme/typography.ts
Purpose:
   * Provides the shared width-based size scaling helper used by the app's typography and layout styles so smaller devices can
     render the same design system more comfortably.
*/
import { Dimensions } from 'react-native';

/*
  This file centralizes lightweight size scaling for the app's shared UI theme.

  WHO USES IT IN THIS PROJECT:
  - typography.ts calls scaleSize(...) to scale shared text tokens
  - components like SubHeaderTop, SubHeaderMovieSearchFields, MovieCard, and MovieDetail
    use it for spacing, pill sizes, image sizes, and other app-owned layout values

  WHY THIS EXISTS:
  - So the same design system can stay shared across iPhone and Android
  - So narrow devices do not feel oversized compared with larger phones
  - So we do not have to maintain separate platform themes just to adjust sizing

  WHAT "SCALE" MEANS HERE:
  - A scale is a multiplier that makes a base design size a little smaller or larger
    depending on the current device width
*/

// This is the design-width reference point the shared theme scales from.
// Devices near this width stay close to the original size values.
const BASE_SCREEN_WIDTH = 430;

// This is the smallest scale we allow, so tiny devices do not shrink forever.
const MIN_SCALE = 0.72;

// This caps scaling at the original design size so larger phones do not keep growing.
const MAX_SCALE = 1;

/*
  Keeps a number inside a safe min/max range.

  WHO USES IT IN THIS FILE:
  - widthScale uses clamp(...) when computing the final shared scale factor

  WHY THIS FILE USES IT:
  - The raw width-based scale could become too small on very narrow devices
  - Or too large on very wide devices
  - clamp(...) forces the final scale to stay between MIN_SCALE and MAX_SCALE

  EXAMPLE:
  - clamp(1.2, 0.72, 1) becomes 1
  - clamp(0.5, 0.72, 1) becomes 0.72
*/
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Reads the current window width so scaling follows the active device size.
const screenWidth = Dimensions.get('window').width;

// Adds an extra reduction for compact phones where the normal width ratio
// still feels too roomy for pills, spacing, and typography.
function getCompactDeviceAdjustment(width: number) {
  if (width <= 360) {
    return 0.88;
  }

  if (width <= 375) {
    return 0.94;
  }

  return 1;
}

// This is the final width-based scale factor used across the theme layer.
// It combines the general width ratio with the compact-device adjustment,
// then clamps the result so sizing stays predictable.
const widthScale = clamp(
  (screenWidth / BASE_SCREEN_WIDTH) * getCompactDeviceAdjustment(screenWidth),
  MIN_SCALE,
  MAX_SCALE
);

/*
  Public helper used by theme tokens and component styles.

  WHO CALLS IT:
  - typography.ts calls scaleSize(...) for shared font sizes and line heights
  - component StyleSheet objects call scaleSize(...) for spacing, image heights,
    pill sizes, border radii, and other layout values

  WHAT IT DOES:
  - It scales a raw design size into a device-appropriate size
  - Then it rounds the result so React Native receives clean whole-number layout values
*/
export function scaleSize(size: number) {
  return Math.round(size * widthScale);
}
