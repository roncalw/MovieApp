import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import {
  formatInlineSummary,
  STREAMER_ITEMS,
  toggleArrayValue,
} from './movieSearchFieldUtils';
import {
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
  MovieSearchBulkSelectionLinks,
  MovieSearchStreamerTile,
} from './MovieSearchFieldShared';
import { movieSearchFieldSharedStyles as sharedStyles } from '../../../styles/search/movieSearchFieldSharedStyles';
import { movieSearchFieldModalStyles as styles } from '../../../styles/search/movieSearchFieldModalStyles';
import type { StreamerFieldProps } from '../../../types/search/movieSearchFieldTypes';
import { useFilterPopupVisibility } from './useFilterPopupVisibility';

export function StreamerField({
  value,
  onChange,
  onPopupVisibilityChange,
}: StreamerFieldProps) {
  const [draftValue, setDraftValue] = useState(() => [...value]);
  const [snapshotValue, setSnapshotValue] = useState(() => [...value]);
  const { hideModal, isModalVisible, showModal } = useFilterPopupVisibility(
    onPopupVisibilityChange,
  );

  const summary = useMemo(
    () => formatInlineSummary(value, STREAMER_ITEMS),
    [value],
  );

  function openModal() {
    setDraftValue([...value]);
    setSnapshotValue([...value]);
    showModal();
  }

  function closeModal() {
    onChange([...draftValue]);
    hideModal();
  }

  function cancelModal() {
    setDraftValue([...snapshotValue]);
    hideModal();
  }

  function toggleDraftValue(nextValue: string) {
    setDraftValue(currentValue => toggleArrayValue(currentValue, nextValue));
  }

  return (
    <>
      <MovieSearchFieldTrigger
        label="Streaming"
        value={summary}
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

          <View style={sharedStyles.selectionModalCard}>
            <Text
              allowFontScaling={false}
              style={sharedStyles.selectionModalTitle}
            >
              Search by Streamer(s)
            </Text>

            <View style={styles.streamerTileGroup}>
              {STREAMER_ITEMS.map(item => (
                <MovieSearchStreamerTile
                  key={item.value}
                  label={item.label}
                  source={item.image}
                  selected={draftValue.includes(item.value)}
                  onPress={() => toggleDraftValue(item.value)}
                  wide={item.wide}
                />
              ))}
            </View>

            <MovieSearchBulkSelectionLinks
              onClearAll={() => setDraftValue([])}
              onAddAll={() =>
                setDraftValue(STREAMER_ITEMS.map(item => item.value))
              }
            />
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
