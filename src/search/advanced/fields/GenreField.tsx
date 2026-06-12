import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import {
  formatInlineSummary,
  GENRE_ITEMS,
  toggleArrayValue,
} from './movieSearchFieldUtils';
import {
  MovieSearchBulkSelectionLinks,
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
  MovieSearchPopupChip,
} from './MovieSearchFieldShared';
import { movieSearchFieldSharedStyles as sharedStyles } from '../../../styles/search/movieSearchFieldSharedStyles';
import { movieSearchFieldModalStyles as styles } from '../../../styles/search/movieSearchFieldModalStyles';
import type { GenreFieldProps } from '../../../types/search/movieSearchFieldTypes';

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

            <MovieSearchBulkSelectionLinks
              onClearAll={() => setDraftValue([])}
              onAddAll={() => setDraftValue(GENRE_ITEMS.map((item) => item.value))}
            />
          </View>

          <MovieSearchModalActions onCancel={cancelModal} onClose={closeModal} />
        </View>
      </Modal>
    </>
  );
}
