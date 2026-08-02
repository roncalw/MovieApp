import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { formatInlineSummary, toggleArrayValue } from './movieSearchFieldUtils';
import {
  MovieSearchBulkSelectionLinks,
  MovieSearchModalActions,
  MovieSearchPopupChip,
} from './MovieSearchFieldShared';
import { movieSearchFieldSharedStyles as sharedStyles } from '../../../styles/search/movieSearchFieldSharedStyles';
import { movieSearchFieldModalStyles as styles } from '../../../styles/search/movieSearchFieldModalStyles';
import type {
  LabelValueItem,
  LanguageFieldProps,
} from '../../../types/search/movieSearchFieldTypes';
import { normalizeMovieOriginalLanguages } from '../../../utils/movieOriginalLanguages';
import { useFilterPopupVisibility } from './useFilterPopupVisibility';

export type LanguageLetterRow = {
  letter: string;
  items: LabelValueItem[];
};

export function groupLanguagesByFirstLetter(
  languageItems: LabelValueItem[],
): LanguageLetterRow[] {
  const itemsByLetter = new Map<string, LabelValueItem[]>();

  languageItems.forEach(item => {
    const firstLetter = item.label.trim().charAt(0).toLocaleUpperCase('en-US');
    if (!firstLetter) {
      return;
    }

    const existingItems = itemsByLetter.get(firstLetter) ?? [];
    existingItems.push(item);
    itemsByLetter.set(firstLetter, existingItems);
  });

  return [...itemsByLetter.entries()]
    .sort(([leftLetter], [rightLetter]) =>
      leftLetter.localeCompare(rightLetter, 'en-US'),
    )
    .map(([letter, items]) => ({
      letter,
      items: [...items].sort((leftItem, rightItem) =>
        leftItem.label.localeCompare(rightItem.label, 'en-US'),
      ),
    }));
}

export function LanguageField({
  value,
  onChange,
  languages,
  isLoading,
  isError,
  onRetry,
  onPopupVisibilityChange,
}: LanguageFieldProps) {
  const [draftValue, setDraftValue] = useState(() => [...value]);
  const [snapshotValue, setSnapshotValue] = useState(() => [...value]);
  const { hideModal, isModalVisible, showModal } = useFilterPopupVisibility(
    onPopupVisibilityChange,
  );
  const languageItems = useMemo(
    () =>
      languages.map(language => ({
        label: language.englishName,
        value: language.code,
      })),
    [languages],
  );
  const languageRows = useMemo(
    () => groupLanguagesByFirstLetter(languageItems),
    [languageItems],
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
    showModal();
  }

  function closeModal() {
    onChange(normalizeMovieOriginalLanguages(draftValue));
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
      <Pressable
        onPress={openModal}
        style={styles.languageInlineTrigger}
        accessibilityRole="button"
        accessibilityLabel={`Show movies in: ${summary}`}
      >
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.languageInlineTriggerText}
        >
          Show movies in: {summary}
        </Text>
      </Pressable>

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
              directionalLockEnabled
              nestedScrollEnabled
            >
              {languageRows.map(row => (
                <ScrollView
                  key={row.letter}
                  testID={`language-row-${row.letter}`}
                  horizontal
                  directionalLockEnabled
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.languageHorizontalRow}
                  contentContainerStyle={styles.languageHorizontalRowContent}
                >
                  {row.items.map(item => (
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
