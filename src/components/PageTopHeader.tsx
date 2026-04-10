/*
Step: 5
   * /MovieApp/src/components/PageTopHeader.tsx
Called by:
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
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <View style={styles.sideSlot}>
          <View style={styles.leftPlaceholder} />
        </View>

        <Text style={styles.title}>{title}</Text>

        {rightActionLabel ? (
          <View style={styles.sideSlot}>
            <Pressable onPress={onRightActionPress} style={styles.rightAction}>
              <Text style={styles.rightActionText}>{rightActionLabel}</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.background,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSlot: {
    width: 96,
    minHeight: 32,
    justifyContent: 'center',
  },
  leftPlaceholder: {
    width: 42,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.placeholderAccent,
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 24,
    fontWeight: '700',
    color: colors.brandText,
    textAlign: 'center',
  },
  rightAction: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: buttons.primaryPill.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionText: {
    color: buttons.primaryPill.textColor,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  rightSpacer: {
    width: 42,
    height: 32,
  },
});
