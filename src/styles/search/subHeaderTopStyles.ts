/**
 * Styles for the top row of the advanced-search header.
 *
 * Imported by:
 * - src/search/advanced/SubHeaderTop.tsx
 *
 * Next step path:
 * - SubHeaderTop sends the submit action through HeaderMovieSearchContext to
 *   SubHeaderMovieSearchFields.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const subHeaderTopStyles = StyleSheet.create({
  container: {
    paddingBottom: scaleSize(14),
    backgroundColor: colors.background,
  },
  title: {
    ...typography.pageTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
  searchModeLink: {
    position: 'absolute',
    alignSelf: 'center',
    minHeight: scaleSize(30),
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchModeLinkText: {
    ...typography.summaryBody,
    color: colors.brandText,
  },
  rightAction: {
    minHeight: scaleSize(36),
    minWidth: scaleSize(94),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderWidth: 1,
    borderColor: colors.searchAccent,
    borderRadius: 999,
    backgroundColor: colors.brandTintSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSlot: {
    width: scaleSize(112),
    alignItems: 'flex-end',
  },
  rightActionDisabled: {
    opacity: 0.45,
  },
  rightActionText: {
    ...typography.buttonLabel,
    color: colors.brandText,
    textAlign: 'center',
  },
});
