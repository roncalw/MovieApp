import React from 'react';
import { Switch, Text, View } from 'react-native';
import { colors } from '../../styles/colors';
import { settingsStyles } from '../../styles/drawer/settingsStyles';
import { usePushSubscription } from './usePushSubscription';

export function PushNotificationsSection() {
  const {
    appGuestId,
    devicePushId,
    handlePushSubscriptionChange,
    isSubscribed,
    isSubscriptionLoading,
    isSubscriptionUpdating,
  } = usePushSubscription();

  return (
    <View style={settingsStyles.notificationBlock}>
      <View style={settingsStyles.notificationRow}>
        <Text allowFontScaling={false} style={settingsStyles.linkText}>
          Push Notifications:
        </Text>
        <Switch
          value={isSubscribed}
          onValueChange={handlePushSubscriptionChange}
          disabled={isSubscriptionLoading || isSubscriptionUpdating}
          ios_backgroundColor={colors.switchInactive}
          thumbColor={colors.switchThumb}
          trackColor={{ false: colors.switchInactive, true: colors.brandText }}
          style={settingsStyles.notificationSwitch}
        />
      </View>
      <Text allowFontScaling={false} style={settingsStyles.subscriptionText}>
        {isSubscribed ? 'Push Subscription IDs' : ''}
      </Text>
      {isSubscribed ? (
        <>
          <Text
            allowFontScaling={false}
            selectable
            style={settingsStyles.notificationIdText}
          >
            {formatPushIdentifier(appGuestId)}
          </Text>
          <Text
            allowFontScaling={false}
            selectable
            style={settingsStyles.notificationIdText}
          >
            {formatPushIdentifier(devicePushId)}
          </Text>
        </>
      ) : null}
    </View>
  );
}

function formatPushIdentifier(value: string | null) {
  return value || '';
}
