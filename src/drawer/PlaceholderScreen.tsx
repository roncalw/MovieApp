import React from 'react';
import { Text, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { drawerScreenStyles as styles } from '../styles/drawer/drawerScreenStyles';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import type { PlaceholderScreenProps } from '../types/drawer/drawerScreenTypes';

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
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
