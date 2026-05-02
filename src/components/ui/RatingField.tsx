import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleSize } from '../../theme/scale';
import {
  RATING_ITEMS,
  toggleArrayValue,
} from './movieSearchFieldUtils';
import {
  MovieSearchBulkSelectionLinks,
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

const sharedStyles = movieSearchFieldSharedStyles;

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
