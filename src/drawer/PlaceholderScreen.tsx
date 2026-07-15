import React from 'react';
import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { drawerScreenStyles as styles } from '../styles/drawer/drawerScreenStyles';
import { DrawerScreenHeader } from '../shared/header/DrawerScreenHeader';
import type { PlaceholderScreenProps } from '../types/drawer/drawerScreenTypes';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const navigation = useNavigation();
  const pageRefresh = usePageRefresh();

  return (
    <View style={styles.screen}>
      <RefreshableScrollView
        style={styles.listContent}
        contentContainerStyle={styles.utilityScrollContent}
        {...pageRefresh}
      >
        <DrawerScreenHeader
          title={title}
          titleVariant="prominent"
          leftButtonVariant="menu"
          onLeftButtonPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
        />
        <View style={styles.content} />
      </RefreshableScrollView>
    </View>
  );
}
