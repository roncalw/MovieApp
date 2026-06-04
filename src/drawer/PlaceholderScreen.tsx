import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import type { PlaceholderScreenProps } from '../types/drawer/drawerScreenTypes';

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderActionRow
          left={
            <HeaderNavButton
              variant="menu"
              anchored={false}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
          center={
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.headerTitle}
            >
              {title}
            </Text>
          }
        />
      </View>

      <View style={styles.content}>
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
    minHeight: scaleSize(142),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  headerTitle: {
    ...typography.pageTitle,
    width: '100%',
    color: colors.brandText,
    textAlign: 'center',
  },
});
