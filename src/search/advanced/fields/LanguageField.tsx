import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { formatInlineSummary, toggleArrayValue } from './movieSearchFieldUtils';
import {
  MovieSearchBulkSelectionLinks,
  MovieSearchFieldTrigger,
  MovieSearchModalActions,
  MovieSearchPopupChip,
} from './MovieSearchFieldShared';
import { movieSearchFieldSharedStyles as sharedStyles } from '../../../styles/search/movieSearchFieldSharedStyles';
import { movieSearchFieldModalStyles as styles } from '../../../styles/search/movieSearchFieldModalStyles';
import type { LanguageFieldProps } from '../../../types/search/movieSearchFieldTypes';
import { normalizeMovieOriginalLanguages } from '../../../utils/movieOriginalLanguages';

export function LanguageField({
  value,
  onChange,
  languages,
  isLoading,
  isError,
  onRetry,
}: LanguageFieldProps) {
  const [draftValue, setDraftValue] = useState(() => [...value]);
  const [snapshotValue, setSnapshotValue] = useState(() => [...value]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const languageItems = useMemo(
    () =>
      languages.map(language => ({
        label: language.englishName,
        value: language.code,
      })),
    [languages],
  );
  const summary = useMemo(() => {
    if (value.length === 0) {
      return 'All Languages';
    }

    const knownSummary = formatInlineSummary(value, languageItems);

    if (knownSummary) {
      return knownSummary;
    }

    return value.map(languageCode => languageCode.toUpperCase()).join(' | ');
  }, [languageItems, value]);

  function openModal() {
    setDraftValue([...value]);
    setSnapshotValue([...value]);
    setIsModalVisible(true);
  }

  function closeModal() {
    onChange(normalizeMovieOriginalLanguages(draftValue));
    setIsModalVisible(false);
  }

  function cancelModal() {
    setDraftValue([...snapshotValue]);
    setIsModalVisible(false);
  }

  function toggleDraftValue(nextValue: string) {
    setDraftValue(currentValue => toggleArrayValue(currentValue, nextValue));
  }

  return (
    <>
      <MovieSearchFieldTrigger
        label="Original Language"
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

          <View
            style={[sharedStyles.selectionModalCard, styles.languageModalCard]}
          >
            <Text
              allowFontScaling={false}
              style={sharedStyles.selectionModalTitle}
            >
              Search by Original Language(s)
            </Text>

            {isError ? (
              <Pressable onPress={onRetry} style={styles.languageStatusButton}>
                <Text
                  allowFontScaling={false}
                  style={styles.languageStatusText}
                >
                  Language names could not be loaded. Tap to retry.
                </Text>
              </Pressable>
            ) : null}

            {isLoading && languageItems.length <= 1 ? (
              <Text allowFontScaling={false} style={styles.languageStatusText}>
                Loading language names...
              </Text>
            ) : null}

            <ScrollView
              style={styles.languageScrollView}
              contentContainerStyle={styles.languageScrollContent}
              showsVerticalScrollIndicator
            >
              <MovieSearchPopupChip
                label="All Languages"
                selected={draftValue.length === 0}
                onPress={() => setDraftValue([])}
                reversedSelectionAppearance
                subtleBorder
              />

              {languageItems.map(item => (
                <MovieSearchPopupChip
                  key={item.value}
                  label={item.label}
                  selected={draftValue.includes(item.value)}
                  onPress={() => toggleDraftValue(item.value)}
                  reversedSelectionAppearance
                  subtleBorder
                />
              ))}
            </ScrollView>

            <MovieSearchBulkSelectionLinks
              onClearAll={() => setDraftValue([])}
              onAddAll={() =>
                setDraftValue(languageItems.map(item => item.value))
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
