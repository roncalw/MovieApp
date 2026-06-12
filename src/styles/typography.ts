/**
 * Shared text-style tokens for app chrome and movie content.
 *
 * Imported by:
 * - Feature style files and components that need consistent text treatment.
 *
 * Code flow:
 * 1. This module normalizes Android text padding.
 * 2. Typography tokens combine that normalization with scaled font sizes.
 * 3. Screens/components compose these tokens with colors and spacing.
 */
import { Platform } from 'react-native';
import type { TextStyle } from 'react-native';
import { scaleSize } from './scale';

const androidTextLayout =
  Platform.select<TextStyle>({
    android: {
      includeFontPadding: false,
    },
    default: {},
  }) ?? {};

export const typography = {
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
