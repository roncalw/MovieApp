import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { MovieSearchModalActions } from '../search/advanced/fields/MovieSearchFieldShared';
import { movieSearchFieldSharedStyles as sharedStyles } from '../styles/search/movieSearchFieldSharedStyles';
import { movieSearchFieldModalStyles as styles } from '../styles/search/movieSearchFieldModalStyles';

export type FavoritesWatchOption =
  | 'Show All'
  | 'Direct Subscriptions'
  | 'Rent, Buy, or Not Showing';
const options: FavoritesWatchOption[] = [
  'Show All',
  'Direct Subscriptions',
  'Rent, Buy, or Not Showing',
];

export function FavoritesWatchOptions({
  value,
  onChange,
}: {
  value: FavoritesWatchOption;
  onChange: (value: FavoritesWatchOption) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value);

  function closeModal() {
    onChange(draft);
    setVisible(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Watch Options: ${value}`}
        style={styles.languageInlineTrigger}
        onPress={() => {
          setDraft(value);
          setVisible(true);
        }}
      >
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={styles.languageInlineTriggerText}
        >
          Watch Options: {value}
        </Text>
      </Pressable>
      <Modal
        transparent
        visible={visible}
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
              Watch Options
            </Text>
            <View style={styles.sortOptionGroup}>
              {options.map(option => (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityLabel={option}
                  accessibilityState={{ selected: draft === option }}
                  onPress={() => setDraft(option)}
                  style={styles.sortOptionRow}
                >
                  <View style={styles.radioOuter}>
                    {draft === option ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>
                  <Text allowFontScaling={false} style={styles.sortOptionText}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <MovieSearchModalActions
            onCancel={() => setVisible(false)}
            onClose={closeModal}
          />
        </View>
      </Modal>
    </>
  );
}
