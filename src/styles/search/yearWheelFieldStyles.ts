/**
 * Styles for the reusable year/date picker used by advanced search.
 *
 * Imported by:
 * - src/search/advanced/fields/YearWheelField.tsx
 *
 * Next step path:
 * - SubHeaderMovieSearchFields owns the begin/end year state and passes it
 *   into YearWheelField.
 */
import { StyleSheet } from 'react-native';
import { buttons } from '../buttons';
import { colors } from '../colors';
import { scaleSize } from '../scale';
import { typography } from '../typography';

export const yearWheelFieldStyles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: scaleSize(8),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(10),
    backgroundColor: colors.background,
  },
  fieldValue: {
    ...typography.inputText,
    color: colors.textPrimary,
  },
  fieldChevron: {
    ...typography.inputText,
    color: colors.brandText,
  },
  anchoredDateField: {
    width: scaleSize(120),
    minHeight: scaleSize(40),
    paddingHorizontal: scaleSize(10),
    paddingVertical: 0,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.brandTintSurface,
    borderWidth: 0,
    borderColor: colors.searchAccent,
    borderRadius: scaleSize(10),
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  anchoredDateFieldValue: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(20),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.modalBackdrop,
  },
  anchoredDateBackdrop: {
    backgroundColor: 'transparent',
  },
  anchoredDateModalAnchor: {
    position: 'absolute',
    alignItems: 'center',
  },
  anchoredDateModalCard: {
    width: '100%',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandTintSurface,
    borderColor: colors.searchAccent,
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
  },
  anchoredDatePicker: {
    height: scaleSize(180),
  },
  anchoredDateActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(10),
    marginTop: scaleSize(10),
  },
  anchoredDateCloseButton: {
    width: scaleSize(96),
    minHeight: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandTintSurface,
    borderRadius: scaleSize(10),
    borderWidth: 0,
    borderColor: colors.searchAccent,
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  anchoredDateSecondaryButton: {
    width: scaleSize(96),
    minHeight: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandTintSurface,
    borderRadius: scaleSize(10),
    borderWidth: 0,
    borderColor: colors.searchAccent,
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  anchoredDateSecondaryButtonText: {
    color: colors.textPrimary,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
    textAlign: 'center',
  },
  anchoredDateCloseButtonText: {
    color: colors.textPrimary,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
    textAlign: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: scaleSize(320),
    padding: scaleSize(16),
    borderRadius: scaleSize(16),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalTitle: {
    ...typography.summaryTitle,
    color: colors.brandText,
    textAlign: 'center',
    marginBottom: scaleSize(12),
  },
  modalDatePicker: {
    alignSelf: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scaleSize(10),
    marginTop: scaleSize(16),
  },
  secondaryAction: {
    minHeight: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    ...typography.buttonLabel,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  primaryAction: {
    minHeight: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: buttons.primaryPill.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...typography.buttonLabel,
    color: buttons.primaryPill.textColor,
    textAlign: 'center',
  },
});
