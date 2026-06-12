import React from 'react';
import { Switch, Text, View } from 'react-native';
import { colors } from '../../styles/colors';
import { settingsStyles } from '../../styles/drawer/settingsStyles';
import { usePushSubscription } from './usePushSubscription';

export function PushNotificationsSection() {
  const {
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
          trackColor={{ false: colors.switchInactive, true: colors.actionLink }}
          style={settingsStyles.notificationSwitch}
        />
      </View>
      <Text allowFontScaling={false} style={settingsStyles.subscriptionText}>
        {isSubscribed ? '(Subscribed)' : ''}
      </Text>
    </View>
  );
}
