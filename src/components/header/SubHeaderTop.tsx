/*
Step: 5
   * /MovieApp/src/components/header/SubHeaderTop.tsx
Imported by:
   * /MovieApp/src/components/header/HeaderMovieSearch.tsx
Next step path:
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Purpose:
   * Renders the shared top header row while reading the search-button disabled state and submit trigger from the parent
     header context.
*/
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { scaleSize } from '../../theme/scale';
import { useHeaderMovieSearchContext } from './HeaderMovieSearchContext';
import { DrawerMenuButton } from '../navigation/DrawerMenuButton';

type SubHeaderTopProps = {
  title: string;
  onRequestDrawerOpen: () => void;
  searchModeLinkLabel?: string;
  onSearchModeLinkPress?: () => void;
};

export function SubHeaderTop({
  title,
  onRequestDrawerOpen,
  searchModeLinkLabel,
  onSearchModeLinkPress,
}: SubHeaderTopProps) {
  const insets = useSafeAreaInsets();
  const {
    isDetailOpen,
    isSubmitDisabled,
    submitDraftFilters,
    triggerDetailBack,
  } = useHeaderMovieSearchContext();

  return (
    /*
      Combine the real safe-area inset with a scaled extra top gap so the header
      clears the status area on all devices without using one fixed number.
    */
    <View
      style={[styles.container, { paddingTop: insets.top + scaleSize(10) }]}
    >
      <View style={styles.row}>
        <View style={styles.sideSlot}>
          {isDetailOpen ? (
            <Pressable
              onPress={triggerDetailBack}
              style={styles.detailBackButton}
            >
              <Ionicons name="chevron-back" size={42} color="#800000" />
            </Pressable>
          ) : (
            <DrawerMenuButton
              onPress={onRequestDrawerOpen}
            />
          )}
        </View>

        <View style={styles.titleBlock}>
          <Text allowFontScaling={false} style={styles.title}>
            {isDetailOpen ? 'Movie Details' : title}
          </Text>
          {!isDetailOpen && searchModeLinkLabel && onSearchModeLinkPress ? (
            <Pressable
              onPress={onSearchModeLinkPress}
              style={styles.searchModeLink}
              accessibilityRole="button"
              accessibilityLabel={searchModeLinkLabel}
            >
              <Text allowFontScaling={false} style={styles.searchModeLinkText}>
                {searchModeLinkLabel}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={scaleSize(15)}
                color={colors.brandText}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sideSlot}>
          {isDetailOpen ? null : (
            <Pressable
              disabled={isSubmitDisabled}
              onPress={submitDraftFilters}
              style={[
                styles.rightAction,
                isSubmitDisabled && styles.rightActionDisabled,
              ]}
            >
              <Text allowFontScaling={false} style={styles.rightActionText}>
                Submit
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    /*
      scaleSize(...) is used throughout this header's spacing so the title row,
      placeholder, and action pill stay visually balanced on both compact and
      larger phones.
    */
    paddingHorizontal: scaleSize(16),
    paddingBottom: scaleSize(14),
    backgroundColor: colors.background,
  },
  row: {
    minHeight: scaleSize(44),
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSlot: {
    width: scaleSize(96),
    minHeight: scaleSize(32),
    justifyContent: 'center',
  },
  detailBackButton: {
    width: '100%',
    minHeight: scaleSize(48),
    marginLeft: scaleSize(10),
    justifyContent: 'center',
  },
  title: {
    ...typography.pageTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
  titleBlock: {
    flex: 1,
    marginHorizontal: scaleSize(12),
    alignItems: 'center',
  },
  searchModeLink: {
    marginTop: scaleSize(8),
    minHeight: scaleSize(30),
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchModeLinkText: {
    ...typography.summaryBody,
    color: colors.brandText,
  },
  rightAction: {
    minHeight: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: '#F8EBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionDisabled: {
    opacity: 0.45,
  },
  rightActionText: {
    ...typography.buttonLabel,
    color: colors.brandText,
    textAlign: 'center',
  },
});
