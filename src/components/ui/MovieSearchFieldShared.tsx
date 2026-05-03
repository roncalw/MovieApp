import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';

type MovieSearchFieldTriggerProps = {
  label: string;
  value: string;
  onPress: () => void;
};

type MovieSearchPopupChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  reversedSelectionAppearance?: boolean;
  fixedWidth?: boolean;
  subtleBorder?: boolean;
};

type MovieSearchStreamerTileProps = {
  label: string;
  source: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
};

type MovieSearchModalActionsProps = {
  onCancel: () => void;
  onClose: () => void;
};

type MovieSearchBulkSelectionLinksProps = {
  onClearAll: () => void;
  onAddAll: () => void;
};

export function MovieSearchFieldTrigger({
  label,
  value,
  onPress,
}: MovieSearchFieldTriggerProps) {
  return (
    <View style={styles.filterColumn}>
      <Pressable onPress={onPress} style={styles.filterTrigger}>
        <Text allowFontScaling={false} style={styles.filterTriggerText}>
          {label} {'>'}
        </Text>
      </Pressable>

      <View style={styles.filterValueBox}>
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.filterValueText}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export function MovieSearchPopupChip({
  label,
  selected,
  onPress,
  reversedSelectionAppearance = false,
  fixedWidth = false,
  subtleBorder = false,
}: MovieSearchPopupChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.popupChip,
        fixedWidth && styles.popupChipFixedWidth,
        subtleBorder && styles.popupChipSubtleBorder,
        reversedSelectionAppearance && styles.popupChipReversed,
        selected && styles.popupChipSelected,
        selected && subtleBorder && styles.popupChipSubtleBorderSelected,
        selected && reversedSelectionAppearance && styles.popupChipSelectedReversed,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.popupChipText,
          reversedSelectionAppearance && styles.popupChipTextReversed,
          selected && styles.popupChipTextSelected,
          selected &&
            reversedSelectionAppearance &&
            styles.popupChipTextSelectedReversed,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MovieSearchStreamerTile({
  label,
  source,
  selected,
  onPress,
}: MovieSearchStreamerTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.streamerTile, selected && styles.streamerTileSelected]}
    >
      <Image source={source} style={styles.streamerLogo} resizeMode="contain" />
    </Pressable>
  );
}

export function MovieSearchModalActions({
  onCancel,
  onClose,
}: MovieSearchModalActionsProps) {
  return (
    <View style={styles.modalActionsRow}>
      <Pressable onPress={onCancel} style={styles.modalSecondaryButton}>
        <Text allowFontScaling={false} style={styles.modalSecondaryButtonText}>
          Cancel
        </Text>
      </Pressable>

      <Pressable onPress={onClose} style={styles.modalPrimaryButton}>
        <Text allowFontScaling={false} style={styles.modalPrimaryButtonText}>
          Close
        </Text>
      </Pressable>
    </View>
  );
}

export function MovieSearchBulkSelectionLinks({
  onClearAll,
  onAddAll,
}: MovieSearchBulkSelectionLinksProps) {
  return (
    <View style={styles.bulkSelectionRow}>
      <Pressable onPress={onClearAll} style={styles.bulkSelectionLink}>
        <Text allowFontScaling={false} style={styles.bulkSelectionText}>
          Clear All
        </Text>
      </Pressable>

      <Pressable onPress={onAddAll} style={styles.bulkSelectionLink}>
        <Text allowFontScaling={false} style={styles.bulkSelectionText}>
          Add All
        </Text>
      </Pressable>
    </View>
  );
}

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
    color: '#771F14',
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
    borderColor: '#771F14',
    borderRadius: scaleSize(30),
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
    paddingTop: scaleSize(8),
    paddingHorizontal: scaleSize(10),
    paddingBottom: scaleSize(10),
  },
  selectionModalTitle: {
    color: '#771F14',
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
    backgroundColor: '#D9BC84',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupChipFixedWidth: {
    alignSelf: 'center',
    width: scaleSize(290),
  },
  popupChipSubtleBorder: {
    borderWidth: 1,
    borderColor: 'rgba(119, 31, 20, 0.12)',
  },
  popupChipSubtleBorderSelected: {
    borderColor: 'rgba(119, 31, 20, 0.18)',
  },
  popupChipSelected: {
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
  },
  popupChipReversed: {
    backgroundColor: 'rgba(251, 235, 202, 0.999)',
  },
  popupChipSelectedReversed: {
    backgroundColor: '#D9BC84',
  },
  popupChipText: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    textAlign: 'center',
  },
  popupChipTextSelected: {
    color: '#777777',
  },
  popupChipTextReversed: {
    color: '#777777',
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
    backgroundColor: 'red',
  },
  streamerLogo: {
    width: scaleSize(70),
    height: scaleSize(35),
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
    backgroundColor: '#F8EBCE',
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  modalSecondaryButton: {
    alignSelf: 'center',
    height: scaleSize(40),
    width: scaleSize(120),
    backgroundColor: '#F8EBCE',
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#771F14',
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

const styles = movieSearchFieldSharedStyles;
