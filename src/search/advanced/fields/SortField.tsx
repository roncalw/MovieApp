import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { getSelectedSortLabel, SORT_ITEMS } from './movieSearchFieldUtils';
import {
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
} from './MovieSearchFieldShared';
import { movieSearchFieldSharedStyles as sharedStyles } from '../../../styles/search/movieSearchFieldSharedStyles';
import { movieSearchFieldModalStyles as styles } from '../../../styles/search/movieSearchFieldModalStyles';
import type { SortFieldProps } from '../../../types/search/movieSearchFieldTypes';
import { useFilterPopupVisibility } from './useFilterPopupVisibility';

export function SortField({
  value,
  onChange,
  onPopupVisibilityChange,
}: SortFieldProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [snapshotValue, setSnapshotValue] = useState(value);
  const { hideModal, isModalVisible, showModal } = useFilterPopupVisibility(
    onPopupVisibilityChange,
  );

  function openModal() {
    setDraftValue(value);
    setSnapshotValue(value);
    showModal();
  }

  function closeModal() {
    onChange(draftValue);
    hideModal();
  }

  function cancelModal() {
    setDraftValue(snapshotValue);
    hideModal();
  }

  function toggleDraftValue(nextValue: string) {
    setDraftValue(currentValue =>
      currentValue === nextValue ? '' : nextValue,
    );
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
            <Text
              allowFontScaling={false}
              style={sharedStyles.selectionModalTitle}
            >
              Sort By Popularity or User Rating
            </Text>

            <View style={styles.sortOptionGroup}>
              {SORT_ITEMS.map(item => (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: draftValue === item.value }}
                  onPress={() => toggleDraftValue(item.value)}
                  style={styles.sortOptionRow}
                >
                  <View style={styles.radioOuter}>
                    {draftValue === item.value ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>

                  <Text allowFontScaling={false} style={styles.sortOptionText}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <MovieSearchModalActions
            onCancel={cancelModal}
            onClose={closeModal}
          />
        </View>
      </Modal>
    </>
  );
}
