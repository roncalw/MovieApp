/**
 * Screen-level styles for the advanced movie search page.
 *
 * Imported by:
 * - src/search/advanced/MovieSearchScreen.tsx
 *
 * Next step path:
 * - MovieSearchScreen renders HeaderMovieSearch, MovieResults, and
 *   DetailStackOverlay as the main search user flow.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const movieSearchScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentStack: {
    flex: 1,
  },
  searchContent: {
    flex: 1,
  },
  searchContentHidden: {
    opacity: 0,
  },
  headerHidden: {
    display: 'none',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
    backgroundColor: colors.background,
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    textAlign: 'center',
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
});
