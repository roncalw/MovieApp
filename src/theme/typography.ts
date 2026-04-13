/*
Step: 10
   * /MovieApp/src/theme/typography.ts
Imported by:
   * /MovieApp/src/components/header/SubHeaderTop.tsx
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
   * /MovieApp/src/components/ui/MovieCard.tsx
   * /MovieApp/src/screens/MovieDetail.tsx
   * /MovieApp/src/screens/PopularMoviesScreen.tsx
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/theme/colors.ts
Purpose:
   * Defines the shared text-style tokens for app chrome and movie content so the app can keep one typography system across
     iPhone and Android.
*/
import { Platform } from 'react-native';
import type { TextStyle } from 'react-native';
import { scaleSize } from './scale';

// Keep one shared typography theme, but normalize Android's extra text box padding
// so the same tokens render closer to iOS without maintaining separate platform themes.
const androidTextLayout =
  Platform.select<TextStyle>({
    android: {
      includeFontPadding: false,
    },
    default: {},
  }) ?? {};

export const typography = {
  /*
    Shared recipe for page-level titles like "Movie Search" or "Popular Movies".

    `...androidTextLayout` is object spread syntax inside an object literal.
    When this pageTitle object is created, JavaScript shallow-copies the direct
    enumerable properties from the androidTextLayout object that was created above
    into this pageTitle object before applying the properties that follow.

    In this file:
    - Android: androidTextLayout = { includeFontPadding: false }
    - iPhone/default: androidTextLayout = {}

    If a later property in this object had the same key, that later value would
    override the spread value because object literal properties are applied in order.

    scaleSize(...) is used on the fontSize and lineHeight values below so one
    typography token can stay shared while still shrinking a bit on narrower phones.
  */
  pageTitle: {
    ...androidTextLayout,
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    fontWeight: '700',
    letterSpacing: 0.2,
  } as const,
  buttonLabel: {
    ...androidTextLayout,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
  } as const,
  visibilityToggle: {
    ...androidTextLayout,
    fontSize: scaleSize(17),
    lineHeight: scaleSize(22),
    fontWeight: '500',
  } as const,
  sectionLabel: {
    ...androidTextLayout,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '600',
  } as const,
  inputText: {
    ...androidTextLayout,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(22),
    fontWeight: '400',
  } as const,
  chipLabel: {
    ...androidTextLayout,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '600',
  } as const,
  summaryTitle: {
    ...androidTextLayout,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(22),
    fontWeight: '700',
  } as const,
  summaryBody: {
    ...androidTextLayout,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    fontWeight: '400',
  } as const,
  feedbackTitle: {
    ...androidTextLayout,
    fontSize: scaleSize(18),
    lineHeight: scaleSize(24),
    fontWeight: '700',
  } as const,
  feedbackBody: {
    ...androidTextLayout,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(22),
    fontWeight: '400',
  } as const,
  detailTitle: {
    ...androidTextLayout,
    fontSize: scaleSize(28),
    lineHeight: scaleSize(34),
    fontWeight: '700',
  } as const,
  detailMeta: {
    ...androidTextLayout,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(22),
    fontWeight: '400',
  } as const,
  detailMetaStrong: {
    ...androidTextLayout,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(22),
    fontWeight: '600',
  } as const,
  detailBody: {
    ...androidTextLayout,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(24),
    fontWeight: '400',
  } as const,
  cardTitle: {
    ...androidTextLayout,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(26),
    fontWeight: '700',
  } as const,
  cardMeta: {
    ...androidTextLayout,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    fontWeight: '400',
  } as const,
  cardBody: {
    ...androidTextLayout,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(21),
    fontWeight: '400',
  } as const,
} as const;
