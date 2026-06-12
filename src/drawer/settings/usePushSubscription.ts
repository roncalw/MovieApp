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
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [isSubscriptionUpdating, setIsSubscriptionUpdating] = useState(false);

  const refreshPushSubscriptionState = useCallback(async () => {
    const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
    setIsSubscribed(optedIn);
  }, []);

  useEffect(() => {
    let isMounted = true;

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
        setIsSubscribed(event.current.optedIn);
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
  }, []);

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
    handlePushSubscriptionChange,
    isSubscribed,
    isSubscriptionLoading,
    isSubscriptionUpdating,
  };
}
