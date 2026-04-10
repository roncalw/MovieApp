/*
Step: 5
   * /MovieApp/src/components/PageTopHeader.tsx
Imported by:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/components/MovieSearchHeader.tsx
Purpose:
   * Renders the shared page-level top header with safe-area-aware spacing, a placeholder left action, and an optional right action button.
*/
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { buttons } from '../theme/buttons';
import { typography } from '../theme/typography';
import { scaleSize } from '../theme/scale';

type PageTopHeaderProps = {
  title: string;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
};

export function PageTopHeader({
  title,
  rightActionLabel,
  onRightActionPress,
}: PageTopHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    /*
      Combine the real safe-area inset with a scaled extra top gap so the header
      clears the status area on all devices without using one fixed number.
    */
    <View style={[styles.container, { paddingTop: insets.top + scaleSize(10) }]}>
      <View style={styles.row}>
        <View style={styles.sideSlot}>
          <View style={styles.leftPlaceholder} />
        </View>

        <Text allowFontScaling={false} style={styles.title}>
          {title}
        </Text>

        {rightActionLabel ? (
          <View style={styles.sideSlot}>
            <Pressable onPress={onRightActionPress} style={styles.rightAction}>
              <Text allowFontScaling={false} style={styles.rightActionText}>
                {rightActionLabel}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.sideSlot} />
        )}
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
  leftPlaceholder: {
    width: scaleSize(42),
    height: scaleSize(32),
    borderRadius: scaleSize(12),
    backgroundColor: colors.placeholderAccent,
  },
  title: {
    flex: 1,
    marginHorizontal: scaleSize(12),
    ...typography.pageTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
  rightAction: {
    minHeight: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: buttons.primaryPill.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionText: {
    ...typography.buttonLabel,
    color: buttons.primaryPill.textColor,
    textAlign: 'center',
  },
  rightSpacer: {
    width: scaleSize(42),
    height: scaleSize(32),
  },
});
