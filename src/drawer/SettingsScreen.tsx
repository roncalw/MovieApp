import React from 'react';
import { Text, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import { ClearMovieListsSection } from './settings/ClearMovieListsSection';
import { PushNotificationsSection } from './settings/PushNotificationsSection';
import { SoftwareVersionSection } from './settings/SoftwareVersionSection';
import { settingsStyles } from '../styles/drawer/settingsStyles';

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

  return (
    <View style={settingsStyles.screen}>
      <View style={settingsStyles.header}>
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
              style={settingsStyles.title}
            >
              Settings
            </Text>
          }
        />
      </View>

      <View style={settingsStyles.content}>
        <SoftwareVersionSection />
        <ClearMovieListsSection />
        <PushNotificationsSection />
      </View>
    </View>
  );
}
