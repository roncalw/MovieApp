/*
Step: 5
   * /MovieApp/src/search/advanced/SubHeaderTop.tsx
Imported by:
   * /MovieApp/src/search/advanced/HeaderMovieSearch.tsx
Next step path:
   * /MovieApp/src/search/advanced/SubHeaderMovieSearchFields.tsx
Purpose:
   * Renders the shared top header row while reading the search-button disabled state and submit trigger from the parent
     header context.
*/
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { colors } from '../../styles/colors';
import { scaleSize } from '../../theme/scale';
import { subHeaderTopStyles as styles } from '../../styles/search/subHeaderTopStyles';
import { useHeaderMovieSearchContext } from './HeaderMovieSearchContext';
import { HeaderActionRow } from '../../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../../shared/header/HeaderNavButton';
import { getHeaderNavSecondaryTop } from '../../shared/header/headerNavMetrics';
import type { SubHeaderTopProps } from '../../types/search/movieSearchHeaderTypes';

export function SubHeaderTop({
  title,
  onRequestDrawerOpen,
  searchModeLinkLabel,
  onSearchModeLinkPress,
}: SubHeaderTopProps) {
  const insets = useSafeAreaInsets();
  const { isSubmitDisabled, submitDraftFilters } =
    useHeaderMovieSearchContext();

  return (
    <View
      style={[styles.container, { minHeight: insets.top + scaleSize(118) }]}
    >
      <HeaderActionRow
        left={
          <HeaderNavButton
            variant="menu"
            anchored={false}
            onPress={onRequestDrawerOpen}
          />
        }
        center={
          <Text allowFontScaling={false} style={styles.title}>
            {title}
          </Text>
        }
        rightStyle={styles.submitSlot}
        right={
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
        }
      />
      {searchModeLinkLabel && onSearchModeLinkPress ? (
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
