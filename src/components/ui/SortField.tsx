import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleSize } from '../../theme/scale';
import { getSelectedSortLabel, SORT_ITEMS } from './movieSearchFieldUtils';
import {
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
  MovieSearchPopupChip,
  movieSearchFieldSharedStyles,
} from './MovieSearchFieldShared';

type SortFieldProps = {
  value: string;
  onChange: (nextValue: string) => void;
};

export function SortField({ value, onChange }: SortFieldProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [snapshotValue, setSnapshotValue] = useState(value);
  const [isModalVisible, setIsModalVisible] = useState(false);

  function openModal() {
    setDraftValue(value);
    setSnapshotValue(value);
    setIsModalVisible(true);
  }

  function closeModal() {
    onChange(draftValue);
    setIsModalVisible(false);
  }

  function cancelModal() {
    setDraftValue(snapshotValue);
    setIsModalVisible(false);
  }

  function toggleDraftValue(nextValue: string) {
    setDraftValue((currentValue) => (currentValue === nextValue ? '' : nextValue));
  }

  return (
    <>
      <MovieSearchFieldTrigger
        label="Sort"
        value={getSelectedSortLabel(value)}
        onPress={openModal}
      />

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={sharedStyles.modalRoot}>
          <Pressable style={sharedStyles.modalBackdrop} onPress={closeModal} />

          <View style={[sharedStyles.selectionModalCard, styles.sortModalCard]}>
            <Text allowFontScaling={false} style={sharedStyles.selectionModalTitle}>
              Sort By Popularity or User Rating
            </Text>

            <View style={styles.sortChipGroup}>
              {SORT_ITEMS.map((item) => (
                <MovieSearchPopupChip
                  key={item.id}
                  label={item.label}
                  selected={draftValue === item.value}
                  onPress={() => toggleDraftValue(item.value)}
                  fixedWidth
                  reversedSelectionAppearance
                  subtleBorder
                />
              ))}
            </View>
          </View>

          <MovieSearchModalActions onCancel={cancelModal} onClose={closeModal} />
        </View>
      </Modal>
    </>
  );
}

const sharedStyles = movieSearchFieldSharedStyles;

const styles = StyleSheet.create({
  sortModalCard: {
    paddingTop: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    paddingBottom: scaleSize(14),
  },
  sortChipGroup: {
    width: '100%',
    gap: scaleSize(8),
    paddingTop: scaleSize(4),
  },
});
