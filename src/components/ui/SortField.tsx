import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleSize } from '../../theme/scale';
import { getSelectedSortLabel, SORT_ITEMS } from './movieSearchFieldUtils';
import {
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
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

const sharedStyles = movieSearchFieldSharedStyles;

const styles = StyleSheet.create({
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
    borderColor: '#8FB7DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(14),
    backgroundColor: 'transparent',
  },
  radioInner: {
    width: scaleSize(14),
    height: scaleSize(14),
    borderRadius: scaleSize(7),
    backgroundColor: '#8FB7DF',
  },
  sortOptionText: {
    flex: 1,
    color: '#222222',
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
  },
});
