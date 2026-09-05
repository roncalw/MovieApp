/**
 * Shared styles for the advanced-search field controls.
 *
 * Imported by:
 * - src/search/advanced/fields/MovieSearchFieldShared.tsx
 *
 * Next step path:
 * - The field-specific controls use these shared field pieces inside
 *   SubHeaderMovieSearchFields before MovieSearchScreen renders results.
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const movieSearchFieldSharedStyles = StyleSheet.create({
  filterColumn: {
    flex: 1,
    alignItems: 'center',
  },
  filterTrigger: {
    justifyContent: 'center',
    minHeight: scaleSize(32),
    marginBottom: 0,
  },
  filterTriggerText: {
    color: colors.searchAccent,
    textAlign: 'center',
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    fontWeight: '400',
  },
  filterValueBox: {
    width: scaleSize(150),
    minHeight: scaleSize(28),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(4),
  },
  filterValueText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: scaleSize(14),
    lineHeight: scaleSize(18),
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: scaleSize(150),
    paddingHorizontal: scaleSize(12),
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  selectionModalCard: {
    width: '100%',
    maxWidth: scaleSize(400),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.searchAccent,
    borderRadius: scaleSize(30),
    backgroundColor: colors.searchModalSurface,
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
    paddingTop: scaleSize(8),
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(10),
  },
  selectionModalTitle: {
    color: colors.searchAccent,
    fontSize: scaleSize(20),
    lineHeight: scaleSize(24),
    marginBottom: scaleSize(6),
    marginTop: scaleSize(2),
  },
  popupChip: {
    minHeight: scaleSize(34),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(10),
    backgroundColor: colors.searchChipSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupChipFixedWidth: {
    alignSelf: 'center',
    width: scaleSize(290),
  },
  popupChipSubtleBorder: {
    borderWidth: 1,
    borderColor: colors.searchChipBorderSubtle,
  },
  popupChipSubtleBorderSelected: {
    borderColor: colors.searchChipBorderSubtleSelected,
  },
  popupChipSelected: {
    backgroundColor: colors.searchModalSurface,
  },
  popupChipReversed: {
    backgroundColor: colors.searchModalSurface,
  },
  popupChipSelectedReversed: {
    backgroundColor: colors.searchChipSurface,
  },
  popupChipText: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    textAlign: 'center',
  },
  popupChipTextSelected: {
    color: colors.searchMutedText,
  },
  popupChipTextReversed: {
    color: colors.searchMutedText,
  },
  popupChipTextSelectedReversed: {
    color: colors.textPrimary,
  },
  streamerTile: {
    minWidth: scaleSize(78),
    minHeight: scaleSize(42),
    paddingHorizontal: scaleSize(4),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamerTileSelected: {
    backgroundColor: colors.favoriteActive,
  },
  streamerWideTile: {
    width: scaleSize(246),
  },
  streamerLogo: {
    width: scaleSize(70),
    height: scaleSize(35),
  },
  streamerWideLogo: {
    width: scaleSize(238),
  },
  bulkSelectionRow: {
    width: '100%',
    maxWidth: scaleSize(250),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scaleSize(10),
    paddingHorizontal: scaleSize(8),
  },
  bulkSelectionLink: {
    minHeight: scaleSize(32),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(8),
  },
  bulkSelectionText: {
    ...typography.visibilityToggle,
    color: colors.brandText,
    fontSize: scaleSize(12.75),
    lineHeight: scaleSize(16.5),
    textAlign: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(12),
    marginTop: scaleSize(12),
  },
  modalPrimaryButton: {
    alignSelf: 'center',
    height: scaleSize(40),
    width: scaleSize(120),
    backgroundColor: colors.brandTintSurface,
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.searchAccent,
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  modalSecondaryButton: {
    alignSelf: 'center',
    height: scaleSize(40),
    width: scaleSize(120),
    backgroundColor: colors.brandTintSurface,
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.searchAccent,
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  modalPrimaryButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
  },
  modalSecondaryButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
  },
});
