import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { WebView } from 'react-native-webview';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
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
      <View style={styles.header}>
        <HeaderActionRow
          left={
            <HeaderNavButton
              variant="back"
              anchored={false}
              onPress={handleBackPress}
            />
          }
          center={
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.title}
            >
              Privacy Policy
            </Text>
          }
        />
      </View>

      <View style={styles.webViewFrame}>
        <WebView source={{ uri: privacyPolicyUrl }} />
      </View>
    </View>
  );
}
