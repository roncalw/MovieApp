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
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    borderWidth: scaleSize(2),
    borderColor: colors.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(14),
    backgroundColor: 'transparent',
  },
  radioInner: {
    width: scaleSize(14),
    height: scaleSize(14),
    borderRadius: scaleSize(7),
    backgroundColor: colors.chipBackgroundSelected,
  },
  sortOptionText: {
    flex: 1,
    color: colors.actionPrimary,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
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
});
