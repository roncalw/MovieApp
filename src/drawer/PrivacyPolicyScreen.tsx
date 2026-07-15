import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerScreenHeader } from '../shared/header/DrawerScreenHeader';
import { RefreshableWebView } from '../shared/refresh/RefreshableWebView';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import { drawerScreenStyles as styles } from '../styles/drawer/drawerScreenStyles';

const privacyPolicyUrl =
  'https://movieapp-cloudflare.carlo-roncallo.workers.dev/privacy-policy';

export function PrivacyPolicyScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  function handleBackPress() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Settings');
  }

  return (
    <View style={styles.screen}>
      <View style={styles.webViewFrame}>
        <RefreshableWebView
          headerComponent={
            <DrawerScreenHeader
              title="Privacy Policy"
              leftButtonVariant="back"
              onLeftButtonPress={handleBackPress}
            />
          }
          source={{ uri: privacyPolicyUrl }}
        />
      </View>
    </View>
  );
}
