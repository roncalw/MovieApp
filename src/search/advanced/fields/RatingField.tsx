import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import {
  RATING_ITEMS,
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
import type { RatingFieldProps } from '../../../types/search/movieSearchFieldTypes';

export function RatingField({ value, onChange }: RatingFieldProps) {
  const [draftValue, setDraftValue] = useState(() => parseRatingValue(value));
  const [snapshotValue, setSnapshotValue] = useState(() => parseRatingValue(value));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedRatings = useMemo(() => parseRatingValue(value), [value]);
  const summary = useMemo(
    () => formatRatingSummary(selectedRatings),
    [selectedRatings]
  );

  function openModal() {
    const nextValue = parseRatingValue(value);
    setDraftValue(nextValue);
    setSnapshotValue(nextValue);
    setIsModalVisible(true);
  }

  function closeModal() {
    onChange(formatRatingValue(draftValue));
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
      <MovieSearchFieldTrigger label="Rating" value={summary} onPress={openModal} />

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
                  selected={draftValue.includes(item.id)}
                  onPress={() => toggleDraftValue(item.id)}
                  reversedSelectionAppearance
                  subtleBorder
                />
              ))}
            </View>

            <MovieSearchBulkSelectionLinks
              onClearAll={() => setDraftValue([])}
              onAddAll={() => setDraftValue(RATING_ITEMS.map((item) => item.id))}
            />
          </View>

          <MovieSearchModalActions onCancel={cancelModal} onClose={closeModal} />
        </View>
      </Modal>
    </>
  );
}

function parseRatingValue(value: string) {
  if (value.trim() === '') {
    return [];
  }

  const allowedValues = new Set(RATING_ITEMS.map((item) => item.id));

  return value
    .split(',')
    .map((rating) => rating.trim())
    .filter((rating) => allowedValues.has(rating));
}

function formatRatingValue(values: string[]) {
  return RATING_ITEMS
    .filter((item) => values.includes(item.id))
    .map((item) => item.id)
    .join(',');
}

function formatRatingSummary(values: string[]) {
  if (values.length === 0) {
    return '';
  }

  return RATING_ITEMS
    .filter((item) => values.includes(item.id))
    .map((item) => item.label)
    .join(' | ');
}
