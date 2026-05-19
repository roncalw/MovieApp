import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

type PlaceholderScreenProps = {
  title: string;
};

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + scaleSize(10),
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <Ionicons name="menu" size={scaleSize(34)} color={colors.brandText} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text allowFontScaling={false} style={styles.title}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: scaleSize(64),
    paddingHorizontal: scaleSize(16),
    justifyContent: 'center',
  },
  menuButton: {
    width: scaleSize(48),
    height: scaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  title: {
    ...typography.pageTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
