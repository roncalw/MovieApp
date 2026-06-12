/**
 * Styles for the full-screen MovieDetail trailer modal.
 *
 * Imported by:
 * - src/movie/components/MovieTrailerModal.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';

export const movieTrailerModalStyles = StyleSheet.create({
  trailerModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  trailerModalBackButton: {
    height: scaleSize(58),
    width: scaleSize(58),
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailerPlayerFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  trailerPlayerFrameLandscape: {
    backgroundColor: colors.actionPrimary,
  },
});
