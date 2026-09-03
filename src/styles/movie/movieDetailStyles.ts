/**
 * Styles for the MovieDetail screen shell and summary card.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx
 *
 * Code flow:
 * 1. MovieDetail owns data loading and summary interactions.
 * 2. This file owns the visual rules for that shell and summary card.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const movieDetailStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nativeTopSpacer: {
    width: '100%',
    backgroundColor: colors.background,
  },
  detailScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContent: {
    paddingBottom: scaleSize(28),
    backgroundColor: colors.background,
  },
  summaryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingBottom: scaleSize(2),
  },
  actionIconRow: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: scaleSize(50),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scaleSize(-25),
    marginBottom: scaleSize(-25),
    paddingLeft: scaleSize(20),
    paddingRight: scaleSize(25),
  },
  heartButton: {
    width: scaleSize(50),
    height: scaleSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  seenButton: {
    minWidth: scaleSize(72),
    height: scaleSize(28),
    paddingHorizontal: scaleSize(7),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: scaleSize(2),
    borderColor: colors.disabledText,
    borderRadius: scaleSize(14),
  },
  seenButtonActive: {
    backgroundColor: colors.brandTintSurface,
    borderColor: colors.brandText,
  },
  seenButtonText: {
    color: colors.disabledText,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
  },
  seenButtonTextActive: {
    color: colors.brandText,
  },
  trailerPlayButton: {
    width: scaleSize(50),
    height: scaleSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailerPlayCircle: {
    width: scaleSize(40),
    height: scaleSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(20),
    backgroundColor: colors.brandText,
    transform: [{ translateY: scaleSize(-3) }],
  },
  movieTitle: {
    color: colors.textPrimary,
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: scaleSize(23),
    marginBottom: scaleSize(8),
    paddingHorizontal: scaleSize(16),
    textAlign: 'center',
  },
  movieTitleWithAlternates: {
    marginBottom: 0,
  },
  alternateMovieTitles: {
    ...typography.detailBody,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontWeight: '400',
    marginBottom: scaleSize(8),
    paddingHorizontal: scaleSize(16),
    textAlign: 'center',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: scaleSize(2),
    marginBottom: scaleSize(14),
    paddingHorizontal: scaleSize(16),
  },
  genre: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginHorizontal: scaleSize(5),
    marginBottom: scaleSize(4),
  },
  starRow: {
    minHeight: scaleSize(36),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStar: {
    textShadowColor: colors.movieShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.5,
  },
  overviewBlock: {
    paddingHorizontal: scaleSize(15),
    paddingTop: scaleSize(13),
    paddingBottom: scaleSize(12),
    alignSelf: 'stretch',
  },
  overview: {
    ...typography.detailBody,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  boldMetaText: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: scaleSize(4),
  },
  reviewsLinkButton: {
    alignSelf: 'center',
    marginTop: scaleSize(8),
    marginBottom: scaleSize(22),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
  },
  reviewsLinkText: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    textDecorationLine: 'underline',
  },
});
