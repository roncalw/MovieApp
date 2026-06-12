/**
 * Styles for the MovieDetail cast and crew rails.
 *
 * Imported by:
 * - src/movie/components/MovieCreditsRail.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';

export const movieCreditsRailStyles = StyleSheet.create({
  creditSectionLabel: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: scaleSize(3.375),
    marginBottom: scaleSize(10),
    marginLeft: scaleSize(5),
  },
  creditListContent: {
    paddingLeft: scaleSize(5),
    paddingRight: scaleSize(5),
  },
  creditCard: {
    alignItems: 'center',
    paddingRight: scaleSize(10),
  },
  profileImage: {
    width: scaleSize(125),
    height: scaleSize(200),
    borderRadius: scaleSize(20),
    backgroundColor: colors.surfaceLight,
  },
  creditTextBlock: {
    alignItems: 'center',
    width: scaleSize(115),
    marginTop: scaleSize(4),
  },
  creditName: {
    color: colors.textPrimary,
    fontSize: scaleSize(13),
    lineHeight: scaleSize(17),
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
  },
  creditSubtitle: {
    color: colors.textPrimary,
    fontSize: scaleSize(13),
    lineHeight: scaleSize(17),
    fontWeight: '400',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
