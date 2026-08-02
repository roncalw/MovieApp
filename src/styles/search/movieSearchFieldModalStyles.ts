/**
 * Field-specific modal layout styles for advanced-search filters.
 *
 * Imported by:
 * - src/search/advanced/fields/GenreField.tsx
 * - src/search/advanced/fields/RatingField.tsx
 * - src/search/advanced/fields/SortField.tsx
 * - src/search/advanced/fields/StreamerField.tsx
 *
 * Next step path:
 * - These field modals update the draft filter values used by
 *   SubHeaderMovieSearchFields.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const movieSearchFieldModalStyles = StyleSheet.create({
  selectionChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(4),
    gap: scaleSize(6),
  },
  ratingModalCard: {
    maxWidth: scaleSize(320),
    paddingBottom: scaleSize(14),
  },
  ratingChipGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(8),
    paddingTop: scaleSize(8),
  },
  sortModalCard: {
    paddingTop: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    paddingBottom: scaleSize(14),
  },
  sortOptionGroup: {
    width: '100%',
    maxWidth: scaleSize(340),
    gap: scaleSize(10),
    paddingTop: scaleSize(8),
    paddingBottom: scaleSize(4),
  },
  sortOptionRow: {
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(8),
  },
  radioOuter: {
    width: typography.summaryBody.lineHeight,
    height: typography.summaryBody.lineHeight,
    borderRadius: scaleSize(10),
    borderWidth: 1.5,
    borderColor: colors.brandText,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(14),
    backgroundColor: 'transparent',
  },
  radioInner: {
    width: scaleSize(10),
    height: scaleSize(10),
    borderRadius: scaleSize(5),
    backgroundColor: colors.brandTextLight,
  },
  sortOptionText: {
    ...typography.summaryBody,
    flex: 1,
    color: colors.brandText,
  },
  streamerTileGroup: {
    width: '100%',
    maxWidth: scaleSize(350),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(6),
    paddingHorizontal: scaleSize(4),
  },
  languageModalCard: {
    maxHeight: scaleSize(560),
    overflow: 'hidden',
  },
  languageInlineTrigger: {
    alignSelf: 'center',
    maxWidth: '92%',
    paddingHorizontal: scaleSize(12),
    paddingBottom: scaleSize(8),
  },
  languageInlineTriggerText: {
    fontSize: scaleSize(12),
    lineHeight: scaleSize(13),
    color: colors.brandTextLight,
    fontStyle: 'italic',
    fontWeight: typography.summaryBody.fontWeight,
    textAlign: 'center',
  },
  languageScrollView: {
    width: '100%',
    height: scaleSize(336),
    maxHeight: scaleSize(336),
  },
  languageScrollContent: {
    alignItems: 'stretch',
    paddingVertical: 0,
  },
  languageHorizontalRow: {
    width: '100%',
    height: scaleSize(42),
    maxHeight: scaleSize(42),
    overflow: 'hidden',
  },
  languageHorizontalRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
    paddingRight: scaleSize(48),
  },
  languageStatusButton: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(6),
  },
  languageStatusText: {
    ...typography.summaryBody,
    color: colors.brandText,
    textAlign: 'center',
    marginBottom: scaleSize(6),
  },
});
