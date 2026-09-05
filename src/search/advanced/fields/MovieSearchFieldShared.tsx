import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { movieSearchFieldSharedStyles as styles } from '../../../styles/search/movieSearchFieldSharedStyles';
import type {
  MovieSearchBulkSelectionLinksProps,
  MovieSearchFieldTriggerProps,
  MovieSearchModalActionsProps,
  MovieSearchPopupChipProps,
  MovieSearchStreamerTileProps,
} from '../../../types/search/movieSearchFieldTypes';

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
        selected &&
          reversedSelectionAppearance &&
          styles.popupChipSelectedReversed,
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
  wide = false,
}: MovieSearchStreamerTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.streamerTile,
        wide && styles.streamerWideTile,
        selected && styles.streamerTileSelected,
      ]}
    >
      <Image
        source={source}
        style={[styles.streamerLogo, wide && styles.streamerWideLogo]}
        resizeMode="contain"
      />
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
      <Pressable onPress={onAddAll} style={styles.bulkSelectionLink}>
        <Text allowFontScaling={false} style={styles.bulkSelectionText}>
          Add All
        </Text>
      </Pressable>

      <Pressable onPress={onClearAll} style={styles.bulkSelectionLink}>
        <Text allowFontScaling={false} style={styles.bulkSelectionText}>
          Clear All
        </Text>
      </Pressable>
    </View>
  );
}
