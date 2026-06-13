import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  OneSignal,
  type PushSubscriptionChangedState,
} from 'react-native-onesignal';

/*
 * Owns the Settings push-notification state.
 *
 * Keeping OneSignal state handling out of SettingsScreen keeps the screen from
 * mixing page layout with native notification permissions and subscription
 * listener cleanup.
 */
export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [appGuestId, setAppGuestId] = useState<string | null>(null);
  const [devicePushId, setDevicePushId] = useState<string | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [isSubscriptionUpdating, setIsSubscriptionUpdating] = useState(false);

  const refreshPushSubscriptionState = useCallback(async () => {
    const [optedIn, currentAppGuestId, currentDevicePushId] =
      await Promise.all([
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.User.getOnesignalId(),
        OneSignal.User.pushSubscription.getIdAsync(),
      ]);

    setIsSubscribed(optedIn);
    setAppGuestId(currentAppGuestId);
    setDevicePushId(currentDevicePushId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPushSubscriptionState = async () => {
      try {
        if (isMounted) {
          await refreshPushSubscriptionState();
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
        setIsSubscribed(event.current.optedIn);
        setDevicePushId(event.current.id ?? null);
        void refreshPushSubscriptionState();
      }
    };

    loadPushSubscriptionState();
    OneSignal.User.pushSubscription.addEventListener(
      'change',
      subscriptionChangeListener
    );

    return () => {
      isMounted = false;
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        subscriptionChangeListener
      );
    };
  }, [refreshPushSubscriptionState]);

  const handlePushSubscriptionChange = useCallback(
    async (nextValue: boolean) => {
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
    },
    [refreshPushSubscriptionState]
  );

  return {
    appGuestId,
    devicePushId,
    handlePushSubscriptionChange,
    isSubscribed,
    isSubscriptionLoading,
    isSubscriptionUpdating,
  };
}
