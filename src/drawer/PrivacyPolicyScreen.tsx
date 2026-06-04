import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { WebView } from 'react-native-webview';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';

const privacyPolicyUrl =
  'https://www.privacypolicies.com/live/bc91d018-505a-4539-965d-37e7416a16b3';

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: scaleSize(142),
    backgroundColor: colors.background,
  },
  title: {
    width: '100%',
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.brandText,
    textAlign: 'center',
  },
  webViewFrame: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
