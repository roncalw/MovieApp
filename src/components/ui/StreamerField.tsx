import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleSize } from '../../theme/scale';
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
  movieSearchFieldSharedStyles,
} from './MovieSearchFieldShared';

type StreamerFieldProps = {
  value: string[];
  onChange: (nextValue: string[]) => void;
};

export function StreamerField({ value, onChange }: StreamerFieldProps) {
  const [draftValue, setDraftValue] = useState(() => [...value]);
  const [snapshotValue, setSnapshotValue] = useState(() => [...value]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const summary = useMemo(() => formatInlineSummary(value, STREAMER_ITEMS), [value]);

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
            <Text allowFontScaling={false} style={sharedStyles.selectionModalTitle}>
              Search by Streamer(s)
            </Text>

            <View style={styles.streamerTileGroup}>
              {STREAMER_ITEMS.map((item) => (
                <MovieSearchStreamerTile
                  key={item.value}
                  label={item.label}
                  source={item.image}
                  selected={draftValue.includes(item.value)}
                  onPress={() => toggleDraftValue(item.value)}
                />
              ))}
            </View>

            <MovieSearchBulkSelectionLinks
              onClearAll={() => setDraftValue([])}
              onAddAll={() =>
                setDraftValue(STREAMER_ITEMS.map((item) => item.value))
              }
            />
          </View>

          <MovieSearchModalActions onCancel={cancelModal} onClose={closeModal} />
        </View>
      </Modal>
    </>
  );
}

const sharedStyles = movieSearchFieldSharedStyles;

const styles = StyleSheet.create({
  streamerTileGroup: {
    width: '100%',
    maxWidth: scaleSize(350),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(6),
    paddingHorizontal: scaleSize(4),
  },
});
