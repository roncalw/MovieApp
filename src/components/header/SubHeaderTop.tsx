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
import { HeaderActionRow } from '../navigation/HeaderActionRow';
import { HeaderNavButton } from '../navigation/HeaderNavButton';
import { getHeaderNavSecondaryTop } from '../navigation/headerNavMetrics';

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
    <View style={[styles.container, { minHeight: insets.top + scaleSize(118) }]}>
      <HeaderActionRow
        left={
          isDetailOpen ? (
            <HeaderNavButton
              variant="back"
              anchored={false}
              onPress={triggerDetailBack}
              color="#800000"
            />
          ) : (
            <HeaderNavButton
              variant="menu"
              anchored={false}
              onPress={onRequestDrawerOpen}
            />
          )
        }
        center={
          <Text allowFontScaling={false} style={styles.title}>
            {isDetailOpen ? 'Movie Details' : title}
          </Text>
        }
        rightStyle={isDetailOpen ? undefined : styles.submitSlot}
        right={
          isDetailOpen ? null : (
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
          )
        }
      />
      {!isDetailOpen && searchModeLinkLabel && onSearchModeLinkPress ? (
        <Pressable
          onPress={onSearchModeLinkPress}
          style={[
            styles.searchModeLink,
            { top: getHeaderNavSecondaryTop(insets.top) },
          ]}
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: scaleSize(14),
    backgroundColor: colors.background,
  },
  title: {
    ...typography.pageTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
  searchModeLink: {
    position: 'absolute',
    alignSelf: 'center',
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
    minWidth: scaleSize(94),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: '#F8EBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSlot: {
    width: scaleSize(112),
    alignItems: 'flex-end',
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
