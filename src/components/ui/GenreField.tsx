import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleSize } from '../../theme/scale';
import {
  formatInlineSummary,
  GENRE_ITEMS,
  toggleArrayValue,
} from './movieSearchFieldUtils';
import {
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
  MovieSearchPopupChip,
  movieSearchFieldSharedStyles,
} from './MovieSearchFieldShared';

type GenreFieldProps = {
  value: string[];
  onChange: (nextValue: string[]) => void;
};

export function GenreField({ value, onChange }: GenreFieldProps) {
  const [draftValue, setDraftValue] = useState(() => [...value]);
  const [snapshotValue, setSnapshotValue] = useState(() => [...value]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const summary = useMemo(() => formatInlineSummary(value, GENRE_ITEMS), [value]);

  function openModal() {
    setDraftValue([...value]);
    setSnapshotValue([...value]);
    setIsModalVisible(true);
  }

  function closeModal() {
    onChange([...draftValue]);
    setIsModalVisible(false);
  }

  function cancelModal() {
    setDraftValue([...snapshotValue]);
    setIsModalVisible(false);
  }

  function toggleDraftValue(nextValue: string) {
    setDraftValue((currentValue) => toggleArrayValue(currentValue, nextValue));
  }

  return (
    <>
      <MovieSearchFieldTrigger label="Genre" value={summary} onPress={openModal} />

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={sharedStyles.modalRoot}>
          <Pressable style={sharedStyles.modalBackdrop} onPress={closeModal} />

          <View style={sharedStyles.selectionModalCard}>
            <Text allowFontScaling={false} style={sharedStyles.selectionModalTitle}>
              Search by Genre(s)
            </Text>

            <View style={styles.selectionChipGroup}>
              {GENRE_ITEMS.map((item) => (
                <MovieSearchPopupChip
                  key={item.value}
                  label={item.label}
                  selected={draftValue.includes(item.value)}
                  onPress={() => toggleDraftValue(item.value)}
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
  selectionChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(4),
    gap: scaleSize(6),
  },
});
