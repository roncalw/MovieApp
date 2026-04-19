import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleSize } from '../../theme/scale';
import { RATING_ITEMS } from './movieSearchFieldUtils';
import {
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
  MovieSearchPopupChip,
  movieSearchFieldSharedStyles,
} from './MovieSearchFieldShared';

type RatingFieldProps = {
  value: string;
  onChange: (nextValue: string) => void;
};

export function RatingField({ value, onChange }: RatingFieldProps) {
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
      <MovieSearchFieldTrigger label="Rating" value={value || ''} onPress={openModal} />

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={sharedStyles.modalRoot}>
          <Pressable style={sharedStyles.modalBackdrop} onPress={closeModal} />

          <View style={[sharedStyles.selectionModalCard, styles.ratingModalCard]}>
            <Text allowFontScaling={false} style={sharedStyles.selectionModalTitle}>
              Search by Rating(s)
            </Text>

            <View style={styles.ratingChipGroup}>
              {RATING_ITEMS.map((item) => (
                <MovieSearchPopupChip
                  key={item.id}
                  label={item.label}
                  selected={draftValue === item.id}
                  onPress={() => toggleDraftValue(item.id)}
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
});
