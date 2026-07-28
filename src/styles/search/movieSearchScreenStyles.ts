/**
 * Screen-level styles for the advanced movie search page.
 *
 * Imported by:
 * - src/search/advanced/MovieSearchScreen.tsx
 *
 * Next step path:
 * - MovieSearchScreen renders HeaderMovieSearch and MovieResults. Selecting a
 *   result opens the root native-stack Movie Detail screen.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const movieSearchScreenStyles = StyleSheet.create({
  resultsListHeader: {
    marginHorizontal: -scaleSize(20),
    marginTop: -scaleSize(24),
    marginBottom: scaleSize(24),
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
  errorActions: {
    marginTop: scaleSize(22),
    alignItems: 'center',
    gap: scaleSize(12),
  },
  errorPrimaryButton: {
    minWidth: scaleSize(150),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(8),
    backgroundColor: colors.brandText,
  },
  errorPrimaryButtonText: {
    ...typography.buttonLabel,
    color: colors.actionOnPrimary,
  },
  errorSecondaryButton: {
    minWidth: scaleSize(150),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brandText,
    borderRadius: scaleSize(8),
    backgroundColor: colors.background,
  },
  errorSecondaryButtonText: {
    ...typography.buttonLabel,
    color: colors.brandText,
  },
});
