import React, { useCallback, useEffect, useState } from 'react';
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
import {
  OneSignal,
  type PushSubscriptionChangedState,
} from 'react-native-onesignal';
import packageJson from '../../package.json';
import { HeaderActionRow } from '../shared/header/HeaderActionRow';
import { HeaderNavButton } from '../shared/header/HeaderNavButton';
import type { AppDrawerParamList } from '../types/navigation/navigationTypes';
import {
  clearStoredMovieList,
  MOVIE_FAVORITES_STORAGE_KEY,
  MOVIE_SEEN_STORAGE_KEY,
} from '../utils/storage/movieUserListsStorage';
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
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [isSubscriptionUpdating, setIsSubscriptionUpdating] = useState(false);
  const storeUrl = Platform.OS === 'android' ? androidStoreUrl : iosStoreUrl;

  // When Settings opens, loadPushSubscriptionState reads OneSignal and sets
  // the switch. When the user changes the switch, handlePushSubscriptionChange
  // asks OneSignal to opt in or opt out, then refreshes this same state.
  // Re-read OneSignal after an opt-in or opt-out call. The switch should show
  // OneSignal's confirmed state, not just the value the user tapped.
  const refreshPushSubscriptionState = useCallback(async () => {
    const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
    setIsSubscribed(optedIn);
  }, []);

  useEffect(() => {
    // Async OneSignal calls can finish after the user leaves Settings.
    // isMounted lets this effect ignore late results instead of updating state
    // on a screen instance that React has already closed.
    let isMounted = true;

    // Load the current OneSignal push-subscription value when Settings opens.
    // This keeps the switch accurate if the user changed notification settings
    // outside the app or from another app session.
    const loadPushSubscriptionState = async () => {
      try {
        const optedIn =
          await OneSignal.User.pushSubscription.getOptedInAsync();
        if (isMounted) {
          setIsSubscribed(optedIn);
        }
      } catch (error) {
        console.error('Error reading push notification subscription:', error);
      } finally {
        if (isMounted) {
          setIsSubscriptionLoading(false);
        }
      }
    };

    const subscriptionChangeListener = (
      event: PushSubscriptionChangedState
    ) => {
      if (isMounted) {
        // OneSignal sends the latest push-subscription state in event.current.
        // Keeping this screen tied to that value prevents the UI from showing
        // "(Subscribed)" after OneSignal says the device is actually opted out.
        setIsSubscribed(event.current.optedIn);
      }
    };

    loadPushSubscriptionState();
    // "change" is the event name defined by the OneSignal React Native SDK for
    // push-subscription updates. It is not a React keyword; it tells OneSignal
    // which event should call subscriptionChangeListener.
    OneSignal.User.pushSubscription.addEventListener(
      'change',
      subscriptionChangeListener
    );

    return () => {
      isMounted = false;
      // Remove the same OneSignal listener when Settings closes. Otherwise an
      // old screen instance could keep receiving subscription updates later.
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        subscriptionChangeListener
      );
    };
  }, []);

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

  async function handlePushSubscriptionChange(nextValue: boolean) {
    setIsSubscriptionUpdating(true);

    try {
      if (nextValue) {
        const alreadyAllowed =
          await OneSignal.Notifications.getPermissionAsync();
        const isAllowed =
          alreadyAllowed ||
          (await OneSignal.Notifications.requestPermission(true));

        if (!isAllowed) {
          setIsSubscribed(false);
          Alert.alert(
            'Push Notifications Disabled',
            'Notifications were not enabled. You can turn them on later from iOS Settings.'
          );
          return;
        }

        OneSignal.User.pushSubscription.optIn();
        setIsSubscribed(true);
      } else {
        OneSignal.User.pushSubscription.optOut();
        setIsSubscribed(false);
      }

      await refreshPushSubscriptionState();
    } catch (error) {
      console.error('Error updating push notification subscription:', error);
      Alert.alert(
        'Unable to Update Notifications',
        'Push notification settings could not be updated right now.'
      );
      await refreshPushSubscriptionState().catch(refreshError => {
        console.error(
          'Error refreshing push notification subscription:',
          refreshError
        );
      });
    } finally {
      setIsSubscriptionUpdating(false);
    }
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
              onValueChange={handlePushSubscriptionChange}
              disabled={isSubscriptionLoading || isSubscriptionUpdating}
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
