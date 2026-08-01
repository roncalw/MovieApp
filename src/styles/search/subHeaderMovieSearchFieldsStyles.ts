/**
 * Layout and text styles for the advanced-search filter controls.
 *
 * Imported by:
 * - src/search/advanced/SubHeaderMovieSearchFields.tsx
 *
 * Next step path:
 * - MovieSearchScreen receives submitted filter values from this subheader
 *   and uses them to run the movie search query.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const subHeaderMovieSearchFieldsStyles = StyleSheet.create({
  visibilityToggle: {
    alignSelf: 'center',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    marginBottom: scaleSize(6),
  },
  visibilityToggleText: {
    ...typography.visibilityToggle,
    color: colors.brandText,
  },
  visibilityToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
  },
  excludeSeenToggle: {
    alignSelf: 'center',
    paddingHorizontal: scaleSize(12),
    paddingBottom: scaleSize(8),
  },
  excludeSeenToggleText: {
    fontSize: scaleSize(12),
    lineHeight: scaleSize(13),
    color: colors.brandTextLight,
    fontStyle: 'italic',
    fontWeight: typography.summaryBody.fontWeight,
    textAlign: 'center',
  },
  excludeSeenToggleTextActive: {
    color: colors.brandTextLight,
    fontWeight: typography.summaryBody.fontWeight,
  },
  yearFieldsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scaleSize(12),
  },
  yearFieldColumn: {
    flex: 1,
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaleSize(8),
    marginBottom: scaleSize(6),
  },
  languageFieldRow: {
    width: '50%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaleSize(4),
    marginBottom: scaleSize(6),
  },
  dateFieldLabel: {
    color: colors.brandText,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    marginTop: scaleSize(8),
    marginBottom: scaleSize(4),
    fontWeight: '400',
  },
  validationText: {
    ...typography.summaryBody,
    color: colors.brandText,
    textAlign: 'center',
    marginTop: scaleSize(8),
    marginBottom: scaleSize(4),
  },
});
