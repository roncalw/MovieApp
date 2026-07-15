import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerScreenHeader } from '../shared/header/DrawerScreenHeader';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import { ClearMovieListsSection } from './settings/ClearMovieListsSection';
import { PushNotificationsSection } from './settings/PushNotificationsSection';
import { SoftwareVersionSection } from './settings/SoftwareVersionSection';
import { settingsStyles } from '../styles/drawer/settingsStyles';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';

/*
 * Settings drawer screen.
 *
 * This file now owns only the page shell: drawer header, title, and section
 * ordering. Each section owns its own behavior so app-version checks, push
 * notification state, and destructive clear-list actions can be maintained
 * independently.
 */
export function SettingsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const [contentKey, setContentKey] = useState(0);
  const refreshSettings = useCallback(() => {
    setContentKey(currentKey => currentKey + 1);
  }, []);
  const pageRefresh = usePageRefresh(refreshSettings);

  return (
    <View style={settingsStyles.screen}>
      <RefreshableScrollView
        style={settingsStyles.contentScroll}
        contentContainerStyle={settingsStyles.scrollContent}
        {...pageRefresh}
      >
        <DrawerScreenHeader
          title="Settings"
          leftButtonVariant="menu"
          onLeftButtonPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
        />

        <View key={contentKey} style={settingsStyles.content}>
          <SoftwareVersionSection />
          <ClearMovieListsSection />
          <PushNotificationsSection />
        </View>
      </RefreshableScrollView>
    </View>
  );
}
