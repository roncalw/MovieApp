/**
 * Styles for the MovieDetail hero/banner component.
 *
 * Imported by:
 * - src/movie/components/MovieHero.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';

export const movieHeroStyles = StyleSheet.create({
  heroBackground: {
    width: '100%',
    minHeight: scaleSize(326),
  },
  heroBackgroundImage: {
    opacity: 1,
  },
  heroScrim: {
    minHeight: scaleSize(326),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayLight,
    paddingVertical: scaleSize(14),
  },
  heroBackButton: {
    position: 'absolute',
    top: scaleSize(8),
    left: scaleSize(8),
    zIndex: 3,
    width: scaleSize(58),
    height: scaleSize(58),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPoster: {
    width: scaleSize(185),
    height: scaleSize(278),
    borderRadius: scaleSize(20),
    backgroundColor: colors.surfaceLight,
  },
  imdbBadge: {
    position: 'absolute',
    top: scaleSize(12),
    right: scaleSize(14),
    width: scaleSize(88),
    minHeight: scaleSize(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imdbLogo: {
    width: scaleSize(42),
    height: scaleSize(20),
  },
  imdbRatingText: {
    marginTop: scaleSize(1),
    color: colors.brandText,
    fontSize: scaleSize(13),
    lineHeight: scaleSize(16),
    fontWeight: '700',
    letterSpacing: 0,
  },
  imdbVotesText: {
    color: colors.brandText,
    fontSize: scaleSize(10),
    lineHeight: scaleSize(12),
    fontWeight: '400',
    letterSpacing: 0,
  },
});
