import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import packageJson from '../../package.json';
import { HeaderActionRow } from '../components/navigation/HeaderActionRow';
import { HeaderNavButton } from '../components/navigation/HeaderNavButton';
import type { AppDrawerParamList } from '../navigation/types';
import {
  clearStoredMovieList,
  MOVIE_FAVORITES_STORAGE_KEY,
  MOVIE_SEEN_STORAGE_KEY,
} from '../storage/movieUserListsStorage';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

const androidStoreUrl =
  'https://play.google.com/store/apps/details?id=com.codefest.movieapp';
const iosStoreUrl = 'https://apps.apple.com/us/app/movie-guider/id6465793035';

const favoriteClearTitle = 'Your Movie Favorites are Cleared!';
const favoriteClearMessage =
  'To start saving your favorite movies again, simply click on the heart from the Movie Detail screen!';
const seenClearTitle = 'Your Movies I Have Seen are Cleared!';
const seenClearMessage =
  'To start saving movies you have seen again, simply click on Seen from the Movie Detail screen!';

export function SettingsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const storeUrl = Platform.OS === 'android' ? androidStoreUrl : iosStoreUrl;

  async function handleCheckForUpdate() {
    try {
      await Linking.openURL(storeUrl);
    } catch (error) {
      console.error('Error opening app store URL:', error);
      Alert.alert(
        'Unable to Open Store',
        'The app store page could not be opened from this device.'
      );
    }
  }

  function handleClearFavorites() {
    Alert.alert(
      'Clear Movie Favorites?',
      `Selecting Yes will clear your movie favorites. ${favoriteClearMessage}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStoredMovieList(MOVIE_FAVORITES_STORAGE_KEY);
              Alert.alert(favoriteClearTitle, favoriteClearMessage);
            } catch (error) {
              console.error('Error clearing movie favorites:', error);
              Alert.alert(
                'Unable to Clear Favorites',
                'Movie favorites could not be cleared right now.'
              );
            }
          },
        },
      ]
    );
  }

  function handleClearSeenMovies() {
    Alert.alert(
      'Clear Movies I Have Seen?',
      `Selecting Yes will clear your movies you have seen. ${seenClearMessage}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStoredMovieList(MOVIE_SEEN_STORAGE_KEY);
              Alert.alert(seenClearTitle, seenClearMessage);
            } catch (error) {
              console.error('Error clearing movies I have seen:', error);
              Alert.alert(
                'Unable to Clear Movies I Have Seen',
                'Movies I Have Seen could not be cleared right now.'
              );
            }
          },
        },
      ]
    );
  }

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
              style={styles.title}
            >
              Settings
            </Text>
          }
        />
      </View>

      <View style={styles.content}>
        <View style={styles.settingBlock}>
          <Pressable
            onPress={handleCheckForUpdate}
            accessibilityRole="button"
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            <Text allowFontScaling={false} style={styles.linkText}>
              Check for Update
            </Text>
          </Pressable>
          <Text allowFontScaling={false} style={styles.versionText}>
            Version: {packageJson.version}
          </Text>
        </View>

        <View style={styles.settingBlock}>
          <Pressable
            onPress={handleClearFavorites}
            accessibilityRole="button"
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            <Text allowFontScaling={false} style={styles.linkText}>
              Clear Movie Favorites
            </Text>
          </Pressable>
        </View>

        <View style={styles.settingBlock}>
          <Pressable
            onPress={handleClearSeenMovies}
            accessibilityRole="button"
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            <Text allowFontScaling={false} style={styles.linkText}>
              Clear Movies I Have Seen
            </Text>
          </Pressable>
        </View>

        <View style={styles.notificationBlock}>
          <View style={styles.notificationRow}>
            <Text allowFontScaling={false} style={styles.linkText}>
              Push Notifications:
            </Text>
            <Switch
              value={isSubscribed}
              onValueChange={setIsSubscribed}
              ios_backgroundColor="grey"
              thumbColor="#FFFFFF"
              trackColor={{ false: 'grey', true: '#007BFF' }}
              style={styles.notificationSwitch}
            />
          </View>
          <Text allowFontScaling={false} style={styles.subscriptionText}>
            {isSubscribed ? '(Subscribed)' : ''}
          </Text>
        </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scaleSize(24),
    paddingTop: scaleSize(28),
  },
  settingBlock: {
    alignItems: 'center',
    marginBottom: scaleSize(28),
  },
  linkText: {
    ...typography.feedbackTitle,
    color: '#007BFF',
    textAlign: 'center',
  },
  versionText: {
    ...typography.summaryBody,
    marginTop: scaleSize(6),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  notificationBlock: {
    alignItems: 'center',
    marginTop: scaleSize(2),
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationSwitch: {
    marginLeft: scaleSize(6),
    transform: [{ scale: 0.75 }],
  },
  subscriptionText: {
    ...typography.summaryBody,
    minHeight: scaleSize(20),
    marginTop: scaleSize(-8),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
